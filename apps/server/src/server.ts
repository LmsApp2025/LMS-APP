import express from 'express';
import next from 'next';
import http from 'http';
import path from 'path';
import connectDB from './utils/db';
import { initSocketServer } from './socketServer';
import { app as apiApp } from './app'; // This is our refactored app

require("dotenv").config();

const dev = process.env.NODE_ENV !== 'production';
const port = parseInt(process.env.PORT || '8000', 10);
const adminAppPath = dev ? path.join(__dirname, '../../admin') : path.resolve(process.cwd(), 'apps/admin');

const nextApp = next({ dev, dir: adminAppPath });
const handle = nextApp.getRequestHandler();

nextApp.prepare().then(() => {
    const mainApp = express();
    const server = http.createServer(mainApp);

    // This line is now the SINGLE source of truth for the API prefix.
    mainApp.use('/api/v1', apiApp);

    // This handles all other requests (like for the admin panel pages)
    mainApp.all('*', (req, res) => {
        return handle(req, res);
    });

    initSocketServer(server);

    server.listen(port, () => {
        console.log(`> Unified Server listening on port: ${port}`);
        connectDB();
    });
}).catch(err => {
    console.error('> Error starting server:', err);
    process.exit(1);
});