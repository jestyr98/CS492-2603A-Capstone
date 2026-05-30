const { z } = require('zod');

const cardSchema = z.object({
  cardNumber: z.string().regex(/^\d{13,19}$/),
  expiryMonth: z.number().int().min(1).max(12),
  expiryYear: z.number().int().min(new Date().getFullYear()).max(new Date().getFullYear() + 30),
  cvv: z.string().regex(/^\d{3,4}$/),
  cardholderName: z.string().min(2).max(120),
});

const tokenizeSchema = z.object({
  card: cardSchema,
  metadata: z.record(z.string(), z.string()).optional(),
});

const paymentSchema = z.object({
  token: z.string().regex(/^tok_[a-f0-9]{24}$/),
  amount: z.number().positive().max(100000),
  currency: z.string().regex(/^[A-Z]{3}$/),
  merchantReference: z.string().min(1).max(100),
});

const refundSchema = z.object({
  paymentId: z.string().regex(/^pay_[a-f0-9]{24}$/),
  amount: z.number().positive().max(100000),
  reason: z.string().min(1).max(300).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  phone: z.string().trim().optional(),
});

const adminMenuItemSchema = z.object({
  categoryId: z.number().int().positive(),
  itemName: z.string().trim().min(1),
  description: z.string().trim().min(1),
  photoPath: z.string().trim().min(1),
  basePrice: z.number().positive(),
  ingredientIds: z.array(z.number().int().positive()).min(1),
});

const checkoutSchema = z.object({
  card: cardSchema,
  amount: z.number().positive().max(100000),
  currency: z.string().regex(/^[A-Z]{3}$/),
  merchantReference: z.string().min(1).max(100),
});

module.exports = {
  tokenizeSchema,
  paymentSchema,
  refundSchema,
  loginSchema,
  registerSchema,
  adminMenuItemSchema,
  checkoutSchema,
};
