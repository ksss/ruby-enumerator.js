#! /usr/bin/env node

var global = (function(){ return this })();

global.Enumerator = require('./enumerator.js').Enumerator;
global.Enumerable = require('./enumerator.js').Enumerable;
global.assert = require('assert');

var test = require('./test.js').test;

for (var key in test) if (test.hasOwnProperty(key)) {
	test[key]();
};
