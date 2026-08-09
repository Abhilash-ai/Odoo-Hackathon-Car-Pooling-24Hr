import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, ShieldCheck, User } from 'lucide-react';

interface VoiceCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  participantName: string;
  participantRole: string;
  participantAvatar?: string;
  tripRoute?: string;
}

export const VoiceCallModal: React.FC<VoiceCallModalProps> = ({
  isOpen,
  onClose,
  participantName,
  participantRole,
  participantAvatar,
  tripRoute,
}) => {
  const [callStatus, setCallStatus] = useState<'calling' | 'connected' | 'ended'>('calling');
  const [seconds, setSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);

  useEffect(() => {
    if (!isOpen) {
      setCallStatus('calling');
      setSeconds(0);
      return;
    }

    // Auto-connect call after 2.5 seconds
    const connectTimer = setTimeout(() => {
      setCallStatus('connected');
    }, 2500);

    return () => clearTimeout(connectTimer);
  }, [isOpen]);

  useEffect(() => {
    let interval: any = null;
    if (callStatus === 'connected') {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  if (!isOpen) return null;

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    setCallStatus('ended');
    setTimeout(() => {
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-8 text-center space-y-6 shadow-2xl text-white">
        
        {/* ENCRYPTED PRIVACY BADGE */}
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-950/80 border border-emerald-800/80 rounded-full text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Encrypted Voice Commute Call</span>
        </div>

        {/* PARTICIPANT AVATAR & INFO */}
        <div className="space-y-3">
          <div className="relative w-24 h-24 mx-auto">
            <img
              src={participantAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
              alt={participantName}
              className="w-24 h-24 rounded-full object-cover border-4 border-emerald-500 shadow-xl"
            />
            {callStatus === 'calling' && (
              <span className="absolute inset-0 rounded-full border-4 border-emerald-400 animate-ping opacity-50" />
            )}
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-extrabold text-white">{participantName}</h3>
            <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">{participantRole}</p>
            {tripRoute && <p className="text-[11px] text-slate-400">{tripRoute}</p>}
          </div>
        </div>

        {/* CALL TIMER / STATUS */}
        <div className="py-2">
          {callStatus === 'calling' && (
            <span className="text-xs font-bold text-slate-400 animate-pulse block">Ringing passenger / driver...</span>
          )}
          {callStatus === 'connected' && (
            <div className="space-y-1">
              <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-widest block">Call Active</span>
              <span className="text-2xl font-mono font-extrabold text-white">{formatTimer(seconds)}</span>
            </div>
          )}
          {callStatus === 'ended' && (
            <span className="text-xs font-bold text-rose-400 block">Call Ended</span>
          )}
        </div>

        {/* CALL CONTROLS */}
        <div className="flex items-center justify-center space-x-6 pt-2">
          {/* MUTE TOGGLE */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            disabled={callStatus !== 'connected'}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition ${
              isMuted 
                ? 'bg-rose-600 text-white' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* END CALL BUTTON */}
          <button
            onClick={handleEndCall}
            className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg transition transform active:scale-95"
          >
            <PhoneOff className="w-7 h-7" />
          </button>

          {/* SPEAKER TOGGLE */}
          <button
            onClick={() => setIsSpeaker(!isSpeaker)}
            disabled={callStatus !== 'connected'}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition ${
              isSpeaker 
                ? 'bg-emerald-600 text-white' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {isSpeaker ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>

      </div>
    </div>
  );
};
