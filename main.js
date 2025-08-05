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
	var testData = [{"name":"Lyceum","youtube_id":"uI7gJ8WtQ-I"},{"name":"Room 332","youtube_id":"1lXZnncGgjc"},{"name":"Room 334","youtube_id":"sYKOpPgzWPE"},{"name":"Room 340","youtube_id":"wJfbS8f2Zio"}];

	// Delay by a quarter of a second to simulate network load
	return new Promise(resolve => setTimeout(resolve.bind(null, testData), 250));
}

//
// YOUTUBE STREAM MONITORING
//

(async function() {
	var data = await (loadTestData ? fetchStreamDataTest : fetchStreamDataLive)();

	var ytMonitorEl = document.getElementById('yt-monitor-tab-pane-inner');
	ytMonitorEl.innerHTML = data.map(streamData => {
		// The <div> here is so that Bootstrap flexbox aligns the header and iframe as a single unit
		return `<div>
			<h2>${ streamData.name }</h2>
			<iframe class="embed-responsive-item" src="https://www.youtube-nocookie.com/embed/${ streamData.youtube_id }?autoplay=0&mute=1&cc_load_policy=1&cc_lang_pref=en&modestbranding=1&rel=0" allow="encrypted-media; picture-in-picture" allowfullscreen></iframe>
			</div>`;
	}).reduce((a, b) => a + b);
})();

//
// STREAM CONTROL
//

(function() {
	// TODO	
})();
