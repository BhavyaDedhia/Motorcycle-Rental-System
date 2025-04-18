import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import Layout from '../../components/Layout';
import MotorcycleCard from '../../components/MotorcycleCard';
// Import static data as fallback
import staticMotorcycles from '../../data/motorcycles';

export default function Motorcycles() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [motorcycles, setMotorcycles] = useState([]);
  const [filteredMotorcycles, setFilteredMotorcycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    brand: '',
    minPrice: '',
    maxPrice: '',
    minCC: '',
    maxCC: '',
    location: '',
    available: true
  });

  // Fetch motorcycles from API
  useEffect(() => {
    const fetchMotorcycles = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/motorcycles');
        
        // If no motorcycles in DB yet, use static data
        if (response.data.length === 0) {
          setMotorcycles(staticMotorcycles);
          setFilteredMotorcycles(staticMotorcycles.filter(m => m.available));
        } else {
          // Filter out user's own motorcycles if logged in
          let filteredData = response.data;
          if (status === 'authenticated') {
            // Convert owner ID to string for comparison
            filteredData = response.data.filter(m => {
              // Check if owner is an object (populated) or just an ID
              const ownerId = typeof m.owner === 'object' ? m.owner._id : m.owner;
              return ownerId !== session.user.id;
            });
          }
          
          setMotorcycles(filteredData);
          setFilteredMotorcycles(filteredData.filter(m => m.available));
        }
      } catch (err) {
        console.error('Error fetching motorcycles:', err);
        setError('Failed to load motorcycles. Using sample data instead.');
        // Fallback to static data
        setMotorcycles(staticMotorcycles);
        setFilteredMotorcycles(staticMotorcycles.filter(m => m.available));
      } finally {
        setLoading(false);
      }
    };

    fetchMotorcycles();
  }, [status, session]);

  // Get unique brands for filter
  const brands = [...new Set(motorcycles.map(m => m.brand))];
  // Get unique locations for filter
  const locations = [...new Set(motorcycles.map(m => m.location))];

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters({
      ...filters,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const applyFilters = () => {
    let filtered = motorcycles;

    // Filter by availability
    if (filters.available) {
      filtered = filtered.filter(m => m.available);
    }

    // Filter by brand
    if (filters.brand) {
      filtered = filtered.filter(m => m.brand === filters.brand);
    }

    // Filter by price range
    if (filters.minPrice) {
      filtered = filtered.filter(m => m.price >= parseInt(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(m => m.price <= parseInt(filters.maxPrice));
    }

    // Filter by CC range
    if (filters.minCC) {
      filtered = filtered.filter(m => m.cc >= parseInt(filters.minCC));
    }
    if (filters.maxCC) {
      filtered = filtered.filter(m => m.cc <= parseInt(filters.maxCC));
    }

    // Filter by location
    if (filters.location) {
      filtered = filtered.filter(m => m.location === filters.location);
    }

    setFilteredMotorcycles(filtered);
  };

  const resetFilters = () => {
    setFilters({
      brand: '',
      minPrice: '',
      maxPrice: '',
      minCC: '',
      maxCC: '',
      location: '',
      available: true
    });
    setFilteredMotorcycles(motorcycles.filter(m => m.available));
  };

  useEffect(() => {
    applyFilters();
  }, [filters]);

  return (
    <Layout title="Motorcycles">
      <div className="bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Available Motorcycles</h2>
            <Link 
              href="/motorcycles/add" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              List Your Motorcycle
            </Link>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters */}
            <div className="lg:w-1/4">
              <div className="bg-white p-6 rounded-lg shadow-md sticky top-4">
                <h2 className="text-xl font-semibold mb-4">Filters</h2>
                
                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="available"
                      checked={filters.available}
                      onChange={handleFilterChange}
                      className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-gray-700">Show only available</span>
                  </label>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                  <select
                    name="brand"
                    value={filters.brand}
                    onChange={handleFilterChange}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                  >
                    <option value="">All Brands</option>
                    {brands.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price Range ($ per day)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      name="minPrice"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={handleFilterChange}
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                    />
                    <input
                      type="number"
                      name="maxPrice"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={handleFilterChange}
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Engine Size (CC)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      name="minCC"
                      placeholder="Min"
                      value={filters.minCC}
                      onChange={handleFilterChange}
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                    />
                    <input
                      type="number"
                      name="maxCC"
                      placeholder="Max"
                      value={filters.maxCC}
                      onChange={handleFilterChange}
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <select
                    name="location"
                    value={filters.location}
                    onChange={handleFilterChange}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                  >
                    <option value="">All Locations</option>
                    {locations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={resetFilters}
                  className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  Reset Filters
                </button>
              </div>
            </div>

            {/* Motorcycle Listings */}
            <div className="lg:w-3/4">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-600"></div>
                </div>
              ) : filteredMotorcycles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredMotorcycles.map(motorcycle => (
                    <MotorcycleCard key={motorcycle._id} motorcycle={motorcycle} />
                  ))}
                </div>
              ) : (
                <div className="bg-white p-8 rounded-lg shadow-md text-center">
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No motorcycles found</h3>
                  <p className="text-gray-600 mb-4">
                    No motorcycles match your current filter criteria. Try adjusting your filters or check back later.
                  </p>
                  <button
                    onClick={resetFilters}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 