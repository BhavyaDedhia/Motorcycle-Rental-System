import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { useSession } from 'next-auth/react';
import Layout from '../../components/Layout';
import { format, differenceInDays } from 'date-fns';
import axios from 'axios';
// Import static data as fallback
import motorcycles from '../../data/motorcycles';

// Base64 encoded placeholder image (orange background with white text)
const placeholderImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAADICAYAAABS39xVAAAACXBIWXMAAAsTAAALEwEAmpwYAAAGEmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOCAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMjQtMDYtMjBUMTg6Mjc6NDQrMDU6MzAiIHhtcDpNb2RpZnlEYXRlPSIyMDI0LTA2LTIwVDE4OjMxOjM3KzA1OjMwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDI0LTA2LTIwVDE4OjMxOjM3KzA1OjMwIiBkYzpmb3JmYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9InNSR0IgSUVDNjE5NjYtMi4xIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjNlMmY1MDA1LWU5ZGItNGRiMS05MGZiLTMwMjU4OTAxN2FiMSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDozZTJmNTAwNS1lOWRiLTRkYjEtOTBmYi0zMDI1ODkwMTdhYjEiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDozZTJmNTAwNS1lOWRiLTRkYjEtOTBmYi0zMDI1ODkwMTdhYjEiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjNlMmY1MDA1LWU5ZGItNGRiMS05MGZiLTMwMjU4OTAxN2FiMSIgc3RFdnQ6d2hlbj0iMjAyNC0wNi0yMFQxODoyNzo0NCswNTozMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTggKE1hY2ludG9zaCkiLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+VJ4o+QAAAUBJREFUeJzt1UFqwmAUheGreIOsJuD2AkWXIZVCoVO3ZHCdWZs3ECo+bdJQj+cDf5f3/YOPSfZxuVzqkXq73dKMYRhdLqr8Xq/XNKOqalVV9V1VVWZn9/s9zXg+n10u6SFerVZpRlVV67qub8oCAIRZAIRZAIRZAIRZAIRZAIRZAIRZAIRZAIRZAIRZAIRZAIRZAIRZAIRZAIRZAIRZAIRZAIRZAIRZAIRZAIRZAIRZAIRZAIRZAIRZAIRZAIRZAIRZAIRZAIRZAIRZAIRZAIRZAIRZAIRZAIRZAIRZAIRZAIRZAIRZAIRZAIRZAIRZAIRZAIRZAIRZAIRZAIRZAIRZAIRZAIRZAIRZAIRZAIRZAIRZAIRZAIRZAIRZAIRZAIRZAIRZAIRZAIRZAIRZAIRZAIRZAIRZAIRZAIRZAIRZAIRZAIRZAIT+BdOSNmrKWdAHAAAAAElFTkSuQmCC';

export default function MotorcycleDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session, status } = useSession();
  
  const [motorcycle, setMotorcycle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchMotorcycle = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/motorcycles/${id}`);
        
        if (response.data && response.data.data) {
          setMotorcycle(response.data.data);
        } else {
          // Fallback to static data if API fails
          const foundMotorcycle = motorcycles.find(m => m._id === id);
          setMotorcycle(foundMotorcycle || null);
        }
      } catch (error) {
        console.error('Error fetching motorcycle:', error);
        // Fallback to static data if API fails
        const foundMotorcycle = motorcycles.find(m => m._id === id);
        setMotorcycle(foundMotorcycle || null);
      } finally {
        setLoading(false);
      }
    };

    fetchMotorcycle();
  }, [id]);

  // Calculate total price when dates change
  useEffect(() => {
    if (startDate && endDate && motorcycle) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const days = differenceInDays(end, start) + 1; // Include end date
      
      if (days > 0) {
        setTotalPrice(days * motorcycle.price);
      } else {
        setTotalPrice(0);
      }
    } else {
      setTotalPrice(0);
    }
  }, [startDate, endDate, motorcycle]);

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
    
    // If end date is before start date, update end date
    if (endDate && new Date(e.target.value) > new Date(endDate)) {
      setEndDate(e.target.value);
    }
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    
    if (!session) {
      toast.info('Please login to book a motorcycle');
      router.push(`/login?redirect=/motorcycles/${id}`);
      return;
    }
    
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates');
      return;
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end < start) {
      toast.error('End date cannot be before start date');
      return;
    }
    
    setBookingLoading(true);
    
    try {
      // Calculate total price
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      // Ensure at least 1 day for the booking
      const bookingDays = Math.max(1, days);
      const totalPrice = bookingDays * motorcycle.price;
      
      // Format dates as ISO strings
      const formattedStartDate = start.toISOString();
      const formattedEndDate = end.toISOString();
      
      // Log the booking data for debugging
      console.log('Booking data:', {
        motorcycleId: id,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        totalPrice: totalPrice
      });
      
      // Log the session for debugging
      console.log('Session:', session);
      
      // Make actual API call to create booking
      const response = await axios.post('/api/bookings', {
        motorcycleId: id,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        totalPrice: totalPrice
      });
      
      console.log('Booking response:', response.data);
      toast.success('Booking created successfully!');
      router.push('/bookings');
    } catch (error) {
      console.error('Error creating booking:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
        toast.error(error.response.data.message || 'Failed to create booking');
      } else if (error.request) {
        console.error('Error request:', error.request);
        toast.error('Network error - please try again');
      } else {
        console.error('Error message:', error.message);
        toast.error('Failed to create booking');
      }
    } finally {
      setBookingLoading(false);
    }
  };

  // Format today's date for min date in date picker
  const today = new Date();
  const formattedToday = format(today, 'yyyy-MM-dd');
  
  if (loading) {
    return (
      <Layout title="Loading...">
        <div className="container mx-auto px-4 py-16 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-600"></div>
        </div>
      </Layout>
    );
  }
  
  if (!motorcycle) {
    return (
      <Layout title="Motorcycle Not Found">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Motorcycle Not Found</h1>
          <p className="text-gray-600 mb-8">The motorcycle you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => router.push('/motorcycles')}
            className="px-6 py-3 bg-yellow-600 text-white font-medium rounded-md hover:bg-yellow-700 transition duration-300"
          >
            Browse Other Motorcycles
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={motorcycle.name}>
      <div className="bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Motorcycle Images */}
            <div className="relative h-96 w-full bg-gray-200">
              {motorcycle.imageUrl ? (
                <img 
                  src={motorcycle.imageUrl}
                  alt={motorcycle.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    console.log('Image failed to load:', motorcycle.imageUrl);
                    e.target.onerror = null;
                    e.target.src = placeholderImage;
                  }}
                />
              ) : (
                <img
                  src={placeholderImage}
                  alt="Motorcycle placeholder"
                  className="h-full w-full object-cover"
                />
              )}
              {!motorcycle.available && (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md text-sm font-medium">
                  Currently Booked
                </div>
              )}
            </div>
            
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{motorcycle.name}</h1>
                  <p className="text-lg text-gray-600 mt-1">{motorcycle.brand} {motorcycle.model} • {motorcycle.year}</p>
                </div>
                <div className="mt-4 md:mt-0">
                  <p className="text-3xl font-bold text-yellow-600">${motorcycle.price}<span className="text-lg font-normal text-gray-600">/day</span></p>
                </div>
              </div>
              
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-2">
                  <h2 className="text-xl font-semibold mb-4">Description</h2>
                  <p className="text-gray-700">{motorcycle.description}</p>
                  
                  <div className="mt-8">
                    <h2 className="text-xl font-semibold mb-4">Specifications</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-yellow-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span className="text-gray-700"><span className="font-medium">Engine:</span> {motorcycle.cc} CC</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-yellow-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-gray-700"><span className="font-medium">Year:</span> {motorcycle.year}</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-yellow-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-gray-700"><span className="font-medium">Location:</span> {motorcycle.location}</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-yellow-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-gray-700"><span className="font-medium">Status:</span> {motorcycle.available ? 'Available' : 'Booked'}</span>
                      </div>
                    </div>
                  </div>
                  
                  {motorcycle.features && motorcycle.features.length > 0 && (
                    <div className="mt-8">
                      <h2 className="text-xl font-semibold mb-4">Features</h2>
                      <div className="flex flex-wrap gap-2">
                        {motorcycle.features.map((feature, index) => (
                          <span key={index} className="inline-block bg-gray-100 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div>
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h2 className="text-xl font-semibold mb-4">Book This Motorcycle</h2>
                    
                    {!motorcycle.available ? (
                      <div className="text-center py-4">
                        <p className="text-gray-700 mb-4">This motorcycle is currently booked.</p>
                        <button
                          onClick={() => router.push('/motorcycles')}
                          className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition duration-300"
                        >
                          Browse Other Motorcycles
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleBooking}>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                          <input
                            type="date"
                            min={formattedToday}
                            value={startDate}
                            onChange={handleStartDateChange}
                            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                            required
                          />
                        </div>
                        
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                          <input
                            type="date"
                            min={startDate || formattedToday}
                            value={endDate}
                            onChange={handleEndDateChange}
                            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                            required
                          />
                        </div>
                        
                        {totalPrice > 0 && (
                          <div className="mb-6 p-4 bg-gray-100 rounded-md">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-700">Daily Rate:</span>
                              <span className="font-medium">${motorcycle.price}</span>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-gray-700">Duration:</span>
                              <span className="font-medium">
                                {differenceInDays(new Date(endDate), new Date(startDate)) + 1} days
                              </span>
                            </div>
                            <div className="border-t border-gray-200 my-2 pt-2 flex justify-between items-center">
                              <span className="font-medium text-gray-900">Total:</span>
                              <span className="font-bold text-xl text-yellow-600">${totalPrice}</span>
                            </div>
                          </div>
                        )}
                        
                        <button
                          type="submit"
                          disabled={bookingLoading || !startDate || !endDate || totalPrice <= 0}
                          className={`w-full px-4 py-2 rounded-md text-white font-medium ${
                            bookingLoading || !startDate || !endDate || totalPrice <= 0
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-yellow-600 hover:bg-yellow-700'
                          } transition duration-300`}
                        >
                          {bookingLoading ? 'Processing...' : 'Book Now'}
                        </button>
                        
                        {!session && (
                          <p className="mt-2 text-sm text-gray-600 text-center">
                            You'll need to login before booking
                          </p>
                        )}
                      </form>
                    )}
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