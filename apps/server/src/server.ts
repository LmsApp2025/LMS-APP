// In: apps/server/src/server.ts (FINAL CORRECTED VERSION)

import dotenv from 'dotenv';
import path from 'path';

// THE DEFINITIVE FIX: Load environment variables directly from the .env file.
// This line MUST be at the very top, before any other imports that need env variables.
dotenv.config({ path: path.resolve(__dirname, './.env') });

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