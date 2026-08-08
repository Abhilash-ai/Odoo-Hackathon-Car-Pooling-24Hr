import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Vehicle } from '../types';
import { MapContainer } from '../components/MapContainer';
import { 
  PlusCircle, Car, MapPin, Calendar, Clock, DollarSign, Users, 
  Navigation, CheckCircle2, AlertCircle, X, Lock, Fuel, Calculator
} from 'lucide-react';

interface OfferRideProps {
  setActiveTab: (tab: string) => void;
}

export const OfferRide: React.FC<OfferRideProps> = ({ setActiveTab }) => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');

  const [pickup, setPickup] = useState('Sitabuldi Square, Nagpur, Maharashtra');
  const [destination, setDestination] = useState('Odoo Tech Campus, Dharampeth, Nagpur');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('08:45');
  const [availableSeats, setAvailableSeats] = useState(3);
  const [fare, setFare] = useState(40); // ₹ INR
  const [isWomenOnly, setIsWomenOnly] = useState(false);

  // Nagpur Coordinates
  const [originLat, setOriginLat] = useState(21.1458);
  const [originLng, setOriginLng] = useState(79.0882);
  const [destLat, setDestLat] = useState(21.1418);
  const [destLng, setDestLng] = useState(79.0596);

  // Route preview state
  const [routeInfo, setRouteInfo] = useState<any>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [publishedSuccess, setPublishedSuccess] = useState(false);

  useEffect(() => {
    api.get('/vehicles')
      .then(res => {
        setVehicles(res.data);
        if (res.data.length > 0) {
          setSelectedVehicleId(res.data[0].id);
        }
      })
      .catch(err => console.error(err));
  }, []);

  // STEP 1: CALCULATE ROUTE & ESTIMATED FUEL COST
  const handleCalculateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicleId) {
      alert('Please register and select a vehicle before publishing a ride.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/rides/calculate-route', {
        originLat,
        originLng,
        destLat,
        destLng,
        originName: pickup,
        destName: destination,
        vehicleId: selectedVehicleId,
      });
      setRouteInfo(res.data);
      setShowConfirmation(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: PUBLISH RIDE
  const handlePublishRide = async () => {
    setLoading(true);
    try {
      await api.post('/rides', {
        vehicleId: selectedVehicleId,
        originName: pickup,
        originLat,
        originLng,
        destName: destination,
        destLat,
        destLng,
        departureTime: `${date}T${time}:00`,
        availableSeats,
        pricePerSeat: fare,
        isWomenOnly,
      });

      setPublishedSuccess(true);
      setShowConfirmation(false);
      setTimeout(() => {
        setActiveTab('dashboard');
      }, 1500);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to publish ride');
    } finally {
      setLoading(false);
    }
  };

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-8">
      
      {/* TITLE & SUBTITLE SPACING */}
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">Offer a Corporate Commute (India)</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Share your empty vehicle seats with verified colleagues across Nagpur, Pune, Bengaluru, or Mumbai. All values in ₹ INR.</p>
      </div>

      {publishedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-500 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Ride published successfully! It is now live for colleague matching and booking.</span>
        </div>
      )}

      {vehicles.length === 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>You must register a vehicle before you can offer a ride.</span>
          </div>
          <button onClick={() => setActiveTab('vehicles')} className="font-bold underline hover:text-amber-950 dark:hover:text-white">
            Add Vehicle →
          </button>
        </div>
      )}

      {/* OFFER RIDE FORM */}
      <form onSubmit={handleCalculateRoute} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 lg:p-8 shadow-sm space-y-5 transition-colors">
        
        {/* VEHICLE SELECTION WITH MILEAGE DISPLAY */}
        <div className="space-y-1.5">
          <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200">Select Registered Vehicle</label>
          <div className="relative">
            <Car className="w-4 h-4 text-emerald-600 dark:text-emerald-400 absolute left-3.5 top-3.5" />
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none font-semibold"
              required
            >
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>
                  {v.make} {v.model} ({v.plateNumber}) • {v.mileageKmL} km/L ({v.fuelType}) • Max Capacity: {v.totalSeats} seats
                </option>
              ))}
            </select>
          </div>
          {selectedVehicle && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
              Stored Mileage: <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedVehicle.mileageKmL} km/L</span> ({selectedVehicle.fuelType})
            </p>
          )}
        </div>

        {/* ROUTE FIELDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200">Pickup Point (India)</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                placeholder="Where are you leaving from?"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200">Destination Point (India)</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-rose-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                placeholder="Where are you driving to?"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200">Departure Date</label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200">Departure Time</label>
            <div className="relative">
              <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200">Available Seats</label>
            <div className="relative">
              <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="number"
                min={1}
                max={6}
                value={availableSeats}
                onChange={(e) => setAvailableSeats(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none font-semibold"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200">Passenger Fare Per Seat (₹ INR)</label>
            <div className="relative">
              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm absolute left-3.5 top-3">₹</span>
              <input
                type="number"
                step="5"
                min={0}
                value={fare}
                onChange={(e) => setFare(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-3 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none font-extrabold"
                required
              />
            </div>
          </div>
        </div>

        {/* WOMEN-ONLY SAFETY OPTION TOGGLE */}
        <div className="p-4 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 rounded-2xl flex items-center justify-between">
          <label className="flex items-center space-x-2 text-xs font-extrabold text-purple-900 dark:text-purple-300 cursor-pointer">
            <input
              type="checkbox"
              checked={isWomenOnly}
              onChange={(e) => setIsWomenOnly(e.target.checked)}
              className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
            />
            <Lock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Enable Women-Only Ride</span>
          </label>
          <span className="text-[10px] text-purple-700 dark:text-purple-400 font-bold">Restricted to female employees</span>
        </div>

        <button
          type="submit"
          disabled={loading || vehicles.length === 0}
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center space-x-2 transition disabled:opacity-50 mt-2"
        >
          <Navigation className="w-4 h-4" />
          <span>{loading ? 'Calculating Route...' : 'Calculate Route & Preview'}</span>
        </button>

      </form>

      {/* ROUTE CONFIRMATION MODAL WITH TRANSPARENT FUEL COST CALCULATOR */}
      {showConfirmation && routeInfo && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-2xl w-full space-y-5 shadow-2xl relative animate-in zoom-in-95">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Confirm Route & Cost Transparency</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Review Indian route polyline and estimated fuel cost vs. passenger fare</p>
              </div>
              <button onClick={() => setShowConfirmation(false)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* COST TRANSPARENCY CARD */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between text-slate-800 dark:text-slate-300 font-extrabold border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400">
                  <Calculator className="w-4 h-4" />
                  <span>Cost Breakdown Formula</span>
                </span>
                <span>Fuel Cost / km = Fuel Price ÷ Mileage</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Route Distance</span>
                  <span className="font-extrabold text-slate-900 dark:text-white text-sm">{routeInfo.distanceKm} km</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Vehicle Mileage</span>
                  <span className="font-extrabold text-slate-900 dark:text-white text-sm">{routeInfo.costBreakdown?.mileageKmL} km/L</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Est. Total Fuel Cost</span>
                  <span className="font-extrabold text-amber-600 dark:text-amber-400 text-sm">₹{routeInfo.costBreakdown?.estimatedFuelCostInr}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Passenger Fare</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">₹{fare} / seat</span>
                </div>
              </div>
            </div>

            {/* MAP PREVIEW */}
            <MapContainer
              origin={routeInfo.origin}
              dest={routeInfo.dest}
              polyline={routeInfo.polyline}
              originName={routeInfo.originName}
              destName={routeInfo.destName}
              height="240px"
            />

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
              >
                Modify Details
              </button>
              <button
                onClick={handlePublishRide}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center space-x-2 shadow-md"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Confirm & Publish Ride</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
