// backend/models/Diagnosis.js
import mongoose from "mongoose";

const diagnosisSchema = new mongoose.Schema({
  userEmail: { 
    type: String, 
    required: true,
    index: true  // Index for faster queries by email
  },
  userName: {
    type: String,
    required: true
  },
  inputs: { 
    type: Object, 
    required: true 
  },
  results: { 
    type: Object, 
    required: true 
  },
  // Store the top prediction for quick access
  topResult: {
    type: String,
    default: "Unknown"
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

export default mongoose.model("Diagnosis", diagnosisSchema);