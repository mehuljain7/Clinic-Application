import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false }, // ✅ new
  verificationToken: { type: String },           // ✅ new
  resetToken: String,
  resetTokenExpiry: Date,
});

export default mongoose.model("User", userSchema);
