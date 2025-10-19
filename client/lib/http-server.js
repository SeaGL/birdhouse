'use strict';

var express = require('express');
var aviaryuiRouter = require('./http-aviaryui');

var app = express();
var PORT = process.env.PORT || 9000;

function startServer() {
	app.use('/aviaryui', aviaryuiRouter);

	app.listen(PORT, () => {
		console.log(`Server running on http://localhost:${PORT}`);
	});
}

module.exports = startServer;
