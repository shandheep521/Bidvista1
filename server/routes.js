import express from "express";
import { createServer } from "http";
import { setupAuth } from "./auth.js";
import { storage } from "./storage.js";
import { sendOutbidEmail, sendAuctionWonEmail, sendAuctionEndedEmail } from "./email.js";

export async function registerRoutes(app) {
  // Setup authentication routes
  setupAuth(app);

  // User routes
  app.get("/api/user/watchlist", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const watchlist = await storage.getUserWatchlist(req.user.id);
      res.json(watchlist);
    } catch (error) {
      console.error("Error fetching watchlist:", error);
      res.status(500).json({ message: "Failed to fetch watchlist" });
    }
  });

  app.post("/api/user/watchlist/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    const { id } = req.params;
    const { action } = req.body;
    
    try {
      if (action === "add") {
        await storage.addToWatchlist(req.user.id, parseInt(id));
        res.json({ message: "Added to watchlist" });
      } else if (action === "remove") {
        await storage.removeFromWatchlist(req.user.id, parseInt(id));
        res.json({ message: "Removed from watchlist" });
      } else {
        res.status(400).json({ message: "Invalid action" });
      }
    } catch (error) {
      console.error("Error updating watchlist:", error);
      res.status(500).json({ message: "Failed to update watchlist" });
    }
  });

  app.get("/api/user/watchlist/check/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    const { id } = req.params;
    
    try {
      const isWatchlisted = await storage.isInWatchlist(req.user.id, parseInt(id));
      res.json({ isWatchlisted });
    } catch (error) {
      console.error("Error checking watchlist:", error);
      res.status(500).json({ message: "Failed to check watchlist" });
    }
  });

  app.get("/api/user/bids", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const bids = await storage.getUserBids(req.user.id);
      res.json(bids);
    } catch (error) {
      console.error("Error fetching user bids:", error);
      res.status(500).json({ message: "Failed to fetch bids" });
    }
  });

  // Auctions routes
  app.get("/api/auctions", async (req, res) => {
    try {
      const auctions = await storage.getAllAuctions();
      res.json(auctions);
    } catch (error) {
      console.error("Error fetching auctions:", error);
      res.status(500).json({ message: "Failed to fetch auctions" });
    }
  });

  app.get("/api/auctions/featured", async (req, res) => {
    try {
      const featuredAuctions = await storage.getFeaturedAuctions();
      res.json(featuredAuctions);
    } catch (error) {
      console.error("Error fetching featured auctions:", error);
      res.status(500).json({ message: "Failed to fetch featured auctions" });
    }
  });

  app.get("/api/auctions/:id", async (req, res) => {
    const { id } = req.params;
    
    try {
      const auction = await storage.getAuction(parseInt(id));
      
      if (!auction) {
        return res.status(404).json({ message: "Auction not found" });
      }
      
      // Increment view count
      await storage.incrementAuctionViews(parseInt(id));
      
      res.json(auction);
    } catch (error) {
      console.error(`Error fetching auction ${id}:`, error);
      res.status(500).json({ message: "Failed to fetch auction" });
    }
  });

  app.get("/api/auctions/:id/bids", async (req, res) => {
    const { id } = req.params;
    
    try {
      const bids = await storage.getAuctionBids(parseInt(id));
      res.json(bids);
    } catch (error) {
      console.error(`Error fetching bids for auction ${id}:`, error);
      res.status(500).json({ message: "Failed to fetch bids" });
    }
  });

  app.post("/api/auctions/:id/bids", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Please sign in to place a bid" });
    
    const { id } = req.params;
    const { amount, maxBid, autoBid } = req.body;
    const userId = req.user.id;
    
    try {
      const auction = await storage.getAuction(parseInt(id));
      
      if (!auction) {
        return res.status(404).json({ message: "Auction not found" });
      }
      
      // Check if auction has ended
      if (new Date(auction.endTime) < new Date()) {
        return res.status(400).json({ message: "This auction has ended" });
      }
      
      // Check if seller is trying to bid on their own auction
      if (auction.sellerId === userId) {
        return res.status(400).json({ message: "You cannot bid on your own auction" });
      }
      
      // Check if bid amount is valid
      const minBidAmount = auction.currentBid 
        ? auction.currentBid + (auction.bidIncrement || 5) 
        : auction.startingBid;
      
      if (amount < minBidAmount) {
        return res.status(400).json({ 
          message: `Bid must be at least ${minBidAmount}` 
        });
      }
      
      // Place the bid
      const newBid = await storage.createBid({
        auctionId: parseInt(id),
        userId,
        amount,
        maxBid: maxBid || amount,
        autoBid: !!autoBid
      });
      
      // Update auction's current bid
      await storage.updateAuctionCurrentBid(parseInt(id), amount);
      
      // If outbid someone, send email notification
      if (auction.currentBidUserId && auction.currentBidUserId !== userId) {
        const outbidUser = await storage.getUser(auction.currentBidUserId);
        if (outbidUser && outbidUser.email) {
          sendOutbidEmail(
            outbidUser.email,
            outbidUser.username,
            auction.title,
            amount,
            id
          ).catch(err => console.error("Failed to send outbid email:", err));
        }
      }
      
      res.status(201).json(newBid);
    } catch (error) {
      console.error(`Error placing bid on auction ${id}:`, error);
      res.status(500).json({ message: "Failed to place bid" });
    }
  });

  app.post("/api/auctions", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Please sign in to create an auction" });
    
    try {
      const { 
        title, 
        description, 
        category,
        startingBid, 
        duration, 
        image,
        shippingCost,
        condition
      } = req.body;
      
      // Calculate end time based on duration
      const endTime = new Date();
      endTime.setDate(endTime.getDate() + parseInt(duration));
      
      const newAuction = await storage.createAuction({
        title,
        description,
        category,
        startingBid: parseFloat(startingBid),
        currentBid: parseFloat(startingBid),
        sellerId: req.user.id,
        image,
        endTime,
        shipping: {
          cost: parseFloat(shippingCost),
          method: "Standard Shipping"
        },
        condition,
        status: "active",
        bidCount: 0,
        viewCount: 0
      });
      
      res.status(201).json(newAuction);
    } catch (error) {
      console.error("Error creating auction:", error);
      res.status(500).json({ message: "Failed to create auction" });
    }
  });

  app.put("/api/auctions/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    const { id } = req.params;
    
    try {
      const auction = await storage.getAuction(parseInt(id));
      
      if (!auction) {
        return res.status(404).json({ message: "Auction not found" });
      }
      
      // Check if user is the auction owner
      if (auction.sellerId !== req.user.id) {
        return res.status(403).json({ message: "You can only edit your own auctions" });
      }
      
      // Check if auction has bids
      if (auction.bidCount > 0) {
        return res.status(400).json({ message: "Cannot edit an auction that has bids" });
      }
      
      const { 
        title, 
        description, 
        category,
        startingBid, 
        duration, 
        image,
        shippingCost,
        condition
      } = req.body;
      
      // Calculate new end time if duration changed
      let endTime = auction.endTime;
      if (duration && duration !== auction.duration) {
        endTime = new Date();
        endTime.setDate(endTime.getDate() + parseInt(duration));
      }
      
      const updatedAuction = await storage.updateAuction(parseInt(id), {
        title,
        description,
        category,
        startingBid: parseFloat(startingBid),
        currentBid: parseFloat(startingBid),
        image,
        endTime,
        shipping: {
          cost: parseFloat(shippingCost),
          method: "Standard Shipping"
        },
        condition
      });
      
      res.json(updatedAuction);
    } catch (error) {
      console.error(`Error updating auction ${id}:`, error);
      res.status(500).json({ message: "Failed to update auction" });
    }
  });

  app.delete("/api/auctions/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    const { id } = req.params;
    
    try {
      const auction = await storage.getAuction(parseInt(id));
      
      if (!auction) {
        return res.status(404).json({ message: "Auction not found" });
      }
      
      // Check if user is the auction owner
      if (auction.sellerId !== req.user.id) {
        return res.status(403).json({ message: "You can only delete your own auctions" });
      }
      
      // Check if auction has bids
      if (auction.bidCount > 0) {
        return res.status(400).json({ message: "Cannot delete an auction that has bids" });
      }
      
      await storage.deleteAuction(parseInt(id));
      res.status(200).json({ message: "Auction deleted successfully" });
    } catch (error) {
      console.error(`Error deleting auction ${id}:`, error);
      res.status(500).json({ message: "Failed to delete auction" });
    }
  });

  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = [
        { slug: 'collectibles', name: 'Collectibles' },
        { slug: 'electronics', name: 'Electronics' },
        { slug: 'art', name: 'Art' },
        { slug: 'fashion', name: 'Fashion' },
        { slug: 'antiques', name: 'Antiques' },
        { slug: 'books', name: 'Books' }
      ];
      
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Seller routes
  app.get("/api/seller/auctions", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const sellerAuctions = await storage.getSellerAuctions(req.user.id);
      res.json(sellerAuctions);
    } catch (error) {
      console.error("Error fetching seller auctions:", error);
      res.status(500).json({ message: "Failed to fetch seller auctions" });
    }
  });

  app.get("/api/seller/stats", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const stats = await storage.getSellerStats(req.user.id);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching seller stats:", error);
      res.status(500).json({ message: "Failed to fetch seller stats" });
    }
  });

  // Setup a recurring process to check ended auctions
  // In a real app, this would be a separate cron job
  async function checkEndedAuctions() {
    try {
      const endedAuctions = await storage.getEndedAuctions();
      
      for (const auction of endedAuctions) {
        // Only process if not already processed
        if (auction.status === 'active') {
          // Update auction status
          const hasBids = auction.bidCount > 0;
          const newStatus = hasBids ? 'sold' : 'expired';
          await storage.updateAuctionStatus(auction.id, newStatus);
          
          // Get seller info for notification
          const seller = await storage.getUser(auction.sellerId);
          
          // If auction was sold, notify winner
          if (hasBids && auction.currentBidUserId) {
            const winningBidder = await storage.getUser(auction.currentBidUserId);
            
            // Send email to winning bidder
            if (winningBidder && winningBidder.email) {
              sendAuctionWonEmail(
                winningBidder.email,
                winningBidder.username,
                auction.title,
                auction.currentBid,
                auction.id
              ).catch(err => console.error("Failed to send auction won email:", err));
            }
            
            // Send email to seller
            if (seller && seller.email) {
              sendAuctionEndedEmail(
                seller.email,
                seller.username,
                auction.title,
                true,
                auction.currentBid,
                winningBidder ? winningBidder.username : 'a buyer'
              ).catch(err => console.error("Failed to send auction ended email to seller:", err));
            }
          } else if (seller && seller.email) {
            // No bids - notify seller
            sendAuctionEndedEmail(
              seller.email,
              seller.username,
              auction.title,
              false
            ).catch(err => console.error("Failed to send auction ended email to seller:", err));
          }
        }
      }
    } catch (error) {
      console.error("Error checking ended auctions:", error);
    }
  }

  // Check for ended auctions every 15 minutes
  // In a production app, this would be handled by a cron job
  setInterval(checkEndedAuctions, 15 * 60 * 1000);
  // Run once at startup
  setTimeout(checkEndedAuctions, 10000);

  const httpServer = createServer(app);
  return httpServer;
}
