import { User, Item, MarketListing, Transaction, ListingStatus } from '@prisma/client';
import prisma from '../config/database';
import { calculateMarketPrice, updateMarketStats } from '../utils/gameLogic';

export class MarketService {
  /**
   * Create a new market listing
   */
  static async createListing(
    userId: string,
    itemId: string,
    quantity: number,
    pricePerUnit: number,
    expiresInDays: number = 7
  ): Promise<MarketListing> {
    // Get user and item
    const [user, item] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.item.findUnique({ where: { id: itemId } }),
    ]);

    if (!user) {
      throw new Error('User not found');
    }

    if (!item) {
      throw new Error('Item not found');
    }

    // Check if user has enough items in inventory
    const inventoryItem = await prisma.inventoryItem.findFirst({
      where: {
        userId,
        itemId,
        quantity: { gte: quantity },
      },
    });

    if (!inventoryItem) {
      throw new Error('Insufficient items in inventory');
    }

    // Validate price
    if (pricePerUnit <= 0) {
      throw new Error('Price must be greater than 0');
    }

    // Calculate total listing price
    const totalPrice = pricePerUnit * quantity;

    // Create the listing
    const listing = await prisma.marketListing.create({
      data: {
        sellerId: userId,
        itemId,
        quantity,
        pricePerUnit,
        status: ListingStatus.ACTIVE,
        expiresAt: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000), // Convert days to milliseconds
      },
    });

    // Remove items from user's inventory
    if (item.isStackable) {
      // For stackable items, reduce quantity
      await prisma.inventoryItem.update({
        where: { id: inventoryItem.id },
        data: { quantity: { decrement: quantity } },
      });

      // If quantity becomes 0, delete the inventory item
      if (inventoryItem.quantity - quantity === 0) {
        await prisma.inventoryItem.delete({
          where: { id: inventoryItem.id },
        });
      }
    } else {
      // For non-stackable items, remove individual items
      for (let i = 0; i < quantity; i++) {
        await prisma.inventoryItem.delete({
          where: { id: inventoryItem.id },
        });
      }
    }

    // Update market stats
    await updateMarketStats(itemId, 'listing_created', totalPrice);

    return listing;
  }

  /**
   * Get all active market listings
   */
  static async getActiveListings(
    page: number = 1,
    limit: number = 20,
    category?: string,
    searchQuery?: string
 ): Promise<{ listings: MarketListing[]; total: number }> {
    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: any = { status: ListingStatus.ACTIVE };
    
    if (category) {
      whereClause.item = { category };
    }
    
    if (searchQuery) {
      whereClause.item = {
        ...whereClause.item,
        name: { contains: searchQuery, mode: 'insensitive' },
      };
    }

    const [listings, total] = await Promise.all([
      prisma.marketListing.findMany({
        where: whereClause,
        include: {
          item: true,
          seller: {
            select: {
              username: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.marketListing.count({ where: whereClause }),
    ]);

    return { listings, total };
  }

  /**
   * Get a specific listing by ID
   */
  static async getListingById(listingId: string): Promise<MarketListing | null> {
    return prisma.marketListing.findUnique({
      where: { id: listingId },
      include: {
        item: true,
        seller: {
          select: {
            username: true,
          },
        },
      },
    });
  }

  /**
   * Purchase an item from a listing
   */
  static async purchaseListing(
    buyerId: string,
    listingId: string,
    quantity: number
  ): Promise<Transaction> {
    // Get the listing
    const listing = await prisma.marketListing.findUnique({
      where: { id: listingId },
      include: { item: true },
    });

    if (!listing) {
      throw new Error('Listing not found');
    }

    if (listing.status !== ListingStatus.ACTIVE) {
      throw new Error('Listing is not active');
    }

    if (listing.quantity < quantity) {
      throw new Error('Not enough items available');
    }

    // Get buyer
    const buyer = await prisma.user.findUnique({ where: { id: buyerId } });
    if (!buyer) {
      throw new Error('Buyer not found');
    }

    // Calculate total cost
    const totalCost = listing.pricePerUnit * quantity;

    // Check if buyer has enough funds
    if (buyer.bitcoins < totalCost) {
      throw new Error('Insufficient funds');
    }

    // Start a transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Update the listing quantity
      const updatedListing = await tx.marketListing.update({
        where: { id: listingId },
        data: {
          quantity: { decrement: quantity },
          status: quantity === listing.quantity ? ListingStatus.SOLD : ListingStatus.ACTIVE,
        },
      });

      // Transfer money from buyer to seller
      await tx.user.update({
        where: { id: buyerId },
        data: { bitcoins: { decrement: totalCost } },
      });

      await tx.user.update({
        where: { id: listing.sellerId },
        data: { bitcoins: { increment: totalCost * 0.95 } }, // 5% marketplace fee
      });

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          buyerId,
          listingId,
          quantity,
          totalPrice: totalCost,
          fee: totalCost * 0.05,
        },
      });

      // Add item to buyer's inventory
      const existingInventoryItem = await tx.inventoryItem.findFirst({
        where: {
          userId: buyerId,
          itemId: listing.itemId,
        },
      });

      if (existingInventoryItem && listing.item.isStackable) {
        // If item exists and is stackable, increase quantity
        await tx.inventoryItem.update({
          where: { id: existingInventoryItem.id },
          data: { quantity: { increment: quantity } },
        });
      } else {
        // Otherwise, create new inventory item
        await tx.inventoryItem.create({
          data: {
            userId: buyerId,
            itemId: listing.itemId,
            quantity,
            equipped: false,
          },
        });
      }

      return { transaction, updatedListing };
    });

    // Update market stats
    await updateMarketStats(listing.itemId, 'item_sold', totalCost);

    return result.transaction;
  }

  /**
   * Cancel a listing (only by the seller)
   */
  static async cancelListing(listingId: string, userId: string): Promise<MarketListing> {
    // Get the listing
    const listing = await prisma.marketListing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      throw new Error('Listing not found');
    }

    if (listing.sellerId !== userId) {
      throw new Error('Unauthorized: Cannot cancel another user\'s listing');
    }

    if (listing.status !== ListingStatus.ACTIVE) {
      throw new Error('Cannot cancel a listing that is not active');
    }

    // Start a transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Update listing status
      const updatedListing = await tx.marketListing.update({
        where: { id: listingId },
        data: {
          status: ListingStatus.CANCELLED,
        },
      });

      // Get the item to check if it's stackable
      const item = await tx.item.findUnique({
        where: { id: listing.itemId },
      });
      
      if (!item) {
        throw new Error('Item not found for listing');
      }

      // Return items to seller's inventory
      const existingInventoryItem = await tx.inventoryItem.findFirst({
        where: {
          userId,
          itemId: listing.itemId,
        },
      });

      if (existingInventoryItem && item.isStackable) {
        // If item exists and is stackable, increase quantity
        await tx.inventoryItem.update({
          where: { id: existingInventoryItem.id },
          data: { quantity: { increment: updatedListing.quantity } },
        });
      } else {
        // Otherwise, create new inventory item
        await tx.inventoryItem.create({
          data: {
            userId,
            itemId: updatedListing.itemId,
            quantity: updatedListing.quantity,
            equipped: false,
          },
        });
      }

      return updatedListing;
    });

    return result;
  }

  /**
   * Get user's active listings
   */
  static async getUserListings(userId: string): Promise<MarketListing[]> {
    return prisma.marketListing.findMany({
      where: { sellerId: userId },
      include: {
        item: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get user's transaction history
   */
  static async getUserTransactions(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ transactions: Transaction[]; total: number }> {
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { buyerId: userId },
        include: {
          listing: {
            include: {
              item: true,
              seller: {
                select: {
                  username: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.transaction.count({ where: { buyerId: userId } }),
    ]);

    return { transactions, total };
  }

  /**
   * Get market statistics for an item
   */
 static async getItemMarketStats(itemId: string): Promise<{
    averagePrice: number;
    lowestPrice: number;
    highestPrice: number;
    totalListings: number;
    totalVolume: number;
  }> {
    const listings = await prisma.marketListing.findMany({
      where: {
        itemId,
        status: ListingStatus.ACTIVE,
      },
      select: {
        pricePerUnit: true,
        quantity: true,
      },
    });

    if (listings.length === 0) {
      return {
        averagePrice: 0,
        lowestPrice: 0,
        highestPrice: 0,
        totalListings: 0,
        totalVolume: 0,
      };
    }

    const prices = listings.map(listing => listing.pricePerUnit);
    const totalVolume = listings.reduce((sum, listing) => sum + (listing.pricePerUnit * listing.quantity), 0);

    return {
      averagePrice: prices.reduce((a, b) => a + b, 0) / prices.length,
      lowestPrice: Math.min(...prices),
      highestPrice: Math.max(...prices),
      totalListings: listings.length,
      totalVolume,
    };
  }
}