import bookings from '../../../../data/bookings';

export default async function handler(req, res) {
  const { userId } = req.query;

  if (req.method === "GET") {
    try {
      // Filter bookings by userId
      const userBookings = bookings.filter(booking => booking.userId._id === userId);
      return res.status(200).json(userBookings);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch user bookings" });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
} 