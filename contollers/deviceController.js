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

// Function to get all data from the mqttData collection
const getAllMqttData = async (req, res) => {
    const last = parseInt(req.query.last) || 10; // Default to 10 if not provided
    try {
        const mqttDataRef = admin.firestore().collection("mqttData");
        const snapshot = await mqttDataRef.orderBy("createdAt", "desc").limit(last).get(); // Order by createdAt and limit results

        if (snapshot.empty) {
            return res.status(404).json({
                status: 'error',
                message: 'No MQTT data found'
            });
        }

        const mqttDataList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.json({
            status: 'success',
            data: mqttDataList
        });
    } catch (error) {
        console.error("Error fetching MQTT data:", error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch MQTT data'
        });
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
    getAllDevices,
    getAllMqttData
};