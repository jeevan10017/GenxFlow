
import React from 'react';
import { Loader2 } from 'lucide-react';

function ServerWakeupModal({ isWakingUp, countdown }) {
  if (!isWakingUp) {
    return null; 
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm text-center p-8 m-4">
        <Loader2 className="mx-auto h-12 w-12 text-stone-500 animate-spin mb-6" />
        <h2 className="font-serif text-2xl font-bold text-stone-800">
          Waking Up the Server
        </h2>
        <p className="text-stone-600 mt-2 mb-6">
          Our backend is hosted on a free plan and goes to sleep when not in use. Please wait a moment while it starts up.
        </p>
        <div className="text-4xl font-bold text-stone-800 tabular-nums">
          {countdown}
        </div>
        <p className="text-sm text-stone-500 mt-1">seconds remaining</p>
      </div>
    </div>
  );
}

export default ServerWakeupModal;