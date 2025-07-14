import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cron from 'node-cron';

// Import configuration and services
import { validateConfig } from './config/sui.js';
import eventListener from './services/eventListener.js';
import { checkAllVaultEligibility } from './services/vaultProcessor.js';

// Import routes
import dreamsRouter from './routes/dreams.js';
import pledgesRouter from './routes/pledges.js';
import vaultsRouter from './routes/vaults.js';
import usersRouter from './routes/users.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(morgan('combined'));

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/dreams', dreamsRouter);
app.use('/api/pledges', pledgesRouter);
app.use('/api/vaults', vaultsRouter);
app.use('/api/users', usersRouter);

// Global statistics endpoint
app.get('/api/stats', async (req, res) => {
  try {
    const { default: database } = await import('./services/database.js');
    const stats = await database.getStats();
    
    res.json({
      success: true,
      data: {
        ...stats,
        serverUptime: process.uptime(),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching global stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  eventListener.stopListening();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  eventListener.stopListening();
  process.exit(0);
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Manorath server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS enabled for: ${corsOptions.origin.join(', ')}`);
  
  // Validate configuration
  const configValid = validateConfig();
  if (configValid) {
    console.log('✅ Configuration validated successfully');
    
    // Start event listener
    await eventListener.startListening();
    
    // Schedule vault eligibility checks every hour
    cron.schedule('0 * * * *', () => {
      console.log('Running scheduled vault eligibility check...');
      checkAllVaultEligibility();
    });
    
    console.log('⏰ Scheduled tasks configured');
  } else {
    console.warn('⚠️  Configuration incomplete - some features may be disabled');
  }
  
  console.log('🎯 Server ready to handle requests');
});

export default app;