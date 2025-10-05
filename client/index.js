'use strict';

var fs = require('fs');
var assert = require('assert');
var Centrifuge = require('centrifuge').Centrifuge;

var config = require('./lib/config');
var requestExecCmd = require('./lib/cmd/request-exec-cmd');

var centrifuge = new Centrifuge(config.centrifugeUrl, config.centrifugeOpts);

var hostname = (config.roomIdOverride || fs.readFileSync('/var/lib/seagl/room-id')).toLowerCase().replaceAll(' ', '_');
var hostControlChannel = centrifuge.newSubscription('host_control_' + hostname);
var hostTalkbackChanName = 'host_talkback';

// Connection logging boilerplate

centrifuge.on('connecting', function(ctx) {
	console.log(`Connecting to Centrifugo: ${ctx.code}, ${ctx.reason}`);
}).on('connected', function(ctx) {
	console.log(`Connected to Centrifugo over transport ${ctx.transport}`);
}).on('disconnected', function(ctx) {
	throw new Error(`Disconnected from Centrifugo, code ${ctx.code}, reason ${ctx.reason}`);
}).connect();

hostControlChannel.on('publication', function(ctx) {
	console.log(`Received Centrifugo publication from \`${hostControlChannel.channel}\`:`);
	console.dir(ctx.data);
}).on('subscribing', function(ctx) {
        console.log(`Subscribing to Centrifugo channel \`${hostControlChannel.channel}\`, code ${ctx.code}, reason ${ctx.reason}`);
}).on('subscribed', function(ctx) {
        console.log(`Subscribed to Centrifugo channel \`${hostControlChannel.channel}\`, context:`, ctx);
}).on('unsubscribed', function(ctx) {
        throw new Error(`Unsubscribed from Centrifugo channel \`${hostControlChannel.channel}\`, code ${ctx.code}, reason ${ctx.reason}`);
}).subscribe();

// Actual commands

// TODO this is a shitty RPC system. Write a better one.
function emitReply(reqUuid, obj) {
	obj.inReplyTo = reqUuid;
	console.log(`Emitting response to ${reqUuid}:`);
	console.dir(obj);
	return centrifuge.publish(hostTalkbackChanName, obj);
}

function emitError(reqUuid, obj) {
	obj.error = true;
	return emitReply(reqUuid, obj);
}

function emitCmdError(reqUuid, msg) {
	return emitError(reqUuid, { errorMsg: msg });
}

hostControlChannel.on('publication', function(ctx) {
	var reqUuid = ctx.data.reqUuid;
	if (!reqUuid) {
                emitError(null, {
                        msg: 'reqUuid property is missing',
                        rawBody: ctx.data
                });
               return;
        }

	switch (ctx.data.controlMsg) {
		case 'requestExecCmd':
			requestExecCmd(ctx.data, emitCmdError.bind(null, reqUuid), emitReply.bind(null, reqUuid));
			break;
		default:
			emitCmdError(reqUuid, `invalid control message type ${ctx.data.controlMsg}`);
	}
});
