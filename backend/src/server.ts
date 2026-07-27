import express from 'express';
import cors from 'cors';
import path from 'path';

import { config } from './config.js';
import { sequelize } from './services/db.js';
import { syncModels } from './models/syncModels.js';

// Routes
import authRoute from './api/v1/auth/auth.js';
import configRoute from './api/v1/config/config.js';
import userRoute from './api/v1/users/users.js';
import vmRoute from './api/v1/vms/vms.js';

const app = express();

app.set('trust proxy', config.server.trustProxy);

app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));

(async () => {
  try {    
    // Connect to DB
    await sequelize.authenticate();

    // Sync Models
    await syncModels()

    // Routes
    app.use('/api/v1/auth', authRoute);
    app.use('/api/v1/config', configRoute);
    app.use('/api/v1/users', userRoute);
    app.use('/api/v1/vms', vmRoute);

    if (config.server.serveFrontend) {
      const distPath = path.resolve(config.server.frontendDistPath);
      app.use(express.static(distPath));
      app.get('*', (_req, res, next) => {
        if (_req.path.startsWith('/api')) return next();
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    // Start express
    app.listen(config.server.port, () => {
      console.log(`Backend has started on port ${config.server.port}`)
    });
  } catch (error) {
    console.error('ERROR - Failed to start backend', error);
    process.exit(1);
  }
})();
