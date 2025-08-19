# Hacking

Some random hopefully helpful notes on how to hack on this codebase.

## Goals

* Simple development and operations
* Instantly responsive, when possible
* Easily testable locally
* No custom server components
* No build step, see "good performance" in non-goals
* Don't build stuff ourselves - this means preferring multiple connectivity options over a unified connectivity option if it means we can use stuff off-the-shelf (this is the rationale for OBS WebSocket connections not going through Centrifugo)

## Non-goals

* Good performance best practices (UW's network is fast - this is why there's e.g. no JS uglifier or even concatenator)
* Always staying in absolute sync with reality - the occasional dropped message is ok, refreshing and waiting 5s or so for heartbeat messages to populate data is ok
* Robust error handling - see above
* Advanced security or ACLs; either users are trusted superusers, or they're unauthorized

## Non-goals, for now

* Operable by a rando volunteer

## Centrifugo channels

### `obs_heartbeat`

Used by all hosts to periodically dump critical OBS information back to the UI.

### `host_control_<host>`

Used to issue commands targeted at individual hosts and receive messages back.
