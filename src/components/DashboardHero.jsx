import React from 'react';
import { Search, Star } from 'lucide-react';

export const DashboardHero = ({ searchQuery, setSearchQuery }) => {
  return (
    <div className="relative bg-gray-900 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900/40 to-purple-900/40 mix-blend-multiply"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500 rounded-full blur-[128px] opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full blur-[128px] opacity-20 transform -translate-x-1/2 translate-y-1/2"></div>

      <div className="max-w-7xl mx-auto px-6 py-20 relative z-10 text-center flex flex-col items-center">
        <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-white/90 text-[10px] font-bold uppercase tracking-widest mb-6 backdrop-blur-md border border-white/20">
          <Star className="w-3 h-3 text-yellow-400" /> Voted #1 Auction Platform
        </span>
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6">
          Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-purple-400">Exclusive</span> Items
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto font-medium mb-12">
          Join thousands of collectors worldwide. Bid on verified premium physical items ranging from luxury watches to limited-edition sneakers.
        </p>

        {/* Search Bar Khổng Lồ */}
        <div className="w-full max-w-2xl relative group">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-14 pr-6 py-5 border-2 border-white/10 rounded-2xl leading-5 bg-white/5 backdrop-blur-md text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-primary-500/30 focus:border-primary-500 focus:bg-white focus:text-gray-900 focus:placeholder-gray-300 text-lg transition-all"
            placeholder="Search by event name, keywords, or brand..."
          />
        </div>
      </div>
    </div>
  );
};
