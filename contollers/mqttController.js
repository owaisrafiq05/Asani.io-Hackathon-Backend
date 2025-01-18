const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

// Function to upload data to Firestore
const uploadDataToFirestore = async (data) => {
    const firestore = admin.firestore();
    const collectionRef = firestore.collection("mqttData");

    try {
        await collectionRef.add(data);
        console.log("Data uploaded to Firestore:", data);
    } catch (error) {
        console.error("Error uploading data to Firestore:", error);
    }
};

// Function to read data from sample.json and upload it
const uploadSampleData = async () => {
    const filePath = path.join(__dirname, '../sample.json'); // Adjusted path to sample.json
    fs.readFile(filePath, 'utf8', (err, jsonData) => {
        if (err) {
            console.error("Error reading sample.json:", err);
            return;
        }
        const data = JSON.parse(jsonData);
        data.forEach(item => {
            if (item.Data) { // Check if Data exists
                uploadDataToFirestore(item.Data); // Upload the Data object
            }
        });
    });
};

// Function to handle incoming MQTT messages
const handleIncomingMqttData = (mqttMessage) => {
    const messageData = JSON.parse(mqttMessage);
    uploadDataToFirestore(messageData);
};

// Export the functions
module.exports = {
    uploadSampleData,
    handleIncomingMqttData
};