import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { toast } from 'react-toastify';
import Layout from '../../components/Layout';
import { format } from 'date-fns';
import axios from 'axios';

export default function BookingDetail() {
  const router = useRouter();
  const { id } = router.query;
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchBooking = async () => {
      try {
        const response = await axios.get(`/api/bookings/${id}`);
        setBooking(response.data);
      } catch (error) {
        console.error('Error fetching booking:', error);
        toast.error('Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  const handleCancelBooking = async () => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }
    
    setCancelLoading(true);
    
    try {
      const response = await axios.post(`/api/bookings/${id}/cancel`);
      
      if (response.data.success) {
        toast.success('Booking cancelled successfully');
        setBooking({
          ...booking,
          status: 'cancelled'
        });
      } else {
        toast.error(response.data.message || 'Failed to cancel booking');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Booking Details">
        <div className="container mx-auto px-4 py-16 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-600"></div>
        </div>
      </Layout>
    );
  }

  if (!booking) {
    return (
      <Layout title="Booking Not Found">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Booking Not Found</h1>
          <p className="text-gray-600 mb-8">The booking you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => router.push('/bookings')}
            className="px-6 py-3 bg-yellow-600 text-white font-medium rounded-md hover:bg-yellow-700 transition duration-300"
          >
            View All Bookings
          </button>
        </div>
      </Layout>
    );
  }

  // Format dates
  const startDate = new Date(booking.startDate);
  const endDate = new Date(booking.endDate);
  const formattedStartDate = format(startDate, 'MMMM dd, yyyy');
  const formattedEndDate = format(endDate, 'MMMM dd, yyyy');
  const formattedBookingDate = format(new Date(booking.createdAt), 'MMMM dd, yyyy');
  
  // Calculate rental duration
  const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  
  // Get motorcycle data
  const motorcycle = booking.motorcycleId;

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
    <Layout title="Booking Details">
      <div className="bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <Link href="/bookings" className="text-yellow-600 hover:text-yellow-700 flex items-center">
              <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to My Bookings
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Booking #{booking._id.substring(0, 8)}</h1>
                  <p className="text-gray-600 mt-1">Booked on {formattedBookingDate}</p>
                </div>
                <div className="mt-4 md:mt-0">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <h2 className="text-xl font-semibold mb-4">Motorcycle Details</h2>
                  
                  <div className="flex flex-col sm:flex-row">
                    <div className="relative h-48 w-full sm:w-64 sm:h-48 flex-shrink-0 mb-4 sm:mb-0 bg-gray-200 rounded-md">
                      <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                        <span>Motorcycle Image</span>
                      </div>
                    </div>
                    
                    <div className="sm:ml-6">
                      <h3 className="text-lg font-bold text-gray-900">{motorcycle.name}</h3>
                      <p className="text-gray-600">{motorcycle.brand} {motorcycle.model} • {motorcycle.year}</p>
                      
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center">
                          <svg className="h-5 w-5 text-yellow-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span className="text-gray-700">{motorcycle.cc} CC</span>
                        </div>
                        <div className="flex items-center">
                          <svg className="h-5 w-5 text-yellow-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-gray-700">{motorcycle.location}</span>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <Link 
                          href={`/motorcycles/${motorcycle._id}`}
                          className="text-yellow-600 hover:text-yellow-700 font-medium"
                        >
                          View Motorcycle Details
                        </Link>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <h2 className="text-xl font-semibold mb-4">Booking Details</h2>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Rental Period</p>
                        <p className="text-gray-900 font-medium">
                          {formattedStartDate} - {formattedEndDate}
                        </p>
                        <p className="text-gray-700">
                          ({days} {days === 1 ? 'day' : 'days'})
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Daily Rate</p>
                        <p className="text-gray-900 font-medium">${motorcycle.price}/day</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Payment Status</p>
                        <p className={`font-medium ${
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
                        <p className="text-sm text-gray-500">Total Price</p>
                        <p className="text-gray-900 font-bold text-xl">${booking.totalPrice.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h2 className="text-xl font-semibold mb-4">Actions</h2>
                    
                    {booking.status === 'pending' && (
                      <button
                        onClick={handleCancelBooking}
                        disabled={cancelLoading}
                        className={`w-full mb-3 px-4 py-2 rounded-md text-white font-medium ${
                          cancelLoading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-red-600 hover:bg-red-700'
                        } transition duration-300`}
                      >
                        {cancelLoading ? 'Cancelling...' : 'Cancel Booking'}
                      </button>
                    )}
                    
                    {booking.status === 'confirmed' && booking.paymentStatus !== 'paid' && (
                      <Link
                        href={`/bookings/${booking._id}/payment`}
                        className="block w-full mb-3 px-4 py-2 text-center rounded-md text-white font-medium bg-green-600 hover:bg-green-700 transition duration-300"
                      >
                        Make Payment
                      </Link>
                    )}
                    
                    <Link
                      href="/motorcycles"
                      className="block w-full px-4 py-2 text-center rounded-md text-yellow-600 font-medium bg-white border border-yellow-600 hover:bg-yellow-50 transition duration-300"
                    >
                      Browse More Motorcycles
                    </Link>
                    
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h3 className="font-medium text-gray-900 mb-2">Need Help?</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        If you have any questions or need assistance with your booking, please contact our customer support.
                      </p>
                      <Link
                        href="/contact"
                        className="text-yellow-600 hover:text-yellow-700 font-medium text-sm"
                      >
                        Contact Support
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 