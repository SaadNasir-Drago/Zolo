import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', }, 
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    dealId: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal', required: true },
    content: { type: String },
    offer: {type: Boolean},
    createdAt: { type: Date, default: Date.now }, // Timestamp for creation
});

const Message = mongoose.model('Message', messageSchema);
export default Message;
