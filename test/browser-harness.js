/*
* This must not be TypeScript, as it is to be loaded outside of the TypeScript environment
*/
// @ts-nocheck

const { EventEmitter } = require('events');
const windowEventEmitter = new EventEmitter();

window = {
	addEventListener(event, cb) {
		windowEventEmitter.on(event, cb);
	},
	dispatchEvent(event) {
		windowEventEmitter.emit(event.type, event);
	},
	requestIdleCallback(cb) {
		setImmediate(cb);
	},

	navigator: {
		language: 'i-default',
	},
	console,
};

navigator = window.navigator;

CustomEvent = function(type, initDict) {
	this.type = type;
	this.initDict = initDict;
};

// Simulate a browser interval: Track it in our own array of intervals/timeouts, but make
// it not prevent the NodeJS process from stopping.
// The returned value is the index+1 into the intervals/timeouts array.
const _savedSetInterval = setInterval;
const _savedSetTimeout = setTimeout;

const intervals = [];
setInterval = function(handler, timeout, ...args) {
	const handle = _savedSetInterval(handler, timeout, ...args);
	handle.unref();
	return intervals.push(handle);
}
window.setInterval = setInterval;

const timeouts = [];
setTimeout = function(handler, timeout, ...args) {
	const handle = _savedSetTimeout(handler, timeout, ...args);
	handle.unref();
	return timeouts.push(handle);
}
window.setTimeout = setTimeout;
