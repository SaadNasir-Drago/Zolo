import {z} from 'zod'
export const messageValidationSchema = z.object({
  buyerId: z.string().nonempty().optional(),
  sellerId: z.string().nonempty().optional(),
  propertyId: z.string().nonempty().optional(),
  dealId: z.string().nonempty().optional(),
  content: z.string().optional(),
  offer: z.boolean().optional()
});