'use strict';

var smartSpawn = require('smart-spawn');

var config = require('../config');

function processCommand(obj, emitError, cb) {
	var cmdline = obj.cmdline;

        if (!Array.isArray(cmdline) || cmdline.length === 0) {
                emitError('cmdline is not a populated array');
                return false;
        }

	var allowlist = ['true', 'false', 'echo', 'rpm-ostree'];
	if (
		config.isProduction !== true
		&& (!allowlist.includes(cmdline[0])
		|| (cmdline[0] === 'rpm-ostree' && cmdline[1] !== 'upgrade'))
	) {
		console.error('We are in dev mode, skipping forbidden command execution: ' + cmdline.join(' '));
		process.nextTick(cb.bind(null, {
			stdout: 'Synthesized stdout of forbidden command execution.'
		}));
	} else {
		console.log('Invoking command: ' + cmdline.join(' '));
		smartSpawn(cmdline.shift(), cmdline, process.cwd(), function(err, stdout) {
			// TODO find some way to elegantly pass stdout here
			if (err) return emitError(err.message);

			cb({ stdout });
		});
	}
}

module.exports = processCommand;
