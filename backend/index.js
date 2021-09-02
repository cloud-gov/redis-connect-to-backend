const redis = require('redis');
const vcapServices = require('vcap_services');

// Get Redis URI. 
const credentials = vcapServices.findCredentials({ service: 'aws-elasticache-redis' });
const serviceUrl = credentials.uri.replace("redis", "rediss");

// Channels for frontend and backend to use to communicate.
const subscribeChannel = "from-frontend";
const publishChannel = "from-backend";

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

// Echo back to the front end what was received.
subscriber.on("message",(channel, message) => {
    publisher.publish(publishChannel, `Received "${message}" from the front end app on "${channel}" channel`);
});

