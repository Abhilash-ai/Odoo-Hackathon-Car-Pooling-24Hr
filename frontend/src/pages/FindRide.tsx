import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Ride } from '../types';
import { MapContainer } from '../components/MapContainer';
import { MatchScoreBadge } from '../components/MatchScoreBadge';
import { 
  Search, MapPin, Calendar, Clock, Users, Navigation, 
  CheckCircle2, ArrowRight, ShieldCheck, AlertCircle, X, Lock, Fuel
} from 'lucide-react';

interface FindRideProps {
  setActiveTab: (tab: string) => void;
  setSelectedTripId: (id: string) => void;
}

export const FindRide: React.FC<FindRideProps> = ({ setActiveTab, setSelectedTripId }) => {
  const { user } = useAuth();
  const [pickup, setPickup] = useState('Nagpur Railway Station, Feeder Rd');
  const [destination, setDestination] = useState('Odoo Tech Campus, Dharampeth, Nagpur');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('08:30');
  const [seats, setSeats] = useState(1);
  const [womenOnlyFilter, setWomenOnlyFilter] = useState(false);

  // Indian Nagpur Coordinates
  const [originLat, setOriginLat] = useState(21.1524);
  const [originLng, setOriginLng] = useState(79.0888);
  const [destLat, setDestLat] = useState(21.1418);
  const [destLng, setDestLng] = useState(79.0596);

  // Workflow states
  const [routeInfo, setRouteInfo] = useState<any>(null);
  const [showRouteConfirmation, setShowRouteConfirmation] = useState(false);
  const [matchedRides, setMatchedRides] = useState<Ride[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  // STEP 1: CALCULATE ROUTE & ESTIMATED FUEL COST
  const handleCalculateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/rides/calculate-route', {
        originLat,
        originLng,
        destLat,
        destLng,
        originName: pickup,
        destName: destination,
      });
      setRouteInfo(res.data);
      setShowRouteConfirmation(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: CONFIRM ROUTE & SEARCH MATCHING RIDES
  const handleConfirmRouteAndSearch = async () => {
    setShowRouteConfirmation(false);
    setLoading(true);
    setHasSearched(true);
    try {
      const res = await api.post('/rides/search', {
        originLat,
        originLng,
        destLat,
        destLng,
        departureTime: `${date}T${time}:00`,
        seatsNeeded: seats,
        womenOnlyFilter,
      });
      setMatchedRides(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: BOOK RIDE WITH SERVER-SIDE SAFETY ENFORCEMENT
  const handleBookRide = async (ride: Ride) => {
    setLoading(true);
    try {
      const res = await api.post('/bookings', {
        rideId: ride.id,
        seatsRequested: seats,
        pickupName: pickup,
        dropName: destination,
        pickupLat: originLat,
        pickupLng: originLng,
        dropLat: destLat,
        dropLng: destLng,
      });

      setBookingSuccess('Seat booked successfully! Commute added to My Trips.');
      setSelectedTripId(res.data.trip.id);
      
      setMatchedRides(matchedRides.map(r => r.id === ride.id ? { ...r, availableSeats: r.availableSeats - seats } : r));

      setTimeout(() => {
        setActiveTab('live-tracking');
      }, 1200);

    } catch (err: any) {
      alert(err.response?.data?.error || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* PAGE TITLE */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Find a Corporate Ride (India)</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Search compatible Indian commutes (Nagpur, Pune, Bengaluru, Mumbai). Fares in ₹ INR.</p>
      </div>

      {/* SUCCESS BANNER */}
      {bookingSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-500 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{bookingSuccess}</span>
        </div>
      )}

      {/* SEARCH FORM */}
      <form onSubmit={handleCalculateRoute} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 transition-colors">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Pickup Location (India)</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 absolute left-3 top-3" />
              <input
                type="text"
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                placeholder="e.g. Nagpur Station, Hinjawadi Pune, Majestic Bengaluru"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Destination (India)</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-rose-500 absolute left-3 top-3" />
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                placeholder="e.g. Dharampeth Tech Campus, Nagpur"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Travel Date</label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Departure Time</label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Seats Needed</label>
              <div className="relative">
                <Users className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <select
                  value={seats}
                  onChange={(e) => setSeats(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                >
                  <option value={1}>1 Seat</option>
                  <option value={2}>2 Seats</option>
                  <option value={3}>3 Seats</option>
                </select>
              </div>
            </div>
          </div>

        </div>

        {/* WOMEN-ONLY SAFETY RIDE TOGGLE OPTION */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
          <label className="flex items-center space-x-2 text-xs font-bold text-purple-700 dark:text-purple-300 cursor-pointer">
            <input
              type="checkbox"
              checked={womenOnlyFilter}
              onChange={(e) => setWomenOnlyFilter(e.target.checked)}
              className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
            />
            <Lock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Filter for Women-Only Rides Only</span>
          </label>
          <span className="text-[10px] text-slate-400">Verified Safety Option</span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center space-x-2 transition disabled:opacity-50"
        >
          <Navigation className="w-4 h-4" />
          <span>{loading ? 'Calculating Indian Route...' : 'Calculate Route & Confirm'}</span>
        </button>
      </form>

      {/* ROUTE CONFIRMATION MODAL WITH INDIA COST TRANSPARENCY */}
      {showRouteConfirmation && routeInfo && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-2xl w-full space-y-4 shadow-2xl relative animate-in zoom-in-95">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Confirm Indian Route & Fuel Cost</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Route visualization in India with transparent fuel cost estimation</p>
              </div>
              <button onClick={() => setShowRouteConfirmation(false)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ROUTE & COST STATS */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Distance</span>
                <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">{routeInfo.distanceKm} km</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Est. Duration</span>
                <span className="text-base font-extrabold text-slate-900 dark:text-white">{routeInfo.durationMins} mins</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Est. Ride Fuel Cost</span>
                <span className="text-base font-extrabold text-amber-600 dark:text-amber-400">₹{routeInfo.costBreakdown?.estimatedFuelCostInr || 28}</span>
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
                onClick={() => setShowRouteConfirmation(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
              >
                Modify Route
              </button>
              <button
                onClick={handleConfirmRouteAndSearch}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center space-x-2 shadow-md"
              >
                <Search className="w-4 h-4" />
                <span>Confirm Route & Search Matches</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MATCHING RESULTS LIST */}
      {hasSearched && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Available Organization Rides ({matchedRides.length})</span>
            </h3>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Prices in ₹ INR</span>
          </div>

          {matchedRides.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
              <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No matching rides found</p>
              <p className="text-xs text-slate-500">Try adjusting your travel time or pickup location.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {matchedRides.map((ride) => (
                <div
                  key={ride.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 shadow-sm space-y-3 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    
                    {/* DRIVER INFO */}
                    <div className="flex items-center space-x-3">
                      <img
                        src={ride.driver.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                        alt={ride.driver.fullName}
                        className="w-10 h-10 rounded-full border border-emerald-500/50 object-cover"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{ride.driver.fullName}</h4>
                          
                          {/* WOMEN ONLY SAFETY BADGE */}
                          {ride.isWomenOnly && (
                            <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800 text-[10px] font-extrabold rounded flex items-center space-x-1">
                              <Lock className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                              <span>WOMEN ONLY</span>
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {ride.vehicle.make} {ride.vehicle.model} • <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{ride.vehicle.plateNumber}</span> • <span className="text-slate-700 dark:text-slate-300">{ride.vehicle.mileageKmL} km/L ({ride.vehicle.fuelType})</span>
                        </p>
                      </div>
                    </div>

                    {/* MATCH SCORE BADGE */}
                    <MatchScoreBadge
                      matchScore={ride.matchScore || 94}
                      breakdown={ride.matchBreakdown}
                    />
                  </div>

                  {/* COST TRANSPARENCY BREAKDOWN */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-950/80 rounded-xl border border-slate-200 dark:border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Distance</span>
                      <span className="text-slate-800 dark:text-slate-200 font-semibold">{ride.distanceKm} km</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Vehicle Mileage</span>
                      <span className="text-slate-800 dark:text-slate-200 font-semibold">{ride.vehicle.mileageKmL} km/L ({ride.vehicle.fuelType})</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Est. Ride Fuel Cost</span>
                      <span className="text-amber-600 dark:text-amber-400 font-extrabold">₹{ride.estimatedFuelCost ? ride.estimatedFuelCost.toFixed(0) : '28'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Departure Time</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        {new Date(ride.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {/* BOOKING BUTTON & FARE IN ₹ */}
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">₹{ride.pricePerSeat.toFixed(0)}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400"> / seat fare • </span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{ride.availableSeats} seat(s) left</span>
                    </div>

                    <button
                      onClick={() => handleBookRide(ride)}
                      disabled={ride.availableSeats < seats || loading}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md transition disabled:opacity-50"
                    >
                      {ride.availableSeats < seats ? 'Fully Booked' : 'Book Seat Now'}
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
