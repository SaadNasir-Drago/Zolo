import Deal from "../models/deal";
import Message from "../models/messages";
import { messageValidationSchema } from "../validation/messageValidation";
import { z } from "zod";

// Controller for sending a message
const sendMessage = async (req: any, res: any, io:any) => {
  try {
    // Validate the request body
    const validatedData = messageValidationSchema.parse(req.body);
    const { dealId, content, offer, buyerId: reqBuyerId, sellerId: reqSellerId } = validatedData;


    // Fetch deal data matching the dealId
    const deal = await Deal.findById(dealId);
    if (!deal) {
      console.error('Deal not found for message:', { dealId, content, offer, buyerId: reqBuyerId, sellerId: reqSellerId });
      return res.status(404).json({ message: "Deal not found" });
    }

    const buyerId = reqBuyerId || deal.buyerId;
    const sellerId = reqSellerId || deal.sellerId;
    const { propertyId } = deal;

    // Create and save a new message
    const newMessage = new Message({
      buyerId: reqBuyerId ? buyerId : undefined,
      sellerId: reqSellerId ? sellerId : undefined,
      propertyId,
      dealId,
      content,
      offer,
    });

    const savedMessage = await newMessage.save();
    
    // Emit the message to all connected clients
    io.emit("newMessage", savedMessage);

    // Respond with success and new message details
    res.status(201).json({ message: "Message sent successfully", savedMessage });
  } catch (err) {
    // Handle validation errors
    if (err instanceof z.ZodError) {
      console.error('Validation error:', err.errors);
      return res.status(400).json({ errors: err.errors });
    }
    console.error("Error sending message:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// Controller for getting all messages associated with a dealId
const getMessagesByDealId = async (req: any, res: any) => {
  try {
    const { dealId } = req.query;

    // Fetch all messages matching the dealId
    const messages = await Message.find({ dealId: dealId });

    if (!messages.length) {
      return res.status(404).json({ message: "No messages found for this deal" });
    }

    // Respond with the list of messages
    res.status(200).json({ messages });
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Controller for sending a message to all buyers associated with a dealId and sellerId
const sendMessageToAllBuyers = async (req: any, res: any) => {
  try {
    const { propertyId, sellerId, content, offer, dealId: excludeDealId} = req.body;

    // Fetch all deals matching the given propertyId and sellerId
    const deals = await Deal.find({ propertyId, sellerId });
    if (!deals || deals.length === 0) {
      return res.status(404).json({ message: "No matching deals found" });
    }
    
 
    // Collect all buyer IDs and deal IDs across the matched deals, excluding the specified dealId
    const buyerDealPairs = deals
      .filter((deal) => deal._id.toString() !== excludeDealId)
      .flatMap((deal) => ({ buyerId: deal.buyerId, dealId: deal._id }));

    // Create and save a new message for each buyer
    const messages = await Promise.all(
      buyerDealPairs.map(async ({ buyerId, dealId }) => {
        const newMessage = new Message({
          buyerId,
          sellerId,
          propertyId,
          dealId,
          content,
          offer,
        });
        return await newMessage.save();
      })
    );

    // Respond with success and new messages details
    res.status(201).json({ message: "Messages sent successfully", messages });
  } catch (err) {
    console.error("Error sending messages:", err);
    res.status(500).json({ message: "Server error" });
  }
};
// Controller for sending a message by seller only
const sendMessageBySeller = async (req: any, res: any) => {
  try {
    // Validate the request body
    const validatedData = messageValidationSchema.parse(req.body);
    const { dealId, content, offer, sellerId: reqSellerId } = validatedData;

    // Fetch deal data matching the dealId
    const deal = await Deal.findById(dealId);
    if (!deal) {
      return res.status(404).json({ message: "Deal not found" });
    }

    const sellerId = reqSellerId || deal.sellerId;
    const { propertyId } = deal;

    // Create and save a new message
    const newMessage = new Message({
      sellerId,
      propertyId,
      dealId,
      content,
      offer,
    });

    const savedMessage = await newMessage.save();

    // Respond with success and new message details
    res.status(201).json({ message: "Message sent successfully", savedMessage });
  } catch (err) {
    // Handle validation errors
    if (err instanceof z.ZodError) {
      return res.status(400).json({ errors: err.errors });
    }
    console.error("Error sending message:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export { sendMessage, getMessagesByDealId, sendMessageToAllBuyers };


