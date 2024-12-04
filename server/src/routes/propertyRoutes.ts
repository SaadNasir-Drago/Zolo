import express, { Request, Response, NextFunction } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import Property from "../models/property";
import authMiddleware from "../middleware/authmiddleware";
import {
  createProperty,
  deleteProperty,
  getAllProperties,
  getPropertiesByUser,
  showSingleProperty,
  updateProperty,
} from "../controllers/propertyController";

const propertyRouter = express.Router();

interface SearchQuery {
  page?: string;
  limit?: string;
  minLat?: string;
  maxLat?: string;
  minLng?: string;
  maxLng?: string;
  isForRent?: string;
  isForSale?: string;
  sortBy?: string;
  sortOrder?: string;
  searchTerm?: string;
  propertyType?: string;
  minPrice?: string;
  maxPrice?: string;
  beds?: string;
  baths?: string;
  fieldsOnly?: string;
  listingStatus?: Boolean | string;
}

interface PropertyParams extends ParamsDictionary {
  id: string;
}
propertyRouter.get("/property", getAllProperties);
// Search properties endpoint - no auth required
propertyRouter.get(
  "/properties/search",
  async (
    req: Request<{}, any, any, SearchQuery>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const {
        page = "1",
        limit = "20",
        minLat,
        maxLat,
        minLng,
        maxLng,
        isForRent,
        isForSale,
        sortBy = "price",
        sortOrder = "asc",
        searchTerm,
        propertyType,
        minPrice,
        maxPrice,
        beds,
        baths,
        fieldsOnly,
        listingStatus
      } = req.query;

      const query: Record<string, any> = {};

      // Geographic bounds
      if (minLat && maxLat && minLng && maxLng) {
        query.lat = { $gte: parseFloat(minLat), $lte: parseFloat(maxLat) };
        query.long = { $gte: parseFloat(minLng), $lte: parseFloat(maxLng) };
      }

      // Property type filters
      if (isForRent !== undefined) query.isForRent = isForRent === "true";
      if (isForSale !== undefined) query.isForSale = isForSale === "true"; 
      if (listingStatus !== undefined) query.listingStatus = listingStatus === "true"; 
       
      if (propertyType && propertyType !== "all")
        query.propertyType = propertyType;

      // Price range
      if (minPrice) query.price = { ...query.price, $gte: parseInt(minPrice) };
      if (maxPrice) query.price = { ...query.price, $lte: parseInt(maxPrice) };

      // Amenities
      if (beds) query.beds = { $gte: parseInt(beds) };
      if (baths) query.baths = { $gte: parseInt(baths) };

      // Search term
      if (searchTerm) {
        query.$or = [
          { address: { $regex: searchTerm, $options: "i" } },
          { description: { $regex: searchTerm, $options: "i" } },
        ];
      }

      // Select fields based on fieldsOnly parameter
      let projection: Record<string, number> = {};
      if (fieldsOnly === "id,lat,long,price") {
        projection = { _id: 1, lat: 1, long: 1, price: 1 };
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [properties, total] = await Promise.all([
        Property.find(query, projection)
          .sort({ [sortBy as string]: sortOrder === "asc" ? 1 : -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        Property.countDocuments(query),
      ]);

      const hasMore = skip + properties.length < total;

      res.status(200).json({
        properties,
        total,
        hasMore,
        currentPage: parseInt(page),
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get single property - no auth required
propertyRouter.get(
  "/properties/:id",
  async (
    req: Request<PropertyParams>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const property = await Property.findById(req.params.id);
      if (!property) {
        res.status(404).json({ message: "Property not found" });
        return;
      }
      res.status(200).json(property);
    } catch (error) {
      next(error);
    }
  }
);

// Protected routes that require authentication
propertyRouter.post("/property", authMiddleware, createProperty);

propertyRouter.get("/getProperty/:id", showSingleProperty);

propertyRouter.put("/updateProperty/:id", updateProperty);

propertyRouter.delete(
  "/properties/:id",
  authMiddleware,
  async (
    req: Request<PropertyParams>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const property = await Property.findByIdAndDelete(req.params.id);
      if (!property) {
        res.status(404).json({ message: "Property not found" });
        return;
      }
      res.status(200).json({ message: "Property deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
);

// Error handling middleware
propertyRouter.use(
  (error: Error, req: Request, res: Response, next: NextFunction) => {
    console.error("Error:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
);
propertyRouter.get('/user-properties', authMiddleware, getPropertiesByUser)

export default propertyRouter;
