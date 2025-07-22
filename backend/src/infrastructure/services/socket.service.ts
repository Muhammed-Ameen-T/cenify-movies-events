import { Server, Socket } from 'socket.io';
import { ExtendedError } from 'socket.io/dist/namespace';
import { v4 as uuidv4 } from 'uuid';
import { Notification } from '../../domain/entities/notification.entity';
import { env } from '../../config/env.config';

class SocketService {
  private io: Server | null = null;
  private isInitialized = false;
  private instanceId = uuidv4();

  constructor() {
    console.log(`SocketService instance created, ID: ${this.instanceId}`);
  }

  initialize(server: any) {
    if (this.isInitialized) {
      console.warn(`Socket.IO server already initialized, instance ID: ${this.instanceId}`);
      return;
    }

    this.io = new Server(server, {
      path: '/socket.io',
      cors: {
        origin: (origin, callback) => {
          const allowedOrigins = ['http://localhost:5173', env.CLIENT_ORIGIN];
          console.log(`CORS check for origin: ${origin}, instance ID: ${this.instanceId}`);
          if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            callback(new Error('Not allowed by CORS'));
          }
        },
        methods: ['GET', 'POST'],
        credentials: true,
      },
      pingTimeout: 20000,
      pingInterval: 25000,
    });

    this.isInitialized = true;
    this.setupSocketEvents();
    console.log(
      `Socket.IO server initialized with path: /socket.io, instance ID: ${this.instanceId}`,
    );
  }

  private setupSocketEvents() {
    if (!this.io) {
      console.error(`Socket.IO server not initialized, instance ID: ${this.instanceId}`);
      return;
    }

    this.io.on('connection', (socket: Socket) => {
      console.log(`Socket connected: ${socket.id}, instance ID: ${this.instanceId}`);

      // Handle joinNotificationRoom
      socket.on('joinNotificationRoom', (room: string) => {
        if (!room) {
          socket.emit('error', { message: 'Invalid room' });
          return;
        }
        socket.join(room);
        console.log(
          `Socket ${socket.id} joined notification room: ${room}, rooms:`,
          Array.from(socket.rooms),
          `instance ID: ${this.instanceId}`,
        );
        socket.emit('joinedNotificationRoom', { room, socketId: socket.id });

        this.io!.in(room)
          .allSockets()
          .then((sockets) => {
            console.log(`Clients in room ${room} after join:`, Array.from(sockets));
          })
          .catch((err) => {
            console.error(`Error fetching clients in room ${room}:`, err);
          });
      });

      socket.on('joinShowRoom', (showId: string) => {
        if (!showId) {
          socket.emit('error', { message: 'Invalid showId' });
          return;
        }
        socket.join(showId);
        console.log(
          `Socket ${socket.id} joined show room: ${showId}, rooms:`,
          Array.from(socket.rooms),
          `instance ID: ${this.instanceId}`,
        );
        socket.emit('joinedShowRoom', { showId, socketId: socket.id });

        this.io!.in(showId)
          .allSockets()
          .then((sockets) => {
            console.log(`Clients in room ${showId} after join:`, Array.from(sockets));
          })
          .catch((err) => {
            console.error(`Error fetching clients in room ${showId}:`, err);
          });
      });

      socket.on('leaveShowRoom', (showId: string) => {
        socket.leave(showId);
        console.log(
          `Socket ${socket.id} left show room: ${showId}, rooms:`,
          Array.from(socket.rooms),
          `instance ID: ${this.instanceId}`,
        );
      });

      socket.on('disconnect', (reason) => {
        console.log(
          `Socket disconnected: ${socket.id}, reason: ${reason}, instance ID: ${this.instanceId}`,
        );
      });

      socket.on('error', (error) => {
        console.error(`Socket error for ${socket.id}:`, error, `instance ID: ${this.instanceId}`);
      });
    });
  }

  emitSeatUpdate(showId: string, seatIds: string[], status: 'pending' | 'booked' | 'available') {
    console.log(
      `emitSeatUpdate called with showId: ${showId}, seatIds:`,
      seatIds,
      `status: ${status}, instance ID: ${this.instanceId}`,
    );
    if (!this.isInitialized || !this.io) {
      console.error(
        `Socket.IO server not initialized, cannot emit seatUpdate, instance ID: ${this.instanceId}`,
      );
      return;
    }
    if (!showId || !seatIds.length) {
      console.warn(
        `Cannot emit seatUpdate: invalid showId (${showId}) or empty seatIds, instance ID: ${this.instanceId}`,
      );
      return;
    }
    console.log(`Emitting seatUpdate to room ${showId}:`, {
      seatIds,
      status,
      instanceId: this.instanceId,
    });
    this.io.to(showId).emit('seatUpdate', { seatIds, status });
    this.io
      .in(showId)
      .allSockets()
      .then((sockets) => {
        console.log(
          `Clients in room ${showId} received seatUpdate:`,
          Array.from(sockets),
          `instance ID: ${this.instanceId}`,
        );
      })
      .catch((err) => {
        console.error(
          `Error fetching clients in room ${showId}:`,
          err,
          `instance ID: ${this.instanceId}`,
        );
      });
  }

  emitNotification(room: string | null, notification: Notification) {
    if (!this.isInitialized || !this.io) {
      console.error(
        `Socket.IO server not initialized, cannot emit notification, instance ID: ${this.instanceId}`,
      );
      return;
    }
    if (!room) {
      console.warn(`Cannot emit notification: invalid room, instance ID: ${this.instanceId}`);
      return;
    }
    console.log(
      `Emitting notification to room ${room}:`,
      notification,
      `instance ID: ${this.instanceId}`,
    );
    this.io.to(room).emit('notification', notification);
    this.io
      .in(room)
      .allSockets()
      .then((sockets) => {
        console.log(
          `Clients in room ${room} received notification:`,
          Array.from(sockets),
          `instance ID: ${this.instanceId}`,
        );
      })
      .catch((err) => {
        console.error(
          `Error fetching clients in room ${room}:`,
          err,
          `instance ID: ${this.instanceId}`,
        );
      });
  }

  emitError(socketId: string, error: string) {
    if (!this.isInitialized || !this.io) {
      console.error(
        `Socket.IO server not initialized, cannot emit error, instance ID: ${this.instanceId}`,
      );
      return;
    }
    console.log(`Emitting error to socket ${socketId}:`, { error, instanceId: this.instanceId });
    this.io.to(socketId).emit('error', { message: error });
  }

  getInstanceId() {
    return this.instanceId;
  }
}

const socketService = new SocketService();
export { socketService };
