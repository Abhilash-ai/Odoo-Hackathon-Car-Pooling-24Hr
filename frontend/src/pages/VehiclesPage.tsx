import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Vehicle } from '../types';
import { Car, PlusCircle, Trash2, CheckCircle2, ShieldCheck, X, Fuel, Gauge } from 'lucide-react';

export const VehiclesPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [make, setMake] = useState('Tata');
  const [model, setModel] = useState('Nexon EV Max');
  const [color, setColor] = useState('Teal Blue');
  const [plateNumber, setPlateNumber] = useState('');
  const [totalSeats, setTotalSeats] = useState(4);
  const [fuelType, setFuelType] = useState<'Petrol' | 'Diesel' | 'CNG' | 'EV'>('Petrol');
  const [mileageKmL, setMileageKmL] = useState(18.0);
  const [submitting, setSubmitting] = useState(false);

  const fetchVehicles = async () => {
    try {
      const res = await api.get('/vehicles');
      setVehicles(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plateNumber.trim()) {
      alert('Plate number is required');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/vehicles', {
        make,
        model,
        color,
        plateNumber: plateNumber.trim().toUpperCase(),
        totalSeats,
        fuelType,
        mileageKmL,
      });
      setShowAddModal(false);
      setPlateNumber('');
      await fetchVehicles();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to add vehicle');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    if (!confirm('Are you sure you want to remove this vehicle?')) return;
    try {
      await api.delete(`/vehicles/${id}`);
      await fetchVehicles();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs font-semibold">Loading vehicle fleet...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-8">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">Vehicle Fleet & Mileage Management</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Register personal vehicles with fuel type & mileage (km/L) for transparent route fuel cost calculations.</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="py-3 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center space-x-2 transition shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Vehicle</span>
        </button>
      </div>

      {/* VEHICLE CARDS GRID */}
      {vehicles.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3 shadow-sm">
          <Car className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Vehicles Registered</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Add a vehicle to start publishing corporate rides.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {vehicles.map((v) => (
            <div key={v.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 transition-colors relative">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-slate-800 border border-emerald-100 dark:border-slate-700 flex items-center justify-center">
                    <Car className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{v.make} {v.model}</h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{v.color} • {v.fuelType}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteVehicle(v.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Reg Plate</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400 font-mono text-sm">{v.plateNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Mileage</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">{v.mileageKmL} km/L</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Capacity</span>
                  <span className="font-extrabold text-slate-700 dark:text-slate-300">{v.totalSeats} seats</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD VEHICLE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddVehicle} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                <Car className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Register Vehicle & Mileage</span>
              </h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Make / Brand</label>
                <input
                  type="text"
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Model Name</label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Fuel Type</label>
                <select
                  value={fuelType}
                  onChange={(e) => setFuelType(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                >
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="CNG">CNG</option>
                  <option value="EV">Electric (EV)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Mileage (km/L)</label>
                <input
                  type="number"
                  step="0.5"
                  min={1}
                  value={mileageKmL}
                  onChange={(e) => setMileageKmL(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-bold"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Plate Number</label>
                <input
                  type="text"
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value)}
                  placeholder="e.g. MH-31-FA-9021"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Capacity</label>
                <input
                  type="number"
                  min={1}
                  max={8}
                  value={totalSeats}
                  onChange={(e) => setTotalSeats(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Color</label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md transition"
            >
              {submitting ? 'Registering...' : 'Confirm Registration'}
            </button>
          </form>
        </div>
      )}

    </div>
  );
};
