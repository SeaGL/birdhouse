'use strict';

var loadTestData = true;

// TODO test this function
function fetchStreamDataLive() {
	return fetch("https://seagl.org/data/schedule.json")
	.then(response => {
		if (!response.ok) {
			console.error(response);
			throw new Error("HTTP status code fetching stream data: " + response.status);
		}
		return response.json();
	})
	.catch(error => {
		console.error(error);
		alert("Stream data fetch error: " + error.message);
	});
}

function fetchStreamDataTest() {
	// 2024's day 2 data, in case you're wondering
	var testData = [{"name":"Lyceum","youtube_id":"uI7gJ8WtQ-I"},{"name":"Virtual Test Room","youtube_id":"1lXZnncGgjc"},{"name":"Room 334","youtube_id":"sYKOpPgzWPE"},{"name":"Room 340","youtube_id":"wJfbS8f2Zio"}];

	// Delay by a quarter of a second to simulate network load
	return new Promise(resolve => setTimeout(resolve.bind(null, testData), 250));
}

(async function() {
	//
	// YOUTUBE STREAM MONITORING
	//

	var data = await (loadTestData ? fetchStreamDataTest : fetchStreamDataLive)();

	var ytMonitorEl = document.getElementById('yt-monitor-tab-pane-inner');
	ytMonitorEl.innerHTML = data.map(streamData => {
		// The <div> here is so that Bootstrap flexbox aligns the header and iframe as a single unit
		return `<div>
			<h2>${ streamData.name }</h2>
			<iframe class="embed-responsive-item" src="https://www.youtube-nocookie.com/embed/${ streamData.youtube_id }?autoplay=0&mute=1&cc_load_policy=1&cc_lang_pref=en&modestbranding=1&rel=0" allow="encrypted-media; picture-in-picture" allowfullscreen></iframe>
			</div>`;
	}).reduce((a, b) => a + b);

	//
	// CENTRIFUGO SETUP
	//

	var centrifuge = new Centrifuge('ws://localhost:8000/connection/websocket', {
		token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM3MjIiLCJpYXQiOjE3NTU1NzM0MjF9._X4rZbCi8LyWNaTtOBlrQzACAyiZgOU3abPoGgldoe4'
	});

	centrifuge.on('connecting', function(ctx) {
		console.log(`Connecting to Centrifugo: ${ctx.code}, ${ctx.reason}`);
	}).on('connected', function(ctx) {
		console.log(`Connected to Centrifugo over transport ${ctx.transport}`);
	}).on('disconnected', function(ctx) {
		var errmsg = `Disconnected from Centrifugo, code ${ctx.code}, reason ${ctx.reason}`;
		console.error(errmsg);
		alert(errmsg);
	}).connect();

	var channelSubs = {};

	var streamToHostChannelMap = Object.fromEntries(data.map(obj => [obj.name, 'host_control_' + obj.name.replaceAll(' ', '_').toLowerCase()]));
	var channelList = Object.values(streamToHostChannelMap);
	channelList.push('host_talkback');

	channelList.forEach(function(channelName) {
		var sub = centrifuge.newSubscription(channelName);
		channelSubs[channelName] = sub;

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
	});

	//
	// HOST CONTROL
	//

	var hostControlTmpl = document.getElementById('host-control-tab-pane-template');
	var hostControlPane = document.getElementById('host-control-tab-pane-inner');
	['__ALL__'].concat(Object.keys(streamToHostChannelMap)).forEach(function(streamName) {
		var controllerNode = hostControlTmpl.cloneNode(true);
		controllerNode.querySelector('.host-control-hostname-heading').textContent = streamName === '__ALL__' ? 'All hosts' : streamName;

		controllerNode.removeAttribute('hidden');
		controllerNode.removeAttribute('id');
		hostControlPane.append(controllerNode);
	});

	document.getElementById('host-control-connecting-msg').hidden = true;
})();
