import express from 'express';
import cors from 'cors';

import { config } from './config.js';
import { sequelize } from './services/db.js';
import { syncModels } from './models/syncModels.js';

// Routes
import authRoute from './api/v1/auth/auth.js';

const app = express();

// Cors
app.use(cors());

app.use(express.json());

(async () => {
  try {
    // Connect to DB
    await sequelize.authenticate();

    // Sync Models
    await syncModels()

    // Routes
    app.use('/api/v1/auth', authRoute);

    // Start express
    app.listen(config.server.port, () => {
      console.log(`Backend has started on port ${config.server.port}`)
    });
  } catch (error) {
    console.error('ERROR - Failed to start backend', error);
    process.exit(1);
  }
})();
