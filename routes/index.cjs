const express = require('express');
const router = express.Router();
const mqttController = require('../contollers/mqttController.cjs');
const deviceController = require('../contollers/deviceController.js');
const admin = require("firebase-admin"); // Import admin to access Firestore

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

// Route to get all MQTT data
router.get('/mqtt-data', deviceController.getAllMqttData);

// New approach for device routes
router.post("/devices", deviceController.addDevice);
router.get("/devices", deviceController.getAllDevices);

// Route to get the latest result from the results collection
router.get('/latest-result', async (req, res) => {
    try {
        const resultsRef = admin.firestore().collection("results");
        const snapshot = await resultsRef.orderBy("timestamp", "desc").limit(1).get(); // Get the latest result

        if (snapshot.empty) {
            return res.status(404).json({
                status: 'error',
                message: 'No results found'
            });
        }

        const latestResult = snapshot.docs[0].data(); // Get the first document's data
        res.json({
            status: 'success',
            data: latestResult
        });
    } catch (error) {
        console.error("Error fetching latest result:", error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch latest result'
        });
    }
});

// Catch-all route for undefined endpoints
router.all('*', (req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Route not found'
    });
});

module.exports = router;
