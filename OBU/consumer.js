let {
    setActiveStatus,
    setLatitude,
    setLongitude,
    setSpeed,
    setColor,
} = require('./obu.js');
const mqtt = require('mqtt')

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// setSpeed(number) : Use this function to set the vehicle's speed (km/hr), e.g. setSpeed(50)
// setActiveStatus(boolean) : Use this function to set the vehicle's online status (true=Active, false=Inactive), e.g. setActiveStatus(true)
// setLatitude(number), setLongitude(number) : Use these functions to set the vehicle's location
    // e.g. setLatitude(13.738044), setLongitude(100.529944)
// setColor(string) : Use this function to set the vehicle-pin's color, e.g. setColor("blue")
    // valid colors are "blue", "green", "red", "violet", "yellow", "no"

// Get configuration from environment - Part 2 configuration
const MQTT_BROKER = process.env.MQTT_BROKER || 'mqtt://161.200.92.6:27004';
const V2X_TOPIC = process.env.V2X_TOPIC || 'IotMsgPlatformPartTwo/chicken-earth-september-finch';

console.log('Starting MQTT Consumer...');
console.log('Broker:', MQTT_BROKER);
console.log('V2X Topic:', V2X_TOPIC);

// Create MQTT client
const client = mqtt.connect(MQTT_BROKER, {
    connectTimeout: 5000,
    clientId: 'obu_consumer_' + Math.random().toString(16).slice(3),
    clean: true,
    reconnectPeriod: 1000,
});

// Handle connection
client.on('connect', () => {
    console.log('[OBU Consumer] ✓ Connected to MQTT Broker:', MQTT_BROKER);
    
    // Subscribe to all necessary topics with QoS 1 for Part 2
    const topics = [
        `${V2X_TOPIC}/speed`,
        `${V2X_TOPIC}/heartbeat`,
        `${V2X_TOPIC}/route`
    ];
    
    topics.forEach(topic => {
        client.subscribe(topic, { qos: 1 }, (err) => {
            if (err) {
                console.error(`[OBU Consumer] ✗ Error subscribing to ${topic}:`, err);
            } else {
                console.log(`[OBU Consumer] ✓ Subscribed to topic: ${topic}`);
            }
        });
    });
});

// Handle incoming messages
client.on('message', (topic, message) => {
    try {
        const payload = JSON.parse(message.toString());
        console.log(`[OBU Consumer] <- Received on topic ${topic}:`, payload);
        
        // Route the message based on topic
        if (topic === `${V2X_TOPIC}/speed`) {
            // Handle speed message
            if (payload.speed !== undefined) {
                const speed = Number(payload.speed) || 0;
                setSpeed(speed);
                console.log(`[OBU Consumer] Set speed to: ${speed} km/h`);
            }
        } else if (topic === `${V2X_TOPIC}/heartbeat`) {
            // Handle heartbeat message
            if (payload.heartbeat !== undefined) {
                const isActive = !!payload.heartbeat;
                setActiveStatus(isActive);
                console.log(`[OBU Consumer] Set active status to: ${isActive}`);
            }
        } else if (topic === `${V2X_TOPIC}/route`) {
            // Handle route message
            if (payload.latitude !== undefined && payload.longitude !== undefined) {
                const lat = Number(payload.latitude);
                const lng = Number(payload.longitude);
                if (!Number.isNaN(lat)) setLatitude(lat);
                if (!Number.isNaN(lng)) setLongitude(lng);
                console.log(`[OBU Consumer] Set location to: (${lat}, ${lng})`);
            }
            if (payload.color !== undefined) {
                const color = String(payload.color || 'no');
                setColor(color);
                console.log(`[OBU Consumer] Set color to: ${color}`);
            }
        }
    } catch (error) {
        console.error('[OBU Consumer] Error processing message:', error);
    }
});

// Handle errors
client.on('error', (error) => {
    console.error('MQTT connection error:', error);
});

// Handle offline
client.on('offline', () => {
    console.log('MQTT client is offline');
});

// Handle reconnect
client.on('reconnect', () => {
    console.log('Attempting to reconnect to MQTT broker');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('Received SIGTERM. Shutting down gracefully...');
    client.end();
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('Received SIGINT. Shutting down gracefully...');
    client.end();
    process.exit(0);
});