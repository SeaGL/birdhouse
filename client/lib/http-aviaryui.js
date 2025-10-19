'use strict';

var express = require('express');

var router = express.Router();

router.get('/set-livestream-state', (req, res) => {
	var state = JSON.parse(req.query.state.toLowerCase());
	console.log('Received request to set livestream state: ' + state);
	// TODO
	res.send();
});

module.exports = router;
