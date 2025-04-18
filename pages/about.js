import React from 'react';
import Layout from '../components/Layout';

export default function About() {
  return (
    <Layout title="About Us">
      <div className="bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">About MotoCruise</h1>
          
          <div className="bg-white p-8 rounded-lg shadow-md">
            <p className="text-gray-700 mb-4">
              MotoCruise is a premier motorcycle rental service dedicated to providing high-quality motorcycles for enthusiasts and travelers alike. Founded in 2023, we aim to make motorcycle rentals accessible, affordable, and hassle-free.
            </p>
            
            <p className="text-gray-700 mb-4">
              Our fleet includes a wide range of motorcycles from cruisers to sport bikes, ensuring that we have the perfect ride for every occasion and preference.
            </p>
            
            <p className="text-gray-700 mb-4">
              At MotoCruise, we prioritize safety, quality, and customer satisfaction. All our motorcycles are regularly maintained and inspected to ensure they meet the highest standards of performance and safety.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Our Mission</h2>
            <p className="text-gray-700 mb-4">
              Our mission is to provide motorcycle enthusiasts with access to premium bikes at affordable prices, enabling them to experience the thrill of the open road without the commitment of ownership.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Contact Us</h2>
            <p className="text-gray-700">
              If you have any questions or need assistance, please don't hesitate to contact our customer support team at <a href="mailto:info@motocruise.com" className="text-yellow-600 hover:text-yellow-700">info@motocruise.com</a> or call us at (123) 456-7890.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
} 