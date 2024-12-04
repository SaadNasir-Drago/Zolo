// Define validation schema for creating a deal
import {z} from 'zod'
export const dealValidationSchema = z.object({
  buyerId: z.string().nonempty(),
  sellerId: z.string().nonempty(),
  propertyId: z.string().nonempty(),
  initialPrice: z.number().positive().optional(),
  offerPrice: z.number().optional(),
  finalPrice: z.number().optional(),
  status: z.enum(["ongoing", "accepted", "rejected"]).optional(),
});
