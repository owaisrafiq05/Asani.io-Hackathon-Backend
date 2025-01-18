const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const dotenv = require("dotenv");
const serviceAccount = require("./asani-hackathon-firebase-adminsdk-fbsvc-af3d0b575b.json");
const mqtt = require("mqtt");
const mqttController = require("./contollers/mqttController.cjs");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
  });
  
  admin.firestore().collection('test').get()
    .then(() => {
      console.log('Firebase Admin connection successful');
      mqttController.uploadSampleData();
    })
    .catch(error => {
      console.error('Firebase connection test failed:', error);
      process.exit(1);
    });
} catch (error) {
  console.error('Firebase initialization failed:', error);
  process.exit(1);
}

// Export the initialized admin instance
module.exports = { admin };

const mqttClient = mqtt.connect("mqtt://test.mosquitto.org:1883");

mqttClient.on("connect", () => {
  console.log("Connected to MQTT broker");
  mqttClient.subscribe("/system/dummy/data/XYZ123", (err) => {
    if (err) {
      console.error("Subscription error:", err);
    } else {
      console.log("Subscribed to topic: /system/dummy/data/XYZ123");
    }
  });
});

mqttClient.on("message", (topic, message) => {
  console.log(`Received message on ${topic}: ${message.toString()}`);
  mqttController.handleIncomingMqttData(message.toString());
});

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cors({ origin: "*" }));
app.use("/api", require("./routes/index.cjs"));
app.get("/", (req, res) => {
    res.json("Running");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
});

