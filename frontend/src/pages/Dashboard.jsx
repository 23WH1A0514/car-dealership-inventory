import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import VehicleCard from "../components/VehicleCard";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { isAdmin } = useAuth();

  const [vehicles, setVehicles] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  const [form, setForm] = useState({
    make: "",
    model: "",
    category: "SUV",
    price: "",
    quantity: ""
  });

  const [restockVehicle, setRestockVehicle] = useState(null);
  const [restockQuantity, setRestockQuantity] = useState("");

  const loadVehicles = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/vehicles");

      setVehicles(response.data.vehicles || []);
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Unable to load vehicles"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      if (search.trim()) {
        params.make = search.trim();
      }

      if (category) {
        params.category = category;
      }

      if (minPrice) {
        params.minPrice = minPrice;
      }

      if (maxPrice) {
        params.maxPrice = maxPrice;
      }

      const response = await api.get(
        "/vehicles/search",
        { params }
      );

      setVehicles(response.data.vehicles || []);
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Search failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = async () => {
    setSearch("");
    setCategory("");
    setMinPrice("");
    setMaxPrice("");

    await loadVehicles();
  };

  const handlePurchase = async (id) => {
    try {
      await api.post(`/vehicles/${id}/purchase`);

      await loadVehicles();

      alert("Vehicle purchased successfully!");
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Purchase failed"
      );
    }
  };

  const handleDelete = async (id) => {
    if (!isAdmin) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this vehicle?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/vehicles/${id}`);

      await loadVehicles();

      alert("Vehicle deleted successfully!");
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Delete failed"
      );
    }
  };

  const openAddForm = () => {
    setEditingVehicle(null);

    setForm({
      make: "",
      model: "",
      category: "SUV",
      price: "",
      quantity: ""
    });

    setShowForm(true);
  };

  const openEditForm = (vehicle) => {
    setEditingVehicle(vehicle);

    setForm({
      make: vehicle.make,
      model: vehicle.model,
      category: vehicle.category,
      price: vehicle.price,
      quantity: vehicle.quantity
    });

    setShowForm(true);
  };

  const handleFormChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleVehicleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = {
        make: form.make,
        model: form.model,
        category: form.category,
        price: Number(form.price),
        quantity: Number(form.quantity)
      };

      if (editingVehicle) {
        await api.put(
          `/vehicles/${editingVehicle._id}`,
          data
        );

        alert("Vehicle updated successfully!");
      } else {
        await api.post("/vehicles", data);

        alert("Vehicle added successfully!");
      }

      setShowForm(false);
      setEditingVehicle(null);

      await loadVehicles();
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Operation failed"
      );
    }
  };

  const openRestock = (vehicle) => {
    setRestockVehicle(vehicle);
    setRestockQuantity("");
  };

  const handleRestock = async (e) => {
    e.preventDefault();

    if (!restockVehicle) return;

    try {
      await api.post(
        `/vehicles/${restockVehicle._id}/restock`,
        {
          quantity: Number(restockQuantity)
        }
      );

      alert("Vehicle restocked successfully!");

      setRestockVehicle(null);
      setRestockQuantity("");

      await loadVehicles();
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Restock failed"
      );
    }
  };

  const filteredVehicles = vehicles.filter((vehicle) => {
    const value = search.toLowerCase();

    return (
      !search ||
      vehicle.make.toLowerCase().includes(value) ||
      vehicle.model.toLowerCase().includes(value)
    );
  });

  return (
    <div className="min-h-screen bg-slate-100">

      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-10">

        {/* HEADER */}

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              {isAdmin
                ? "Admin Inventory"
                : "Dealership Inventory"}
            </p>

            <h1 className="mt-2 text-4xl font-bold text-slate-900">
              Find your next car
            </h1>

            <p className="mt-2 text-slate-500">
              Browse available vehicles in our dealership.
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={openAddForm}
              className="rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700"
            >
              + Add Vehicle
            </button>
          )}

        </div>

        {/* SEARCH */}

        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">

            <input
              type="text"
              placeholder="Search make or model..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />

            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
              className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">
                All categories
              </option>

              <option value="SUV">SUV</option>
              <option value="Sedan">Sedan</option>
              <option value="Hatchback">
                Hatchback
              </option>
              <option value="Truck">Truck</option>
              <option value="Coupe">Coupe</option>
            </select>

            <input
              type="number"
              placeholder="Min price"
              value={minPrice}
              onChange={(e) =>
                setMinPrice(e.target.value)
              }
              className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="number"
              placeholder="Max price"
              value={maxPrice}
              onChange={(e) =>
                setMaxPrice(e.target.value)
              }
              className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex gap-2">

              <button
                onClick={handleSearch}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Search
              </button>

              <button
                onClick={clearSearch}
                className="rounded-lg border border-slate-300 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
              >
                Clear
              </button>

            </div>

          </div>

        </div>

        {/* ADMIN NOTICE */}

        {isAdmin && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4">

            <p className="font-semibold text-emerald-800">
              Admin Mode
            </p>

            <p className="mt-1 text-sm text-emerald-700">
              You can add, edit, delete and restock vehicles.
            </p>

          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-lg bg-red-100 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {/* LOADING */}

        {loading ? (
          <div className="py-20 text-center">

            <p className="text-lg text-slate-500">
              Loading inventory...
            </p>

          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center">

            <div className="text-5xl">
              🚘
            </div>

            <h2 className="mt-4 text-xl font-bold text-slate-900">
              No vehicles found
            </h2>

            <p className="mt-2 text-slate-500">
              Try another search or check back later.
            </p>

          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {filteredVehicles.map((vehicle) => (
              <div key={vehicle._id}>

                <VehicleCard
                  vehicle={vehicle}
                  onPurchase={handlePurchase}
                  onDelete={handleDelete}
                  isAdmin={isAdmin}
                />

                {isAdmin && (
                  <div className="mt-2 grid grid-cols-2 gap-2">

                    <button
                      onClick={() =>
                        openEditForm(vehicle)
                      }
                      className="rounded-lg bg-amber-500 px-4 py-2 font-semibold text-white hover:bg-amber-600"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        openRestock(vehicle)
                      }
                      className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700"
                    >
                      Restock
                    </button>

                  </div>
                )}

              </div>
            ))}

          </div>
        )}

      </main>

      {/* ADD / EDIT MODAL */}

      {showForm && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">

          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">

            <div className="mb-6 flex items-center justify-between">

              <h2 className="text-2xl font-bold text-slate-900">
                {editingVehicle
                  ? "Edit Vehicle"
                  : "Add Vehicle"}
              </h2>

              <button
                onClick={() => setShowForm(false)}
                className="text-2xl text-slate-400 hover:text-slate-700"
              >
                ×
              </button>

            </div>

            <form
              onSubmit={handleVehicleSubmit}
              className="space-y-4"
            >

              <input
                name="make"
                value={form.make}
                onChange={handleFormChange}
                placeholder="Make"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                name="model"
                value={form.model}
                onChange={handleFormChange}
                placeholder="Model"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />

              <select
                name="category"
                value={form.category}
                onChange={handleFormChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="SUV">SUV</option>
                <option value="Sedan">Sedan</option>
                <option value="Hatchback">
                  Hatchback
                </option>
                <option value="Truck">Truck</option>
                <option value="Coupe">Coupe</option>
              </select>

              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleFormChange}
                placeholder="Price"
                min="0"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleFormChange}
                placeholder="Quantity"
                min="0"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />

              <div className="flex gap-3 pt-2">

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 rounded-lg border border-slate-300 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"
                >
                  {editingVehicle
                    ? "Save Changes"
                    : "Add Vehicle"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* RESTOCK MODAL */}

      {restockVehicle && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">

          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

            <h2 className="text-2xl font-bold text-slate-900">
              Restock Vehicle
            </h2>

            <p className="mt-2 text-slate-500">
              {restockVehicle.make}{" "}
              {restockVehicle.model}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Current stock:{" "}
              {restockVehicle.quantity}
            </p>

            <form
              onSubmit={handleRestock}
              className="mt-6 space-y-4"
            >

              <input
                type="number"
                min="1"
                required
                value={restockQuantity}
                onChange={(e) =>
                  setRestockQuantity(e.target.value)
                }
                placeholder="Quantity to add"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
              />

              <div className="flex gap-3">

                <button
                  type="button"
                  onClick={() =>
                    setRestockVehicle(null)
                  }
                  className="flex-1 rounded-lg border border-slate-300 py-3 font-semibold text-slate-700"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700"
                >
                  Restock
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}