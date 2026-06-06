import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { showError, showSuccess } from '../utils/alerts';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const navigateByRole = (role) => {
    if (role === 'admin') navigate('/admin/dashboard', { replace: true });
    else if (role === 'barber') navigate('/barber/dashboard', { replace: true });
    else navigate('/customer/dashboard', { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        await showSuccess('Welcome back', 'Your workspace is ready.');
        navigateByRole(result.user.role);
      } else {
        showError('Login failed', result.message);
      }
    } catch (err) {
      showError('Login failed', 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_.95fr]">
        <section className="barber-hero-media hidden lg:block">
          <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
            <span className="mb-3 w-fit rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wide backdrop-blur">
              Premium Grooming
            </span>
            <h1 className="max-w-lg text-5xl font-black leading-tight">
              Sharp schedules for sharp cuts.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-white/85">
              Book barbers, manage appointments, and keep every chair running smoothly.
            </p>
          </div>
        </section>

        <section className="surface-card mx-auto w-full max-w-md p-6 sm:p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-900 text-2xl font-black text-white shadow-lg shadow-red-950/20">
              B
            </div>
            <h2 className="text-3xl font-black text-stone-950 dark:text-white">
              Barber Booking
            </h2>
            <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
              Sign in to manage your appointments.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-bold text-stone-700 dark:text-stone-200">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="soft-input w-full"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-bold text-stone-700 dark:text-stone-200">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="soft-input w-full"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="primary-action w-full disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-stone-600 dark:text-stone-300">
            New to the shop?{' '}
            <Link to="/register" className="font-black text-red-900 hover:text-red-700 dark:text-red-300">
              Create an account
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
};

export default Login;
