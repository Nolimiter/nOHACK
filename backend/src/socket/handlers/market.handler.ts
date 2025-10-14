import { Server, Socket } from 'socket.io';
import { MarketService } from '../../services/market.service';

// In-memory storage for market watchers
// In a real application, you would use Redis or a database for persistence
const marketWatchers: { [key: string]: Set<string> } = {}; // itemId -> Set of socketIds

export const handleMarketEvents = (io: Server, socket: Socket) => {
  // Handle watching an item
  socket.on('market:watch', async (data) => {
    try {
      const { itemId } = data;
      
      // Verify item exists
      const item = await prisma.item.findUnique({
        where: { id: itemId },
      });
      
      if (!item) {
        socket.emit('error', 'Item not found');
        return;
      }
      
      // Add socket to watchers for this item
      if (!marketWatchers[itemId]) {
        marketWatchers[itemId] = new Set();
      }
      
      marketWatchers[itemId].add(socket.id);
      
      // Send current market stats for the item
      const stats = await MarketService.getItemMarketStats(itemId);
      socket.emit('market:watch:confirmed', {
        itemId,
        stats,
        message: `Now watching ${item.name} market`,
      });
    } catch (error: any) {
      socket.emit('error', error.message || 'Failed to watch item');
    }
 });
  
  // Handle unwatching an item
  socket.on('market:unwatch', (data) => {
    try {
      const { itemId } = data;
      
      if (marketWatchers[itemId]) {
        marketWatchers[itemId].delete(socket.id);
        socket.emit('market:unwatch:confirmed', {
          itemId,
          message: `Stopped watching ${itemId} market`,
        });
      }
    } catch (error: any) {
      socket.emit('error', error.message || 'Failed to unwatch item');
    }
  });
  
  // Handle requesting market updates (for price changes, new listings, etc.)
  socket.on('market:refresh', async (data) => {
    try {
      const { itemId } = data;
      
      // Get updated market stats
      const stats = await MarketService.getItemMarketStats(itemId);
      
      socket.emit('market:refresh:response', {
        itemId,
        stats,
        timestamp: new Date(),
      });
    } catch (error: any) {
      socket.emit('error', error.message || 'Failed to refresh market data');
    }
  });
};

// Function to broadcast market updates to watchers
// This would be called from other parts of the application when market changes occur
export const broadcastMarketUpdate = (itemId: string, updateType: 'price' | 'listing' | 'stats', data: any) => {
  if (marketWatchers[itemId]) {
    marketWatchers[itemId].forEach(socketId => {
      // In a real implementation, you would check if the socket is still connected
      // before sending the message
      io.to(socketId).emit('market:update', {
        itemId,
        updateType,
        data,
        timestamp: new Date(),
      });
    });
  }
};