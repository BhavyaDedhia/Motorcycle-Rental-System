import React from 'react';
import Link from 'next/link';
import { format, differenceInCalendarDays } from 'date-fns';
import Image from 'next/image';

import axios from 'axios';
import { toast } from 'react-toastify';

export default function BookingCard({ booking }) {
  // Get motorcycle data from the correct field
  const motorcycle = booking.motorcycle || booking.motorcycleId;
  
  // Format dates
  const startDate = new Date(booking.startDate);
  const endDate = new Date(booking.endDate);
  const formattedStartDate = format(startDate, 'MMM dd, yyyy');
  const formattedEndDate = format(endDate, 'MMM dd, yyyy');
  
  // Calculate rental duration (inclusive of both start and end date)
  let days = differenceInCalendarDays(endDate, startDate) + 1;
  if (days < 1) days = 1;
  
  // Status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row">
          <div className="relative h-40 w-full sm:w-48 sm:h-32 flex-shrink-0 mb-4 sm:mb-0 bg-gray-200 rounded-md">
            {/* Motorcycle Image Display Logic */}
            {(() => {
              let displayImage = null;
              if (Array.isArray(motorcycle?.images) && motorcycle.images.length > 0) {
                const validImages = motorcycle.images.filter(img => typeof img === 'string' && (img.startsWith('/') || img.startsWith('http') || img.startsWith('data:')));
                if (validImages.length > 0) {
                  displayImage = validImages[0];
                }
              }
              if (!displayImage && motorcycle?.imageUrl && typeof motorcycle.imageUrl === 'string') {
                displayImage = motorcycle.imageUrl;
              }
              if (displayImage) {
                return (
                  <img
                    src={displayImage}
                    alt={motorcycle?.name || 'Motorcycle'}
                    className="object-cover w-full h-full rounded-md"
                    onError={e => { e.target.onerror = null; e.target.src = '/placeholder.png'; }}
                  />
                );
              } else {
                return (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                    <span>No Image</span>
                  </div>
                );
              }
            })()}
          </div>
          
          <div className="sm:ml-6 flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{motorcycle?.name || 'Motorcycle'}</h3>

                <p className="text-sm text-gray-600">
                  {motorcycle?.brand} {motorcycle?.model} • {motorcycle?.year}
                </p>
              </div>
              
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </span>
              {booking.status === 'cancelled' && booking.cancellationReason && (
                <div className="mt-2 text-xs text-red-700 bg-red-50 rounded p-2 border border-red-200">
                  <strong>Reason:</strong> {booking.cancellationReason}
                </div>
              )}
            </div>
            
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Rental Period</p>
                <p className="text-sm font-medium text-gray-900">
                  {formattedStartDate} - {formattedEndDate} ({days} {days === 1 ? 'day' : 'days'})
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Total Price</p>
                <p className="text-sm font-medium text-gray-900">₹{motorcycle?.price && days ? (days * motorcycle.price).toFixed(2) : 'N/A'}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Payment Status</p>
                <p className={`text-sm font-medium ₹{
                  booking.paymentStatus === 'paid' 
                    ? 'text-green-600' 
                    : booking.paymentStatus === 'refunded' 
                      ? 'text-blue-600' 
                      : 'text-yellow-600'
                }`}>
                  {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Booking ID</p>
                <p className="text-sm font-medium text-gray-900">{booking._id.substring(0, 8)}</p>
              </div>
            </div>
            
            <div className="mt-4 flex flex-wrap gap-2">
              <Link 
                href={`/bookings/${booking._id}`}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                View Details
              </Link>
              
              {booking.status === 'pending' && (
                <button
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  onClick={async () => {
                    try {
                      // Cancel the booking
                      await axios.patch(`/api/bookings/${booking._id}`, {
                        status: 'cancelled',
                        cancellationReason: 'Cancelled by user'
                      });
                      toast.success('Booking cancelled and vehicle is now available!');
                      window.location.reload(); // Refresh to update UI
                    } catch (error) {
                      toast.error(error.response?.data?.error || 'Failed to cancel booking');
                    }
                  }}
                >
                  Cancel Booking
                </button>
              )}
              
              {booking.status === 'confirmed' && booking.paymentStatus !== 'paid' && (
                <Link 
                  href={`/bookings/${booking._id}/payment`}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Make Payment
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 