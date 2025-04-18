import connectToDatabase from "../../lib/mongodb";
import User from "../../models/User";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    await connectToDatabase();

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Hash the password directly
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Update the user's password directly
    user.password = hashedPassword;
    
    // Save without triggering the pre-save hook
    await User.updateOne(
      { _id: user._id },
      { $set: { password: hashedPassword } }
    );

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
} 