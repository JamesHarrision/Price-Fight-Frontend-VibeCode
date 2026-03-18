import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

export const Forbidden = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-red-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

      <div className="max-w-md w-full text-center relative z-10">
        <div className="mb-8 relative inline-block">
          <div className="w-32 h-32 bg-red-50 rounded-[40px] flex items-center justify-center mx-auto transform rotate-12 transition-transform hover:rotate-0 duration-500">
            <ShieldAlert className="w-16 h-16 text-red-500 transform -rotate-12 transition-transform hover:rotate-0 duration-500" />
          </div>
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg">
            RESTRICTED
          </div>
        </div>

        <h1 className="text-8xl font-black text-gray-900 tracking-tighter mb-4">403</h1>
        <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Access Denied</h2>
        <p className="text-gray-500 font-medium mb-12 leading-relaxed">
          It seems you don't have the necessary permissions to access this area. If you believe this is a mistake, please contact support.
        </p>

        <div className="space-y-4">
          <button
            onClick={() => navigate(-1)}
            className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-4 rounded-2xl font-black shadow-xl hover:bg-gray-800 transition-all transform active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
            GO BACK
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center gap-2 bg-white text-gray-900 border-2 border-gray-100 py-4 rounded-2xl font-black hover:bg-gray-50 transition-all transform active:scale-95"
          >
            <Home className="w-5 h-5" />
            RETURN HOME
          </button>
        </div>
      </div>
    </div>
  );
};
