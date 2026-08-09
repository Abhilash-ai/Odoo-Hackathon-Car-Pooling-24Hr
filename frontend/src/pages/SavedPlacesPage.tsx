import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Home, Building2, Trash2, Edit3, CheckCircle2, ArrowLeft } from 'lucide-react';
import api from '../services/api';

interface SavedPlace {
  id: string;
  label: string;
  address: string;
  latitude: number;
  longitude: number;
}

interface SavedPlacesPageProps {
  onBack?: () => void;
  onSelectPlace?: (address: string, lat: number, lng: number) => void;
}

export const SavedPlacesPage: React.FC<SavedPlacesPageProps> = ({ onBack, onSelectPlace }) => {
  const [places, setPlaces] = useState<SavedPlace[]>([
    {
      id: '1',
      label: 'Home',
      address: 'Nagpur Railway Station, Feeder Road, Nagpur',
      latitude: 21.1524,
      longitude: 79.0888,
    },
    {
      id: '2',
      label: 'Office',
      address: 'Dharampeth Tech Campus, IT Park Road, Nagpur',
      latitude: 21.1385,
      longitude: 79.0551,
    },
    {
      id: '3',
      label: 'Sitabuldi Station',
      address: 'Sitabuldi Interchange, Wardha Road, Nagpur',
      latitude: 21.1458,
      longitude: 79.0882,
    },
  ]);

  const [newLabel, setNewLabel] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchSavedPlaces();
  }, []);

  const fetchSavedPlaces = async () => {
    try {
      const res = await api.get('/saved-places');
      if (Array.isArray(res.data) && res.data.length > 0) {
        setPlaces(res.data);
      }
    } catch (err) {
      // Fall back to default seeded places if endpoint is empty
    }
  };

  const handleAddPlace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel || !newAddress) return;

    const newPlace: SavedPlace = {
      id: Date.now().toString(),
      label: newLabel,
      address: newAddress,
      latitude: 21.1458,
      longitude: 79.0882,
    };

    setPlaces([...places, newPlace]);
    try {
      await api.post('/saved-places', {
        label: newLabel,
        address: newAddress,
        latitude: 21.1458,
        longitude: 79.0882,
      });
    } catch (err) {
      // Silent catch
    }

    setNewLabel('');
    setNewAddress('');
    setShowAddForm(false);
  };

  const handleDeletePlace = async (id: string) => {
    setPlaces(places.filter((p) => p.id !== id));
    try {
      await api.delete(`/saved-places/${id}`);
    } catch (err) {
      // Silent catch
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Saved Places</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage your Home, Office, and frequent commute destinations
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'Cancel' : 'Add New Place'}</span>
        </button>
      </div>

      {/* ADD FORM */}
      {showAddForm && (
        <form onSubmit={handleAddPlace} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Save a Favorite Location</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Label Name</label>
              <input
                type="text"
                placeholder="e.g. Home, Office, Gym, Sitabuldi Branch"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Address / Landmark</label>
              <input
                type="text"
                placeholder="e.g. IT Park Road, Nagpur"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow transition"
          >
            Save Location
          </button>
        </form>
      )}

      {/* SAVED PLACES LIST */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {places.map((place) => (
          <div
            key={place.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-sm hover:border-emerald-500 transition group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  {place.label.toLowerCase().includes('home') ? (
                    <Home className="w-4 h-4" />
                  ) : place.label.toLowerCase().includes('office') ? (
                    <Building2 className="w-4 h-4" />
                  ) : (
                    <MapPin className="w-4 h-4" />
                  )}
                </div>
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">{place.label}</span>
              </div>

              <button
                onClick={() => handleDeletePlace(place.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {place.address}
            </p>

            {onSelectPlace && (
              <button
                onClick={() => onSelectPlace(place.address, place.latitude, place.longitude)}
                className="w-full mt-2 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs transition flex items-center justify-center space-x-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Use for Commute</span>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
