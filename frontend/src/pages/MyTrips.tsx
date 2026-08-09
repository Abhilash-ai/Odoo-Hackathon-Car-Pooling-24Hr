import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Trip } from '../types';
import { VoiceCallModal } from '../components/VoiceCallModal';
import { 
  Clock, Navigation, CheckCircle2, DollarSign, Car, User, 
  MapPin, Calendar, ArrowRight, Shield, Lock, Phone, MessageSquare
} from 'lucide-react';

interface MyTripsProps {
  setActiveTab: (tab: string) => void;
  setSelectedTripId: (id: string) => void;
}

export const MyTrips: React.FC<MyTripsProps> = ({ setActiveTab, setSelectedTripId }) => {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  // VOICE CALL MODAL STATE
  const [showCallModal, setShowCallModal] = useState(false);
  const [activeCallTarget, setActiveCallTarget] = useState<{
    name: string;
    role: string;
    avatar?: string;
    route?: string;
  } | null>(null);

  useEffect(() => {
    api.get('/trips/my-trips')
      .then(res => setTrips(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleStartCall = (targetName: string, targetRole: string, targetAvatar?: string, routeName?: string) => {
    setActiveCallTarget({
      name: targetName,
      role: targetRole,
      avatar: targetAvatar,
      route: routeName,
    });
    setShowCallModal(true);
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs font-semibold">Loading trips...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-8">
      
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">My Commutes & Trips</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">View and manage your active, scheduled, and completed rides (Fares displayed in ₹ INR).</p>
      </div>

      {trips.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3 shadow-sm">
          <Clock className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Trips Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Search for a commute or offer a ride to get started.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {trips.map((trip) => {
            const isDriver = user?.id === trip.driverId;
            const targetPerson = isDriver ? trip.passenger : trip.driver;
            const targetRoleLabel = isDriver ? 'Passenger' : 'Driver';

            const statusColor = 
              trip.status === 'IN_PROGRESS' || trip.status === 'STARTED'
                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 font-extrabold'
                : trip.status === 'BOOKED'
                ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800'
                : trip.paymentStatus === 'PAID'
                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800';

            return (
              <div
                key={trip.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 rounded-3xl p-6 shadow-sm space-y-4 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 text-[10px] uppercase tracking-wider font-extrabold rounded-xl border ${statusColor}`}>
                      {trip.status}
                    </span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {isDriver ? '★ Driver Role' : '👤 Passenger Role'}
                    </span>

                    {trip.ride.isWomenOnly && (
                      <span className="px-2.5 py-0.5 bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800 text-[10px] font-extrabold rounded-lg flex items-center space-x-1">
                        <Lock className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                        <span>WOMEN ONLY</span>
                      </span>
                    )}
                  </div>

                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Fare: <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">₹{trip.fareAmount.toFixed(0)}</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Route</span>
                    <p className="font-extrabold text-slate-900 dark:text-white text-sm">
                      {trip.ride.originName} → {trip.ride.destName}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] pt-0.5">
                      Vehicle: {trip.ride.vehicle.make} {trip.ride.vehicle.model} ({trip.ride.vehicle.plateNumber}) • {trip.ride.vehicle.mileageKmL} km/L
                    </p>
                  </div>

                  <div className="space-y-1 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">
                        {targetRoleLabel}
                      </span>
                      <p className="font-bold text-slate-800 dark:text-slate-200">
                        {targetPerson.fullName}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Dept: {targetPerson.department || 'Engineering'}
                      </p>
                    </div>

                    {/* ENCRYPTED VOICE CALL BUTTON */}
                    <button
                      onClick={() => handleStartCall(
                        targetPerson.fullName,
                        targetRoleLabel,
                        targetPerson.avatarUrl,
                        `${trip.ride.originName} → ${trip.ride.destName}`
                      )}
                      className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-200 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition"
                      title={`Call ${targetRoleLabel}`}
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Call</span>
                    </button>
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    Payment Status: <span className={trip.paymentStatus === 'PAID' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-amber-600 dark:text-amber-400 font-bold'}>{trip.paymentStatus}</span>
                  </span>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => { setSelectedTripId(trip.id); setActiveTab('live-tracking'); }}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl flex items-center space-x-1.5 shadow-md transition"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Track Live Commute</span>
                    </button>

                    {!isDriver && trip.paymentStatus !== 'PAID' && (
                      <button
                        onClick={() => setActiveTab('wallet')}
                        className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-xs rounded-xl flex items-center space-x-1.5 shadow-md transition"
                      >
                        <span>Pay Fare (₹{trip.fareAmount.toFixed(0)})</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* VOICE CALL MODAL */}
      {activeCallTarget && (
        <VoiceCallModal
          isOpen={showCallModal}
          onClose={() => setShowCallModal(false)}
          participantName={activeCallTarget.name}
          participantRole={activeCallTarget.role}
          participantAvatar={activeCallTarget.avatar}
          tripRoute={activeCallTarget.route}
        />
      )}

    </div>
  );
};
