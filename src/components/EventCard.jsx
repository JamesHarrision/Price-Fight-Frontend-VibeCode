import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, ArrowRight } from 'lucide-react';

export const EventCard = ({ event }) => {
  const navigate = useNavigate();
  const { id, title, description, cover_image, start_time, end_time, status } = event;

  const getStatusColor = (status) => {
    switch (status) {
      case 'ONGOING': return 'bg-green-100 text-green-700 border-green-200';
      case 'PENDING': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'ENDED': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative h-48 overflow-hidden">
        <img
          src={cover_image || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800'}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(status)}`}>
            {status}
          </span>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
          {title}
        </h3>
        <p className="text-gray-500 text-sm line-clamp-2 mb-4 h-10">
          {description || 'No description available for this auction event.'}
        </p>

        <div className="flex flex-col gap-2 mb-6">
          <div className="flex items-center text-sm text-gray-600 gap-2">
            <Calendar className="w-4 h-4 text-primary-500" />
            <span>Starts: {formatDate(start_time)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 gap-2">
            <Clock className="w-4 h-4 text-primary-500" />
            <span>Ends: {formatDate(end_time)}</span>
          </div>
        </div>

        <button
          onClick={() => navigate(`/events/${id}`)}
          className="w-full py-3 bg-gray-50 text-gray-900 font-bold rounded-xl flex items-center justify-center gap-2 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300"
        >
          View Auction Items
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};
