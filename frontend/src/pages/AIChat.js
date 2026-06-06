import React, { useCallback, useEffect, useRef, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { showError } from '../utils/alerts';

const ROLE_CONFIG = {
  admin: {
    title: 'AI Admin Assistant',
    subtitle: 'Revenue, services, barbers, bookings, and reports.',
    placeholder: 'Ask about revenue, bookings, or services...',
    badge: 'Admin',
    accent: 'red',
    prompts: ['Revenue report', 'Top performing barbers', 'Show all bookings', 'Add a new service'],
  },
  barber: {
    title: 'AI Barber Assistant',
    subtitle: 'Appointments, schedules, clients, and daily workflow.',
    placeholder: 'Ask about your schedule or appointments...',
    badge: 'Barber',
    accent: 'emerald',
    prompts: ["Today's appointments", 'Upcoming bookings', 'Pending requests', 'Grooming tips'],
  },
  customer: {
    title: 'AI Customer Assistant',
    subtitle: 'Book appointments, check slots, and get grooming advice.',
    placeholder: 'Ask about services, slots, or grooming...',
    badge: 'Customer',
    accent: 'amber',
    prompts: ['Book an appointment', 'Available slots today', 'Service prices', 'Recommend a barber'],
  },
};

const accentClasses = {
  red: {
    bg: 'bg-red-900',
    badge: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200',
    chip: 'hover:border-red-800 hover:text-red-900 hover:bg-red-50',
  },
  emerald: {
    bg: 'bg-emerald-700',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
    chip: 'hover:border-emerald-700 hover:text-emerald-800 hover:bg-emerald-50',
  },
  amber: {
    bg: 'bg-red-900',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
    chip: 'hover:border-red-800 hover:text-red-900 hover:bg-red-50',
  },
};

const formatTime = () =>
  new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const getInitials = (name = '') =>
  name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U';

const getWelcome = (role, name) => {
  const first = name?.split(' ')[0] || 'there';
  if (role === 'admin') return `Welcome back, ${first}. I can help with reports, services, barbers, and bookings.`;
  if (role === 'barber') return `Hey ${first}. I can help you review appointments and manage your day.`;
  return `Hi ${first}. I can help you book a visit, compare services, or find available slots.`;
};

const AIChat = () => {
  const { user } = useAuth();
  const role = ROLE_CONFIG[user?.role] ? user.role : 'customer';
  const config = ROLE_CONFIG[role];
  const accent = accentClasses[config.accent];

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setMessages([
      {
        sender: 'ai',
        text: getWelcome(role, user?.name),
        time: formatTime(),
      },
    ]);
  }, [role, user?.name]);

  useEffect(() => {
    if (bottomRef.current) {
      requestAnimationFrame(() => {
        bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      });
    }
  }, [messages, loading]);

  const send = useCallback(
    async (text) => {
      const trimmed = (text || input).trim();
      if (!trimmed || loading) return;

      setMessages((prev) => [...prev, { sender: 'user', text: trimmed, time: formatTime() }]);
      setInput('');
      setLoading(true);

      try {
        const { data } = await api.post('/ai/chat', { message: trimmed });
        setMessages((prev) => [...prev, { sender: 'ai', text: data.reply, time: formatTime() }]);
      } catch (error) {
        const message = error.response?.data?.reply || 'Something went wrong. Please try again.';
        showError('Assistant error', message);
        setMessages((prev) => [...prev, { sender: 'ai', text: message, time: formatTime() }]);
      } finally {
        setLoading(false);
        inputRef.current?.focus();
      }
    },
    [input, loading]
  );

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="app-page">
      <div className="page-hero grid gap-6 lg:grid-cols-[1.2fr_.8fr] lg:items-center">
        <div>
          <span className={`mb-3 inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${accent.badge}`}>
            {config.badge}
          </span>
          <h1 className="page-title">{config.title}</h1>
          <p className="page-subtitle">{config.subtitle}</p>
        </div>
        <div className="barber-hero-media min-h-[180px]" />
      </div>

      <section className="surface-card flex min-h-[620px] flex-col overflow-hidden p-0">
        <div className="bg-white dark:bg-neutral-950">
          <div className="flex items-center gap-3 border-b border-stone-200 bg-stone-50 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-950">
            <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${accent.bg} text-sm font-black text-white`}>
              AI
            </div>
            <div>
              <p className="font-black text-stone-950 dark:text-white">{config.title}</p>
              <p className="text-xs text-stone-500">{config.subtitle}</p>
            </div>
            <span className="ml-auto rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">
              Online
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto border-b border-stone-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900">
            {config.prompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => send(prompt)}
                className={`shrink-0 rounded-full border border-stone-300 px-3 py-1.5 text-xs font-bold text-stone-600 transition dark:border-neutral-700 dark:text-stone-300 ${accent.chip}`}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
          <div ref={chatRef} className="h-full space-y-4 overflow-y-auto p-4">
          {messages.map((msg, index) => {
            const isUser = msg.sender === 'user';
            return (
              <div key={index} className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                {!isUser && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stone-100 text-xs font-black text-stone-500 dark:bg-neutral-800">
                    AI
                  </div>
                )}
                <div className={`max-w-[82%] ${isUser ? 'text-right' : 'text-left'}`}>
                  <div
                    className={`rounded-2xl px-4 py-3 text-base leading-6 shadow-sm whitespace-pre-line ${
                      isUser
                        ? `${accent.bg} rounded-br-sm text-white`
                        : 'rounded-bl-sm border border-stone-200 bg-stone-50 text-stone-800 dark:border-neutral-800 dark:bg-neutral-950 dark:text-stone-100'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="mt-1 block px-1 text-[11px] text-stone-400">{msg.time}</span>
                </div>
                {isUser && (
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${accent.bg} text-xs font-black text-white`}>
                    {getInitials(user?.name)}
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-xs font-black text-stone-500 dark:bg-neutral-800">
                AI
              </div>
              <div className="rounded-2xl rounded-bl-sm border border-stone-200 bg-stone-50 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-950">
                <span className="inline-flex gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-stone-400" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-stone-400 [animation-delay:120ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-stone-400 [animation-delay:240ms]" />
                </span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        </div>

        <div className="flex gap-2 border-t border-stone-200 p-4 dark:border-neutral-800">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={config.placeholder}
            className="soft-input min-h-[48px] flex-1 resize-none"
          />
          <button
            onClick={() => send()}
            disabled={loading || !input.trim()}
            className="primary-action shrink-0 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Sending' : 'Send'}
          </button>
        </div>
      </section>
    </div>
  );
};

export default AIChat;
