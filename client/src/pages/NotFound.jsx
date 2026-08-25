import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 space-y-6">
      <div className="w-20 h-20 bg-[#18181F] border border-[#E85D3D]/40 text-[#E85D3D] rounded-3xl flex items-center justify-center shadow-flame-glow animate-bounce">
        <Flame className="w-10 h-10" />
      </div>
      <h1 className="text-6xl font-black text-flame-gradient">404</h1>
      <h2 className="text-2xl font-extrabold text-white">ANIME DIMENSION LOST</h2>
      <p className="text-sm text-gray-400 max-w-md">
        The page or flame drop you are seeking has vanished into the shadow realm.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#D9480F] to-[#E85D3D] text-white text-xs font-extrabold rounded-xl shadow-flame-glow"
      >
        <ArrowLeft className="w-4 h-4" /> Return to Sanctuary
      </Link>
    </div>
  );
};

export default NotFound;
