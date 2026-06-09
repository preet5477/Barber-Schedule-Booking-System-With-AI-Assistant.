const fs = require('fs');
const path = require('path');

const User = require('../models/User');
const Service = require('../models/Service');
const Booking = require('../models/Booking');

const { createBooking, getAvailableSlots } = require('./bookingService');
const { getGroqClient } = require('./groqClient');

const SKILL_PATH = path.join(__dirname, '..', 'skills', 'barberAssistant.skill.md');
const MODEL = 'llama-3.3-70b-versatile';
// const MODEL = 'kimi-k2.6'

let cachedSkill = null;

const loadSkill = () => {
  if (cachedSkill) {
    return cachedSkill;
  }

  cachedSkill = fs.readFileSync(SKILL_PATH, 'utf8');
  return cachedSkill;
};

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const resolveAppointmentDate = (message, extractedDate) => {
  const source = `${extractedDate || ''} ${message || ''}`.toLowerCase();

  const dateMatch = source.match(/\b\d{4}-\d{2}-\d{2}\b/);
  if (dateMatch) return { date: dateMatch[0], label: dateMatch[0] };

  const date = new Date();
  if (source.includes('tomorrow')) {
    date.setDate(date.getDate() + 1);
    return { date: formatDate(date), label: 'tomorrow' };
  }

  return { date: formatDate(date), label: 'today' };
};

const convertSlotToDate = (slot, appointmentDate) => {
  const [time, modifier] = slot.split(' ');
  let [hours, minutes] = time.split(':');
  hours = parseInt(hours);
  minutes = parseInt(minutes);

  if (modifier === 'PM' && hours !== 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;

  const [year, month, day] = appointmentDate.split('-').map(Number);
  return new Date(year, month - 1, day, hours, minutes, 0, 0);
};

const removePastSlotsForToday = (slots, appointmentDate) => {
  const today = formatDate(new Date());
  if (appointmentDate !== today) return slots;

  const now = new Date();
  return slots.filter((slot) => {
    const slotTime = convertSlotToDate(slot, appointmentDate);
    return slotTime > now;
  });
};

const parseJsonFromAi = (text) => {
  const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(cleanText);
};

const askAgentForJson = async ({ message, task }) => {
  const groq = getGroqClient();
  if (!groq) return null;

  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: `
${loadSkill()}

## Structured Agent Task

${task}

Return ONLY valid JSON. Do not add markdown, comments, or explanation.
`
      },
      { role: 'user', content: message }
    ]
  });

  return parseJsonFromAi(completion.choices[0].message.content);
};

const detectIntentWithAgent = async (message) => {
  try {
    const result = await askAgentForJson({
      message,
      task: `
Classify this message using the skill file's Agent Intent Rules.

Return this schema:
{
  "intent": "book"
}
`
    });

    return result?.intent || 'chat';
  } catch (error) {
    console.log('INTENT AGENT ERROR:', error);
    return 'chat';
  }
};

const extractBookingDetailsWithAgent = async (message) => {
  try {
    return await askAgentForJson({
      message,
      task: `
Extract booking details using the skill file's Booking extraction schema.

Return this schema:
{
  "service": "",
  "barber": "",
  "time": "",
  "date": ""
}
`
    });
  } catch (error) {
    console.log('BOOKING EXTRACT AGENT ERROR:', error);
    return null;
  }
};

const extractServiceDetailsWithAgent = async (message) => {
  try {
    return await askAgentForJson({
      message,
      task: `
Extract service details using the skill file's Service extraction schema.

Return this schema:
{
  "name": "",
  "description": "",
  "price": 0,
  "duration": 0,
  "category": ""
}
`
    });
  } catch (error) {
    console.log('SERVICE EXTRACT AGENT ERROR:', error);
    return null;
  }
};

const extractBarberNameFromMessage = async (message) => {
  try {
    const parsed = await askAgentForJson({
      message,
      task: `
Extract ONLY the barber name from the user message.

Return this schema:
{
  "barber": ""
}

If no barber is mentioned, return an empty string for barber.
`
    });

    return parsed?.barber || null;
  } catch (err) {
    console.log('BARBER EXTRACT ERROR:', err);
    return null;
  }
};

const buildRoleContext = ({
  userRole,
  barberList,
  serviceList,
  slotLabel,
  requestedDate,
  availableSlotText
}) => {
  if (userRole === 'customer') {
    return `
ROLE: customer

AVAILABLE BARBERS
${barberList}

AVAILABLE SERVICES
${serviceList}

AVAILABLE TIME SLOTS ${slotLabel} FOR ${requestedDate.label.toUpperCase()} (${requestedDate.date})
${availableSlotText}
`;
  }

  if (userRole === 'admin') {
    return `
ROLE: admin

CURRENT SERVICES
${serviceList}

CURRENT BARBERS
${barberList}

AVAILABLE SLOTS ${slotLabel}
${availableSlotText}
`;
  }

  if (userRole === 'barber') {
    return `
ROLE: barber

Use the barber behavior rules from the skill file. If schedule data is not supplied,
ask the barber to use the dashboard for exact appointment details.
`;
  }

  return `
ROLE: guest

Answer generally and ask the user to log in for booking-specific actions.
`;
};

const buildSystemPrompt = (context) => {
  return `
${loadSkill()}

## Runtime Context

${buildRoleContext(context)}
`;
};

const runAiAgent = async ({ message, context }) => {
  const groq = getGroqClient();

  if (!groq) {
    return {
      success: false,
      statusCode: 500,
      reply: 'AI is not configured. Please set GROQ_API_KEY in backend/.env and restart the server.'
    };
  }

  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: buildSystemPrompt(context) },
      { role: 'user', content: message }
    ]
  });

  return {
    success: true,
    reply: completion.choices[0].message.content
  };
};

const buildBarberList = (barbers) => {
  return barbers.map((barber) => `
- ${barber.name}
  Specialty: ${barber.specialty}
  Experience: ${barber.experience}
`).join('\n');
};

const buildServiceList = (services) => {
  return services.map((service) => `
- ${service.name}
  Price: Rs.${service.price}
  Duration: ${service.duration} mins
`).join('\n');
};

const handleBookingIntent = async ({ message, intent, userId }) => {
  const hasBookingDetails =
    message.toLowerCase().includes('today') ||
    message.toLowerCase().includes('tomorrow') ||
    message.match(/\d{1,2}\s?(am|pm)/i);

  if (intent !== 'book' || !hasBookingDetails) {
    return null;
  }

  const extracted = await extractBookingDetailsWithAgent(message);
  console.log('EXTRACTED:', extracted);

  if (!extracted) {
    return {
      success: false,
      reply: 'Could not understand booking details.'
    };
  }

  const serviceName = extracted.service;
  const time = extracted.time;
  const barberName = extracted.barber || null;
  const bookingDate = resolveAppointmentDate(message, extracted.date);

  const bookingSlotResult = await getAvailableSlots({
    barberName: barberName || undefined,
    appointmentDate: bookingDate.date
  });

  const bookingAvailableSlots = removePastSlotsForToday(
    bookingSlotResult.availableSlots || [],
    bookingDate.date
  );

  const bookingAvailableSlotText = bookingAvailableSlots.length
    ? bookingAvailableSlots.join('\n')
    : 'No slots available';

  console.log('SERVICE:', serviceName);
  console.log('BARBER:', barberName);
  console.log('TIME:', time);
  console.log('DATE:', bookingDate.date);
  console.log('USER:', userId);

  if (!bookingAvailableSlots.includes(time)) {
    const forWhom = barberName
      ? `for ${barberName}`
      : 'for any available barber';

    return {
      success: false,
      reply: `This slot is unavailable ${forWhom}.\n\nAvailable slots:\n\n${bookingAvailableSlotText}`
    };
  }

  const result = await createBooking({
    serviceName,
    barberName,
    time,
    appointmentDate: bookingDate.date,
    userId
  });

  if (!result.success) {
    return { success: false, reply: result.message };
  }

  return {
    success: true,
    reply: `
Appointment booked successfully

- Service: ${result.service.name}
- Barber: ${result.barber.name}
- Date: ${bookingDate.label}
- Time: ${time}
`
  };
};

const handleAddServiceIntent = async ({ message, intent, userRole }) => {
  if (intent !== 'add_service') {
    return null;
  }

  if (userRole !== 'admin') {
    return { success: false, reply: 'Only admin can add services.' };
  }

  const extracted = await extractServiceDetailsWithAgent(message);
  if (!extracted) {
    return { success: false, reply: 'Could not extract service details.' };
  }

  const existingService = await Service.findOne({
    name: { $regex: new RegExp('^' + extracted.name + '$', 'i') }
  });

  if (existingService) {
    return { success: false, reply: 'Service already exists.' };
  }

  const service = await Service.create({
    name: extracted.name,
    description: extracted.description || extracted.name,
    price: extracted.price,
    duration: extracted.duration,
    category: extracted.category || 'styling'
  });

  return {
    success: true,
    reply: `
Service added successfully.

- Name: ${service.name}
- Price: Rs.${service.price}
- Duration: ${service.duration} mins
`
  };
};

const handleAdminActions = async ({ message, userRole }) => {
  if (userRole !== 'admin') {
    return null;
  }

  const lowerMessage = message.toLowerCase();

  if (
    lowerMessage.includes('revenue') ||
    lowerMessage.includes('income') ||
    lowerMessage.includes('earning')
  ) {
    console.log('ADMIN REVENUE BLOCK RUNNING');

    const bookings = await Booking.find({ status: 'completed' });
    const totalRevenue = bookings.reduce(
      (sum, booking) => sum + Number(booking.totalAmount || 0),
      0
    );

    return {
      success: true,
      reply: `
Revenue Report

- Total Completed Bookings: ${bookings.length}
- Total Revenue: Rs.${totalRevenue}
`
    };
  }

  if (
    lowerMessage.includes('booking') ||
    lowerMessage.includes('appointments')
  ) {
    console.log('ADMIN BOOKING BLOCK RUNNING');

    const bookings = await Booking.find()
      .populate('customer', 'name')
      .populate('barber', 'name')
      .populate('services.service', 'name')
      .sort({ createdAt: -1 });

    if (!bookings.length) {
      return { success: true, reply: 'No bookings found.' };
    }

    let bookingText = 'Booking List\n\n';

    bookings.forEach((booking, index) => {
      const serviceName = booking.services?.[0]?.service?.name || 'Unknown Service';

      bookingText += `
${index + 1}. Customer: ${booking.customer?.name}
- Barber: ${booking.barber?.name}
- Service: ${serviceName}
- Time: ${booking.startTime}
- Amount: Rs.${booking.totalAmount}
- Status: ${booking.status}

`;
    });

    return { success: true, reply: bookingText };
  }

  if (
    lowerMessage.includes('top barber') ||
    lowerMessage.includes('best barber') ||
    lowerMessage.includes('performing barber')
  ) {
    console.log('TOP BARBER BLOCK RUNNING');

    const bookings = await Booking.find({ status: 'completed' })
      .populate('barber', 'name specialty');

    if (!bookings.length) {
      return { success: true, reply: 'No completed bookings found.' };
    }

    const barberStats = {};

    bookings.forEach((booking) => {
      if (!booking.barber) return;

      const barberId = booking.barber._id.toString();

      if (!barberStats[barberId]) {
        barberStats[barberId] = {
          name: booking.barber.name,
          specialty: booking.barber.specialty,
          totalBookings: 0,
          totalRevenue: 0
        };
      }

      barberStats[barberId].totalBookings += 1;
      barberStats[barberId].totalRevenue += Number(booking.totalAmount || 0);
    });

    const result = Object.values(barberStats)
      .sort((a, b) => b.totalRevenue - a.totalRevenue);

    let reply = 'Top Performing Barbers\n\n';

    result.forEach((barber, index) => {
      reply += `
${index + 1}. ${barber.name}
- Specialty: ${barber.specialty}
- Total Bookings: ${barber.totalBookings}
- Revenue: Rs.${barber.totalRevenue}

`;
    });

    return { success: true, reply };
  }

  if (
    lowerMessage.includes('update') &&
    lowerMessage.includes('service') &&
    lowerMessage.includes('price')
  ) {
    console.log('UPDATE SERVICE BLOCK RUNNING');

    const serviceMatch = message.match(/update\s(.+?)\sservice/i);
    const priceMatch = message.match(/to\s(\d+)/i);

    if (!serviceMatch || !priceMatch) {
      return { success: false, reply: 'Could not understand update request.' };
    }

    const serviceName = serviceMatch[1].trim();
    const newPrice = Number(priceMatch[1]);

    const service = await Service.findOne({
      name: { $regex: new RegExp('^' + serviceName + '$', 'i') }
    });

    if (!service) {
      return { success: false, reply: 'Service not found.' };
    }

    service.price = newPrice;
    await service.save();

    return {
      success: true,
      reply: `
Service Updated

- Service: ${service.name}
- New Price: Rs.${service.price}
- Duration: ${service.duration}
`
    };
  }

  return null;
};

const handleAiChat = async ({ message, userId, userRole }) => {
  console.log('MESSAGE:', message);

  const intent = await detectIntentWithAgent(message);
  console.log('INTENT:', intent);

  const barbers = await User.find({ role: 'barber', available: true });
  const services = await Service.find();
  const requestedDate = resolveAppointmentDate(message);
  const mentionedBarberName = await extractBarberNameFromMessage(message);

  const slotResult = await getAvailableSlots({
    barberName: mentionedBarberName || undefined,
    appointmentDate: requestedDate.date
  });

  const availableSlots = removePastSlotsForToday(
    slotResult.availableSlots || [],
    requestedDate.date
  );

  const barberList = buildBarberList(barbers);
  const serviceList = buildServiceList(services);
  const slotLabel = mentionedBarberName
    ? `FOR ${mentionedBarberName.toUpperCase()}`
    : '(ANY AVAILABLE BARBER)';
  const availableSlotText = availableSlots.length
    ? availableSlots.join('\n')
    : 'No slots available';

  const bookingResult = await handleBookingIntent({ message, intent, userId });
  if (bookingResult) return bookingResult;

  const serviceResult = await handleAddServiceIntent({ message, intent, userRole });
  if (serviceResult) return serviceResult;

  const adminResult = await handleAdminActions({ message, userRole });
  if (adminResult) return adminResult;

  return runAiAgent({
    message,
    context: {
      userRole,
      barberList,
      serviceList,
      slotLabel,
      requestedDate,
      availableSlotText
    }
  });
};

module.exports = {
  buildSystemPrompt,
  handleAiChat,
  runAiAgent
};
