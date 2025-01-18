// controllers/deviceController.js
const admin = require("firebase-admin");

// Function to upload device data to Firestore
const uploadDeviceData = async (deviceData) => {
    const firestore = admin.firestore();
    const collectionRef = firestore.collection("devices");

    try {
        await collectionRef.add(deviceData);
        console.log("Device data uploaded to Firestore:", deviceData);
    } catch (error) {
        console.error("Error uploading device data to Firestore:", error);
    }
};

// Function to add a new device
const addDevice = async (req, res) => {
    const { name, FlowRate, Energy, Pressure, Temperature, Frequency } = req.body;

    // Validation against the schema
    if (typeof name !== 'string' || 
        typeof FlowRate !== 'number' || 
        typeof Energy !== 'number' || 
        typeof Pressure !== 'number' || 
        typeof Temperature !== 'number' || 
        typeof Frequency !== 'number') {
        return res.status(400).json({ error: "Invalid device data" });
    }

    const deviceData = { name, FlowRate, Energy, Pressure, Temperature, Frequency };
    await uploadDeviceData(deviceData);
    res.status(201).json({ message: "Device added successfully", deviceData });
};

// Function to get all devices
const getAllDevices = async (req, res) => {
    const firestore = admin.firestore();
    const collectionRef = firestore.collection("devices");
    
    try {
        const snapshot = await collectionRef.get();
        const devices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Sending the response with the "message" tag
        res.status(200).json({
            message: "Fetched Successfully",
            devices: devices
        });
    } catch (error) {
        console.error("Error fetching devices:", error);
        res.status(500).json({ error: "Error fetching devices" });
    }
};


// Export the functions
module.exports = {
    addDevice,
    getAllDevices
};