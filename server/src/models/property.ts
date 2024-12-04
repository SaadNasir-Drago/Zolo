import mongoose from 'mongoose';
import { boolean } from 'zod';

// Comment schema
const commentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Property schema
const propertySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Foreign Key (User)
  address: { type: String }, // Optional
  price: { type: Number }, // Optional
  bath: { type: Number }, // Optional
  bed: { type: Number }, // Optional
  size: { type: Number }, // Optional
  description: { type: String }, // Optional
  images: [{ type: String }], // Array of image file paths
  propertyType: { type: String }, // Optional (can be "house", "apartment", etc.)
  lat: { type: Number }, // Latitude for location
  long: { type: Number }, // Longitude for location
  isForRent: { type: Boolean, }, // Defaults to false
  isForSale: { type: Boolean,}, // Defaults to true
  createdAt: { type: Date, default: Date.now }, // Timestamp for creation
  amenities:[{ type: String }],
  listingStatus: {type:Boolean, default: true}
});

// Creating the model
const Property = mongoose.model('Property', propertySchema);

export default Property;
