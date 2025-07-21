"use strict";
// // src/interfaces/http/middlewares/socket.middleware.ts
// import { Request, Response, NextFunction } from 'express';
// import { container } from 'tsyringe';
// import { SocketService } from '../../infrastructure/services/socket.service';
// export const socketMiddleware = (req: Request, res: Response, next: NextFunction) => {
//   const socketId = req.headers['x-socket-id'] as string;
//   if (socketId) {
//     req.socketId = socketId;
//   }
//   next();
// };
