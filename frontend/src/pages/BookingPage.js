import React, { useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { showError, showSuccess, showWarning } from '../utils/alerts';


const BookingPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [barbers, setBarbers] = useState([]);
  const [services, setServices] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBarbers();
    fetchServices();
  }, []);

  const fetchBarbers = async () => {
    try {
      //const response = await axios.get('http://localhost:5000/api/users/barbers');
      const response = await api.get('/users/barbers');
      setBarbers(response.data.barbers || []);
    } catch (error) {
      console.error('Error fetching barbers:', error);
    }
  };

  const fetchServices = async () => {
  try {
    //const response = await axios.get('http://localhost:5000/api/services');
    const response = await api.get('/services');
    const data = response.data;

    if (Array.isArray(data)) {
      // API directly returned an array
      setServices(data);
    } else if (Array.isArray(data.services)) {
      // API wrapped array inside `services`
      setServices(data.services);
    } else {
      console.error('Unexpected services data format:', data);
      setServices([]);
    }
  } catch (error) {
    console.error('Error fetching services:', error);
    setServices([]);
  }
};


  // const fetchAvailableSlots = async () => {
  //   try {
  //    // const response = await axios.get(`http://localhost:5000/api/bookings/available-slots/${selectedBarber}/${selectedDate}`);
  //     const response = await api.get(`/bookings/available-slots/${selectedBarber}/${selectedDate}`);
 
  //    setAvailableSlots(response.data);
  //   } catch (error) {
  //     console.error('Error fetching slots:', error);
  //   }
  // };

  const fetchAvailableSlots = useCallback(async () => {
  try {
    setLoading(true);
    setError(''); // Clear any previous errors
    
    console.log('Fetching slots for:', { barber: selectedBarber, date: selectedDate });
    
    const response = await api.get(`/bookings/available-slots/${selectedBarber}/${selectedDate}`);
    
    console.log('Available slots response:', response.data);
    
    // Handle different response formats
    const slots = Array.isArray(response.data) ? response.data : response.data.slots || [];
    setAvailableSlots(slots);
    
    if (slots.length === 0) {
      console.warn('No available slots found');
    }
  } catch (error) {
    console.error('Error fetching slots:', error);
    setError('Failed to fetch available time slots');
    setAvailableSlots([]);
  } finally {
    setLoading(false);
  }
}, [selectedBarber, selectedDate]);

  useEffect(() => {
    if (selectedBarber && selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedBarber, selectedDate, fetchAvailableSlots]);

  const handleServiceToggle = (serviceId) => {
    setSelectedServices(prev => {
      if (prev.includes(serviceId)) {
        return prev.filter(id => id !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
  };

  const calculateTotal = () => {
    return selectedServices.reduce((total, serviceId) => {
      const service = services.find(s => s._id === serviceId);
      return total + (service?.price || 0);
    }, 0);
  };

  const calculateTotalDuration = () => {
    return selectedServices.reduce((total, serviceId) => {
      const service = services.find(s => s._id === serviceId);
      return total + (service?.duration || 0);
    }, 0);
  };

  const handleSubmit = async () => {
    if (!selectedBarber || selectedServices.length === 0 || !selectedDate || !selectedSlot) {
      showWarning('Booking incomplete', 'Please select barber, services, date, and time.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      //await axios.post('http://localhost:5000/api/bookings', {
      await api.post('/bookings', {  
      barber: selectedBarber,
        services: selectedServices,
        bookingDate: selectedDate,
        startTime: selectedSlot
      });

      await showSuccess('Booking confirmed', 'Your appointment has been created.');
      navigate('/customer/bookings');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create booking';
      setError(message);
      showError('Booking failed', message);
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen">
      <div className="app-page max-w-5xl">
        <div className="page-hero grid gap-6 lg:grid-cols-[1.15fr_.85fr] lg:items-center">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-red-900 dark:text-red-300">
              Appointment Flow
            </p>
            <h1 className="page-title">Book Appointment</h1>
            <p className="page-subtitle">
              Pick a barber, choose services, reserve a slot, and confirm your visit.
            </p>
          </div>
          <div className="barber-hero-media min-h-[180px]" />
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between overflow-x-auto pb-2">
            {['Select Barber', 'Select Services', 'Choose Date & Time', 'Confirm'].map((label, idx) => (
              <div key={idx} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  step > idx ? 'bg-red-900 text-white' : step === idx + 1 ? 'bg-red-900 text-white' : 'bg-stone-200 text-stone-600'
                }`}>
                  {idx + 1}
                </div>
                {idx < 3 && (
                  <div className={`h-1 w-10 sm:w-20 ${step > idx + 1 ? 'bg-red-900' : 'bg-stone-200'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {['Select Barber', 'Select Services', 'Choose Date & Time', 'Confirm'].map((label, idx) => (
              <span key={idx} className="text-xs text-gray-600 w-24 text-center">{label}</span>
            ))}
          </div>
        </div>

        {/* Step 1: Select Barber */}
        {step === 1 && (
          <div className="surface-card">
            <h2 className="text-xl font-semibold mb-4">Select a Barber</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {barbers.map(barber => (
                <div
                  key={barber._id}
                  onClick={() => {
                    setSelectedBarber(barber._id);
                    setStep(2);
                  }}
                  className={`rounded-2xl border-2 p-4 cursor-pointer transition ${
                    selectedBarber === barber._id
                      ? 'border-red-900 bg-red-50 dark:bg-red-950/20'
                      : 'border-stone-200 hover:border-red-800'
                  }`}
                >
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-900 text-xl font-black text-white">
                    {barber.name?.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="font-bold text-lg">{barber.name}</h3>
                  <p className="text-stone-600 text-sm mt-1">{barber.specialty || barber.specialization || 'Professional Barber'}</p>
                  <p className="text-stone-500 text-sm mt-2">
                    Experience: {barber.experience || 'N/A'} years
                  </p>
                  <p className="text-amber-600 text-sm">
                    Rating: {barber.rating ? `${barber.rating}/5` : 'New'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Select Services */}
        {step === 2 && (
          <div className="surface-card">
            <h2 className="text-xl font-semibold mb-4">Select Services</h2>
            <div className="space-y-3 mb-6">
              {services.map(service => (
                <div
                  key={service._id}
                  onClick={() => handleServiceToggle(service._id)}
                  className={`rounded-2xl border-2 p-4 cursor-pointer transition ${
                    selectedServices.includes(service._id)
                      ? 'border-red-900 bg-red-50 dark:bg-red-950/20'
                      : 'border-stone-200 hover:border-red-800'
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-semibold">{service.name}</h3>
                      <p className="text-gray-600 text-sm">{service.description}</p>
                      <p className="text-sm text-gray-500 mt-1">{service.duration} minutes</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-red-900">Rs.{service.price}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col justify-between gap-3 sm:flex-row">
              <button
                onClick={() => setStep(1)}
                className="secondary-action"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={selectedServices.length === 0}
                className="primary-action disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        )}

       {/* Step 3: Choose Date & Time */}
{step === 3 && (
  <div className="surface-card">
    <h2 className="text-xl font-semibold mb-4">Choose Date & Time</h2>
    
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Date
      </label>
      <input
        type="date"
        min={getMinDate()}
        value={selectedDate}
        onChange={(e) => {
          setSelectedDate(e.target.value);
          setSelectedSlot(''); // Reset slot when date changes
        }}
        className="soft-input w-full"
      />
    </div>

    {selectedDate && (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Time Slot
        </label>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading available slots...</p>
          </div>
        ) : availableSlots.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No available slots for this date.</p>
            <p className="text-sm text-gray-500 mt-1">Please select a different date.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {availableSlots.map((slot, idx) => {
              const slotTime = typeof slot === 'string' ? slot : slot.time;
              const isAvailable = typeof slot === 'string' ? true : slot.available;

              return (
                <button
                  key={idx}
                  onClick={() => isAvailable && setSelectedSlot(slotTime)}
                  disabled={!isAvailable}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    selectedSlot === slotTime
                      ? 'bg-red-900 text-white shadow-md'
                      : isAvailable
                      ? 'bg-stone-100 hover:bg-stone-200 text-stone-900 border border-stone-300'
                      : 'bg-stone-50 text-stone-400 cursor-not-allowed line-through'
                  }`}
                >
                  {slotTime}
                </button>
              );
            })}
          </div>
        )}
      </div>
    )}

    <div className="flex flex-col justify-between gap-3 mt-6 sm:flex-row">
      <button
        onClick={() => setStep(2)}
        className="secondary-action"
      >
        Back
      </button>
      <button
        onClick={() => setStep(4)}
        disabled={!selectedDate || !selectedSlot}
        className="primary-action disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continue
      </button>
    </div>
  </div>
)}

        {/* Step 4: Confirm Booking */}
        {step === 4 && (
          <div className="surface-card">
            <h2 className="text-xl font-semibold mb-6">Confirm Booking</h2>
            
            <div className="space-y-4 mb-6">
              <div className="border-b pb-3">
                <p className="text-sm text-gray-600">Barber</p>
                <p className="font-semibold">
                  {barbers.find(b => b._id === selectedBarber)?.name}
                </p>
              </div>
              
              <div className="border-b pb-3">
                <p className="text-sm text-gray-600">Services</p>
                {selectedServices.map(serviceId => {
                  const service = services.find(s => s._id === serviceId);
                  return (
                    <div key={serviceId} className="flex justify-between mt-1">
                      <span>{service?.name}</span>
                      <span className="font-semibold">Rs.{service?.price}</span>
                    </div>
                  );
                })}
              </div>
              
              <div className="border-b pb-3">
                <p className="text-sm text-gray-600">Date & Time</p>
                <p className="font-semibold">
                  {new Date(selectedDate).toLocaleDateString()} at {selectedSlot}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Duration: {calculateTotalDuration()} minutes
                </p>
              </div>
              
              <div className="pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount</span>
                  <span className="text-red-900">Rs.{calculateTotal()}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-3 sm:flex-row">
              <button
                onClick={() => setStep(3)}
                className="secondary-action"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="primary-action disabled:opacity-50"
              >
                {loading ? 'Creating Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingPage;
