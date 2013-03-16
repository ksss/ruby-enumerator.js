#! /usr/bin/env node

var global = (function(){ return this })();

var that = require('./enumerator.js');
global.Enumerator = that.Enumerator;
global.Enumerable = that.Enumerable;
global.assert = require('assert');

var test = require('./test.js').test;

for (var key in test) if (test.hasOwnProperty(key)) {
	test[key]();
};
