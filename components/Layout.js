import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Layout({ children, title = 'Motorcycle Rental' }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    
    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  // Direct navigation function
  const navigateTo = (path) => {
    router.push(path);
  };

  return (
    <>
      <Head>
        <title>{`${title} | Motorcycle Rental`}</title>
        <meta name="description" content="Rent motorcycles for your adventures" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen flex flex-col">
        <header className="bg-gray-900 text-white shadow-md">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold">
              MotoCruise
            </Link>

            {/* Mobile menu button */}
            <button 
              className="md:hidden p-2 rounded-md focus:outline-none" 
              onClick={toggleMenu}
            >
              <svg 
                className="h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6 items-center">
              <Link href="/" className={`hover:text-gray-300 ${router.pathname === '/' ? 'text-yellow-400' : ''}`}>
                Home
              </Link>
              <Link href="/motorcycles" className={`hover:text-gray-300 ${router.pathname.startsWith('/motorcycles') ? 'text-yellow-400' : ''}`}>
                Motorcycles
              </Link>
              <Link href="/about" className={`hover:text-gray-300 ${router.pathname === '/about' ? 'text-yellow-400' : ''}`}>
                About
              </Link>
              <Link href="/contact" className={`hover:text-gray-300 ${router.pathname === '/contact' ? 'text-yellow-400' : ''}`}>
                Contact
              </Link>
              
              {status === 'authenticated' ? (
                <>
                  <Link href="/bookings" className={`hover:text-gray-300 ${router.pathname.startsWith('/bookings') ? 'text-yellow-400' : ''}`}>
                    My Bookings
                  </Link>
                  <div className="relative" ref={dropdownRef}>
                    <button 
                      onClick={toggleDropdown} 
                      className="flex items-center space-x-1 hover:text-gray-300 focus:outline-none"
                    >
                      <span>{session.user.name || session.user.email}</span>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                        <a 
                          href="/dashboard?tab=profile"
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsDropdownOpen(false);
                          }}
                        >
                          Profile
                        </a>
                        <a 
                          href="/dashboard?tab=my-vehicles"
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsDropdownOpen(false);
                          }}
                        >
                          My Vehicles
                        </a>
                        <a 
                          href="/dashboard?tab=bookings"
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsDropdownOpen(false);
                          }}
                        >
                          My Bookings
                        </a>
                        <a 
                          href="/api/auth/signout?callbackUrl=/"
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsDropdownOpen(false);
                          }}
                        >
                          Logout
                        </a>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link href="/login" className="px-4 py-2 rounded bg-yellow-500 text-white hover:bg-yellow-600 transition duration-300">
                    Login
                  </Link>
                  <Link href="/signup" className="px-4 py-2 rounded border border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-white transition duration-300">
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden bg-gray-800 px-4 py-2">
              <nav className="flex flex-col space-y-3">
                <Link href="/" className={`hover:text-gray-300 ${router.pathname === '/' ? 'text-yellow-400' : ''}`}>
                  Home
                </Link>
                <Link href="/motorcycles" className={`hover:text-gray-300 ${router.pathname.startsWith('/motorcycles') ? 'text-yellow-400' : ''}`}>
                  Motorcycles
                </Link>
                <Link href="/about" className={`hover:text-gray-300 ${router.pathname === '/about' ? 'text-yellow-400' : ''}`}>
                  About
                </Link>
                <Link href="/contact" className={`hover:text-gray-300 ${router.pathname === '/contact' ? 'text-yellow-400' : ''}`}>
                  Contact
                </Link>
                
                {status === 'authenticated' ? (
                  <>
                    <a href="/dashboard?tab=profile" className={`hover:text-gray-300 ${router.pathname === '/dashboard' && router.query.tab === 'profile' ? 'text-yellow-400' : ''}`}>
                      Profile
                    </a>
                    <a href="/dashboard?tab=my-vehicles" className={`hover:text-gray-300 ${router.pathname === '/dashboard' && router.query.tab === 'my-vehicles' ? 'text-yellow-400' : ''}`}>
                      My Vehicles
                    </a>
                    <a href="/dashboard?tab=bookings" className={`hover:text-gray-300 ${router.pathname === '/dashboard' && router.query.tab === 'bookings' ? 'text-yellow-400' : ''}`}>
                      My Bookings
                    </a>
                    <a 
                      href="/api/auth/signout?callbackUrl=/"
                      className="text-left text-white hover:text-gray-300"
                    >
                      Logout
                    </a>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="px-4 py-2 rounded bg-yellow-500 text-white hover:bg-yellow-600 transition duration-300 inline-block">
                      Login
                    </Link>
                    <Link href="/signup" className="px-4 py-2 rounded border border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-white transition duration-300 inline-block">
                      Sign Up
                    </Link>
                  </>
                )}
              </nav>
            </div>
          )}
        </header>

        <main className="flex-grow">
          {children}
        </main>

        <footer className="bg-gray-900 text-white py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">MotoCruise</h3>
                <p className="text-gray-400">
                  Your premier destination for motorcycle rentals. Experience the thrill of the open road with our premium bikes.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li><Link href="/" className="text-gray-400 hover:text-white">Home</Link></li>
                  <li><Link href="/motorcycles" className="text-gray-400 hover:text-white">Motorcycles</Link></li>
                  <li><Link href="/about" className="text-gray-400 hover:text-white">About Us</Link></li>
                  <li><Link href="/contact" className="text-gray-400 hover:text-white">Contact</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Legal</h3>
                <ul className="space-y-2">
                  <li><Link href="/terms" className="text-gray-400 hover:text-white">Terms of Service</Link></li>
                  <li><Link href="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</Link></li>
                  <li><Link href="/refund" className="text-gray-400 hover:text-white">Refund Policy</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
                <address className="text-gray-400 not-italic">
                  <p>123 Bike Street</p>
                  <p>Motorcycle City, MC 12345</p>
                  <p className="mt-2">Email: info@motocruise.com</p>
                  <p>Phone: (123) 456-7890</p>
                </address>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-400">
              <p>&copy; {new Date().getFullYear()} MotoCruise. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
      
      <ToastContainer position="bottom-right" />
    </>
  );
} 