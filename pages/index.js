import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import Layout from '../components/Layout';

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();

  return (
    <Layout title="Motorcycle Rental - Find Your Perfect Ride">
      {/* Hero Section */}
      <div className="relative h-screen">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1558981806-ec527fa84c39?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80"
            alt="Motorcycle on scenic road"
            fill
            sizes="100vw"
            style={{ objectFit: 'cover' }}
            priority
          />
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>
        
        <div className="relative z-10 h-full flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                Experience the Freedom of the Open Road
              </h1>
              <p className="text-xl md:text-2xl text-white mb-8">
                Rent premium motorcycles for your next adventure. From cruisers to sport bikes, find the perfect ride.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/motorcycles"
                  className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition duration-300"
                >
                  Browse Motorcycles
                </Link>
                {status === 'authenticated' ? (
                  <Link 
                    href="/motorcycles/add"
                    className="inline-flex items-center justify-center px-8 py-4 border border-white text-lg font-medium rounded-md text-white hover:bg-white hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition duration-300"
                  >
                    List Your Motorcycle
                  </Link>
                ) : (
                  <Link 
                    href="/login"
                    className="inline-flex items-center justify-center px-8 py-4 border border-white text-lg font-medium rounded-md text-white hover:bg-white hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition duration-300"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-center">
              <a href="#features" className="text-white animate-bounce">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose Our Service</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide a seamless experience for both motorcycle owners and renters
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Earn Money</h3>
              <p className="text-gray-600 text-center">
                List your motorcycle and earn passive income when you're not using it. Our platform makes it easy to manage bookings and payments.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Secure & Safe</h3>
              <p className="text-gray-600 text-center">
                All rentals are covered by our insurance policy. We verify all users and provide secure payment processing for peace of mind.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">24/7 Support</h3>
              <p className="text-gray-600 text-center">
                Our customer support team is available around the clock to assist you with any questions or issues you may have.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Motorcycles Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Popular Motorcycles</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover our most sought-after models for your next adventure
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group relative overflow-hidden rounded-xl shadow-lg">
              <div className="relative h-80">
                <Image
                  src="https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                  alt="Sport Motorcycle"
                  layout="fill"
                  objectFit="cover"
                  className="group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-xl font-bold text-white mb-2">Sport Bikes</h3>
                  <p className="text-white text-sm mb-4">High-performance machines for the thrill-seekers</p>
                  <Link 
                    href="/motorcycles?category=sport"
                    className="inline-flex items-center text-white border border-white px-4 py-2 rounded-md hover:bg-white hover:text-gray-900 transition duration-300"
                  >
                    View All
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="group relative overflow-hidden rounded-xl shadow-lg">
              <div className="relative h-80">
                <Image
                  src="https://images.unsplash.com/photo-1580310614729-ccd69652491d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                  alt="Cruiser Motorcycle"
                  layout="fill"
                  objectFit="cover"
                  className="group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-xl font-bold text-white mb-2">Cruisers</h3>
                  <p className="text-white text-sm mb-4">Comfortable rides for long-distance journeys</p>
                  <Link 
                    href="/motorcycles?category=cruiser"
                    className="inline-flex items-center text-white border border-white px-4 py-2 rounded-md hover:bg-white hover:text-gray-900 transition duration-300"
                  >
                    View All
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="group relative overflow-hidden rounded-xl shadow-lg">
              <div className="relative h-80">
                <Image
                  src="https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                  alt="Adventure Motorcycle"
                  layout="fill"
                  objectFit="cover"
                  className="group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-xl font-bold text-white mb-2">Adventure Bikes</h3>
                  <p className="text-white text-sm mb-4">Versatile machines for on and off-road exploration</p>
                  <Link 
                    href="/motorcycles?category=adventure"
                    className="inline-flex items-center text-white border border-white px-4 py-2 rounded-md hover:bg-white hover:text-gray-900 transition duration-300"
                  >
                    View All
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Renting a motorcycle has never been easier
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-yellow-600 rounded-full flex items-center justify-center mb-6 mx-auto text-white text-2xl font-bold">1</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Browse</h3>
              <p className="text-gray-600">
                Explore our wide selection of motorcycles and find the perfect one for your needs.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-yellow-600 rounded-full flex items-center justify-center mb-6 mx-auto text-white text-2xl font-bold">2</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Book</h3>
              <p className="text-gray-600">
                Select your rental dates and complete the booking process with our secure payment system.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-yellow-600 rounded-full flex items-center justify-center mb-6 mx-auto text-white text-2xl font-bold">3</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Meet</h3>
              <p className="text-gray-600">
                Meet the owner at the agreed location and time to pick up your motorcycle.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-yellow-600 rounded-full flex items-center justify-center mb-6 mx-auto text-white text-2xl font-bold">4</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Ride</h3>
              <p className="text-gray-600">
                Enjoy your ride and create unforgettable memories on the open road.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-yellow-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Start Your Adventure?</h2>
          <p className="text-xl text-white mb-8 max-w-3xl mx-auto">
            Join thousands of riders who have discovered the freedom of motorcycle rental.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/motorcycles"
              className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-md text-yellow-600 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition duration-300"
            >
              Browse Motorcycles
            </Link>
            {status === 'authenticated' ? (
              <Link 
                href="/motorcycles/add"
                className="inline-flex items-center justify-center px-8 py-4 border border-white text-lg font-medium rounded-md text-white hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition duration-300"
              >
                List Your Motorcycle
              </Link>
            ) : (
              <Link 
                href="/signup"
                className="inline-flex items-center justify-center px-8 py-4 border border-white text-lg font-medium rounded-md text-white hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition duration-300"
              >
                Sign Up Now
              </Link>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
} 