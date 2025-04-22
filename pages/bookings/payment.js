import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import axios from 'axios';
import Layout from '../../components/Layout';

export default function Payment() {
  const router = useRouter();
  const { bookingId } = router.query;
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [motorcycle, setMotorcycle] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  });

  useEffect(() => {
    if (!bookingId || status === 'loading') return;

    if (status === 'unauthenticated') {
      toast.error('You must be logged in to view this page');
      router.push('/login?redirect=/bookings');
      return;
    }

    const fetchBookingDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/bookings/₹{bookingId}`);
        setBooking(response.data);
        
        if (response.data.motorcycle && typeof response.data.motorcycle === 'object') {
          setMotorcycle(response.data.motorcycle);
        }
      } catch (error) {
        console.error('Error fetching booking details:', error);
        toast.error('Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId, router, status]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Format card number with spaces every 4 digits
    if (name === 'cardNumber') {
      const formatted = value.replace(/\s/g, '').replace(/(\d{4})/g, '₹1 ').trim();
      setPaymentData({ ...paymentData, cardNumber: formatted });
      return;
    }
    
    setPaymentData({ ...paymentData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate card details
    if (paymentData.cardNumber.replace(/\s/g, '').length !== 16) {
      toast.error('Please enter a valid 16-digit card number');
      return;
    }
    
    if (!paymentData.cardHolder.trim()) {
      toast.error('Please enter the card holder name');
      return;
    }
    
    if (!paymentData.expiryMonth || !paymentData.expiryYear) {
      toast.error('Please enter a valid expiry date');
      return;
    }
    
    if (paymentData.cvv.length !== 3) {
      toast.error('Please enter a valid 3-digit CVV');
      return;
    }
    
    setPaymentProcessing(true);
    
    try {
      // This is a dummy payment - in a real system, we would process the payment through a gateway
      // Simulate a payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update the booking status to mark payment as completed
      await axios.put(`/api/bookings/₹{bookingId}`, {
        paymentStatus: 'paid'
      });
      
      toast.success('Payment processed successfully!');
      router.push('/bookings');
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Failed to process payment');
    } finally {
      setPaymentProcessing(false);
    }
  };

  if (loading) {
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
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Booking Not Found</h1>
          <p className="text-gray-600 mb-8">The booking you're trying to pay for doesn't exist or has been removed.</p>
          <button
            onClick={() => router.push('/bookings')}
            className="px-6 py-3 bg-yellow-600 text-white font-medium rounded-md hover:bg-yellow-700 transition duration-300"
          >
            View My Bookings
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Payment">
      <div className="bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Complete Your Payment</h1>
                
                <div className="mb-6 bg-gray-50 p-4 rounded-md">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Motorcycle:</p>
                      <p className="font-medium">{motorcycle?.brand} {motorcycle?.model}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Rental Period:</p>
                      <p className="font-medium">
                        {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Location:</p>
                      <p className="font-medium">{motorcycle?.location}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Amount:</p>
                      <p className="font-medium text-yellow-600">₹{booking.totalPrice.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-6">
                    <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      id="cardNumber"
                      name="cardNumber"
                      value={paymentData.cardNumber}
                      onChange={handleChange}
                      placeholder="1234 5678 9012 3456"
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                      maxLength="19" // 16 digits + 3 spaces
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="cardHolder" className="block text-sm font-medium text-gray-700 mb-1">
                      Card Holder Name
                    </label>
                    <input
                      type="text"
                      id="cardHolder"
                      name="cardHolder"
                      value={paymentData.cardHolder}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Date
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          name="expiryMonth"
                          value={paymentData.expiryMonth}
                          onChange={handleChange}
                          className="border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                        >
                          <option value="">Month</option>
                          {[...Array(12)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>
                              {i + 1 < 10 ? `0₹{i + 1}` : i + 1}
                            </option>
                          ))}
                        </select>
                        <select
                          name="expiryYear"
                          value={paymentData.expiryYear}
                          onChange={handleChange}
                          className="border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                        >
                          <option value="">Year</option>
                          {[...Array(10)].map((_, i) => {
                            const year = new Date().getFullYear() + i;
                            return (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                        CVV
                      </label>
                      <input
                        type="text"
                        id="cvv"
                        name="cvv"
                        value={paymentData.cvv}
                        onChange={handleChange}
                        placeholder="123"
                        className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                        maxLength="3"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-2 text-sm text-gray-500">
                    <p className="mb-1">* This is a dummy payment page for demonstration purposes only.</p>
                    <p>* No real payment will be processed.</p>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={paymentProcessing}
                    className={`w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ₹{
                      paymentProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500'
                    }`}
                  >
                    {paymentProcessing ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing Payment...
                      </span>
                    ) : (
                      `Pay ₹₹{booking.totalPrice.toFixed(2)}`
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 