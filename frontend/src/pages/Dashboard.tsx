import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Trip, SavedPlace, Ride } from '../types';
import { 
  Search, PlusCircle, Navigation, MapPin, Wallet, Car, ArrowRight, 
  Clock, Building2, Shield, Lock, Bell, CheckCircle2, User
} from 'lucide-react';

interface DashboardProps {
  setActiveTab: (tab: string) => void;
  setSelectedTripId: (id: string) => void;
}

interface DashboardMetrics {
  role: string;
  gender: string;
  walletBalance: number;
  activeTripsCount: number;
  completedTripsCount: number;
  offeredRidesCount: number;
  vehiclesCount: number;
  upcomingTrip?: any;
  notifications: any[];
  orgStats: {
    activeEmployees: number;
    totalRides: number;
    totalVehicles: number;
    completedTrips: number;
  };
}

export const Dashboard: React.FC<DashboardProps> = ({ setActiveTab, setSelectedTripId }) => {
  const { user } = useAuth();
  const [activeTrips, setActiveTrips] = useState<Trip[]>([]);
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);
  const [upcomingRides, setUpcomingRides] = useState<Ride[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  useEffect(() => {
    api.get('/reports/dashboard-metrics')
      .then(res => setMetrics(res.data))
      .catch(err => console.error(err));

    api.get('/trips/my-trips')
      .then(res => setActiveTrips(res.data))
      .catch(err => console.error(err));

    api.get('/saved-places')
      .then(res => setSavedPlaces(res.data))
      .catch(err => console.error(err));

    api.post('/rides/search', {})
      .then(res => setUpcomingRides(res.data.slice(0, 3)))
      .catch(err => console.error(err));
  }, []);

  const liveTrip = activeTrips.find(t => t.status === 'IN_PROGRESS' || t.status === 'STARTED' || t.status === 'BOOKED');

  const isAdmin = user?.role === 'ADMINISTRATOR';
  const isDriverPersona = user?.fullName?.includes('Marcus') || user?.fullName?.includes('Priya') || (metrics && metrics.offeredRidesCount > 0);

  return (
    <div className="space-y-10 pb-10">
      
      {/* ACTIVE COMMUTE ALERT BANNER */}
      {liveTrip && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 dark:from-emerald-950 dark:to-teal-950 border border-emerald-500/40 rounded-3xl p-6 shadow-md text-white flex flex-col md:flex-row items-center justify-between gap-5 animate-in fade-in">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-extrabold shadow-lg animate-pulse shrink-0">
              <Navigation className="w-6 h-6 text-white" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-extrabold bg-white text-emerald-900 rounded-full">
                  {liveTrip.status}
                </span>
                <span className="text-xs text-emerald-100 font-semibold">Commute Active</span>
              </div>
              <h3 className="text-lg font-extrabold text-white leading-tight">
                {liveTrip.ride.originName} → {liveTrip.ride.destName}
              </h3>
              <p className="text-xs text-emerald-100">
                Driver: <span className="font-semibold text-white">{liveTrip.driver.fullName}</span> ({liveTrip.ride.vehicle.model})
              </p>
            </div>
          </div>
          <button
            onClick={() => { setSelectedTripId(liveTrip.id); setActiveTab('live-tracking'); }}
            className="w-full md:w-auto px-6 py-3 bg-white hover:bg-emerald-50 text-emerald-900 font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center space-x-2 transition shrink-0"
          >
            <span>Open Live Tracking Command Center</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* HERO WELCOME & ACTION TILES */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 lg:p-10 shadow-sm relative overflow-hidden transition-colors space-y-6">
        <div className="relative z-10 max-w-3xl space-y-5">
          
          {/* ORGANIZATION BADGE */}
          <div>
            <span className="inline-block px-4 py-1.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-full text-xs font-bold tracking-wide">
              {user?.organizationName} Mobility Hub (India)
            </span>
          </div>

          {/* MAIN HERO HEADING */}
          <div className="space-y-3 pt-1">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Turn empty seats into <span className="text-emerald-600 dark:text-emerald-400">smarter commutes.</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl pt-1">
              Share rides with verified colleagues from {user?.organizationName}, cut fuel costs, and track commutes live across India.
            </p>
          </div>

          {/* MAIN CTA BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-4 pt-3">
            <button
              onClick={() => setActiveTab('find')}
              className="py-4 px-8 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center space-x-2 transition"
            >
              <Search className="w-4 h-4" />
              <span>Find a Ride</span>
            </button>
            <button
              onClick={() => setActiveTab('offer')}
              className="py-4 px-8 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 font-extrabold text-xs rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center space-x-2 transition"
            >
              <PlusCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Offer a Ride</span>
            </button>
          </div>

        </div>
      </div>

      {/* DYNAMIC PERSONALIZED METRIC CARDS BASED ON USER ROLE */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        
        {isAdmin ? (
          <>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Employees</span>
                <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white leading-none">{metrics?.orgStats?.activeEmployees || 11}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Verified members</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Rides</span>
                <Car className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white leading-none">{metrics?.orgStats?.totalRides || 5}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Scheduled commutes</p>
              </div>
            </div>
          </>
        ) : isDriverPersona ? (
          <>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Offered Rides</span>
                <PlusCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white leading-none">{metrics?.offeredRidesCount || 2}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Active driver offers</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">My Vehicles</span>
                <Car className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white leading-none">{user?.vehicles?.length || 1}</p>
                <button onClick={() => setActiveTab('vehicles')} className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-bold inline-block">
                  Manage Vehicles →
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">My Trips</span>
                <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white leading-none">{activeTrips.length}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Booked & completed</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">My Vehicles</span>
                <Car className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white leading-none">{user?.vehicles?.length || 1}</p>
                <button onClick={() => setActiveTab('vehicles')} className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-bold inline-block">
                  Manage Vehicles →
                </button>
              </div>
            </div>
          </>
        )}

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Wallet Balance</span>
            <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 leading-none">₹{user?.walletBalance ? user.walletBalance.toFixed(0) : '1500'}</p>
            <button onClick={() => setActiveTab('wallet')} className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-bold inline-block">
              Recharge Wallet →
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Safety System</span>
            <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white leading-none">Women Only</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">Verified Safety Enabled</p>
          </div>
        </div>

      </div>

      {/* SAVED PLACES & RECOMMENDED RIDES GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        
        {/* SAVED PLACES & RECENT ACTIVITY */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 lg:p-7 space-y-6 shadow-sm transition-colors">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Saved Places</span>
              </h3>
              <span className="text-xs text-slate-400 font-medium">Quick Search</span>
            </div>

            <div className="space-y-3">
              {savedPlaces.map((place) => (
                <div
                  key={place.id}
                  onClick={() => setActiveTab('find')}
                  className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/50 hover:border-emerald-500 cursor-pointer transition flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <p className="text-xs font-extrabold text-slate-900 dark:text-slate-200">{place.label}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[180px]">{place.address}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </div>
              ))}
            </div>
          </div>

          {/* RECENT ACTIVITY TIMELINE */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 lg:p-7 space-y-4 shadow-sm transition-colors">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                <Bell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Recent Commute Activity</span>
              </h3>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex items-start space-x-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Nagpur Station → Dharampeth</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Boarding OTP verified (4829)</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <Car className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Wardha Rd → Dharampeth</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Tata Nexon EV (MH-31-EV-8842)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* UPCOMING AVAILABLE RIDES */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 lg:p-7 space-y-6 shadow-sm transition-colors">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
              <Car className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Recommended Corporate Commutes</span>
            </h3>
            <button onClick={() => setActiveTab('find')} className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
              View All Rides →
            </button>
          </div>

          <div className="space-y-4">
            {upcomingRides.map((ride) => (
              <div key={ride.id} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[10px] font-extrabold rounded-lg">
                      {ride.matchScore || 94}% MATCH
                    </span>
                    {ride.isWomenOnly && (
                      <span className="px-2.5 py-1 bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800 text-[10px] font-extrabold rounded-lg flex items-center space-x-1">
                        <Lock className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                        <span>WOMEN ONLY</span>
                      </span>
                    )}
                  </div>
                  
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                    {ride.originName} → {ride.destName}
                  </h4>
                  
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Driver: <span className="text-slate-900 dark:text-slate-200 font-semibold">{ride.driver.fullName}</span> • {ride.vehicle.model} ({ride.vehicle.plateNumber})
                  </p>
                </div>

                <div className="flex items-center space-x-4 shrink-0">
                  <div className="text-right">
                    <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 leading-none">₹{ride.pricePerSeat.toFixed(0)}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{ride.availableSeats} seats left</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('find')}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md transition"
                  >
                    Book Seat
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
