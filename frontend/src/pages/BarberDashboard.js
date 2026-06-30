// ✅ File: frontend/src/pages/BarberDashboard.js
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { confirmAction, showError, showSuccess } from "../utils/alerts";

const BarberDashboard = () => {
  // Only one useAuth()
  const { user, loading: authLoading } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingAppointments: 0,
    todayAppointments: 0,
  });
  const [loading, setLoading] = useState(true);

  // LOAD BOOKINGS WHEN USER IS READY
  useEffect(() => {
    if (!authLoading && user?._id) {
      fetchBookings();
    }
  }, [authLoading, user]);

  // FETCH BOOKINGS
  // const fetchBookings = async () => {
  //   try {
  //     const token = localStorage.getItem("token");
  //     const config = { headers: { Authorization: `Bearer ${token}` } };

  //     // const res = await axios.get(
  //     //   "http://localhost:5000/api/bookings/all",
  //     //   config
  //     // );

  //         const res = await axios.get(
  //     `http://localhost:5000/api/bookings/barber/${user._id}`,
  //     config
  //   );

  //     const allBookings = Array.isArray(res.data)
  //       ? res.data
  //       : res.data.bookings || res.data.data || [];

  //     // Filter bookings for this barberfetchBookings 
  //     const barberBookings = allBookings.filter((b) => {
  //       const barberId =
  //         typeof b.barber === "object" ? b.barber._id : b.barber;

  //       return barberId?.toString() === user._id?.toString();
  //     });

  //     setBookings(barberBookings);

  //     // Calculate stats
  //     const pending = barberBookings.filter(
  //       (b) => b.status === "pending"
  //     ).length;

  //     const today = new Date().toISOString().split("T")[0];
  //     const todayAppointments = barberBookings.filter(
  //       (b) => b.bookingDate?.split("T")[0] === today
  //     ).length;

  //     setStats({
  //       totalAppointments: barberBookings.length,
  //       pendingAppointments: pending,
  //       todayAppointments,
  //     });
  //   } catch (error) {
  //     console.error("❌ Error fetching bookings:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  //----------PREET27112025---------//
  const fetchBookings = async () => {
  try {
    console.log('BarberDashboard: Fetching bookings...');

    // Use the correct endpoint that exists in your backend
    const res = await api.get('/bookings/barber-bookings');

    console.log('BarberDashboard: API response:', res.data);

    const allBookings = Array.isArray(res.data)
      ? res.data
      : res.data.bookings || res.data.data || [];

    console.log('BarberDashboard: Found bookings:', allBookings.length);

    setBookings(allBookings);// Set all bookings directly

    // Calculate stats
    const pending = allBookings.filter(
      (b) => b.status === "pending"
    ).length;

    const today = new Date().toISOString().split("T")[0];
    const todayAppointments = allBookings.filter(
      (b) => b.bookingDate?.split("T")[0] === today
    ).length;

    setStats({
      totalAppointments: allBookings.length,
      pendingAppointments: pending,
      todayAppointments,
    });
  } catch (error) {
    console.error("❌ Error fetching bookings:", error);
  } finally {
    setLoading(false);
  }
};

  // UPDATE BOOKING STATUS
  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      if (!bookingId) return;

      const confirmed = await confirmAction({
        title: 'Update booking?',
        text: `This appointment will be marked as ${newStatus}.`,
        confirmButtonText: `Mark ${newStatus}`,
      });

      if (!confirmed) return;

      await api.patch(
        `/bookings/${bookingId}/status`,
        { status: newStatus }
      );

      setBookings((prev) =>
        prev.map((booking) =>
          booking._id === bookingId
            ? {
                ...booking,
                status: newStatus,
              }
            : booking
        )
      );

      showSuccess('Booking updated', `Booking marked as ${newStatus}.`);
      fetchBookings(); // Refresh list
    } catch (error) {
      console.error("❌ Update failed:", error);
      const message =
        error.response?.data?.message ||
        "Error updating booking status.";

      showError('Update failed', message);
    }
  };

  // UPCOMING BOOKINGS
  const upcomingBookings = bookings
    .filter((b) =>
      b.status !== "completed" &&
      b.status !== "rejected"
    )
    .sort((a, b) => {
      const aDate = new Date(`${a.bookingDate.split("T")[0]}T${a.startTime}`);
      const bDate = new Date(`${b.bookingDate.split("T")[0]}T${b.startTime}`);
      return aDate - bDate;
    });

  // Badge Colors
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };


  // LOADING VIEW
  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex items-center">
          <div
            className="mr-4 w-6 h-6 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"
            aria-hidden="true"
          />
          <p className="text-gray-600 text-lg">Loading bookings...</p>
        </div>
      </div>
    );
  }
  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-600 text-lg">Loading bookings...</p>
      </div>
    );
  }

  // RENDER DASHBOARD
  return (
    <div className="app-page">
      {/* Header */}
      <div className="page-hero">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-red-900 dark:text-red-300">
          Barber Workspace
        </p>
        <h1 className="page-title">
          Barber Dashboard
        </h1>
        <p className="page-subtitle">Welcome back, {user.name}. Review pending requests and keep today&apos;s appointments moving.</p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2 xl:grid-cols-3">
        <DashboardCard
          icon="📅"
          count={stats.totalAppointments}
          label="Total Appointments"
        />
        <DashboardCard
          icon="⏰"
          count={stats.pendingAppointments}
          label="Pending"
        />
        <DashboardCard
          icon="📆"
          count={stats.todayAppointments}
          label="Today's Appointments"
        />
      </div>

      {/* Upcoming Bookings */}
      {upcomingBookings.length > 0 ? (
        <div className="surface-card">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Upcoming Appointments
          </h2>

          <div className="space-y-4">
            {upcomingBookings.map((booking) => (
              <div
                key={booking._id}
                className="rounded-2xl border border-gray-100 bg-gray-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-gray-800 dark:bg-gray-800"
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  {/* Booking Info */}
                  <div className="flex-grow">
                    <div className="space-y-1 text-gray-700">
                      <p>
                        <strong>Customer:</strong>{" "}
                        {booking.customer?.name || "N/A"}
                      </p>
                      <p>
                        <strong>Date:</strong>{" "}
                        {new Date(booking.bookingDate).toLocaleDateString(
                          "en-GB"
                        )}
                      </p>
                      <p>
                        <strong>Time:</strong> {booking.startTime}
                      </p>
                      <p>
                        <strong>Service:</strong>{" "}
                        {booking.services
                          ?.map(
                            (s) =>
                              s.service?.name ||
                              s.serviceName ||
                              s.name
                          )
                          .join(", ") || "N/A"}
                      </p>
                      <p>
                        <strong>Total Amount:</strong> ₹
                        {booking.totalAmount}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3 md:items-end">
                    <span
                      className={`px-4 py-2 rounded-full font-semibold capitalize ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {booking.status}
                    </span>

                    <div className="flex flex-wrap gap-2">
                      {booking.status === "pending" && (
                        <>
                          <button
                            onClick={() =>
                              handleUpdateStatus(
                                booking._id,
                                "accepted"
                              )
                            }
                            className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() =>
                              handleUpdateStatus(
                                booking._id,
                                "rejected"
                              )
                            }
                            className="rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {(booking.status === "accepted" ||
                        booking.status === "confirmed") && (
                        <>
                          <button
                            onClick={() =>
                              handleUpdateStatus(
                                booking._id,
                                "completed"
                              )
                            }
                            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() =>
                              handleUpdateStatus(
                                booking._id,
                                "rejected"
                              )
                            }
                            className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
                          >
                            Cancel
                          </button>
                        </>
                      )}

                      {(booking.status === "completed" ||
                        booking.status === "rejected") && (
                        <span className="text-gray-500 text-sm italic">
                          No actions available
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="surface-card p-12 text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            No upcoming appointments
          </h3>
          <p className="text-gray-600">You're all caught up!</p>
        </div>
      )}
    </div>
  );
};

// Reusable Card Component
const DashboardCard = ({ icon, count, label }) => (
  <div className="stat-card flex items-center space-x-4">
    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-4xl dark:bg-red-950">
      {icon}
    </div>
    <div>
      <h3 className="text-3xl font-bold text-gray-800">{count}</h3>
      <p className="text-gray-600">{label}</p>
    </div>
  </div>
);

export default BarberDashboard;
