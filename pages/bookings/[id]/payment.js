import React from 'react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Layout from '../../../components/Layout';
import PaymentForm from '../../../components/PaymentForm';

export default function BookingPaymentPage() {
  const router = useRouter();
  const { id } = router.query;
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    axios.get(`/api/bookings/${id}`)
      .then(res => {
        setBooking(res.data);
        setLoading(false);
      })
      .catch(() => {
        toast.error('Failed to fetch booking');
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <Layout title="Payment"><div className="p-8 text-center">Loading...</div></Layout>;
  }
  if (!booking) {
    return <Layout title="Payment"><div className="p-8 text-center text-red-600">Booking not found.</div></Layout>;
  }
  if (booking.paymentStatus === 'paid') {
    return <Layout title="Payment"><div className="p-8 text-center text-green-600">Payment already completed.</div></Layout>;
  }

  return (
    <Layout title="Payment">
      <div className="max-w-md mx-auto bg-white mt-10 p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Payment for {booking.motorcycle?.name || 'Motorcycle'}</h1>
        <p className="mb-2">Total: <span className="font-medium">₹{booking.totalPrice}</span></p>
        <PaymentForm
          bookingId={booking._id}
          totalPrice={booking.totalPrice}
          onSuccess={() => router.push(`/bookings/${booking._id}`)}
        />
      </div>
    </Layout>
  );
}
