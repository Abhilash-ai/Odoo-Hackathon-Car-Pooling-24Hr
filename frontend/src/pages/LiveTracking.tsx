import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';
import { Trip, Message } from '../types';
import { MapContainer } from '../components/MapContainer';
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
    }, 2500);

    return () => clearInterval(interval);
  }, [isSimulating, polylineCoords, trip, socket]);

  const handleStartTrip = async () => {
    if (!trip) return;
    try {
      const res = await api.post(`/trips/${trip.id}/start`);
      setTrip(res.data);
      setIsSimulating(true);
      if (socket) socket.emit('trip_status_changed', { tripId: trip.id, status: 'IN_PROGRESS' });
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to start trip');
    }
  };

  const handleCompleteTrip = async () => {
    if (!trip) return;
    try {
      const res = await api.post(`/trips/${trip.id}/complete`);
      setTrip(res.data);
      setIsSimulating(false);
      if (socket) socket.emit('trip_status_changed', { tripId: trip.id, status: 'PAYMENT_PENDING' });
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to complete trip');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !trip || !user) return;

    try {
      const res = await api.post(`/chat/trip/${trip.id}`, { content: chatInput.trim() });
      if (socket) {
        socket.emit('send_message', res.data);
      }
      setChatInput('');
    } catch (err) {
      console.error(err);
    }
  };

  const copyTripLink = () => {
    navigator.clipboard.writeText(`https://odoo-commute.in/track/${trip?.id}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const triggerSosAlert = () => {
    setSosAlertSent(true);
    setTimeout(() => setSosAlertSent(false), 4000);
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 text-xs font-semibold">Loading Live Tracking Command Center...</div>;
  }

  if (!trip) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4 max-w-xl mx-auto shadow-sm">
        <Navigation className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mx-auto animate-bounce" />
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">No Active Commute Tracked</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Book or offer a ride to launch the Live Commute Command Center.</p>
        <button onClick={() => setActiveTab('find')} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md">
          Find a Ride
        </button>
      </div>
    );
  }

  const isDriver = user?.id === trip.driverId;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8">
      
      {/* HEADER COMMAND CENTER BAR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5 transition-colors">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-extrabold rounded-xl flex items-center space-x-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
              <span>{trip.status}</span>
            </span>

            {/* LIVE GPS vs DEMO SIMULATION BADGE */}
            <span className={`px-3 py-1 text-[10px] uppercase font-extrabold rounded-xl border ${
              isDemoSimulation
                ? 'bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                : 'bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800'
            }`}>
              {isDemoSimulation ? '⚡ DEMO SIMULATION MODE' : '📡 REAL GPS GEOLOCATION'}
            </span>

            {/* WOMEN ONLY SAFETY BADGE */}
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
          
          {/* SAFETY SOS BUTTON */}
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

          {!isDriver && (trip.status === 'PAYMENT_PENDING' || trip.status === 'COMPLETED') && trip.paymentStatus !== 'PAID' && (
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

      {/* SAFETY & SOS PANEL MODAL */}
      {showSafetyPanel && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl relative animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-400">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Commute Safety & Emergency Panel</h3>
              </div>
              <button onClick={() => setShowSafetyPanel(false)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white">
                ✕
              </button>
            </div>

            {sosAlertSent && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold rounded-xl animate-pulse">
                🚨 Demo Alert Simulated: Organization Security Desk & Emergency Contacts Notified.
              </div>
            )}

            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <p className="font-extrabold text-slate-700 dark:text-slate-300 uppercase text-[10px] tracking-wider">Verified Trip Information</p>
              <p className="text-slate-900 dark:text-slate-200 font-semibold">Driver: {trip.driver.fullName} ({trip.driver.phone || '+91 98765 43210'})</p>
              <p className="text-slate-900 dark:text-slate-200 font-semibold">Vehicle Plate: <span className="font-mono text-emerald-600 dark:text-emerald-400">{trip.ride.vehicle.plateNumber}</span> ({trip.ride.vehicle.make} {trip.ride.vehicle.model})</p>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">Org Code: {user?.organizationName}</p>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={copyTripLink}
                className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center space-x-2 border border-slate-200 dark:border-slate-700 transition"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Share2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                <span>{copiedLink ? 'Live Tracking Link Copied!' : 'Share Live Trip Status Link'}</span>
              </button>

              <button
                onClick={triggerSosAlert}
                className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center space-x-2 transition"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Simulate Emergency SOS Alert</span>
              </button>
            </div>

            <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center italic">
              Demo Mode: Real emergency service integrations are simulated for hackathon evaluation.
            </p>
          </div>
        </div>
      )}

      {/* LIVE MAP & COMMUTE METRICS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* MAP COMMAND CENTER */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* REALTIME HUD STATS (INR ₹) */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center shadow-sm">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Estimated ETA</span>
              <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{etaMins} mins</span>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center shadow-sm">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Distance Left</span>
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{distanceRemainingKm} km</span>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center shadow-sm">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Total Fare</span>
              <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">₹{trip.fareAmount.toFixed(0)}</span>
            </div>
          </div>

          {/* LEAFLET LIVE TRACKING MAP (NAGPUR ROUTE) */}
          <MapContainer
            origin={[trip.ride.originLat, trip.ride.originLng]}
            dest={[trip.ride.destLat, trip.ride.destLng]}
            currentPos={currentPos}
            polyline={polylineCoords}
            originName={trip.ride.originName}
            destName={trip.ride.destName}
            height="440px"
          />

        </div>

        {/* COMMUTE PARTICIPANTS & CHAT DRAWER */}
        <div className="space-y-5">
          
          {/* DRIVER & PASSENGER CARDS */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm">
            <h3 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Commute Participants</h3>

            {/* DRIVER CARD */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/50 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={trip.driver.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
                  alt={trip.driver.fullName}
                  className="w-10 h-10 rounded-full border border-emerald-500/50 object-cover"
                />
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{trip.driver.fullName}</span>
                    <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded font-extrabold">DRIVER</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{trip.driver.department}</p>
                </div>
              </div>
              <a href={`tel:${trip.driver.phone || '+919876543210'}`} className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 rounded-xl text-emerald-600 dark:text-emerald-400">
                <Phone className="w-4 h-4" />
              </a>
            </div>

            {/* PASSENGER CARD */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/50 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={trip.passenger.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={trip.passenger.fullName}
                  className="w-10 h-10 rounded-full border border-blue-500/50 object-cover"
                />
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{trip.passenger.fullName}</span>
                    <span className="text-[9px] bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 px-1.5 py-0.5 rounded font-extrabold">PASSENGER</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{trip.passenger.department}</p>
                </div>
              </div>
              <a href={`tel:${trip.passenger.phone || '+919711223344'}`} className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 rounded-xl text-emerald-600 dark:text-emerald-400">
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* TRIP CHAT DRAWER */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 flex flex-col h-[320px] shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-200 flex items-center space-x-1.5">
                <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Pickup Coordination Chat</span>
              </h3>
              <span className="text-[10px] text-slate-400">Live Socket.IO</span>
            </div>

            {/* MESSAGES LIST */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs">
              {messages.map((m) => {
                const isMe = m.senderId === user?.id;
                return (
                  <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <span className="text-[9px] text-slate-400 mb-0.5">{m.sender.fullName}</span>
                    <div className={`p-3 rounded-2xl max-w-[80%] ${
                      isMe ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 rounded-bl-none'
                    }`}>
                      {m.content}
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* CHAT INPUT */}
            <form onSubmit={handleSendMessage} className="mt-3 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type pickup update..."
                className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
              />
              <button type="submit" className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-sm">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
};
