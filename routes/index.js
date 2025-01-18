import express from 'express';
const router = express.Router();

// Test route to verify API is working
router.get('/test', (req, res) => {
    res.json({
        status: 'success',
        message: 'API is working correctly'
    });
});

// Basic health check endpoint
router.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});

// Catch-all route for undefined endpoints
router.all('*', (req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Route not found'
    });
});

export default router;
