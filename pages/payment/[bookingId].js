import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Layout from '../../components/Layout';
import PaymentForm from '../../components/PaymentForm';

export default function PaymentPage() {
  const router = useRouter();
  const { bookingId } = router.query;
  const { data: session, status } = useSession();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/login?redirect=/payment/₹{bookingId}`);
    }
  }, [status, router, bookingId]);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) return;

      try {
        const response = await axios.get(`/api/bookings/₹{bookingId}`);
        setBooking(response.data);
      } catch (error) {
        console.error('Error fetching booking:', error);
        toast.error('Failed to load booking details');
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, router]);

  if (status === 'loading' || loading) {
    return (
      <Layout title="Payment">
        <div className="container mx-auto px-4 py-16 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-600"></div>
        </div>
      </Layout>
    );
  }

  if (!booking) {
    return (
      <Layout title="Payment">
        <div className="container mx-auto px-4 py-16">
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Booking Not Found</h1>
            <p className="text-gray-600 mb-6">The booking you're looking for doesn't exist or you don't have permission to view it.</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (booking.paymentStatus === 'paid') {
    return (
      <Layout title="Payment">
        <div className="container mx-auto px-4 py-16">
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Already Processed</h1>
            <p className="text-gray-600 mb-6">This booking has already been paid for.</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Payment">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Complete Your Payment</h1>
          
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Motorcycle:</span>
                <span className="font-medium">{booking.motorcycle.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Rental Period:</span>
                <span className="font-medium">
                  {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Daily Rate:</span>
                <span className="font-medium">₹{booking.motorcycle.price}/day</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span className="text-gray-900">Total Amount:</span>
                <span className="text-yellow-600">₹{booking.totalPrice}</span>
              </div>
            </div>
          </div>

          <PaymentForm
            bookingId={bookingId}
            totalPrice={booking.totalPrice}
            onSuccess={() => {
              toast.success('Payment processed successfully!');
              router.push('/dashboard');
            }}
          />
        </div>
      </div>
    </Layout>
  );
} 