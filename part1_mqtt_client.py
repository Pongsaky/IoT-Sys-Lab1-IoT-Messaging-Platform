#!/usr/bin/env python3
"""
IoT Assignment Part 1: MQTT Publisher and Subscriber
Group Name: AiYah
"""

import paho.mqtt.client as mqtt
import json
import time
import sys

# Configuration
BROKER_HOST = "161.200.92.6"
BROKER_PORT = 27004
GROUP_NAME = "AiYah"
MAC_ADDRESS = "02:aa:bb:13:e8:30"  # en0 MAC address

# Topics
PUBLISH_TOPIC = f"IotMsgPlatformPartOne/{GROUP_NAME}"
SUBSCRIBE_TOPIC = "IotMsgPlatformPartOne/respond"

# Global variable to store response
response_received = False
response_data = None


def on_connect(client, userdata, flags, rc):
    """Callback when the client connects to the broker."""
    if rc == 0:
        print(f"✓ Connected to MQTT Broker at {BROKER_HOST}:{BROKER_PORT}")
        print(f"✓ Subscribing to topic: {SUBSCRIBE_TOPIC}")
        client.subscribe(SUBSCRIBE_TOPIC)
    else:
        print(f"✗ Failed to connect, return code {rc}")
        sys.exit(1)


def on_subscribe(client, userdata, mid, granted_qos):
    """Callback when subscription is successful."""
    print(f"✓ Successfully subscribed to {SUBSCRIBE_TOPIC}")


def on_message(client, userdata, msg):
    """Callback when a message is received."""
    global response_received, response_data
    
    print(f"\n{'='*60}")
    print(f"✓ Message received on topic: {msg.topic}")
    print(f"{'='*60}")
    
    try:
        payload = json.loads(msg.payload.decode())
        response_data = payload
        
        print("\nResponse Payload:")
        print(json.dumps(payload, indent=2))
        
        print("\n" + "="*60)
        print("IMPORTANT INFORMATION FOR myCourseVille:")
        print("="*60)
        print(f"Group ID: {payload.get('group_id', 'N/A')}")
        print(f"V2X Topic (for Part 2): {payload.get('v2x_topic', 'N/A')}")
        
        error = payload.get('error', '')
        if error:
            print(f"Error: {error}")
        else:
            print("Status: ✓ No errors")
        print("="*60 + "\n")
        
        response_received = True
        
    except json.JSONDecodeError as e:
        print(f"✗ Error decoding JSON: {e}")
        print(f"Raw payload: {msg.payload.decode()}")


def on_publish(client, userdata, mid):
    """Callback when a message is published."""
    print(f"✓ Message published successfully (Message ID: {mid})")


def on_disconnect(client, userdata, rc):
    """Callback when the client disconnects."""
    if rc != 0:
        print(f"✗ Unexpected disconnection (return code: {rc})")


def main():
    """Main function to run the MQTT client."""
    print("\n" + "="*60)
    print("IoT Assignment Part 1: MQTT Publisher/Subscriber")
    print("="*60)
    print(f"Group Name: {GROUP_NAME}")
    print(f"MAC Address: {MAC_ADDRESS}")
    print(f"Broker: {BROKER_HOST}:{BROKER_PORT}")
    print(f"Publish Topic: {PUBLISH_TOPIC}")
    print(f"Subscribe Topic: {SUBSCRIBE_TOPIC}")
    print("="*60 + "\n")
    
    # Create MQTT client
    client = mqtt.Client(client_id=f"AiYah_Client_{int(time.time())}")
    
    # Set callbacks
    client.on_connect = on_connect
    client.on_subscribe = on_subscribe
    client.on_message = on_message
    client.on_publish = on_publish
    client.on_disconnect = on_disconnect
    
    try:
        # Connect to broker
        print(f"Connecting to broker {BROKER_HOST}:{BROKER_PORT}...")
        client.connect(BROKER_HOST, BROKER_PORT, keepalive=60)
        
        # Start the network loop in a separate thread
        client.loop_start()
        
        # Wait a moment for connection to establish
        time.sleep(2)
        
        # Prepare and publish the message
        payload = {
            "mac_address": MAC_ADDRESS
        }
        
        print(f"\nPublishing to topic: {PUBLISH_TOPIC}")
        print(f"Payload: {json.dumps(payload, indent=2)}\n")
        
        result = client.publish(PUBLISH_TOPIC, json.dumps(payload), qos=1)
        
        if result.rc == mqtt.MQTT_ERR_SUCCESS:
            print("✓ Publish initiated successfully")
        else:
            print(f"✗ Publish failed with code: {result.rc}")
        
        # Wait for response (timeout after 30 seconds)
        print("\nWaiting for response from broker...")
        timeout = 30
        elapsed = 0
        
        while not response_received and elapsed < timeout:
            time.sleep(1)
            elapsed += 1
            if elapsed % 5 == 0:
                print(f"  Still waiting... ({elapsed}s/{timeout}s)")
        
        if response_received:
            print("\n✓ Response received successfully!")
            
            # Summary for myCourseVille submission
            print("\n" + "="*60)
            print("SUMMARY FOR myCourseVille SUBMISSION:")
            print("="*60)
            print(f"1. Group Name: {GROUP_NAME}")
            print(f"2. MAC Address: {MAC_ADDRESS}")
            if response_data:
                print(f"3. V2X Topic: {response_data.get('v2x_topic', 'N/A')}")
            print("="*60 + "\n")
        else:
            print("\n✗ Timeout: No response received within 30 seconds")
            print("  Please check:")
            print("  - Broker connectivity")
            print("  - Topic names are correct")
            print("  - Group name is correct")
        
        # Clean up
        client.loop_stop()
        client.disconnect()
        print("\n✓ Disconnected from broker")
        
    except Exception as e:
        print(f"\n✗ Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()

