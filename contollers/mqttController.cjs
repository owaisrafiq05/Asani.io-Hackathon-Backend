// const { admin } = require("../server.cjs"); 
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const admin = require("firebase-admin");

let dataBuffer = [];
let intervalId;
let previousApiResponse = null;

// Function to fetch the number of devices from Firestore
const getNumDevices = async () => {
    const devicesRef = admin.firestore().collection("devices");
    const snapshot = await devicesRef.get();
    return snapshot.size; // Return the count of devices
};

// Function to send data to the API
const sendDataToApi = async (data) => {
    const numDevices = await getNumDevices();
    const payload = {
        num_devices: numDevices,
        df: data
    };

    try {
        const response = await axios.post("https://jw9vbmcl-8000.inc1.devtunnels.ms/generate-response", payload);
        console.log("API response:", response.data);
        await handleApiResponse(response.data);
    } catch (error) {
        console.error("Error sending data to API:", error);
    }
};

// Function to handle the API response
const handleApiResponse = async (currentResponse) => {
    if (previousApiResponse) {
        // Compare the current response with the previous one
        await compareApiResponses(previousApiResponse, currentResponse);
    }
    previousApiResponse = currentResponse; // Update the previous response
};

// Function to compare previous and current API responses
const compareApiResponses = async (prevResponse, currentResponse) => {
    const prevData = prevResponse.data;
    const currentData = currentResponse.data;
    const comparisonResults = []; // Array to hold comparison results

    for (let i = 0; i < prevData.length; i++) {
        if (prevData[i] !== currentData[i]) {
            // If there is a difference, log the notification message
            const notificationMessage = currentData[i] === 1 
                ? `Device ${i + 1} is turned On` 
                : `Device ${i + 1} is turned OFF`;
            console.log(notificationMessage); // Log the message

            // Save the comparison result
            comparisonResults.push({
                deviceId: i + 1,
                status: currentData[i] === 1 ? "On" : "Off",
                timestamp: new Date().toISOString() // Add a timestamp for the comparison
            });
        }
    }

    // Save comparison results to Firestore
    if (comparisonResults.length > 0) {
        await saveComparisonResults(comparisonResults);
    }
};

// Function to save comparison results to Firestore
const saveComparisonResults = async (results) => {
    const collectionRef = admin.firestore().collection("results"); // Collection to store results
    try {
        for (const result of results) {
            await collectionRef.add(result); // Add each result to the Firestore collection
        }
        console.log("Comparison results saved to Firestore:", results);
    } catch (error) {
        console.error("Error saving comparison results to Firestore:", error);
    }
};

// Function to start collecting MQTT data
const startCollectingMqttData = () => {
    dataBuffer = [];
    intervalId = setInterval(async () => {
        await sendDataToApi(dataBuffer);
        dataBuffer = [];
    }, 300000);
};

// Function to handle incoming MQTT messages
const handleIncomingMqttData = (mqttMessage) => {
    const messageData = JSON.parse(mqttMessage);
    const timestamp = Date.now(); // Get the current timestamp
    messageData.createdAt = timestamp; // Add the createdAt field with the current timestamp
    dataBuffer.push(messageData);
};

// Call startCollectingMqttData to begin the process
startCollectingMqttData();

// Function to upload data to Firestore
const uploadDataToFirestore = async (data) => {
    const collectionRef = admin.firestore().collection("mqttData");
    try {
        await collectionRef.add(data); // Add the data to Firestore
        console.log("Data uploaded to Firestore:", data);
    } catch (error) {
        console.error("Error uploading data to Firestore:", error);
    }
};

// Function to read data from sample.json and upload it
const uploadSampleData = async () => {
    const filePath = path.join(__dirname, '../sample.json');
    fs.readFile(filePath, 'utf8', async (err, jsonData) => {
        if (err) {
            console.error("Error reading sample.json:", err);
            return;
        }
        try {
            const data = JSON.parse(jsonData);
            for (const item of data) {
                // Add createdAt timestamp to each item
                item.createdAt = Date.now(); // Set the current timestamp
                await uploadDataToFirestore(item); // Upload the item with the timestamp
            }
        } catch (parseError) {
            console.error("Error parsing JSON data:", parseError);
        }
    });
};

// Export the functions
module.exports = {
    uploadSampleData,
    handleIncomingMqttData
};