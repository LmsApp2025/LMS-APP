// In: apps/server/src/server.ts (FINAL, PURE API VERSION)

import dotenv from 'dotenv';
import path from 'path';

// This explicitly loads the local .env file when running in development
if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: path.resolve(__dirname, './.env') });
}

import http from 'http';
import connectDB from './utils/db';
import { initSocketServer } from './socketServer';
import { app } from './app';

const port = parseInt(process.env.PORT || '8000', 10);
const server = http.createServer(app);

initSocketServer(server);

server.listen(port, () => {
    console.log(`> API Server listening on port: ${port}`);
    connectDB();
});