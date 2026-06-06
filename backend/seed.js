const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { connectDB, disconnectDB } = require('./config/database');
const User = require('./models/User');
const Service = require('./models/Service');
const Booking = require('./models/Booking');

dotenv.config();

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

// Helper function for colored console output
const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

// Sample data
const users = [
  {
    name: 'John Doe',
    email: 'customer@demo.com',
    password: 'demo123',
    phone: '1234567890',
    role: 'customer'
  },
  {
    name: 'Mike Johnson',
    email: 'barber@demo.com',
    password: 'demo123',
    phone: '1234567891',
    role: 'barber',
    specialty: 'Classic Cuts & Styling',
    experience: '10 years',
    bio: 'Specialized in classic men\'s haircuts and modern styling techniques.',
    rating: 4.9,
    reviews: 250,
    available: true
  },
  {
    name: 'David Chen',
    email: 'david@barber.com',
    password: 'demo123',
    phone: '1234567892',
    role: 'barber',
    specialty: 'Beard Grooming Expert',
    experience: '8 years',
    bio: 'Master of beard grooming and traditional wet shaving.',
    rating: 4.8,
    reviews: 180,
    available: true
  },
  {
    name: 'Carlos Rodriguez',
    email: 'carlos@barber.com',
    password: 'demo123',
    phone: '1234567893',
    role: 'barber',
    specialty: 'Modern Fades',
    experience: '12 years',
    bio: 'Expert in modern fades, tapers, and contemporary styles.',
    rating: 5.0,
    reviews: 320,
    available: false
  },
  {
    name: 'James Wilson',
    email: 'james@barber.com',
    password: 'demo123',
    phone: '1234567894',
    role: 'barber',
    specialty: 'Hair Coloring',
    experience: '7 years',
    bio: 'Specializes in hair coloring and creative styling.',
    rating: 4.7,
    reviews: 150,
    available: true
  },
  {
    name: 'Robert Taylor',
    email: 'robert@barber.com',
    password: 'demo123',
    phone: '1234567895',
    role: 'barber',
    specialty: 'All-Round Barber',
    experience: '15 years',
    bio: 'Veteran barber with expertise in all grooming services.',
    rating: 4.9,
    reviews: 400,
    available: true
  },
  {
    name: 'Admin User',
    email: 'admin@demo.com',
    password: 'demo123',
    phone: '1234567896',
    role: 'admin'
  }
];

const services = [
  {
    name: 'Classic Haircut',
    description: 'Traditional men\'s haircut with scissors and clippers',
    price: 20,
    duration: '30 min',
    category: 'haircut',
    icon: '✂️',
    popularity: 150
  },
  {
    name: 'Beard Trim',
    description: 'Professional beard shaping and trimming',
    price: 15,
    duration: '20 min',
    category: 'beard',
    icon: '🧔',
    popularity: 120
  },
  {
    name: 'Hot Towel Shave',
    description: 'Traditional straight razor shave with hot towel',
    price: 25,
    duration: '40 min',
    category: 'shave',
    icon: '🪒',
    popularity: 80
  },
  {
    name: 'Hair Coloring',
    description: 'Professional hair coloring service',
    price: 50,
    duration: '90 min',
    category: 'coloring',
    icon: '🎨',
    popularity: 60
  },
  {
    name: 'Kids Haircut',
    description: 'Haircut for children under 12',
    price: 15,
    duration: '25 min',
    category: 'haircut',
    icon: '👦',
    popularity: 90
  },
  {
    name: 'Facial Treatment',
    description: 'Deep cleansing facial with massage',
    price: 35,
    duration: '45 min',
    category: 'facial',
    icon: '💆',
    popularity: 70
  },
  {
    name: 'Hair Styling',
    description: 'Special event hair styling',
    price: 30,
    duration: '40 min',
    category: 'styling',
    icon: '💇',
    popularity: 50
  },
  {
    name: 'Beard Grooming',
    description: 'Complete beard care package',
    price: 40,
    duration: '50 min',
    category: 'beard',
    icon: '✨',
    popularity: 65
  }
];

// Seed functions
const seedUsers = async () => {
  try {
    await User.deleteMany();
    const createdUsers = await User.insertMany(users);
    log(`✅ Users seeded: ${createdUsers.length}`, 'green');
    return createdUsers;
  } catch (error) {
    log(`❌ Error seeding users: ${error.message}`, 'red');
    throw error;
  }
};

const seedServices = async () => {
  try {
    await Service.deleteMany();
    const createdServices = await Service.insertMany(services);
    log(`✅ Services seeded: ${createdServices.length}`, 'green');
    return createdServices;
  } catch (error) {
    log(`❌ Error seeding services: ${error.message}`, 'red');
    throw error;
  }
};

const seedBookings = async (users, services) => {
  try {
    await Booking.deleteMany();
    
    const customer = users.find(u => u.role === 'customer');
    const barbers = users.filter(u => u.role === 'barber' && u.available);
    
    if (!customer || barbers.length === 0) {
      log('⚠️  No customer or available barbers found for seeding bookings', 'yellow');
      return [];
    }

    const bookings = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Create sample bookings for next 10 days
    for (let i = 0; i < 10; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      
      const barber = barbers[i % barbers.length];
      const service = services[i % services.length];
      
      // Determine status based on date
      let status;
      if (i < 2) {
        status = 'confirmed';
      } else if (i < 4) {
        status = 'pending';
      } else if (i < 7) {
        status = 'completed';
      } else {
        status = 'cancelled';
      }
      
      bookings.push({
        customer: customer._id,
        customerName: customer.name,
        barber: barber._id,
        barberName: barber.name,
        service: service._id,
        serviceName: service.name,
        servicePrice: service.price,
        date: date,
        time: i % 2 === 0 ? '10:00 AM' : '02:00 PM',
        status: status,
        notes: `Sample booking #${i + 1}`,
        ...(status === 'completed' && { completedAt: new Date() })
      });
    }
    
    const createdBookings = await Booking.insertMany(bookings);
    log(`✅ Bookings seeded: ${createdBookings.length}`, 'green');
    return createdBookings;
  } catch (error) {
    log(`❌ Error seeding bookings: ${error.message}`, 'red');
    throw error;
  }
};

// Display database statistics
const displayStats = async () => {
  try {
    const userCount = await User.countDocuments();
    const serviceCount = await Service.countDocuments();
    const bookingCount = await Booking.countDocuments();
    
    log('\n📊 Database Statistics:', 'blue');
    log('═══════════════════════════', 'blue');
    log(`   Users: ${userCount}`, 'bright');
    log(`   - Customers: ${await User.countDocuments({ role: 'customer' })}`, 'bright');
    log(`   - Barbers: ${await User.countDocuments({ role: 'barber' })}`, 'bright');
    log(`   - Admins: ${await User.countDocuments({ role: 'admin' })}`, 'bright');
    log(`   Services: ${serviceCount}`, 'bright');
    log(`   Bookings: ${bookingCount}`, 'bright');
    log(`   - Pending: ${await Booking.countDocuments({ status: 'pending' })}`, 'bright');
    log(`   - Confirmed: ${await Booking.countDocuments({ status: 'confirmed' })}`, 'bright');
    log(`   - Completed: ${await Booking.countDocuments({ status: 'completed' })}`, 'bright');
    log(`   - Cancelled: ${await Booking.countDocuments({ status: 'cancelled' })}`, 'bright');
  } catch (error) {
    log(`❌ Error fetching statistics: ${error.message}`, 'red');
  }
};

// Main seed function
const seedDatabase = async () => {
  try {
    log('\n╔════════════════════════════════════════════╗', 'bright');
    log('║     🌱 BarberBook Database Seeder         ║', 'bright');
    log('╚════════════════════════════════════════════╝\n', 'bright');
    
    // Connect to database
    await connectDB();
    
    log('🔄 Starting database seeding...', 'yellow');
    log('⚠️  This will delete all existing data!\n', 'yellow');
    
    // Seed data
    log('👥 Seeding users...', 'blue');
    const createdUsers = await seedUsers();
    
    log('💈 Seeding services...', 'blue');
    const createdServices = await seedServices();
    
    log('📅 Seeding bookings...', 'blue');
    await seedBookings(createdUsers, createdServices);
    
    // Display statistics
    await displayStats();
    
    // Display demo credentials
    log('\n🔑 Demo Credentials:', 'green');
    log('═══════════════════════════', 'green');
    log('   Customer:', 'bright');
    log('   📧 Email: customer@demo.com', 'bright');
    log('   🔒 Password: demo123\n', 'bright');
    log('   Barber:', 'bright');
    log('   📧 Email: barber@demo.com', 'bright');
    log('   🔒 Password: demo123\n', 'bright');
    log('   Admin:', 'bright');
    log('   📧 Email: admin@demo.com', 'bright');
    log('   🔒 Password: demo123\n', 'bright');
    
    log('✅ Database seeding completed successfully!', 'green');
    log('🚀 You can now start your server with: npm run dev\n', 'bright');
    
    await disconnectDB();
    process.exit(0);
  } catch (error) {
    log(`\n❌ Error seeding database: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
};

// Run seeder
seedDatabase();