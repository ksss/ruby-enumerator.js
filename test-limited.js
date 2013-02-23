#! /usr/bin/env node

var global = (function(){ return this })();

global.assert = require('assert');
global.Enumerator = require('./enumerator.limited.js').Enumerator;

var test = require('./test.js').test;

var limited = 'each obj next next_values peek peek_values rewind with_index with_object parallel deferred'.split(/\s+/);

for (var i = 0, len = limited.length; i < len; i++) {
	test['test_' + limited[i]]();
}
