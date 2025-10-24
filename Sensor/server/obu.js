const { chula_route } = require('./static/chula_route.js');

// ================ Import necessary libraries ================

// ============================================================

let route_counter = 0;
let location_route = null;
let location_runner = null;
let activeStatus = false

process.on('message', async (message) => {
	const { type, value } = message;
	console.log('Message from parent:', type, value);
	if (type === 'speed') {
		// this section receives vehicle's speed (km/hr) from the frontend, e.g. 50
		// you should send a payload containing the value to the "<topic>/speed" topic

		// =================== Add your code below ========================

		// ================================================================

	} else if (type === 'heartbeat') {
		// this section receives vehicle's active status from the frontend, e.g. ACTIVE, INACTIVE
		// the ACTIVE and INACTIVE must be converted to a boolean, ACTIVE=true and INACTIVE=false, before publishing
		// you should send a payload containing the value to the "<topic>/heartbeat" topic

		// =================== Add your code below ========================

		// ================================================================

	} else if (type === 'route') {
		// this section receives vehicle's position from the frontend
		// you must modify the "change_route" function below

		if (location_route) {
			clear_route();
		}
		if (value === 'chula') {
			change_route('chula', chula_route);
		}
	}
});

process.on('SIGTERM', () => {
	console.log('Received SIGTERM. Shutting down gracefully...');
	if (location_runner) {
		clearInterval(location_runner);
	}
	process.exit(0);
});

function change_route(route_name, position_route) {
	location_route = route_name;
	location_runner = setInterval(() => {
		
		// This section reads the lat, long, color from static/chula_route.js
		// e.g. latitude = 13.738044, longitude = 100.529944, color = red
		route_counter = (route_counter + 1) % chula_route.length;
		let msg = JSON.stringify({
			latitude: position_route[route_counter].latitude,
			longitude: position_route[route_counter].longitude,
			color: position_route[route_counter].color
		})

		// =================== Add your code below ========================
		// you should send a payload containing the latitude, longitude, and color to the "<topic>/route" topic

		// ================================================================
	}, 1000);
}

function clear_route() {
	clearInterval(location_runner);
	location_route = null;
	console.log('Cleared previous route');
}
