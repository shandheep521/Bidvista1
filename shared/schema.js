// In a real application, this would define the database schema using Drizzle ORM
// Since we're using in-memory storage for this application, this file serves as a reference
// for the data structure we'll be using.

// User schema
export const users = {
  id: 'serial',
  username: 'text',
  email: 'text',
  password: 'text',
  role: 'text', // 'buyer' or 'seller'
  createdAt: 'timestamp',
  resetToken: 'text',
  resetTokenExpiry: 'timestamp'
};

// Auction schema
export const auctions = {
  id: 'serial',
  title: 'text',
  description: 'text',
  category: 'text',
  startingBid: 'decimal',
  currentBid: 'decimal',
  bidIncrement: 'decimal',
  sellerId: 'integer',
  currentBidUserId: 'integer',
  image: 'text',
  images: 'text[]',
  endTime: 'timestamp',
  createdAt: 'timestamp',
  updatedAt: 'timestamp',
  shipping: 'jsonb', // { cost, method, estimatedDelivery, restrictions }
  condition: 'text', // 'new', 'like-new', 'excellent', 'good', 'fair', 'poor'
  status: 'text', // 'active', 'sold', 'expired', 'draft'
  bidCount: 'integer',
  viewCount: 'integer',
  details: 'jsonb' // Additional item details specific to category
};

// Bid schema
export const bids = {
  id: 'serial',
  auctionId: 'integer',
  userId: 'integer',
  amount: 'decimal',
  maxBid: 'decimal', // For auto-bidding
  autoBid: 'boolean', // Whether auto-bidding is enabled
  createdAt: 'timestamp',
  user: 'jsonb' // Denormalized user info for convenience
};

// Watchlist schema
export const watchlists = {
  userId: 'integer',
  auctionId: 'integer',
  addedAt: 'timestamp'
};

// Schema for inserting a new user
export const insertUserSchema = {
  username: {
    type: 'string',
    required: true,
    minLength: 3
  },
  email: {
    type: 'string',
    required: true,
    format: 'email'
  },
  password: {
    type: 'string',
    required: true,
    minLength: 6
  },
  role: {
    type: 'string',
    enum: ['buyer', 'seller'],
    default: 'buyer'
  }
};

// Schema for inserting a new auction
export const insertAuctionSchema = {
  title: {
    type: 'string',
    required: true,
    minLength: 5
  },
  description: {
    type: 'string',
    required: true,
    minLength: 20
  },
  category: {
    type: 'string',
    required: true
  },
  startingBid: {
    type: 'number',
    required: true,
    minimum: 0
  },
  sellerId: {
    type: 'number',
    required: true
  },
  image: {
    type: 'string',
    required: true,
    format: 'uri'
  },
  endTime: {
    type: 'string',
    required: true,
    format: 'date-time'
  },
  shipping: {
    type: 'object',
    properties: {
      cost: { type: 'number', minimum: 0 },
      method: { type: 'string' },
      estimatedDelivery: { type: 'string' },
      restrictions: { type: 'string' }
    }
  },
  condition: {
    type: 'string',
    enum: ['new', 'like-new', 'excellent', 'good', 'fair', 'poor'],
    default: 'good'
  }
};

// Schema for inserting a new bid
export const insertBidSchema = {
  auctionId: {
    type: 'number',
    required: true
  },
  userId: {
    type: 'number',
    required: true
  },
  amount: {
    type: 'number',
    required: true,
    minimum: 0
  },
  maxBid: {
    type: 'number',
    minimum: 0
  },
  autoBid: {
    type: 'boolean',
    default: false
  }
};

// Additional type definitions for TypeScript (in a real app)
export class InsertUser {}
export class User {}
export class InsertAuction {}
export class Auction {}
export class InsertBid {}
export class Bid {}
