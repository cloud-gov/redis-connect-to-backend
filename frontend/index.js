const express = require('express');
const bodyParser = require('body-parser')
const redis = require('redis');
const vcapServices = require('vcap_services');
const port = process.env.PORT || 5000;

// Get Redis URI. 
const credentials = vcapServices.findCredentials({ service: 'aws-elasticache-redis' });
const serviceUrl = credentials.uri.replace("redis", "rediss");

// Channels for frontend and backend to use to communicate.
const subscribeChannel = "from-backend";
const publishChannel = "from-frontend";

// Subscriber to listen for messages from frontend.
const subscriber = redis.createClient(serviceUrl);

// Publisher to send messages back to frontend.
const publisher = redis.createClient(serviceUrl);

subscriber.subscribe(subscribeChannel);

subscriber.on("connect", () => {
    console.log("Client is connected to Redis");
});

subscriber.on("error", () => {
    console.log("An error occurred");
});

subscriber.on("end", () => {
    console.log("Client disconnected from Redis");
});

subscriber.on("subscribe", (channel) => {
    console.log(`Subscribed to channel: ${channel}`);
});

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());

app.get('/', (req, res) => {
    res.send("This is a demo app: Redis Connect to cloud.gov backend service");
});

app.post('/',(req, res) => {

    let message = req.body.message || "Test"

    publisher.publish(publishChannel, message);

    subscriber.on("message",(channel, message) => {
        res.end(`Backend app says: ${message}`);
    })

});

app.listen(port,() => {
    console.log(`server is listening on PORT ${port}`);
});