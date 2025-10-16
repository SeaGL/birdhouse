'use strict';

var express = require('express');

var app = express();
var PORT = process.env.PORT || 9000;

function startServer() {
	app.get('/birdhouse/set-livestream-state', (req, res) => {
		var state = JSON.parse(req.query.state.toLowerCase());
		console.log('Received request to set livestream state: ' + state);
		// TODO
		res.send();
	});

	app.listen(PORT, () => {
		console.log(`Server running on http://localhost:${PORT}`);
	});
}

module.exports = startServer;
