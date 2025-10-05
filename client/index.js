'use strict';

var fs = require('fs');
var assert = require('assert');
var Centrifuge = require('centrifuge').Centrifuge;

var config = require('./lib/config');

var centrifuge = new Centrifuge(config.centrifugeUrl, config.centrifugeOpts);

var hostname = (config.roomIdOverride || fs.readFileSync('/var/lib/seagl/room-id')).toLowerCase().replaceAll(' ', '_');
var heartbeatChannel = centrifuge.newSubscription('obs_heartbeats');
var hostControlChannel = centrifuge.newSubscription('host_control_' + hostname);

// Connection logging boilerplate

centrifuge.on('connecting', function(ctx) {
	console.log(`Connecting to Centrifugo: ${ctx.code}, ${ctx.reason}`);
}).on('connected', function(ctx) {
	console.log(`Connected to Centrifugo over transport ${ctx.transport}`);
}).on('disconnected', function(ctx) {
	throw new Error(`Disconnected from Centrifugo, code ${ctx.code}, reason ${ctx.reason}`);
}).connect();

for (let sub of [heartbeatChannel, hostControlChannel]) {
	sub.on('publication', function(ctx) {
		console.log(`Received Centrifugo publication from \`${sub.channel}\`:`);
		console.dir(ctx.data);
	}).on('subscribing', function(ctx) {
	        console.log(`Subscribing to Centrifugo channel \`${sub.channel}\`, code ${ctx.code}, reason ${ctx.reason}`);
	}).on('subscribed', function(ctx) {
	        console.log(`Subscribed to Centrifugo channel \`${sub.channel}\`, context:`, ctx);
	}).on('unsubscribed', function(ctx) {
	        var errmsg = `Unsubscribed from Centrifugo channel \`${sub.channel}\`, code ${ctx.code}, reason ${ctx.reason}`;
	        console.error(errmsg);
	        alert(errmsg);
	}).subscribe();
}

// Actual commands

// TODO

