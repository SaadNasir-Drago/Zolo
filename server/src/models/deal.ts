import mongoose from 'mongoose';
import Message from './messages'; // Adjust path if necessary

const dealSchema = new mongoose.Schema({
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  initialPrice: { type: Number, required: true },
  finalPrice: { type: Number },
  offerPrice: { type: Number },
  status: { 
    type: String, 
    enum: ['ongoing', 'accepted', 'rejected'], 
    default: 'ongoing' 
  },
  messages: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  createdAt: { type: Date, default: Date.now }
});

const Deal = mongoose.model('Deal', dealSchema);
export default Deal;
