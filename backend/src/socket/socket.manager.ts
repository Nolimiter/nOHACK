import { Server as SocketIOServer } from 'socket.io';

class SocketManager {
  private static instance: SocketManager;
  private io: SocketIOServer | null = null;

  private constructor() {}

  public static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  public setIO(io: SocketIOServer): void {
    this.io = io;
  }

  public getIO(): SocketIOServer | null {
    return this.io;
  }

  public emitToUser(userId: string, event: string, data: any): void {
    if (this.io) {
      this.io.to(`user-${userId}`).emit(event, data);
    }
  }
}

export default SocketManager.getInstance();