import Property from '../models/property';
import { notifyNewProperty } from '..';

// Controller to create a new property
export const createProperty = async (req: any, res: any) => {
  
    try {
      // Create a new property object with data from the request body and the uploaded images
      
      const propertyData = {
        userId: req.user.id,
        address: req.body.address, // Optional fields from request body
        price: req.body.price,
        bath: req.body.bath,
        bed: req.body.bed,
        size: req.body.size,
        description: req.body.description,
        propertyType: req.body.propertyType,
        lat: req.body.lat,
        long: req.body.long,
        isForRent: req.body.isForRent,
        isForSale: req.body.isForSale,
        images: req.body.images, // Save the uploaded image file paths]
        amenities: req.body.amenities
      };

      // Save the property to the database
      const property = new Property(propertyData);
      await property.save();
      notifyNewProperty(property);
      // Respond with the created property
      return res.status(201).json(property);
    } catch (error) {
      // Handle errors during property creation
      return res.status(500).json({ message: 'Error creating property', error });
    }
  
};


// Controller to fetch all properties with listingStatus true
export const getAllProperties = async (req: any, res: any) => {
  const page = parseInt(req.query.page) || 1; // Default to page 1
  const limit = parseInt(req.query.limit) || 20; // Default to 20 properties per page

  try {
    // Sort properties by 'createdAt' in descending order and apply pagination
    const properties = await Property.find({ listingStatus: true })
      .sort({ createdAt: -1 }) // Sort by 'createdAt' in descending order (latest first)
      .skip((page - 1) * limit) // Skip to the correct page
      .limit(limit); // Limit results

    return res.status(200).json(properties);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching properties', error });
  }
};

// Controller to update an existing property
export const updateProperty = async (req: any, res: any) => {
    
    try {
      // Find the property by ID
      const property = await Property.findById(req.params.id);

      if (!property) {
        return res.status(404).json({ message: 'Property not found' });
      }
      // Update the property with new data
      property.address = req.body.address || property.address;
      property.price = req.body.price || property.price;
      property.bath = req.body.bath || property.bath;
      property.bed = req.body.bed || property.bed;
      property.size = req.body.size || property.size;
      property.description = req.body.description || property.description;
      property.propertyType = req.body.propertyType || property.propertyType;
      property.lat = req.body.lat || property.lat;
      property.long = req.body.long || property.long;
      property.isForRent = req.body.isForRent !== undefined ? req.body.isForRent : property.isForRent;
      property.isForSale = req.body.isForSale !== undefined ? req.body.isForSale : property.isForSale;
      property.amenities = req.body.amenities || property.amenities
      property.images = req.body.images || property.images;

      // Save the updated property to the database
      await property.save();

      return res.status(200).json(property);
    } catch (error) {
      return res.status(500).json({ message: 'Error updating property', error });
    }
};

// Controller to delete a property
export const deleteProperty = async (req: any, res: any) => {
  try {
    // Find the property by ID
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Remove the property from the database
    await property.deleteOne();

    // Respond with a success message
    return res.status(200).json({ message: 'Property deleted successfully' });
  } catch (error) {
    // Handle errors during property deletion
    return res.status(500).json({ message: 'Error deleting property', error });
  }
};

// Controller to show a single property by ID
export const showSingleProperty = async (req: any, res: any) => {
  try {
    // Find the property by ID
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    // Respond with the property details
    return res.status(200).json(property);
  } catch (error) {
    // Handle errors during property retrieval
    return res.status(500).json({ message: 'Error fetching property', error });
  }
};

// Controller to get all properties for rent with pagination
export const getAllRentProperties = async (req: any, res: any) => {
  try {
    // Extract limit and page from query parameters
    const limit = parseInt(req.query.limit) || 10; // Default to 10 if not specified
    const page = parseInt(req.query.page) || 1;   // Default to 1 if not specified

    // Calculate the number of documents to skip
    const skip = (page - 1) * limit;

    // Fetch all properties where isForRent is true with pagination
    const rentProperties = await Property.find({ isForRent: true })
      .limit(limit)
      .skip(skip);

    // Check if any properties were found
    if (rentProperties.length === 0) {
      return res.status(404).json({ message: 'No properties available for rent.' });
    }

    // Get the total count of properties for rent
    const totalCount = await Property.countDocuments({ isForRent: true });

    // Return the properties and pagination info as a response
    return res.status(200).json({
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      properties: rentProperties,
    });
  } catch (error) {
    console.error('Error fetching properties:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};


// Controller function to get properties by user
export const getPropertiesByUser = async (req: any, res: any) => {
  try {
    // Get userId from the authenticated user (attached to req.user by authMiddleware)
    const userId = req.user.id;

    // Fetch properties created by the user (userId)
    const properties = await Property.find({ userId }).sort({ createdAt: -1 }); // Sort by createdAt to get most recent first

    // Check if the user has any properties
    if (!properties.length) {
      return res.status(200).json([])
      // return res.status(404).json({ message: 'No properties found for this user' });
    }

    // Return the list of properties
    return res.status(200).json(properties);
  } catch (err) {
    console.error("Error fetching properties:", err);
    return res.status(500).json({ message: 'Server error while fetching properties' });
  }
};
