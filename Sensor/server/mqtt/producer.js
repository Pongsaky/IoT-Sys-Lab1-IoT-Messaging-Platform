const mqtt = require('mqtt')

// Load the configuration
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const Producer = () => {
    let client
    const BROKER = process.env.MQTT_BROKER || 'mqtt://161.200.92.6:27004';
    const options = {
        connectTimeout: 5000,
        clientId: 'nodejs_producer_' + Math.random().toString(16).slice(3),
        clean: true,
        reconnectPeriod: 1000,
    };

    const connect = async() => {
        return new Promise((resolve, reject) => {
            client = mqtt.connect(BROKER, options);

            client.on('connect', () => {
                console.log('[Producer] Connected to MQTT broker:', BROKER);
                resolve();
            });

            client.on('error', (error) => {
                console.error('[Producer] MQTT connection error:', error);
                reject(error);
            });

            // Optional, just for logging/debugging
            client.on('offline', () => console.log('[Producer] MQTT client is offline'));
            client.on('reconnect', () => console.log('[Producer] Attempting to reconnect to MQTT broker'));
        });
    }

    const publish = async(topic, msg) => {
        return new Promise((resolve, reject) => {
            if (!client) {
                return reject(new Error("Producer is not connected."));
            }

            const options = {
                qos: 1,  // Changed to QoS 1 for guaranteed delivery
                retain: false,
                dup: false
            }

            client.publish(topic, msg, options, (err) => {
                if (err) {
                    console.error(`[Producer] Error publishing to topic ${topic}:`, err);
                    reject(err);
                } else {
                    console.log(`[Producer] Successfully published to topic ${topic}:`, msg);
                    resolve();
                }
            });
        });
    }

    const close = async() => {
        return new Promise((resolve, reject) => {
            if (!client) {
                return reject(new Error("No connection to close."));
            }

            client.end(false, {}, (err) => {
                if (err) {
                    console.error(`Error closing connection:`, err);
                    reject(err);
                } else {
                    console.log(`Connection to ${BROKER} closed.`);
                    resolve();
                }
            });
        });
    }

    return {
        connect,
        publish,
        close
    }
}

module.exports = Producer;