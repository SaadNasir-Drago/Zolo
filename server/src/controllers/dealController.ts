import Deal from "../models/deal";
import { z } from "zod";
import { dealValidationSchema } from "../validation/dealValidation";
import Property from "../models/property";
import mongoose from "mongoose";

// Controller for creating a deal
export const createDeal = async (req: any, res: any) => {
  try {
    // Validate the request body
    const validatedData = dealValidationSchema.parse(req.body);

    const {
      buyerId,
      sellerId,
      propertyId,
      initialPrice,
      offerPrice,
      finalPrice,
      status,
    } = validatedData;

    // Create and save a new deal
    const newDeal = new Deal({
      buyerId,
      sellerId,
      propertyId,
      initialPrice,
      offerPrice,
      finalPrice,
      status: status || "ongoing",
    });

    await newDeal.save();

    // Respond with success and new deal details
    res.status(201).json({ message: "Deal created successfully", newDeal });
  } catch (err) {
    // Handle validation errors
    if (err instanceof z.ZodError) {
      return res.status(400).json({ errors: err.errors });
    }
    console.error("Error creating deal:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Controller for getting all deals belonging to a user
export const getUserDeals = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page as string) || 1; // Default to page 1 if not specified
    const limit = parseInt(req.query.limit as string) || 10; // Default to 10 items per page

    // Calculate the number of documents to skip for pagination
    const skip = (page - 1) * limit;

    // Fetch paginated deals where the user is either a buyer or a seller
    const userDeals = await Deal.find({
      $or: [{ buyerId: userId }, { sellerId: userId }],
    })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // Sort by creation date, latest first

    // Get total count of deals for this user (for pagination metadata)
    const totalDeals = await Deal.countDocuments({
      $or: [{ buyerId: userId }, { sellerId: userId }],
    });

    res.status(200).json({
      deals: userDeals,
      totalDeals,
      totalPages: Math.ceil(totalDeals / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching user deals:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Controller for getting all deals with property address and user details
export const getAllDealsWithDetails = async (req: any, res: any) => {
  try {
    const page = parseInt(req.query.page as string) || 1; // Default to page 1 if not specified
    const limit = parseInt(req.query.limit as string) || 10; // Default to 10 items per page

    // Calculate the number of documents to skip for pagination
    const skip = (page - 1) * limit;
    const deals = await Deal.aggregate([
      {
        $lookup: {
          from: "properties",
          localField: "propertyId",
          foreignField: "_id",
          as: "propertyDetails",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "buyerId",
          foreignField: "_id",
          as: "buyerDetails",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "sellerId",
          foreignField: "_id",
          as: "sellerDetails",
        },
      },
      { $unwind: "$propertyDetails" },
      { $unwind: "$buyerDetails" },
      { $unwind: "$sellerDetails" },
      {
        $project: {
          _id: { $toString: "$_id" },
          buyerId: { $toString: "$buyerId" },
          sellerId: { $toString: "$sellerId" },
          propertyId: { $toString: "$propertyId" },
          initialPrice: 1,
          offerPrice: 1,
          finalPrice: 1,
          status: 1,
          createdAt: 1,
          propertyAddress: "$propertyDetails.address",
          otherUser: {
            $cond: {
              if: { $eq: ["$buyerId", req.user.id] },
              then: {
                firstname: "$sellerDetails.firstname",
                lastname: "$sellerDetails.lastname",
                email: "$sellerDetails.email",
              },
              else: {
                firstname: "$buyerDetails.firstname",
                lastname: "$buyerDetails.lastname",
                email: "$buyerDetails.email",
              },
            },
          },
        },
      },
    ])
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({ deals });
  } catch (error) {
    console.error("Error fetching deals with details:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Controller for getting property details by dealId
export const getDealProperty = async (req: any, res: any) => {
  try {
    const { dealId } = req.query;

    // Find the deal by dealId
    const deal = await Deal.findById(dealId);
    if (!deal) {
      return res.status(404).json({ message: "Deal not found" });
    }

    // Get the propertyId from the deal
    const propertyId = deal.propertyId;

    // Find the property details by propertyId
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Respond with the property details
    res.status(200).json({ property });
  } catch (error) {
    console.error("Error fetching property details:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Controller for updating the status of a deal to "rejected"
export const rejectDeal = async (req: any, res: any) => {
  try {
    const { dealId } = req.query;

    // Find the deal by dealId and update its status to "rejected"
    const updatedDeal = await Deal.findByIdAndUpdate(
      dealId,
      { status: "rejected" },
      { new: true }
    );
    if (!updatedDeal) {
      return res.status(404).json({ message: "Deal not found" });
    }

    // Respond with the updated deal details
    res
      .status(200)
      .json({ message: "Deal status updated to rejected", updatedDeal });
  } catch (error) {
    console.error("Error updating deal status:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Controller for updating the status of a deal to "accepted"
export const acceptDeal = async (req: any, res: any, io: any) => {
  try {
    const { dealId } = req.query;

    // Find the deal by dealId
    const deal = await Deal.findById(dealId);
    if (!deal) {
      return res.status(404).json({ message: "Deal not found" });
    }

    // Update all other deals associated with the property to "rejected"
    await Deal.updateMany(
      { propertyId: deal.propertyId, _id: { $ne: dealId } },
      { status: "rejected" }
    );

    // Update the status of the current deal to "accepted"
    const updatedDeal = await Deal.findByIdAndUpdate(
      dealId,
      { status: "accepted" },
      { new: true }
    );

    // Update the status of the property associated with the accepted deal
    await Property.findByIdAndUpdate(deal.propertyId, { listingStatus: false });

    // io.emit("dealChanged", { message: "A deal has been updated" });

    res.status(200).json({
      message: "Deal status updated to accepted",
      updatedDeal,
    });
  } catch (error) {
    console.error("Error updating deal status:", error);
    res.status(500).json({ message: "Server error" });
  }
};
// // Emit socket event for deal creation
// io.emit("dealChanged", { message: "A new deal has been created" });

// // Emit socket event for deal update
