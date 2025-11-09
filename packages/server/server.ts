// packages/server/server.ts

import express from 'express';
import next from 'next';
import http from 'http';
import path from 'path';
import connectDB from './utils/db';
import { initSocketServer } from './socketServer';
import { app as apiApp } from './app';

require("dotenv").config();

const dev = process.env.NODE_ENV !== 'production';
const port = parseInt(process.env.PORT || '8000', 10);

// This logic now correctly finds the 'admin' directory whether
// it's running from the source '.ts' file in development,
// or from the compiled '.js' file in the 'build' directory in production.
const adminAppPath = path.join(__dirname, dev ? '../../admin' : '../../../packages/admin');

const nextApp = next({ dev, dir: adminAppPath });
const handle = nextApp.getRequestHandler();

nextApp.prepare().then(() => {
    const mainApp = express();
    const server = http.createServer(mainApp);

    mainApp.use('/api/v1', apiApp);
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
