import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Layout from '../../components/Layout';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import DashboardQuestions from '../../components/DashboardQuestions';

export default function Dashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [myMotorcycles, setMyMotorcycles] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('my-vehicles'); // my-vehicles, bookings, profile, questions

  const handleTabChange = (tab) => {
    console.log(`Changing tab to: ${tab}`);
    setActiveTab(tab);
  };

  const handleLogout = async () => {
    console.log("Logging out...");
    try {
      await signOut({ callbackUrl: '/' });
      router.push('/');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  useEffect(() => {
    // Handle tab from URL query parameter
    if (router.query.tab) {
      const validTabs = ['my-vehicles', 'bookings', 'profile', 'questions'];
      if (validTabs.includes(router.query.tab)) {
        console.log(`Setting tab from URL: ${router.query.tab}`);
        setActiveTab(router.query.tab);
      }
    }
  }, [router.query.tab]);

  useEffect(() => {
    // Redirect if not authenticated
    if (status === 'unauthenticated') {
      router.push(`/login?redirect=${encodeURIComponent('/dashboard')}`);
    }
  }, [status, router]);

  useEffect(() => {
    // Fetch data if authenticated
    if (status === 'authenticated') {
      fetchData();
    }
  }, [status]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch user's motorcycles
      const motorcyclesResponse = await axios.get('/api/motorcycles/my-listings');
      setMyMotorcycles(motorcyclesResponse.data);
      
      // Fetch bookings for motorcycles owned by the user (i.e., orders received as an owner)
      const ordersResponse = await axios.get('/api/bookings/my-vehicles');
      setMyBookings(ordersResponse.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="container mx-auto px-4 py-16 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard">
      <div className="bg-gray-100 min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <div className="w-64 bg-white shadow-md">
              <div className="p-4">
                <div className="flex items-center mb-6 pb-4 border-b border-gray-200">
                  <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
                    <span className="text-yellow-600 text-lg font-bold">
                      {session?.user?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div>
                    <h2 className="font-medium text-gray-900">{session?.user?.name || 'User'}</h2>
                    <p className="text-xs text-gray-500">Vehicle Owner</p>
                  </div>
                </div>
                
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Dashboard</h2>
                <nav className="space-y-1">
                  <a
                    href="/dashboard?tab=my-vehicles"
                    className={`block w-full px-4 py-2 text-sm font-medium rounded-md ${
                      activeTab === 'my-vehicles'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center">
                      <svg className="mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      My Vehicles
                    </div>
                  </a>
                  
                  <button
                    onClick={() => setActiveTab('bookings')}
                    className={`block w-full px-4 py-2 text-sm font-medium rounded-md ${
                      activeTab === 'bookings'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center">
                      <svg className="mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Orders
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('questions')}
                    className={`block w-full px-4 py-2 text-sm font-medium rounded-md ${
                      activeTab === 'questions'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center">
                      <svg className="mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Q&A
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`block w-full px-4 py-2 text-sm font-medium rounded-md ${
                      activeTab === 'profile'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center">
                      <svg className="mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Profile
                    </div>
                  </button>
                </nav>
                
                <div className="mt-6 pt-4 border-t border-gray-200 space-y-4">
                  <Link 
                    href="/motorcycles/add"
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                  >
                    <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add New Vehicle
                  </Link>
                  
                  <a 
                    href="/api/auth/signout?callbackUrl=/"
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <svg className="mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </a>
                </div>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="flex-1">
              {/* My Vehicles Tab */}
              {activeTab === 'my-vehicles' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">My Vehicles</h1>
                    <Link 
                      href="/motorcycles/add"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                    >
                      <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add New Vehicle
                    </Link>
                  </div>
                  
                  {myMotorcycles.length === 0 ? (
                    <div className="bg-white p-8 rounded-lg shadow-md text-center">
                      <h3 className="text-xl font-medium text-gray-900 mb-2">No vehicles listed yet</h3>
                      <p className="text-gray-600 mb-6">Start earning by listing your motorcycle for rent.</p>
                      <Link 
                        href="/motorcycles/add"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                      >
                        List Your First Vehicle
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {myMotorcycles.map((motorcycle) => (
                        <div key={motorcycle._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                          <div className="relative h-48 bg-gray-200">
                            <Image
                              src={
                                Array.isArray(motorcycle.images) && typeof motorcycle.images[0] === 'string' && (motorcycle.images[0].startsWith('/') || motorcycle.images[0].startsWith('http') || motorcycle.images[0].startsWith('data:'))
                                  ? motorcycle.images[0]
                                  : (typeof motorcycle.imageUrl === 'string' && (motorcycle.imageUrl.startsWith('/') || motorcycle.imageUrl.startsWith('http') || motorcycle.imageUrl.startsWith('data:'))
                                    ? motorcycle.imageUrl
                                    : '/images/motorcycle-placeholder.jpg')
                              }
                              alt={motorcycle.name}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              style={{ objectFit: 'cover' }}
                            />
                            <div className="absolute top-2 right-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                motorcycle.available 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {motorcycle.available ? 'Available' : 'Unavailable'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="p-4">
                            <h3 className="text-lg font-bold text-gray-900">{motorcycle.name}</h3>
                            <p className="text-sm text-gray-600">
                              {motorcycle.brand} {motorcycle.model} • {motorcycle.year}
                            </p>
                            <p className="text-sm font-medium text-gray-900 mt-1">
                              ${motorcycle.price} <span className="text-gray-500">/ day</span>
                            </p>
                            
                            <div className="mt-4 flex space-x-2">
                              <Link 
                                href={`/motorcycles/${motorcycle._id}/edit`}
                                className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                              >
                                Edit
                              </Link>
                              <Link 
                                href={`/motorcycles/${motorcycle._id}`}
                                className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                              >
                                View
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {/* Bookings Tab */}
              {activeTab === 'bookings' && (
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-6">My Bookings</h1>
                  
                  {myBookings.length === 0 ? (
                    <div className="bg-white p-8 rounded-lg shadow-md text-center">
                      <h3 className="text-xl font-medium text-gray-900 mb-2">No bookings yet</h3>
                      <p className="text-gray-600 mb-6">You don't have any bookings yet. Browse motorcycles to make a booking.</p>
                      <Link 
                        href="/motorcycles"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                      >
                        Browse Motorcycles
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {myBookings.map((booking) => (
                        <div key={booking._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                          <div className="p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row">
                              <div className="relative h-32 w-full sm:w-40 flex-shrink-0 mb-4 sm:mb-0 bg-gray-200 rounded-md">
                                {(() => {
  let displayImage = null;
  if (Array.isArray(booking.motorcycle?.images) && booking.motorcycle.images.length > 0) {
    const validImages = booking.motorcycle.images.filter(img => typeof img === 'string' && (img.startsWith('/') || img.startsWith('http') || img.startsWith('data:')));
    if (validImages.length > 0) {
      displayImage = validImages[0];
    }
  }
  if (!displayImage && booking.motorcycle?.imageUrl && typeof booking.motorcycle.imageUrl === 'string') {
    displayImage = booking.motorcycle.imageUrl;
  }
  if (displayImage) {
    return (
      <Image
        src={displayImage}
        alt={booking.motorcycle?.name || 'Motorcycle'}
        layout="fill"
        objectFit="cover"
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
                                    <h3 className="text-lg font-bold text-gray-900">{booking.motorcycle?.name || 'Motorcycle'}</h3>
                                    <p className="text-sm text-gray-600">
                                      {booking.motorcycle?.brand} {booking.motorcycle?.model} • {booking.motorcycle?.year}
                                    </p>
                                  </div>
                                  
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                  </span>
                                </div>
                                
                                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm text-gray-500">Rental Period</p>
                                    <p className="text-sm font-medium text-gray-900">
                                      {format(new Date(booking.startDate), 'MMM dd, yyyy')} - {format(new Date(booking.endDate), 'MMM dd, yyyy')}
                                    </p>
                                  </div>
                                  
                                  <div>
                                    <p className="text-sm text-gray-500">Total Price</p>
                                    <p className="text-sm font-medium text-gray-900">${booking.totalPrice.toFixed(2)}</p>
                                  </div>
                                  
                                  <div>
                                    <p className="text-sm text-gray-500">Renter</p>
                                    <p className="text-sm font-medium text-gray-900">{booking.user?.name || 'Unknown'}</p>
                                  </div>
                                  
                                  <div>
                                    <p className="text-sm text-gray-500">Payment Status</p>
                                    <p className={`text-sm font-medium ${
                                      booking.paymentStatus === 'paid' 
                                        ? 'text-green-600' 
                                        : booking.paymentStatus === 'refunded' 
                                          ? 'text-blue-600' 
                                          : 'text-yellow-600'
                                    }`}>
                                      {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                                    </p>
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
                                    <>
                                      <Link 
                                        href={`/bookings/${booking._id}/confirm`}
                                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                      >
                                        Confirm
                                      </Link>
                                      <Link 
                                        href={`/bookings/${booking._id}/reject`}
                                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                      >
                                        Reject
                                      </Link>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {/* Questions Tab */}
              {activeTab === 'questions' && (
                <div>
                  <DashboardQuestions myMotorcycles={myMotorcycles} />
                </div>
              )}
              
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile</h1>
                  
                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-center mb-6">
                        <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center mr-6">
                          <span className="text-yellow-600 text-3xl font-bold">
                            {session?.user?.name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">{session?.user?.name || 'User'}</h2>
                          <p className="text-gray-600">{session?.user?.email}</p>
                          <p className="text-sm text-gray-500 mt-1">Vehicle Owner</p>
                        </div>
                      </div>
                      
                      <div className="border-t border-gray-200 pt-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <p className="mt-1 text-sm text-gray-900">{session?.user?.name || 'Not provided'}</p>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <p className="mt-1 text-sm text-gray-900">{session?.user?.email || 'Not provided'}</p>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Phone</label>
                            <p className="mt-1 text-sm text-gray-900">Not provided</p>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Location</label>
                            <p className="mt-1 text-sm text-gray-900">Not provided</p>
                          </div>
                        </div>
                        
                        <div className="mt-6">
                          <Link 
                            href="/profile/edit"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                          >
                            Edit Profile
                          </Link>
                        </div>
                      </div>

                      {/* My Vehicles Section */}
                      <div className="border-t border-gray-200 pt-6 mt-6">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-medium text-gray-900">My Vehicles</h3>
                          <Link 
                            href="/motorcycles/add"
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                          >
                            Add New Vehicle
                          </Link>
                        </div>

                        {myMotorcycles.length === 0 ? (
                          <div className="text-center py-6">
                            <p className="text-gray-600">You haven't listed any vehicles yet.</p>
                            <Link 
                              href="/motorcycles/add"
                              className="mt-2 inline-flex items-center text-sm text-yellow-600 hover:text-yellow-700"
                            >
                              List your first vehicle
                            </Link>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {myMotorcycles.map((motorcycle) => (
                              <div key={motorcycle._id} className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-start space-x-4">
                                  <div className="relative h-20 w-20 flex-shrink-0 bg-gray-200 rounded-md overflow-hidden">
                                    <Image
                                      src={motorcycle.images[0] || '/images/motorcycle-placeholder.jpg'}
                                      alt={motorcycle.name}
                                      fill
                                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                      style={{ objectFit: 'cover' }}
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-medium text-gray-900 truncate">{motorcycle.name}</h4>
                                    <p className="text-sm text-gray-500">
                                      {motorcycle.brand} {motorcycle.model} • {motorcycle.year}
                                    </p>
                                    <p className="text-sm font-medium text-yellow-600">
                                      ${motorcycle.price}/day
                                    </p>
                                    <div className="mt-2 flex space-x-2">
                                      <Link 
                                        href={`/motorcycles/${motorcycle._id}/edit`}
                                        className="text-sm text-yellow-600 hover:text-yellow-700"
                                      >
                                        Edit
                                      </Link>
                                      <Link 
                                        href={`/motorcycles/${motorcycle._id}`}
                                        className="text-sm text-yellow-600 hover:text-yellow-700"
                                      >
                                        View
                                      </Link>
                                    </div>
                                  </div>
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                    motorcycle.available 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {motorcycle.available ? 'Available' : 'Unavailable'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 