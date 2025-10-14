import { Server, Socket } from 'socket.io';

// In-memory storage for chat channels and online users
// In a real application, you would use Redis or a database for persistence
const chatChannels: { [key: string]: Set<string> } = {
  general: new Set(),
  trading: new Set(),
  help: new Set(),
};

const onlineUsers: Map<string, { socketId: string; username: string; joinDate: Date }> = new Map();

export const handleChatEvents = (io: Server, socket: Socket) => {
  // Handle joining a chat channel
  socket.on('chat:join', (data) => {
    const userId = (socket as any).user.userId;
    const username = (socket as any).user.username;
    
    // Add user to the specified channel
    if (!chatChannels[data.channel]) {
      chatChannels[data.channel] = new Set();
    }
    
    chatChannels[data.channel].add(socket.id);
    socket.join(data.channel);
    
    // Add user to online users if not already there
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, {
        socketId: socket.id,
        username,
        joinDate: new Date(),
      });
    }
    
    // Notify others in the channel that a user joined
    socket.to(data.channel).emit('chat:userJoined', {
      userId,
      username,
      channel: data.channel,
    });
    
    // Send updated online users list to the channel
    const usersInChannel = Array.from(chatChannels[data.channel]).map(sockId => {
      const userEntry = Array.from(onlineUsers.entries()).find(([, value]) => value.socketId === sockId);
      return userEntry ? { id: userEntry[0], username: userEntry[1].username } : null;
    }).filter(Boolean);
    
    io.to(data.channel).emit('chat:onlineUsers', {
      channel: data.channel,
      users: usersInChannel,
    });
  });
  
  // Handle leaving a chat channel
  socket.on('chat:leave', (data) => {
    const userId = (socket as any).user.userId;
    
    if (chatChannels[data.channel]) {
      chatChannels[data.channel].delete(socket.id);
      socket.leave(data.channel);
      
      // Notify others in the channel that a user left
      socket.to(data.channel).emit('chat:userLeft', {
        userId,
        username: (socket as any).user.username,
        channel: data.channel,
      });
    }
  });
  
  // Handle sending a chat message
  socket.on('chat:message', (data) => {
    const userId = (socket as any).user.userId;
    const username = (socket as any).user.username;
    
    // Verify user is in the channel
    if (chatChannels[data.channel] && chatChannels[data.channel].has(socket.id)) {
      // Create message object
      const message = {
        userId,
        username,
        message: data.message,
        timestamp: new Date(),
        channelId: data.channel,
      };
      
      // Broadcast message to all users in the channel
      io.to(data.channel).emit('chat:message', message);
    } else {
      socket.emit('error', 'You are not in this channel');
    }
 });
  
  // Handle socket disconnect
  socket.on('disconnect', () => {
    const userId = Array.from(onlineUsers.entries()).find(([, value]) => value.socketId === socket.id)?.[0];
    
    if (userId) {
      const user = onlineUsers.get(userId);
      if (user) {
        // Remove user from all channels
        Object.keys(chatChannels).forEach(channel => {
          chatChannels[channel].delete(socket.id);
          
          // Notify others that user left
          socket.to(channel).emit('chat:userLeft', {
            userId,
            username: user.username,
            channel,
          });
        });
        
        // Remove from online users
        onlineUsers.delete(userId);
      }
    }
  });
};