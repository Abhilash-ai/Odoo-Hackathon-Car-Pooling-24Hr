import React, { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { Bell, Car, CheckCircle2, X, ArrowRight, User } from 'lucide-react';

interface NotificationToastProps {
  setActiveTab: (tab: string) => void;
}

export const BookingNotificationToast: React.FC<NotificationToastProps> = ({ setActiveTab }) => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [notification, setNotification] = useState<any>(null);

  useEffect(() => {
    if (!socket || !user) return;

    // Join user room
    socket.emit('join_user', user.id);

    // Listen to real-time booking notification
    const handleNewBooking = (data: any) => {
      if (data.driverId === user.id || data.booking?.ride?.driverId === user.id) {
        setNotification(data);
        setTimeout(() => setNotification(null), 8000);
      }
    };

    socket.on('new_booking_notification', handleNewBooking);

    return () => {
      socket.off('new_booking_notification', handleNewBooking);
    };
  }, [socket, user]);

  if (!notification) return null;

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm w-full bg-slate-900 border-2 border-emerald-500 rounded-3xl p-5 shadow-2xl text-white animate-bounce">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center font-bold text-white shadow">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider">
              {notification.title || 'New Booking Received!'}
            </h4>
            <p className="text-[11px] text-slate-300 font-medium leading-tight">
              {notification.message}
            </p>
          </div>
        </div>

        <button
          onClick={() => setNotification(null)}
          className="text-slate-400 hover:text-white p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
        <div className="space-y-0.5">
          <span className="text-[10px] text-slate-400 font-bold block uppercase">Passenger</span>
          <span className="font-extrabold text-white">{notification.passengerName || 'Employee'}</span>
        </div>

        <button
          onClick={() => {
            setNotification(null);
            setActiveTab('my-trips');
          }}
          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs flex items-center space-x-1 shadow transition"
        >
          <span>View in My Trips</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
