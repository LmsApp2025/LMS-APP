// In: apps/server/src/server.ts (FINAL CORRECTED VERSION)

import http from 'http';
import connectDB from './utils/db';
import { initSocketServer } from './socketServer';
import { app } from './app'; // Import the single, unified app

require("dotenv").config();
const port = parseInt(process.env.PORT || '8000', 10);

const server = http.createServer(app);

initSocketServer(server);

server.listen(port, () => {
    console.log(`> Unified Server listening on port: ${port}`);
    connectDB();
});