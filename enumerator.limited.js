// Rubylike.js (https://github.com/ksss/ruby-enumerator.js)
// Copyright (c) 2013 ksss <co000ri@gmail.com>
function Enumerator (obj, method) {
	return (this instanceof Enumerator) ? this.initialize.apply(this, arguments) : new Enumerator(obj, method);
};

(function(){
'use strict';
Enumerator.prototype.method = undefined;
Enumerator.prototype.index = undefined;
Enumerator.prototype.initialize = function (obj, method) {
	switch (typeof obj) {
	case 'undefined':
		return this;
	case 'function':
		method = obj;
		obj = null;
		break;
	}
	this.obj = obj;
	this.method = method || Enumerator.default_method(obj);
	this._index = 0;
	return this;
};
Enumerator.prototype.each = function (callback) {
	if (typeof callback === 'function') {
		return this.method.call(this.obj, callback);
	} else {
		return this;
	}
};
Enumerator.prototype.next = function () {
	var ret = this.peek_values();
	this._index += 1;
	return ret[0];
};
Enumerator.prototype.next_values = function () {
	var ret = this.peek_values();
	this._index += 1;
	return ret;
};
Enumerator.prototype.peek = function () {
	var ret = this.peek_values();
	return ret[0];
};
Enumerator.prototype.peek_values = function () {
	var index = 0;
	var self = this;
	var is_a = (Array.isArray && Array.isArray(this.obj) || toString(this.obj) === '[object Array]')
	var is_default_array = (this.method === Enumerator.default_method.array && is_a);

	if (this._index === undefined) this._index = 0;

	if (is_default_array  && this._index < this.obj.length) {
		return [this.obj[this._index]];
	}

	try {
		this.each(function(i){
			if (index === self._index) {
				if (1 < arguments.length) {
					throw [Array.prototype.slice.call(arguments)];
				} else if (arguments.length === 0) {
					throw [];
				} else {
					throw [i];
				}
			}
			index += 1;
		});
	} catch (e) {
		if (e instanceof Error) throw e;
		return e;
	}
	Enumerator.raise('StopIteration', "iteration reached an end");
};
Enumerator.prototype.rewind = function () {
	this._index = 0;
	if (this.obj && typeof this.obj.rewind === 'function') {
		this.obj.rewind();
	}
	return this;
};
Enumerator.prototype.with_index = function (offset, callback) {
	if (typeof offset === 'function') {
		callback = offset;
		offset = 0;
	}
	offset = offset || 0;
	var self = this;
	var e = Enumerator(function(y){
		self.each(function(i){
			var arg = Array.prototype.slice.call(arguments);
			var len = arg.length;
			if (1 < len) {
				y.call(arg, arg, offset);
			} else {
				y.call(i, i, offset);
			}
			offset += 1;
		});
		return self.obj;
	});

	if (typeof callback === 'function') {
		return e.each(callback);
	} else {
		return e;
	}
};
Enumerator.prototype.with_object = function (obj, callback) {
	var self = this;
	var e = Enumerator(function(y){
		self.each(function(){
			var arg = Array.prototype.slice.call(arguments);
			if (1 < arg.length) {
				y.apply(this, [arg, obj]);
			} else {
				y.apply(this, [arg[0], obj]);
			}
		});
		return obj;
	});

	if (typeof callback === 'function') {
		return e.each(callback);
	} else {
		return e;
	}
};
Enumerator.default_method = function (obj) {
	if (/Array|Arguments/.test(toString(obj))) {
		return Enumerator.default_method.array;
	}
	if (typeof obj === 'object') {
		return Enumerator.default_method.hash;
	}
	return Enumerator.default_method.other;
};
Enumerator.default_method.hash = function(y){
	var handler = 1 < y.length ? 'apply' : 'call';
	for (var key in this) if (this.hasOwnProperty(key)) {
		y[handler](this, [key, this[key]]);
	}
	return this;
};
Enumerator.default_method.array = function (y){
	for (var i = 0, len = this.length; i < len; i += 1) {
		y.call(this, this[i]);
	}
	return this;
};
Enumerator.default_method.other = function (y){
	for (var key in this) if (this.hasOwnProperty(key)) {
		y.call(this, this[key]);
	}
	return this;
};
Enumerator.extend = function (obj) {
	var proto = Enumerator.prototype;
	var extended = [];
	for (var key in proto) {
		if (obj[key] === undefined) {
			obj[key] = proto[key];
			extended.push(key);
		}
	}
	return extended;
};
Enumerator.raise = function (name, message) {
	var error     = new Error(name);
	error.name    = name;
	error.message = message;
	throw error;
};
Enumerator.parallel = function (enumerators) {
	var is_a = (Array.isArray && Array.isArray(enumerators) || toString(enumerators) === '[object Array]')

	for (var key in enumerators) if (enumerators.hasOwnProperty(key)) (function(e){
		enumerators[key] = (e instanceof Enumerator) ? e : Enumerator(e);
	})(enumerators[key]);

	return Enumerator(function(y){
		for (;;) {
			var values = [];
			var num = 0;

			for (var key in enumerators) if (enumerators.hasOwnProperty(key)) (function(e){
				try {
					var next = e.next();
					values.push((is_a) ? next : [key,next]);
					num += 1;
				} catch (ex) {
					if (ex.name === 'StopIteration') {
						values.push((is_a) ? undefined : [key,undefined]);
					} else {
						throw ex;
					}
				}
			})(enumerators[key]);

			if (num === 0) {
				return null;
			} else {
				y(values);
			}
		}
	});
};
function toString (obj) {
	return {}.toString.call(obj);
};

this.Enumerator = Enumerator;

}).call(this);
