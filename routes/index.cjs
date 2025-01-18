const express = require('express');
const router = express.Router();
const mqttController = require('../contollers/mqttController.js');
const deviceController = require('../contollers/deviceController.js');

// Test route to verify API is working
router.get('/test', (req, res) => {
    res.json({
        status: 'success',
        message: 'API is working correctly'
    });
});

// Route to upload sample data to Firestore
router.get('/upload-sample-data', async (req, res) => {
    await mqttController.uploadSampleData();
    res.json({ status: 'success', message: 'Sample data uploaded to Firestore' });
});


// New approach for device routes
router.post("/devices", deviceController.addDevice);
router.get("/devices", deviceController.getAllDevices);


// Catch-all route for undefined endpoints
router.all('*', (req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Route not found'
    });
});


module.exports = router;
