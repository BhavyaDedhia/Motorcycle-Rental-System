const bookings = [
  {
    _id: '101',
    userId: {
      _id: 'user1',
      username: 'johndoe',
      email: 'john@example.com'
    },
    motorcycleId: {
      _id: '4',
      name: 'Ducati Monster',
      brand: 'Ducati',
      model: 'Monster',
      year: 2022,
      cc: 937,
      price: 85,
      imageUrl: '/images/motorcycle-placeholder.jpg',
      location: 'Miami'
    },
    startDate: '2023-07-15T00:00:00.000Z',
    endDate: '2023-07-18T00:00:00.000Z',
    totalPrice: 255,
    status: 'completed',
    paymentStatus: 'paid',
    createdAt: '2023-07-10T10:30:00.000Z'
  },
  {
    _id: '102',
    userId: {
      _id: 'user1',
      username: 'johndoe',
      email: 'john@example.com'
    },
    motorcycleId: {
      _id: '1',
      name: 'Harley-Davidson Street Glide',
      brand: 'Harley-Davidson',
      model: 'Street Glide',
      year: 2023,
      cc: 1868,
      price: 120,
      imageUrl: '/images/motorcycle-placeholder.jpg',
      location: 'New York'
    },
    startDate: '2023-08-20T00:00:00.000Z',
    endDate: '2023-08-25T00:00:00.000Z',
    totalPrice: 600,
    status: 'confirmed',
    paymentStatus: 'pending',
    createdAt: '2023-08-05T14:45:00.000Z'
  }
];

export default bookings; 