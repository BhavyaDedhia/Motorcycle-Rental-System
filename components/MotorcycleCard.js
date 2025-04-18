import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function MotorcycleCard({ motorcycle }) {
  const [imageError, setImageError] = useState(false);
  
  const {
    _id,
    brand,
    model,
    year,
    price,
    cc,
    location,
    imageUrl,
    available
  } = motorcycle;

  // Function to handle image loading errors
  const handleImageError = () => {
    console.log('Image failed to load:', imageUrl);
    setImageError(true);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-48 w-full">
        {imageUrl && !imageError ? (
          <Image
            src={imageUrl}
            alt={`${brand} ${model}`}
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-300 hover:scale-105"
            onError={handleImageError}
            unoptimized={imageUrl.includes('google.com')} // Skip optimization for Google images
          />
        ) : (
          <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
            <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {!available && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white text-lg font-semibold">Not Available</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{brand} {model}</h3>
            <p className="text-sm text-gray-600">{year} • {cc}cc</p>
          </div>
          <span className="text-lg font-bold text-yellow-600">${price}/day</span>
        </div>

        <div className="flex items-center text-sm text-gray-600 mb-4">
          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {location}
        </div>

        <Link
          href={`/motorcycles/${_id}`}
          className="block w-full text-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors duration-300"
        >
          View Details
        </Link>
      </div>
    </div>
  );
} 