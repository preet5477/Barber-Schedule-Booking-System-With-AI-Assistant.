// import React from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { useTheme } from '../context/ThemeContext';

// const Navbar = () => {
//   const { user, logout } = useAuth();
//   const { isDark, toggleTheme } = useTheme();
//   const navigate = useNavigate();

//   const navLinkClass =
//     'block w-full rounded-lg px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-blue-300';

//   const handleLogout = () => {
//     logout();
//     navigate('/login');
//   };

//   const getNavLinks = () => {
//     // ✅ Add null check before accessing user.role
//     if (!user) return null;

//     if (user.role === 'customer') {
//       return (
//         <>
//           <Link to="/customer/dashboard" className={navLinkClass}>
//             Dashboard
//           </Link>
//           <Link to="/customer/book" className={navLinkClass}>
//             Book Appointment
//           </Link>
//           <Link to="/customer/bookings" className={navLinkClass}>
//             My Bookings
//           </Link>
//            {/* AI Assistant Link */}
//           <Link
//             to="/ai-chat"
//             className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
//           >
//             🤖 AI Assistant
//           </Link>
//         </>
//       );
//     } else if (user.role === 'barber') {
//       return (
//         <>
//           <Link to="/barber/dashboard" className={navLinkClass}>
//             Dashboard
//           </Link>
//             {/* AI Assistant Link */}
//           <Link
//             to="/ai-chat"
//             className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
//           >
//             🤖 AI Assistant
//           </Link>
//         </>
//       );
//     } else if (user.role === 'admin') {
//       return (
//         <>
//           <Link to="/admin/dashboard" className={navLinkClass}>
//             Dashboard
//           </Link>
//           <Link to="/admin/services" className={navLinkClass}>
//             Services
//           </Link>
//           <Link to="/admin/barbers" className={navLinkClass}>
//             Barbers
//           </Link>
//             {/* AI Assistant Link */}
//           <Link
//             to="/ai-chat"
//             className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
//           >
//             🤖 AI Assistant
//           </Link>
//         </>
//       );
//     }
//     return null;
//   };

//   // ✅ Don't render navbar if user is not logged in
//   if (!user) {
//     return null;
//   }

//   return (
//     <nav className="z-40 bg-white/95 shadow-lg backdrop-blur border-b border-transparent transition-colors duration-300 dark:bg-gray-950/95 dark:border-gray-800 lg:fixed lg:right-0 lg:top-0 lg:h-screen lg:w-64 lg:border-b-0 lg:border-l">
//       <div className="h-full px-4 sm:px-6 lg:px-5">
//         <div className="flex min-h-16 flex-wrap items-center justify-between gap-3 py-3 lg:h-full lg:flex-col lg:flex-nowrap lg:items-stretch lg:justify-start lg:py-6">
//           <div className="flex items-center shrink-0 lg:mb-6">
//             <span className="text-xl font-bold text-blue-600 dark:text-blue-400">Barber Booking</span>
//           </div>
          
//           <div className="flex flex-wrap items-center justify-end gap-2 lg:flex-1 lg:flex-col lg:flex-nowrap lg:items-stretch lg:justify-start">
//             <div className="flex flex-wrap items-center justify-end gap-2 lg:flex-col lg:items-stretch">
//               {getNavLinks()}
//             </div>
            
//             <div className="flex flex-wrap items-center justify-end gap-2 border-l pl-4 ml-2 dark:border-gray-700 lg:mt-auto lg:flex-col lg:items-stretch lg:border-l-0 lg:border-t lg:pl-0 lg:pt-4 lg:ml-0">
//               <button
//                 onClick={toggleTheme}
//                 aria-label="Toggle theme"
//                 className="flex h-9 min-w-[92px] items-center justify-center rounded-full border border-gray-300 bg-gray-100 px-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 lg:w-full"
//               >
//                 {isDark ? 'Dark Mode' : 'Light Mode'}
//               </button>

//               <span className="hidden text-gray-700 dark:text-gray-200 sm:inline lg:block lg:text-sm">
//                 {user.name} <span className="text-xs text-gray-500">({user.role})</span>
//               </span>
//               <button
//                 onClick={handleLogout}
//                 className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium lg:w-full"
//               >
//                 Logout
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const linkClass = (path) =>
    `flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150 ${
      isActive(path)
        ? 'bg-red-900 text-white shadow-sm shadow-red-950/20'
        : 'text-stone-600 hover:bg-stone-100 hover:text-stone-950 dark:text-stone-300 dark:hover:bg-neutral-800 dark:hover:text-white'
    }`;

  const aiLinkClass = (path) =>
    `flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150 ${
      isActive(path)
        ? 'bg-amber-700 text-white shadow-sm shadow-amber-950/20'
        : 'text-amber-800 bg-amber-50 hover:bg-amber-100 dark:text-amber-300 dark:bg-amber-950/40 dark:hover:bg-amber-900/40'
    }`;

  const getNavLinks = () => {
    if (!user) return null;

    if (user.role === 'customer') {
      return (
        <>
          <Link to="/customer/dashboard" className={linkClass('/customer/dashboard')}>
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
            Dashboard
          </Link>
          <Link to="/customer/book" className={linkClass('/customer/book')}>
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            Book Appointment
          </Link>
          <Link to="/customer/bookings" className={linkClass('/customer/bookings')}>
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
            My Bookings
          </Link>
          <Link to="/ai-chat" className={aiLinkClass('/ai-chat')}>
            <span className="text-xs font-black leading-none">AI</span>
            AI Assistant
          </Link>
        </>
      );
    } else if (user.role === 'barber') {
      return (
        <>
          <Link to="/barber/dashboard" className={linkClass('/barber/dashboard')}>
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
            Dashboard
          </Link>
          <Link to="/ai-chat" className={aiLinkClass('/ai-chat')}>
            <span className="text-xs font-black leading-none">AI</span>
            AI Assistant
          </Link>
        </>
      );
    } else if (user.role === 'admin') {
      return (
        <>
          <Link to="/admin/dashboard" className={linkClass('/admin/dashboard')}>
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
            Dashboard
          </Link>
          <Link to="/admin/services" className={linkClass('/admin/services')}>
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
            Services
          </Link>
          <Link to="/admin/barbers" className={linkClass('/admin/barbers')}>
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            Barbers
          </Link>
          <Link to="/ai-chat" className={aiLinkClass('/ai-chat')}>
            <span className="text-xs font-black leading-none">AI</span>
            AI Assistant
          </Link>
        </>
      );
    }
    return null;
  };

  const roleColor = {
    customer: 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-200',
    barber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    admin: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  };

  const UserBlock = () => (
    <div className="flex items-center gap-3 px-1">
      {/* Avatar */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-800 to-stone-900 text-white text-sm font-bold shadow-sm">
        {user.name?.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{user.name}</p>
        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${roleColor[user.role] || ''}`}>
          {user.role}
        </span>
      </div>
    </div>
  );

  return (
    <>
      {/* ── DESKTOP: fixed left sidebar ── */}
      <aside className="hidden lg:flex lg:fixed lg:inset-y-0 lg:right-0 lg:w-64 lg:flex-col lg:border-l lg:border-gray-200 lg:bg-white lg:dark:border-gray-800 lg:dark:bg-gray-950 z-40">
        {/* Brand */}
        <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-gray-200 px-5 dark:border-gray-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-900 text-white">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <span className="text-base font-bold tracking-tight text-gray-900 dark:text-white">Barber Booking</span>
        </div>

        {/* Nav links */}
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
          {getNavLinks()}
        </nav>

        {/* Bottom section */}
        <div className="shrink-0 border-t border-gray-200 px-3 py-4 space-y-3 dark:border-gray-800">
          <UserBlock />
          <button
            onClick={toggleTheme}
            className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-all"
          >
            {isDark ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 100 10A5 5 0 0012 7z"/></svg>
                Light Mode
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
                Dark Mode
              </>
            )}
          </button>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            Logout
          </button>
        </div>
      </aside>

      {/* ── MOBILE: top bar ── */}
      <header className="lg:hidden fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-gray-200 bg-white/95 backdrop-blur px-4 dark:border-gray-800 dark:bg-gray-950/95">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-900 text-white">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <span className="text-sm font-bold tracking-tight text-gray-900 dark:text-white">Barber Booking</span>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition"
          >
            {isDark ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 100 10A5 5 0 0012 7z"/></svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
            )}
          </button>
          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition"
          >
            {menuOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
            )}
          </button>
        </div>
      </header>

      {/* ── MOBILE: slide-down drawer ── */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="lg:hidden fixed inset-0 z-30 bg-black/30 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          {/* Drawer */}
          <div className="lg:hidden fixed inset-x-0 top-14 z-40 border-b border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-950 animate-[slideDown_200ms_ease-out]">
            <nav className="flex flex-col gap-1 px-3 py-3">
              {getNavLinks()}
            </nav>
            <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 dark:border-gray-800">
              <UserBlock />
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-900/30 transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                Logout
              </button>
            </div>
          </div>
        </>
      )}

      {/* Spacer so content doesn't hide behind mobile top bar */}
      <div className="h-14 lg:hidden" aria-hidden="true" />
    </>
  );
};

export default Navbar;
