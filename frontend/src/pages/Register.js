import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { showError, showSuccess, showWarning } from '../utils/alerts';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
    specialty: '',
    experience: '',
    bio: '',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
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

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
      showWarning('Missing details', 'Please fill in all required fields.');
      return false;
    }

    if (formData.password.length < 6) {
      showWarning('Weak password', 'Password must be at least 6 characters.');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      showWarning('Password mismatch', 'Please confirm the same password.');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      showWarning('Invalid email', 'Please enter a valid email address.');
      return false;
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      showWarning('Invalid phone', 'Please enter a valid 10-digit phone number.');
      return false;
    }

    if (formData.role === 'barber' && (!formData.specialty || !formData.experience)) {
      showWarning('Barber profile incomplete', 'Specialty and experience are required for barbers.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    const userData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      role: formData.role,
    };

    if (formData.role === 'barber') {
      userData.specialty = formData.specialty;
      userData.experience = formData.experience;
      if (formData.bio) userData.bio = formData.bio;
    }

    try {
      const result = await register(userData);

      if (result.success) {
        await showSuccess('Account created', 'Your profile is ready.');
        navigateByRole(result.user.role);
      } else {
        showError('Registration failed', result.message);
      }
    } catch (error) {
      showError('Registration failed', 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl items-start gap-8 lg:grid-cols-[.9fr_1.1fr]">
        <section className="barber-hero-media hidden min-h-[760px] lg:block">
          <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
            <span className="mb-3 w-fit rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wide backdrop-blur">
              Join The Chair
            </span>
            <h1 className="max-w-lg text-5xl font-black leading-tight">
              A polished booking flow for customers, barbers, and admins.
            </h1>
          </div>
        </section>

        <section className="surface-card mx-auto w-full max-w-2xl p-6 sm:p-8">
          <div className="mb-7">
            <p className="text-sm font-black uppercase tracking-wide text-red-900 dark:text-red-300">
              Create Account
            </p>
            <h1 className="mt-2 text-3xl font-black text-stone-950 dark:text-white">
              Start booking smarter.
            </h1>
            <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
              Choose your role and complete your profile.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} disabled={loading} required />
            <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} disabled={loading} required />
            <Input label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} disabled={loading} maxLength="10" required />

            <div>
              <label className="mb-2 block text-sm font-bold text-stone-700 dark:text-stone-200">Role</label>
              <select name="role" value={formData.role} onChange={handleChange} disabled={loading} className="soft-input w-full" required>
                <option value="customer">Customer</option>
                <option value="barber">Barber</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {formData.role === 'barber' && (
              <>
                <Input label="Specialty" name="specialty" value={formData.specialty} onChange={handleChange} disabled={loading} placeholder="Classic Cuts, Fades" required />
                <Input label="Experience" name="experience" value={formData.experience} onChange={handleChange} disabled={loading} placeholder="5 years" required />
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-bold text-stone-700 dark:text-stone-200">Bio</label>
                  <textarea name="bio" value={formData.bio} onChange={handleChange} rows="3" disabled={loading} className="soft-input w-full" placeholder="Short barber profile" />
                </div>
              </>
            )}

            <Input label="Password" name="password" type="password" value={formData.password} onChange={handleChange} disabled={loading} required />
            <Input label="Confirm Password" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} disabled={loading} required />

            <button type="submit" disabled={loading} className="primary-action sm:col-span-2 disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-stone-600 dark:text-stone-300">
            Already have an account?{' '}
            <Link to="/login" className="font-black text-red-900 hover:text-red-700 dark:text-red-300">
              Sign in
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
};

const Input = ({ label, ...props }) => (
  <div>
    <label className="mb-2 block text-sm font-bold text-stone-700 dark:text-stone-200">
      {label}
    </label>
    <input className="soft-input w-full" placeholder={props.placeholder || label} {...props} />
  </div>
);

export default Register;
