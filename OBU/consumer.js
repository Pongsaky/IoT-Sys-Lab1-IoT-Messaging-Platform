let {
    setActiveStatus,
    setLatitude,
    setLongitude,
    setSpeed,
    setColor,
} = require('./obu.js');
const mqtt = require('mqtt')

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// setSpeed(number) : Use this function to set the vehicle's speed (km/hr), e.g. setSpeed(50)
// setActiveStatus(boolean) : Use this function to set the vehicle's online status (true=Active, false=Inactive), e.g. setActiveStatus(true)
// setLatitude(number), setLongitude(number) : Use these functions to set the vehicle's location
    // e.g. setLatitude(13.738044), setLongitude(100.529944)
// setColor(string) : Use this function to set the vehicle-pin's color, e.g. setColor("blue")
    // valid colors are "blue", "green", "red", "violet", "yellow", "no"