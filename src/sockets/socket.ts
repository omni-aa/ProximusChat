// src/socket.ts
import { io } from "socket.io-client";

const URL = "http://localhost:3000"; // your Socket.IO server
export const socket = io(URL);
