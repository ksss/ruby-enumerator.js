var eql = Enumerable.eql;
var assert = {};
assert.ok = function (value, message) {
	if (!value) throw new Error(message);
};
assert.strictEqual = function (actual, expected, message) {
	assert.ok(actual === expected, actual + ' !== ' + expected);
};
assert.deepEqual = function (actual, expected, message) {
	if (!eql(actual, expected)) {
		throw new Error (actual + '!==' + expected + ' ' + (message || ''));
	}
};
assert.throws = function(callback, message) {
	var actual; 
	try {
		callback();
	} catch (ex) {
		actual = ex;
	}
	assert.ok(actual !== undefined, message);
};
