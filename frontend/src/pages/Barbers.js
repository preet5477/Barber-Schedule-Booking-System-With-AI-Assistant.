import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { showError, showSuccess, showWarning } from '../utils/alerts';

const initialBarber = {
  name: '',
  email: '',
  phone: '',
  specialty: '',
  experience: '',
  bio: '',
  available: true,
};

const Barbers = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [newBarber, setNewBarber] = useState(initialBarber);

  const fetchBarbers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/barbers');
      setBarbers(res.data.barbers || []);
    } catch (error) {
      console.error('Error fetching barbers:', error);
      setBarbers([]);
      showError('Could not load barbers', error.response?.data?.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBarbers();
  }, []);

  const handleBookBarber = (barber) => {
    if (!barber.available) {
      showWarning('Barber unavailable', 'Please choose another professional or try a different time.');
      return;
    }

    navigate('/customer/book', { state: { selectedBarber: barber } });
  };

  const handleAddBarber = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post('/users/barbers', newBarber);

      if (res.data.success) {
        showSuccess('Barber added', `${newBarber.name} is now on the team.`);
        setShowForm(false);
        setNewBarber(initialBarber);
        fetchBarbers();
      } else {
        showError('Could not add barber', res.data.message || 'Failed to add barber.');
      }
    } catch (error) {
      console.error('Error adding barber:', error);
      showError('Could not add barber', error.response?.data?.message || 'Something went wrong.');
    }
  };

  const filteredBarbers = barbers.filter((barber) => {
    if (filter === 'available') return barber.available;
    if (filter === 'unavailable') return !barber.available;
    return true;
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-red-900" />
      </div>
    );
  }

  return (
    <div className="app-page">
      <div className="page-hero flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-red-900 dark:text-red-300">
            The Team
          </p>
          <h1 className="page-title">Expert Barbers</h1>
          <p className="page-subtitle">
            Pick a professional for clean fades, classic trims, beard care, and full grooming.
          </p>
        </div>

        {user?.role === 'admin' && (
          <button onClick={() => setShowForm(true)} className="primary-action">
            Add Barber
          </button>
        )}
      </div>

      <div className="mb-8 flex gap-3 overflow-x-auto pb-2 sm:flex-wrap">
        {['all', 'available', 'unavailable'].map((option) => (
          <button
            key={option}
            onClick={() => setFilter(option)}
            className={`barber-tab ${filter === option ? 'barber-tab-active' : ''}`}
          >
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </button>
        ))}
      </div>

      {filteredBarbers.length === 0 ? (
        <div className="surface-card py-12 text-center">
          <p className="text-lg text-stone-500">No barbers found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredBarbers.map((barber) => (
            <article
              key={barber._id}
              className={`surface-card surface-card-hover overflow-hidden p-0 ${!barber.available ? 'opacity-70' : ''}`}
            >
              <div className="relative flex h-44 items-center justify-center bg-neutral-950">
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(127,29,29,.88),rgba(68,64,60,.78)),url('https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=900&q=80')] bg-cover bg-center" />
                <span className={`absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-bold text-white ${barber.available ? 'bg-emerald-600' : 'bg-red-700'}`}>
                  {barber.available ? 'Available' : 'Unavailable'}
                </span>
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-white/70 bg-white text-4xl font-black text-red-900">
                  {barber.name?.charAt(0).toUpperCase()}
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-2xl font-black text-stone-950 dark:text-white">{barber.name}</h3>
                <p className="mt-1 font-bold text-red-900 dark:text-red-300">{barber.specialty || 'Professional Barber'}</p>
                <p className="mt-2 text-sm text-stone-500">Experience: {barber.experience || 'N/A'} years</p>

                <div className="my-5 grid grid-cols-2 gap-3">
                  <div className="barber-metric text-center">
                    <p className="text-xl font-black text-amber-600">{barber.rating?.toFixed?.(1) || '0.0'}</p>
                    <p className="text-xs text-stone-500">Rating</p>
                  </div>
                  <div className="barber-metric text-center">
                    <p className="text-xl font-black text-red-900 dark:text-red-300">{barber.reviews || 0}</p>
                    <p className="text-xs text-stone-500">Reviews</p>
                  </div>
                </div>

                <div className="mb-5 space-y-1 text-sm text-stone-600 dark:text-stone-300">
                  <p>{barber.email}</p>
                  <p>{barber.phone}</p>
                </div>

                {barber.bio && (
                  <p className="mb-5 text-sm italic text-stone-500">"{barber.bio}"</p>
                )}

                {user?.role !== 'admin' && (
                  <button
                    onClick={() => handleBookBarber(barber)}
                    className={`w-full rounded-xl px-4 py-3 text-sm font-black transition ${
                      barber.available
                        ? 'bg-red-900 text-white hover:bg-red-800'
                        : 'cursor-not-allowed bg-stone-200 text-stone-500'
                    }`}
                    disabled={!barber.available}
                  >
                    {barber.available ? `Book with ${barber.name.split(' ')[0]}` : 'Currently Unavailable'}
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
          <form onSubmit={handleAddBarber} className="surface-card max-h-[90vh] w-full max-w-lg overflow-y-auto">
            <h2 className="mb-5 text-2xl font-black text-stone-950 dark:text-white">Add New Barber</h2>

            <div className="grid gap-3 sm:grid-cols-2">
              {['name', 'email', 'phone', 'specialty', 'experience'].map((key) => (
                <input
                  key={key}
                  type={key === 'experience' ? 'number' : 'text'}
                  min={key === 'experience' ? '0' : undefined}
                  placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                  value={newBarber[key]}
                  onChange={(e) => setNewBarber({ ...newBarber, [key]: e.target.value })}
                  className="soft-input w-full"
                  required
                />
              ))}
              <textarea
                placeholder="Bio"
                value={newBarber.bio}
                onChange={(e) => setNewBarber({ ...newBarber, bio: e.target.value })}
                className="soft-input w-full sm:col-span-2"
                rows="3"
              />
              <label className="flex items-center gap-3 rounded-xl border border-stone-200 p-3 text-sm font-bold dark:border-neutral-700">
                <input
                  type="checkbox"
                  checked={newBarber.available}
                  onChange={(e) => setNewBarber({ ...newBarber, available: e.target.checked })}
                />
                Available for bookings
              </label>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button type="submit" className="primary-action flex-1">Add Barber</button>
              <button type="button" onClick={() => setShowForm(false)} className="secondary-action flex-1">Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Barbers;
