import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { showError, showSuccess } from "../utils/alerts";

const emptyServiceForm = {
  name: "",
  description: "",
  price: "",
  duration: "",
  category: "",
  icon: "",
};

const Services = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceForm, setServiceForm] = useState(emptyServiceForm);

  const isAdmin = user?.role === "admin";

  const categories = [
    { id: "all", name: "All Services" },
    { id: "haircut", name: "Haircuts" },
    { id: "beard", name: "Beard Care" },
    { id: "shave", name: "Shaving" },
    { id: "coloring", name: "Coloring" },
    { id: "facial", name: "Facial" },
    { id: "styling", name: "Styling" },
  ];

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);

      const endpoint = isAdmin
        ? "/services/admin/all"
        : "/services";

      const res = await api.get(endpoint);

      setServices(res.data.services || []);
    } catch (error) {
      console.error("Error fetching services:", error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const filteredServices =
    selectedCategory === "all"
      ? services
      : services.filter((service) => service.category === selectedCategory);

  const resetServiceForm = () => {
    setServiceForm(emptyServiceForm);
    setEditingService(null);
    setShowForm(false);
  };

  const handleOpenAddForm = () => {
    setEditingService(null);
    setServiceForm(emptyServiceForm);
    setShowForm(true);
  };

  const handleOpenEditForm = (service) => {
    setEditingService(service);
    setServiceForm({
      name: service.name || "",
      description: service.description || "",
      price: service.price || "",
      duration: service.duration || "",
      category: service.category || "",
      icon: service.icon || "",
    });
    setShowForm(true);
  };

  const handleBookService = (service) => {
    navigate("/customer/book", {
      state: {
        selectedService: service,
      },
    });
  };

  const handleSaveService = async (e) => {
    e.preventDefault();

    try {
      const response = editingService
        ? await api.put(
            `/services/${editingService._id}`,
            serviceForm
          )
        : await api.post(
            "/services",
            serviceForm
          );

      showSuccess(
        editingService ? "Service updated" : "Service added",
        response.data.message || "Service saved successfully!"
      );
      resetServiceForm();
      fetchServices();
    } catch (error) {
      showError("Service not saved", error.response?.data?.message || "Error saving service");
    }
  };

  const handleToggleServiceStatus = async (service) => {
    try {
      const response = await api.patch(
        `/services/${service._id}/status`,
        {
          isActive: !service.isActive,
        }
      );

      setServices((prev) =>
        prev.map((item) =>
          item._id === service._id
            ? response.data.service
            : item
        )
      );

      showSuccess("Service updated", response.data.message || "Service status updated!");
    } catch (error) {
      showError("Update failed", error.response?.data?.message || "Error updating service status");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="app-page">
      <div className="page-hero flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-300">
            Service Menu
          </p>
          <h1 className="page-title">
            Our Services
          </h1>
          <p className="page-subtitle">
            Choose from premium grooming services, with clear pricing and duration.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAddForm}
            className="primary-action"
          >
            Add Service
          </button>
        )}
      </div>

      <div className="mb-8 flex gap-3 overflow-x-auto pb-2 sm:flex-wrap sm:justify-center sm:overflow-visible">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`shrink-0 rounded-full px-5 py-2 text-sm font-semibold transition ${
              selectedCategory === category.id
                ? "bg-red-900 text-white"
                : "bg-white text-stone-700 border border-stone-200 hover:border-red-800 dark:bg-neutral-900 dark:text-stone-200 dark:border-neutral-700"
            }`}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>

      {filteredServices.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No services available in this category.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filteredServices.map((service) => (
            <div
              key={service._id}
              className={`surface-card surface-card-hover flex flex-col items-center text-center ${
                service.isActive
                  ? "hover:shadow-2xl hover:-translate-y-2"
                  : "opacity-70"
              }`}
            >
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-red-100 to-amber-100 text-5xl dark:from-red-950 dark:to-amber-950">
                {service.icon || "*"}
              </div>

              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-xl font-bold text-gray-800">
                  {service.name}
                </h3>
                {isAdmin && (
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      service.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {service.isActive ? "Active" : "Inactive"}
                  </span>
                )}
              </div>

              <p className="text-gray-600 mb-4 flex-grow">
                {service.description}
              </p>

              <div className="w-full rounded-2xl bg-gray-50 p-4 mb-4 flex justify-between items-center dark:bg-gray-800">
                <span className="text-2xl font-bold text-red-900 dark:text-red-300">
                  Rs. {service.price}
                </span>
                <span className="text-gray-600">
                  {service.duration} mins
                </span>
              </div>

              {isAdmin ? (
                <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
                  <button
                    onClick={() => handleOpenEditForm(service)}
                    className="rounded-xl bg-gray-800 py-2 font-semibold text-white hover:bg-gray-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleServiceStatus(service)}
                    className={`rounded-xl py-2 font-semibold text-white ${
                      service.isActive
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    {service.isActive ? "Deactivate" : "Activate"}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleBookService(service)}
                  className="primary-action w-full"
                >
                  Book Now
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <form
            onSubmit={handleSaveService}
            className="surface-card max-h-[90vh] w-[92vw] max-w-md overflow-y-auto"
          >
            <h2 className="text-2xl font-bold mb-4 text-center">
              {editingService ? "Edit Service" : "Add New Service"}
            </h2>

            {["name", "description", "price", "duration", "icon"].map((field) => (
              <input
                key={field}
                type={field === "price" || field === "duration" ? "number" : "text"}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                value={serviceForm[field]}
                onChange={(e) =>
                  setServiceForm({
                    ...serviceForm,
                    [field]: e.target.value,
                  })
                }
                className="soft-input mb-3 w-full"
                required={field !== "icon"}
              />
            ))}

            <select
              value={serviceForm.category}
              onChange={(e) =>
                setServiceForm({
                  ...serviceForm,
                  category: e.target.value,
                })
              }
              className="soft-input mb-3 w-full"
              required
            >
              <option value="">Select Category</option>
              <option value="haircut">Haircut</option>
              <option value="beard">Beard Care</option>
              <option value="shave">Shaving</option>
              <option value="coloring">Coloring</option>
              <option value="facial">Facial</option>
              <option value="styling">Styling</option>
            </select>

            <div className="flex justify-between gap-3">
              <button
                type="submit"
                className="primary-action flex-1"
              >
                {editingService ? "Update Service" : "Add Service"}
              </button>
              <button
                type="button"
                onClick={resetServiceForm}
                className="secondary-action flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Services;
