import { z } from 'zod';

// Schema to validate user ID in route parameters
export const userIdSchema = z.object({
  id: z
    .string()
    .refine(
      val => {
        const num = Number(val);
        return !isNaN(num) && num > 0 && Number.isInteger(num);
      },
      {
        message: 'ID must be a positive integer',
      }
    )
    .transform(val => Number(val)),
});

// Schema to validate update user requests
// All fields are optional since we only update what's provided
export const updateUserSchema = z
  .object({
    name: z.string().min(2).max(255).trim().optional(),
    email: z.email().max(255).toLowerCase().trim().optional(),
    password: z.string().min(6).max(128).optional(),
    role: z.enum(['admin', 'user']).optional(),
  })
  .refine(
    data => {
      // At least one field must be provided for update
      return Object.keys(data).length > 0;
    },
    {
      message: 'At least one field must be provided for update',
    }
  );
