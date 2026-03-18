import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, Home, Ghost } from 'lucide-react';

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 -right-20 w-80 h-80 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

      <div className="max-w-md w-full text-center relative z-10">
        <div className="mb-8 relative inline-block">
          <div className="w-32 h-32 bg-indigo-50 rounded-[40px] flex items-center justify-center mx-auto transform -rotate-12 transition-transform hover:rotate-0 duration-500">
            <Ghost className="w-16 h-16 text-indigo-500 transform rotate-12 transition-transform hover:rotate-0 duration-500" />
          </div>
        </div>

        <h1 className="text-8xl font-black text-gray-900 tracking-tighter mb-4">404</h1>
        <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Lost in the Arena?</h2>
        <p className="text-gray-500 font-medium mb-12 leading-relaxed">
          The page you are looking for has been knocked out or never existed in the first place. Let's get you back to the fight.
        </p>

        <div className="space-y-4">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white py-4 rounded-2xl font-black shadow-xl hover:bg-primary-700 transition-all transform active:scale-95 shadow-primary-500/20"
          >
            <Home className="w-5 h-5" />
            RETURN TO DASHBOARD
          </button>
          <button
            onClick={() => navigate(-1)}
            className="w-full flex items-center justify-center gap-2 bg-white text-gray-900 border-2 border-gray-100 py-4 rounded-2xl font-black hover:bg-gray-50 transition-all transform active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
            GO BACK
          </button>
        </div>
      </div>
    </div>
  );
};
