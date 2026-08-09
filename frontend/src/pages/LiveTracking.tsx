import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';
import { Trip, Message } from '../types';
import { MapContainer } from '../components/MapContainer';
import { VoiceCallModal } from '../components/VoiceCallModal';
import { 
  Navigation, Play, CheckCircle2, Phone, MessageSquare, 
  Car, Shield, Clock, MapPin, Send, Zap, RefreshCw, DollarSign,
  ShieldAlert, Share2, Copy, Check, Lock
} from 'lucide-react';

interface LiveTrackingProps {
  selectedTripId?: string;
  setActiveTab: (tab: string) => void;
}

export const LiveTracking: React.FC<LiveTrackingProps> = ({ selectedTripId, setActiveTab }) => {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  // Live GPS vs Demo Simulation mode
  const [isDemoSimulation, setIsDemoSimulation] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);

  // Tracking position state (Nagpur, Maharashtra, India)
  const [currentPos, setCurrentPos] = useState<[number, number]>([21.1478, 79.0760]);
  const [stepIndex, setStepIndex] = useState(0);
  const [etaMins, setEtaMins] = useState(10);
  const [distanceRemainingKm, setDistanceRemainingKm] = useState(2.8);

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Safety & SOS Modal state
  const [showSafetyPanel, setShowSafetyPanel] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [sosAlertSent, setSosAlertSent] = useState(false);

  // Voice Call Modal state
  const [showCallModal, setShowCallModal] = useState(false);

  // Nagpur Polyline Coordinates (Nagpur Station -> Dharampeth)
  const polylineCoords: [number, number][] = trip?.ride?.routePolyline
    ? JSON.parse(trip.ride.routePolyline)
    : [
        [21.1524, 79.0888], // Nagpur Railway Station
        [21.1505, 79.0835], // Feeder Rd
        [21.1478, 79.0760], // Sitabuldi Square
        [21.1445, 79.0675], // Law College Square
        [21.1418, 79.0596]  // Dharampeth Tech Campus
      ];

  // FETCH TRIP DATA
  useEffect(() => {
    const fetchTrip = async () => {
      try {
        let idToFetch = selectedTripId;
        if (!idToFetch) {
          const res = await api.get('/trips/my-trips');
          if (res.data.length > 0) {
            idToFetch = res.data[0].id;
          }
        }

        if (idToFetch) {
          const res = await api.get(`/trips/${idToFetch}`);
          setTrip(res.data);
          if (res.data.currentLat && res.data.currentLng) {
            setCurrentPos([res.data.currentLat, res.data.currentLng]);
          }
          if (res.data.messages) {
            setMessages(res.data.messages);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [selectedTripId]);

  // SOCKET LISTENERS
  useEffect(() => {
    if (!socket || !trip) return;

    socket.emit('join_trip', trip.id);

    socket.on('location_updated', (data: { tripId: string; lat: number; lng: number; etaMins?: number; distanceKm?: number }) => {
      if (data.tripId === trip.id) {
        setCurrentPos([data.lat, data.lng]);
        if (data.etaMins !== undefined) setEtaMins(data.etaMins);
        if (data.distanceKm !== undefined) setDistanceRemainingKm(data.distanceKm);
      }
    });

    socket.on('trip_status_updated', (data: { tripId: string; status: string }) => {
      if (data.tripId === trip.id) {
        setTrip(prev => prev ? { ...prev, status: data.status as any } : null);
      }
    });

    socket.on('new_message', (msg: Message) => {
      setMessages(prev => [...prev, msg]);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    return () => {
      socket.off('location_updated');
      socket.off('trip_status_updated');
      socket.off('new_message');
    };
  }, [socket, trip]);

  // ANIMATED DEMO GPS SIMULATION TIMER ALONG NAGPUR ROUTE
  useEffect(() => {
    if (!isSimulating || polylineCoords.length === 0) return;

    const interval = setInterval(() => {
      setStepIndex((prevStep) => {
        const nextStep = prevStep + 1;
        if (nextStep >= polylineCoords.length) {
          setIsSimulating(false);
          return prevStep;
        }

        const nextPos = polylineCoords[nextStep];
        setCurrentPos(nextPos);

        const remainingRatio = (polylineCoords.length - nextStep) / polylineCoords.length;
        const newEta = Math.max(1, Math.round((trip?.ride?.durationMins || 14) * remainingRatio));
        const newDist = Number(((trip?.ride?.distanceKm || 4.8) * remainingRatio).toFixed(1));

        setEtaMins(newEta);
        setDistanceRemainingKm(newDist);

        if (socket && trip) {
          socket.emit('update_location', {
            tripId: trip.id,
            lat: nextPos[0],
            lng: nextPos[1],
            etaMins: newEta,
            distanceKm: newDist,
          });
        }

        return nextStep;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isSimulating, polylineCoords, trip, socket]);

  const handleStartTrip = async () => {
    if (!trip) return;
    try {
      await api.post(`/trips/${trip.id}/start`);
      setTrip(prev => prev ? { ...prev, status: 'IN_PROGRESS' } : null);
      setIsSimulating(true);
      if (socket) {
        socket.emit('trip_status_changed', { tripId: trip.id, status: 'IN_PROGRESS' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCompleteTrip = async () => {
    if (!trip) return;
    try {
      await api.post(`/trips/${trip.id}/complete`);
      setTrip(prev => prev ? { ...prev, status: 'COMPLETED', paymentStatus: 'UNPAID' } : null);
      setIsSimulating(false);
      if (socket) {
        socket.emit('trip_status_changed', { tripId: trip.id, status: 'COMPLETED' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !trip || !user) return;

    const content = chatInput.trim();
    setChatInput('');

    try {
      await api.post(`/trips/${trip.id}/chat`, { content });
      if (socket) {
        socket.emit('send_message', {
          tripId: trip.id,
          senderName: user.fullName,
          senderId: user.id,
          content,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs font-semibold">Loading live commute tracking...</div>;
  }

  if (!trip) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl mx-auto space-y-3 shadow-sm">
        <Navigation className="w-10 h-10 text-emerald-500 mx-auto animate-bounce" />
        <h3 className="text-base font-bold text-slate-900 dark:text-white">No Active Trip Selected</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Search for a ride or view My Trips to track your live commute.</p>
        <button
          onClick={() => setActiveTab('my-trips')}
          className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow"
        >
          View My Trips
        </button>
      </div>
    );
  }

  const isDriver = user?.id === trip.driverId;
  const participant = isDriver ? trip.passenger : trip.driver;
  const participantRole = isDriver ? 'Passenger' : 'Driver';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">

      {/* HEADER BAR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[10px] uppercase font-extrabold tracking-wider rounded-xl">
              {trip.status}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
              {isDriver ? '★ Driver View' : '👤 Passenger View'}
            </span>

            {trip.ride.isWomenOnly && (
              <span className="px-3 py-1 bg-purple-50 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-[10px] font-extrabold rounded-xl flex items-center space-x-1">
                <Lock className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                <span>WOMEN ONLY RIDE</span>
              </span>
            )}
          </div>

          <h1 className="text-xl lg:text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
            {trip.ride.originName} → {trip.ride.destName}
          </h1>
          
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Vehicle: <span className="font-semibold text-slate-900 dark:text-slate-200">{trip.ride.vehicle.make} {trip.ride.vehicle.model}</span> ({trip.ride.vehicle.plateNumber}) • {trip.ride.vehicle.mileageKmL} km/L
          </p>
        </div>

        {/* TRIP CONTROL BUTTONS & SAFETY SOS BUTTON */}
        <div className="flex items-center space-x-3 shrink-0">
          
          <button
            onClick={() => setShowSafetyPanel(true)}
            className="px-4 py-3 bg-rose-50 dark:bg-rose-950 hover:bg-rose-100 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-extrabold text-xs rounded-xl shadow-sm flex items-center space-x-2 transition"
          >
            <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span>Safety & SOS</span>
          </button>

          {isDriver && trip.status === 'BOOKED' && (
            <button
              onClick={handleStartTrip}
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center space-x-2 transition"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Trip Now</span>
            </button>
          )}

          {isDriver && (trip.status === 'IN_PROGRESS' || trip.status === 'STARTED') && (
            <button
              onClick={handleCompleteTrip}
              className="px-5 py-3 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center space-x-2 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete Trip</span>
            </button>
          )}

          {!isDriver && (trip.status === 'COMPLETED') && trip.paymentStatus !== 'PAID' && (
            <button
              onClick={() => setActiveTab('wallet')}
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center space-x-2 transition animate-bounce"
            >
              <span>Pay Fare (₹{trip.fareAmount.toFixed(0)})</span>
            </button>
          )}

          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`px-4 py-3 text-xs font-bold rounded-xl border transition ${
              isSimulating ? 'bg-amber-600 text-white border-amber-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            {isSimulating ? 'Pause GPS Motion' : 'Simulate GPS Motion'}
          </button>
        </div>

      </div>

      {/* MAIN TRACKING GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* MAP VIEW & METRICS */}
        <div className="lg:col-span-2 space-y-6">

          {/* OSRM LEAFLET MAP CONTAINER */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm h-[460px] relative">
            <MapContainer
              origin={polylineCoords[0]}
              dest={polylineCoords[polylineCoords.length - 1]}
              currentPos={currentPos}
              polyline={polylineCoords}
              originName={trip.ride.originName}
              destName={trip.ride.destName}
            />

            {/* LIVE GPS HUD OVERLAY */}
            <div className="absolute top-4 left-4 z-10 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-3.5 shadow-xl text-white space-y-1">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400">Live GPS Stream</span>
              </div>
              <p className="text-xs font-mono font-bold text-slate-300">
                Lat: {currentPos[0].toFixed(4)} | Lng: {currentPos[1].toFixed(4)}
              </p>
            </div>
          </div>

          {/* LIVE METRICS CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-1">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider block">Estimated ETA</span>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white">~{etaMins} mins</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-1">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider block">Distance Remaining</span>
              <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{distanceRemainingKm} km</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-1">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider block">Total Fare</span>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white">₹{trip.fareAmount.toFixed(0)}</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-1">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider block">Boarding OTP</span>
              <p className="text-xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">4829</p>
            </div>

          </div>

        </div>

        {/* SIDEBAR: PARTICIPANT INFO & REALTIME CHAT */}
        <div className="space-y-6">

          {/* PARTICIPANT DETAILS CARD */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider block">
              Trip Participant ({participantRole})
            </span>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={participant.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                  alt={participant.fullName}
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-500"
                />
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{participant.fullName}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{participant.department || 'Engineering'}</p>
                </div>
              </div>

              {/* VOICE CALL ACTION BUTTON */}
              <button
                onClick={() => setShowCallModal(true)}
                className="p-2.5 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900 rounded-xl transition"
                title={`Call ${participantRole}`}
              >
                <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </button>
            </div>
          </div>

          {/* REALTIME SOCKET CHAT */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 flex flex-col h-[360px]">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center space-x-1.5">
                <MessageSquare className="w-4 h-4 text-emerald-500" />
                <span>Trip Chat Room</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-bold">Encrypted</span>
            </div>

            {/* CHAT MESSAGES */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
              {messages.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">No messages yet. Send a message to coordinate pickup.</div>
              ) : (
                messages.map((msg: any, i) => {
                  const isMe = msg.senderId === user?.id || msg.userId === user?.id;
                  const senderName = msg.senderName || msg.user?.fullName || 'Participant';
                  return (
                    <div
                      key={i}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <span className="text-[9px] text-slate-400 font-bold mb-0.5">{senderName}</span>
                      <div
                        className={`max-w-[85%] px-3 py-2 rounded-2xl ${
                          isMe
                            ? 'bg-emerald-600 text-white rounded-br-none font-medium'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-none'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* CHAT INPUT */}
            <form onSubmit={handleSendMessage} className="flex items-center space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <input
                type="text"
                placeholder="Type a message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>

        </div>

      </div>

      {/* VOICE CALL MODAL */}
      <VoiceCallModal
        isOpen={showCallModal}
        onClose={() => setShowCallModal(false)}
        participantName={participant.fullName}
        participantRole={participantRole}
        participantAvatar={participant.avatarUrl}
        tripRoute={`${trip.ride.originName} → ${trip.ride.destName}`}
      />

    </div>
  );
};
