import { users, bids, auctions, watchlists } from "../shared/schema.js";
import createMemoryStore from "memorystore";
import session from "express-session";

// In-memory data stores for our app
const MemoryStore = createMemoryStore(session);

export class MemStorage {
  constructor() {
    this.users = new Map();
    this.auctions = new Map();
    this.bids = new Map();
    this.watchlists = new Map();
    this.nextUserId = 1;
    this.nextAuctionId = 1;
    this.nextBidId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
    
    // Add sample data for demo purposes
    this.initializeSampleData();
  }

  // User methods
  async getUser(id) {
    return this.users.get(id);
  }

  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getUserByEmail(email) {
    return Array.from(this.users.values()).find(
      (user) => user.email && user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async getUserByResetToken(token) {
    return Array.from(this.users.values()).find(
      (user) => user.resetToken === token && user.resetTokenExpiry > Date.now()
    );
  }

  async createUser(userData) {
    const id = this.nextUserId++;
    const user = { id, ...userData, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  async updateUserResetToken(userId, token, expiry) {
    const user = await this.getUser(userId);
    if (!user) return null;
    
    user.resetToken = token;
    user.resetTokenExpiry = expiry;
    this.users.set(userId, user);
    return user;
  }

  async updateUserPassword(userId, hashedPassword) {
    const user = await this.getUser(userId);
    if (!user) return null;
    
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    this.users.set(userId, user);
    return user;
  }

  // Auction methods
  async getAllAuctions() {
    // Return only active auctions
    return Array.from(this.auctions.values())
      .filter(auction => auction.status === 'active' && new Date(auction.endTime) > new Date())
      .sort((a, b) => new Date(a.endTime) - new Date(b.endTime));
  }

  async getFeaturedAuctions(limit = 8) {
    // Get active auctions sorted by bid count (most popular first)
    return Array.from(this.auctions.values())
      .filter(auction => auction.status === 'active' && new Date(auction.endTime) > new Date())
      .sort((a, b) => b.bidCount - a.bidCount)
      .slice(0, limit);
  }

  async getAuction(id) {
    return this.auctions.get(id);
  }

  async createAuction(auctionData) {
    const id = this.nextAuctionId++;
    const auction = { 
      id, 
      ...auctionData, 
      createdAt: new Date(),
      bidCount: 0,
      viewCount: 0 
    };
    this.auctions.set(id, auction);
    return auction;
  }

  async updateAuction(id, auctionData) {
    const auction = await this.getAuction(id);
    if (!auction) return null;
    
    const updatedAuction = { ...auction, ...auctionData, updatedAt: new Date() };
    this.auctions.set(id, updatedAuction);
    return updatedAuction;
  }

  async updateAuctionCurrentBid(id, amount, userId) {
    const auction = await this.getAuction(id);
    if (!auction) return null;
    
    auction.currentBid = amount;
    auction.currentBidUserId = userId;
    auction.bidCount += 1;
    auction.updatedAt = new Date();
    
    this.auctions.set(id, auction);
    return auction;
  }

  async updateAuctionStatus(id, status) {
    const auction = await this.getAuction(id);
    if (!auction) return null;
    
    auction.status = status;
    auction.updatedAt = new Date();
    
    this.auctions.set(id, auction);
    return auction;
  }

  async incrementAuctionViews(id) {
    const auction = await this.getAuction(id);
    if (!auction) return null;
    
    auction.viewCount = (auction.viewCount || 0) + 1;
    this.auctions.set(id, auction);
    return auction;
  }

  async deleteAuction(id) {
    return this.auctions.delete(id);
  }

  async getEndedAuctions() {
    const now = new Date();
    return Array.from(this.auctions.values())
      .filter(auction => 
        auction.status === 'active' && new Date(auction.endTime) <= now
      );
  }

  // Bid methods
  async getAuctionBids(auctionId) {
    return Array.from(this.bids.values())
      .filter(bid => bid.auctionId === auctionId)
      .sort((a, b) => b.amount - a.amount); // Highest first
  }

  async createBid(bidData) {
    const id = this.nextBidId++;
    const bid = { id, ...bidData, createdAt: new Date() };
    this.bids.set(id, bid);
    
    // Update auction bid count and current bid
    const auction = await this.getAuction(bidData.auctionId);
    if (auction) {
      auction.currentBid = bidData.amount;
      auction.currentBidUserId = bidData.userId;
      auction.bidCount += 1;
      this.auctions.set(auction.id, auction);
    }
    
    return bid;
  }

  async getUserBids(userId) {
    return Array.from(this.bids.values())
      .filter(bid => bid.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // Watchlist methods
  async getUserWatchlist(userId) {
    const userWatchlist = Array.from(this.watchlists.values())
      .filter(item => item.userId === userId)
      .map(item => item.auctionId);
    
    // Fetch the actual auction objects
    return Promise.all(userWatchlist.map(id => this.getAuction(id)))
      .then(auctions => auctions.filter(Boolean)); // Remove nulls
  }

  async addToWatchlist(userId, auctionId) {
    const watchlistId = `${userId}-${auctionId}`;
    const watchlistItem = { userId, auctionId, addedAt: new Date() };
    this.watchlists.set(watchlistId, watchlistItem);
    return watchlistItem;
  }

  async removeFromWatchlist(userId, auctionId) {
    const watchlistId = `${userId}-${auctionId}`;
    return this.watchlists.delete(watchlistId);
  }

  async isInWatchlist(userId, auctionId) {
    const watchlistId = `${userId}-${auctionId}`;
    return this.watchlists.has(watchlistId);
  }

  // Seller methods
  async getSellerAuctions(sellerId) {
    return Array.from(this.auctions.values())
      .filter(auction => auction.sellerId === sellerId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async getSellerStats(sellerId) {
    const sellerAuctions = await this.getSellerAuctions(sellerId);
    
    // Active listings
    const activeListings = sellerAuctions.filter(auction => 
      auction.status === 'active' && new Date(auction.endTime) > new Date()
    ).length;
    
    // Sold items
    const soldItems = sellerAuctions.filter(auction => auction.status === 'sold').length;
    
    // Total sales amount
    const totalSales = sellerAuctions
      .filter(auction => auction.status === 'sold')
      .reduce((sum, auction) => sum + auction.currentBid, 0);
    
    // Total bids received
    const totalBids = sellerAuctions.reduce((sum, auction) => sum + auction.bidCount, 0);
    
    // Conversion rate (items sold / total ended auctions)
    const endedAuctions = sellerAuctions.filter(auction => 
      auction.status === 'sold' || auction.status === 'expired' || 
      new Date(auction.endTime) <= new Date()
    ).length;
    
    const conversionRate = endedAuctions === 0 
      ? 0 
      : Math.round((soldItems / endedAuctions) * 100);
    
    return {
      activeListings,
      soldItems,
      totalSales,
      totalBids,
      conversionRate,
      totalAuctions: sellerAuctions.length
    };
  }

  // Initialize sample data for demo purposes
  initializeSampleData() {
    // Sample users
    const sampleUsers = [
      {
        username: 'john_collector',
        email: 'john@example.com',
        password: '$2b$10$9tS/zDdJD.MMpTh/9Vz9kOZ7386KcOX1Wz.TJbuU5loCnN09YbD7O', // 'password123'
        role: 'buyer',
      },
      {
        username: 'sarah_antiques',
        email: 'sarah@example.com',
        password: '$2b$10$9tS/zDdJD.MMpTh/9Vz9kOZ7386KcOX1Wz.TJbuU5loCnN09YbD7O', // 'password123'
        role: 'seller',
      }
    ];

    sampleUsers.forEach(user => {
      this.createUser(user);
    });

    // Sample auction end dates
    const getRandomEndDate = () => {
      const date = new Date();
      date.setDate(date.getDate() + Math.floor(Math.random() * 14) + 1); // 1-14 days from now
      return date;
    };

    // Sample auctions
    const sampleAuctions = [
      {
        title: 'Vintage Leica Camera',
        description: '1960s Leica M3 in excellent condition with original leather case.',
        category: 'collectibles',
        startingBid: 950,
        currentBid: 1250,
        sellerId: 2, // sarah_antiques
        currentBidUserId: 1, // john_collector
        image: 'https://images.unsplash.com/photo-1610813869154-ed24bdd9c916?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
        endTime: getRandomEndDate(),
        shipping: { cost: 25, method: 'Standard Shipping' },
        condition: 'excellent',
        status: 'active',
        bidCount: 8,
        viewCount: 120
      },
      {
        title: 'Rolex Submariner 1985',
        description: 'Vintage Rolex Submariner with box and papers. Excellent condition.',
        category: 'collectibles',
        startingBid: 7000,
        currentBid: 7850,
        sellerId: 2, // sarah_antiques
        currentBidUserId: 1, // john_collector
        image: 'https://images.unsplash.com/photo-1517142089942-ba376ce32a2e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
        endTime: getRandomEndDate(),
        shipping: { cost: 50, method: 'Insured Shipping' },
        condition: 'excellent',
        status: 'active',
        bidCount: 14,
        viewCount: 245
      },
      {
        title: 'Vinyl Record Collection',
        description: 'Collection of 50+ classic rock vinyl records from the 70s.',
        category: 'music',
        startingBid: 500,
        currentBid: 675,
        sellerId: 2, // sarah_antiques
        currentBidUserId: 1, // john_collector
        image: 'https://images.unsplash.com/photo-1556814278-8906c7d3a05f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
        endTime: getRandomEndDate(),
        shipping: { cost: 35, method: 'Standard Shipping' },
        condition: 'good',
        status: 'active',
        bidCount: 5,
        viewCount: 98
      },
      {
        title: 'Antique Writing Desk',
        description: '19th century mahogany writing desk with original brass hardware.',
        category: 'furniture',
        startingBid: 800,
        currentBid: 950,
        sellerId: 2, // sarah_antiques
        currentBidUserId: 1, // john_collector
        image: 'https://images.unsplash.com/photo-1516040631970-0b9718427e26?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
        endTime: getRandomEndDate(),
        shipping: { cost: 120, method: 'Furniture Delivery' },
        condition: 'good',
        status: 'active',
        bidCount: 3,
        viewCount: 75
      }
    ];

    sampleAuctions.forEach(auction => {
      this.createAuction(auction);
    });

    // Sample bids for each auction
    const sampleBids = [
      { auctionId: 1, userId: 1, amount: 1000, createdAt: new Date(Date.now() - 3600000 * 24) },
      { auctionId: 1, userId: 1, amount: 1250, createdAt: new Date(Date.now() - 3600000 * 12) },
      { auctionId: 2, userId: 1, amount: 7250, createdAt: new Date(Date.now() - 3600000 * 36) },
      { auctionId: 2, userId: 1, amount: 7500, createdAt: new Date(Date.now() - 3600000 * 24) },
      { auctionId: 2, userId: 1, amount: 7850, createdAt: new Date(Date.now() - 3600000 * 10) },
      { auctionId: 3, userId: 1, amount: 600, createdAt: new Date(Date.now() - 3600000 * 18) },
      { auctionId: 3, userId: 1, amount: 675, createdAt: new Date(Date.now() - 3600000 * 8) },
      { auctionId: 4, userId: 1, amount: 950, createdAt: new Date(Date.now() - 3600000 * 20) }
    ];

    sampleBids.forEach(bid => {
      const { auctionId, userId, amount, createdAt } = bid;
      const bidObj = { 
        id: this.nextBidId++, 
        auctionId, 
        userId, 
        amount, 
        createdAt,
        user: { username: 'john_collector' } // Add user info for display
      };
      this.bids.set(bidObj.id, bidObj);
    });

    // Watchlist
    this.addToWatchlist(1, 2); // John is watching Rolex auction
  }
}

export const storage = new MemStorage();
