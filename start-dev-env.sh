#!/usr/bin/env bash

set -euo pipefail

function die() {
	echo "$@" >&2
	exit 1
}

if ! test -x vendor/centrifugo; then
	echo Downloading Centrifugo...
	mkdir -p vendor/centrifugo.unverified
	curl -L https://github.com/centrifugal/centrifugo/releases/download/v6.2.4/centrifugo_6.2.4_linux_386.tar.gz | tee >(sha256sum > vendor/centrifugo.unverified/downloaded.sha256sum) | tar xvzC vendor/centrifugo.unverified/ centrifugo

	while ! test -f vendor/centrifugo.unverified/downloaded.sha256sum; do sleep 1; done

	echo Verifying Centrifugo checksum...
	if ! grep -q b37dc9f6a3adf3262edc7bd77ca1a9ca1d36a18118abaa95da3b2eff8b88e6d6 vendor/centrifugo.unverified/downloaded.sha256sum; then
		rm -rf vendor/centrifugo.unverified
		die 'Failed to verify Centrifugo (untrusted/corrupted files have been deleted, consider trying again)'
	else
		mv vendor/centrifugo{.unverified,}
		echo Centrifugo set up successfully.
	fi
else
	echo Centrifugo already set up.
fi

echo Starting Python web server in the background, and Centrifugo server in the foreground. ^C will quit both, stdout shows for both.

python3 -m http.server 3000 &
python_pid=$!
trap "kill $python_pid" EXIT
./vendor/centrifugo/centrifugo --config=centrifugo-development-config.json --admin.enabled=true

