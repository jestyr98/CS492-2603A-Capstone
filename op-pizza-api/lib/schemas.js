const { z } = require('zod');

const cardSchema = z.object({
  cardNumber: z.string().regex(/^(\d{16}|\d{4}(?:\s\d{4}){3})$/),
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
  mfaMethod: z.enum(['email', 'sms']),
});

const adminMenuItemSchema = z.object({
  categoryId: z.number().int().positive(),
  itemName: z.string().trim().min(1),
  description: z.string().trim().min(1),
  photoPath: z.string().trim().min(1),
  basePrice: z.number().positive(),
  ingredientIds: z.array(z.number().int().positive()).min(1),
});

const adminMenuItemUpdateSchema = z.object({
  itemName: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).optional(),
  basePrice: z.number().positive().optional(),
});

const checkoutSchema = z.object({
  card: cardSchema,
  amount: z.number().positive().max(100000),
  currency: z.string().regex(/^[A-Z]{3}$/),
  merchantReference: z.string().min(1).max(100),
});

const orderSubmissionSchema = z.object({
  cartItems: z.array(
    z.object({
      id: z.union([z.number().int().positive(), z.string()]).optional(),
      name: z.string().min(1),
      price: z.string().min(1),
      quantity: z.number().int().positive(),
    })
  ).min(1),
  orderType: z.enum(['carryout', 'delivery']),
  deliveryAddress: z.object({
    street1: z.string().trim().min(1),
    street2: z.string().trim().optional(),
    city: z.string().trim().min(1),
    state: z.string().trim().min(1),
    postalCode: z.string().trim().min(1),
  }).nullable().optional(),
  billingAddress: z.object({
    street1: z.string().trim().min(1),
    street2: z.string().trim().optional(),
    city: z.string().trim().min(1),
    state: z.string().trim().min(1),
    postalCode: z.string().trim().min(1),
  }).nullable().optional(),
  paymentMethod: z.enum(['cash', 'card']),
  tipAmount: z.number().min(0),
  paymentStatus: z.string().optional(),
  paymentId: z.string().optional(),
  pricing: z.object({
    subtotal: z.number().min(0),
    taxes: z.number().min(0),
    fees: z.number().min(0),
    total: z.number().min(0),
  }),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(20),
  password: z.string().min(8),
});

module.exports = {
  tokenizeSchema,
  paymentSchema,
  refundSchema,
  loginSchema,
  registerSchema,
  adminMenuItemSchema,
  adminMenuItemUpdateSchema,
  checkoutSchema,
  orderSubmissionSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};
