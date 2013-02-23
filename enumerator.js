/**
 * @fileOverview ruby-enumerator.js
 * @author ksss
 * @version 0.0.1
 * @license
 * ruby-enumerator.js Copyright (c) 2013 ksss <co000ri@gmail.com>
 *
 * https://github.com/ksss/ruby-enumerator.js
 *
 * License:: MIT
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/**
 * Enumerable is an API that can be mixin other objects.
 * All method of Enumerable use `each` method.
 * But Enumerable don't have `each` method.
 * Therefore, object.prototype to mixin must have `each` method.
 *
 * @class Enumerable
 */
function Enumerable () {
};

/**
 * Create a Enumerator object.
 *
 * @call_see
 *   var e = new Enumerator([object,] callback);
 *   // or
 *   var e = Enumerator([object,] callback);
 *
 * @class Enumerator
 * @constructor
 */
function Enumerator (obj, method) {
	return (this instanceof Enumerator) ? this.initialize.apply(this, arguments) : new Enumerator(obj, method);
};

(function(){
'use strict';

// {{{ Enumerable
/**
 * @lends Enumerable
 */

/**
 * Return true when all object == true or all callback returns true.
 *
 * @call_see
 *   all() -> bool
 *   all(callback) -> bool
 *
 * @example
 *   Enumerator(function(y){
 *     y(true); y('1'); y(1);
 *   }).all();
 *   //=> true
 *
 * @example
 *   Enumerator(function(y){
 *     y(10); y(15); y(32);
 *   }).all(function(i){
 *     return i % 5 === 0;
 *   });
 *   //=> false
 *
 * @return {bool}
 */
Enumerable.prototype.all = function (callback) {
	var self = this;
	try {
		if (typeof callback === 'function') {
			return Enumerator(function(y){
				var alen;
				var handler = 1 < y.length ? 'apply' : 'call';
				self.each(function(i){
					alen = alen || arguments.length;
					if (1 < alen) {
						if (!y.apply(this, arguments)) throw false;
					} else {
						if (!y[handler](this, i)) throw false;
					}
				});
				return true;
			}).each(callback);
		} else {
			this.each(function(i){
				if (!i) throw false;
			});
		}
	} catch (ex) {
		if (ex instanceof Error) throw ex;
		return ex;
	}
	return true;
};

/**
 * Return false when all object == false.
 *
 * @call_see
 *   any() -> bool
 *   any(callback) -> bool
 *
 * @example
 *   Enumerator(function(y){
 *     y(true); y(''); y(0);
 *   }).any();
 *   //=> true
 *
 * @example
 *   Enumerator(function(y){
 *     y(11); y(16); y(32);
 *   }).any(function(i){
 *     return i % 5 === 0;
 *   });
 *   //=> false
 *
 * @return {bool}
 */
Enumerable.prototype.any = function (callback) {
	var self = this;
	try {
		if (typeof callback === 'function') {
			return Enumerator(function(y){
				var alen;
				var handler = 1 < y.length ? 'apply' : 'call';
				self.each(function(i){
					alen = alen || arguments.length;
					if (1 < alen) {
						if (y.apply(this, arguments)) throw true;
					} else {
						if (y[handler](this, i)) throw true;
					}
				});
				return false;
			}).each(callback);
		} else {
			this.each(function(i){
				if (i) throw true;
			});
		}
	} catch (ex) {
		if (ex instanceof Error) throw ex;
		return ex;
	}
	return false;
};

/**
 * Split by callback return value.
 * `initial_state` is keep value object when to chunk need change state.
 *
 * @call_see
 *   chunk(function) -> Enumerator
 *   chunk(initial_state, function) -> Enumerator
 *
 * @example
 *   Enumerator([1,3,4,6,7]).chunk(function(i){
 *     //=> (call number:value)
 *     console.log(i) //=> (1:1, 2:3, 3:4, 5:6, 6:7)
 *     return i % 2 === 0;
 *   }).each(function(c,items){
 *     console.log([c,items]); //=> (4:[false,[1,3]], 7:[true,[4,6]], 8:[false:[7]])
 *   });
 *
 * @param {Array|Object} initial_state
 * @param {function(*,Array|Object):*} callback
 * @return {Enumerator}
 */
Enumerable.prototype.chunk = function (initial_state, callback) {
	switch (arguments.length) {
	case 1:
		callback = initial_state;
		initial_state = undefined;
		break;
	case 2:
		// clone initial_state
		var str = toString(initial_state);
		if (/Array/.test(str)) {
			initial_state = Array.prototype.slice.call(initial_state);
		} else if (!/Number|String/.test(str)) {
			var dup = function(){};
			dup.prototype = initial_state;
			initial_state = new dup();
		} else {
			Enumerator.raise('TypeError', "can't clone " + str);
		}
		break;
	}

	if (typeof callback !== 'function') {
		Enumerator.raise('ArgumentError', "no callback given");
	}

	var self = this;
	var c_handler = 1 < callback.length ? 'apply' : 'call';

	return Enumerator(function(y){
		var answer, before, flg = false, chosen = [];
		self.each(function(i){
			var arg = Array.prototype.slice.call(arguments);
			if (initial_state) {
				if (1 < arg.length) {
					answer = callback.apply(this, [arg, initial_state]);
				} else {
					answer = callback.apply(this, [i, initial_state]);
				}
			} else {
				if (1 < arg.length) {
					answer = callback.apply(this, arg);
				} else {
					answer = callback[c_handler](this, i);
				}
			}

			if (answer === null) {
				return;
			} else if (flg === true && answer !== before) {
				y(before, chosen);
				chosen = [];
			} else {
				flg = true;
			}
			if (1 < arg.length) {
				chosen.push(arg);
			} else {
				chosen.push(i);
			}
			before = answer;
		});
		y(before, chosen);
		return null;
	});
};

/**
 * Create a new Array by callback
 *
 * @call_see
 *   collect() -> Enumerator
 *   collect(callback) -> Enumerator([object])
 *   map() -> Enumerator
 *   map(callback) -> Enumerator([object])
 *
 * @example
 *   var a = Enumerator([10,16,30]).collect(function(i){
 *     return i % 5 === 0;
 *   }).to_a();
 *   console.log(a); //=> [true, false, true]
 *
 * @param {function(*):*} callback
 * @return {Enumerator}
 */
Enumerable.prototype.collect = function (callback) {
	var self = this;
	var e = Enumerator(function(y){
		var handler = 1 < y.length ? 'apply' : 'call';
		var ret = [];
		self.each(function(i){
			var arg = Array.prototype.slice.call(arguments);
			if (1 < arg.length) {
				ret.push(y.apply(this, arg));
			} else {
				ret.push(y[handler](this, i));
			}
		});
		return Enumerator(ret);
	});

	if (typeof callback === 'function') {
		return e.each(callback);
	} else {
		return e;
	}
};
Enumerable.prototype.map = Enumerable.prototype.collect;

/**
 * Count objects.
 *
 * @call_see
 *   count() -> Number
 *   count(item) -> Number
 *   count(callback) -> Number
 *
 * @example
 *   Enumerator([10,16,30]).count(); //=> 3
 *   Enumerator([10,16,30]).count(10); //=> 1
 *   Enumerator([10,16,30]).count(function(i){ return i % 5 === 0 }); //=> 2
 *
 * @param {*} [object]
 * @return {number}
 */
Enumerable.prototype.count = function (object) {
	if (arguments.length === 0) {
		if (typeof this.size === 'function') {
			return this.size();
		} else {
			return this.to_a().length;
		}
	}

	var count = 0;
	if (typeof object === 'function') {
		var handler = 1 < object.length ? 'apply' : 'call';
		this.each(function(i){
			var arg = Array.prototype.slice.call(arguments);
			if (1 < arg.length) {
				if (object.apply(this, arg)) count++;
			} else {
				if (object[handler](this, i)) count++;
			}
		});
	} else {
		this.each(function(i){
			var arg = Array.prototype.slice.call(arguments);
			if (1 < arg.length) {
				if (Enumerable.eql(object, arg)) count++;
			} else {
				if (Enumerable.eql(object, i)) count++;
			}
		});
	}
	return count;
};

/**
 * Enumerator repeated specified number of times.
 *
 * @call_see
 *   cycle(n) -> Enumerator
 *   cycle(n, callback) -> null
 *
 * @example
 *   Enumerator([1,2,3]).cycle(3).each(function(i){
 *     console.log(i) //=> 1,2,3,1,2,3,1,2,3
 *   });
 *
 * @param {number} n count of enumerator cycle.
 * @param {function(*):*} callback cycle function.
 * @return {Enumerator|null}
 */
Enumerable.prototype.cycle = function (n, callback) {
	switch (arguments.length) {
	case 0:
		Enumerator.raise('ArgumentError', "wrong number of arguments ("+arguments.length+" for 1)");
		break;
	case 1:
		if (typeof n !== 'number') {
			Enumerator.raise('TypeError', "must set cycle count");
		}
		break;
	}

	var obj = {};
	var self = this;
	var e = Enumerator(function(y){
		var handler = 1 < y.length ? 'apply' : 'call';
		for (var i = 0; i < n; i += 1) {
			var index = 0;
			self.each(function(i){
				var arg = Array.prototype.slice.call(arguments);
				if (!obj.hasOwnProperty(index)) obj[index] = arg;
				if (1 < arg.length) {
					y.apply(this, obj[index]);
				} else {
					y[handler](this, obj[index][0]);
				}
				index += 1;
			});
		}
		return null;
	});

	if (typeof callback === 'function') {
		return e.each(callback);
	} else {
		return e;
	}
};

/**
 * Drop first something.
 *
 * @call_see
 *   drop(n) -> Enumerator
 *
 * @example
 *   Enumerator(function(y){
 *     y(10); y(16); y(30);
 *   }).drop(1).to_a();
 *   //=> [16,30]
 *
 * @param {Number} n count of drop from Enumerator
 * @return {Enumerator}
 */
Enumerable.prototype.drop = function (n) {
	var ret = [];
	var index = 0;

	this.each(function(i){
		if (n <= index) {
			var arg = Array.prototype.slice.call(arguments);
			if (1 < arg.length) {
				ret.push(arg);
			} else {
				ret.push(i);
			}
		}
		index += 1;
	});
	return Enumerator(ret);
};

/**
 * Drop while callback is true.
 *
 * @call_see
 *   drop_while() -> Enumerator
 *   drop_while(callback) -> Enumerator
 *
 * @example
 *   var a = Enumerator(function(y){
 *     y(10); y(16); y(30);
 *   }).drop_while(function(i){
 *     return i % 5 === 0
 *   }).to_a();
 *   console.log(a); //=> [16,30]
 *
 * @return {Enumerator}
 */
Enumerable.prototype.drop_while = function (callback) {
	var self = this;
	var e = Enumerator(function(y){
		var handler = 1 < y.length ? 'apply' : 'call';
		var flg = false;
		var ret = [];
		self.each(function(i){
			var arg = Array.prototype.slice.call(arguments);
			if (1 === arg.length) {
				arg = arg[0];
			}

			if (!flg && !y[handler](this, arg)) flg = true;

			if (flg) {
				ret.push(arg);
			}
		});
		return Enumerator(ret);
	});

	if (typeof callback === 'function') {
		return e.each(callback);
	} else {
		return e;
	}
};

/**
 * Slice repeated by `n`.
 *
 * @call_see
 *   each_cons(n) -> Enumerator
 *   each_cons(n, callback) -> null
 *
 * @example
 *   Enumerator([1,2,3,4]).each_cons(2).each(function(i){
 *     console.log(i) //=> [1,2], [2,3], [3,4]
 *   });
 *
 * @param {number} n size of cons array.
 * @param {function(*):*} callback each cons function.
 * @return {Enumerator|null}
 */
Enumerable.prototype.each_cons = function (n, callback) {
	switch (arguments.length) {
	case 0:
		Enumerator.raise('ArgumentError', "wrong number of arguments ("+arguments.length+" for 1)");
		break;
	case 1:
		if (typeof n !== 'number') {
			Enumerator.raise('TypeError', "must set cons num");
		}
		break;
	}

	var self = this;
	var e = Enumerator(function(y){
		var pool = [];
		var index = 1;
		var handler = 1 < y.length ? 'apply' : 'call';
		self.each(function(i){
			var arg = Array.prototype.slice.call(arguments);
			if (1 < arg.length) {
				pool.push(arg);
			} else {
				pool.push(i);
			}
			if (n <= index) {
				y[handler](this, pool.slice(index - n, index));
			}
			index += 1;
		});
		return null;
	});

	if (typeof callback === 'function') {
		return e.each(callback);
	} else {
		return e;
	}
};

/**
 * Slice by `n`.
 *
 * @call_see
 *   each_slice(n) -> Enumerator
 *   each_slice(n, callback) -> null
 *
 * @example
 *   Enumerator([1,2,3,4]).each_slice(2).each(function(i){
 *     console.log(i) //=> [1,2], [3,4]
 *   });
 *
 * @param {number} n size of slice array.
 * @param {function(*):*} callback each cons function.
 * @return {Enumerator|null}
 */
Enumerable.prototype.each_slice = function (n, callback) {
	var index = 1;
	var pool = [];
	var self = this;
	var e = Enumerator(function(y){
		var handler;
		self.each(function(i){
			var arg = Array.prototype.slice.call(arguments);
			if (1 < arg.length) {
				pool.push(arg);
			} else {
				pool.push(i);
			}
			if (index % n === 0) {
				handler = handler || ((1 < y.length) ? 'apply' : 'call');
				y[handler](pool, pool);
				pool = [];
			}
			index += 1;
		});
		y[handler || 'call'](pool, pool);
		return null;
	});

	if (typeof callback === 'function') {
		return e.each(callback);
	} else {
		return e;
	}
};

/**
 * Same Enumerator#with_index. but can't set offset.
 * @see Enumerator#with_index
 */
Enumerable.prototype.each_with_index = function (callback) {
	var offset = 0;
	var self = this;
	var e = Enumerator(function(y){
		self.each(function(i){
			var arg = Array.prototype.slice.call(arguments);
			if (1 < arg.length) {
				y.call(this, arg, offset);
			} else {
				y.call(this, i, offset);
			}
			offset += 1;
		});
		return self;
	});

	if (typeof callback === 'function') {
		return e.each(callback);
	} else {
		return e;
	}
};

/**
 * Same Enumerator#with_object.
 * @see Enumerator#with_object.
 */
Enumerable.prototype.each_with_object = function (obj, callback) {
	var self = this;
	var e = Enumerator(function(y){
		self.each(function(i){
			var arg = Array.prototype.slice.call(arguments);
			if (1 < arg.length) {
				y.call(this, arg, obj);
			} else {
				y.call(this, i, obj);
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

/**
 * Returns the first for which callback is not false.
 * If no object matches, return `ifnone` when it is specified or return null otherwise.
 *
 * @call_see
 *   find(ifnone = null) -> Enumerator
 *   find(ifnone = null, callback) -> object or null
 *   detect(ifnone = null) -> Enumerator
 *   detect(ifnone = null, callback) -> object or null
 *
 * @example
 *   Enumerator(function(y){
 *     y(10); y(16); y(30);
 *   }).find(function(i){
 *     return i % 5 !== 0;
 *   });
 *   //=> 16
 *
 * @param {*} ifnone
 * @param {function(*):bool} callback
 * @return {Enumerator|*}
 */
Enumerable.prototype.find = function (ifnone, callback) {
	if (arguments.length === 1) {
		callback = ifnone;
		ifnone = null;
	}
	var self = this;
	var e = Enumerator(function(y){
		var handler = 1 < y.length ? 'apply' : 'call';
		try {
			self.each(function(i){
				var arg = Array.prototype.slice.call(arguments);
				if (1 < arg.length) {
					if (y.apply(this, arg)) throw arg;
				} else {
					if (y[handler](this, i)) throw i;
				}
			});
		} catch (ex) {
			if (ex instanceof Error) throw ex;
			return ex;
		}
		return ifnone;
	});

	if (typeof callback === 'function') {
		return e.each(callback);
	} else {
		return e;
	}
};
Enumerable.prototype.detect = Enumerable.prototype.find;

/**
 * Same `find`. But return index.
 * If no object matches, return null.
 *
 * @call_see
 *   find_index() -> Enumerator
 *   find_index(callback(item)) -> Number | null
 *
 * @param {function(*):*} callback
 */
Enumerable.prototype.find_index = function (callback) {
	var self = this;
	var e = Enumerator(function(y){
		var index = 0;
		var handler = 1 < y.length ? 'apply' : 'call';
		try {
			self.each(function(i){
				var arg = Array.prototype.slice.call(arguments);
				if (1 < arg.length) {
					if (y.apply(this, arg)) throw index;
				} else {
					if (y[handler](this, i)) throw index;
				}
				index += 1;
			});
		} catch (ex) {
			if (ex instanceof Error) throw ex;
			return ex;
		}
		return null;
	});

	if (typeof callback === 'function') {
		return e.each(callback);
	} else {
		return e;
	}
};

/**
 * Take first some objects.
 * If object is empty then return undefined.
 *
 * @call_see
 *   first() -> object | undefined
 *   first(n) -> Enumerator
 *
 * @example
 *   var e = Enumerator(function(y){
 *     for (var i = 10;; i++) {
 *       y(i);
 *     }
 *   });
 *   console.log(e.first()); //=> 10
 *   console.log(e.first(3).to_a()); //=> [10,11,12]
 *   console.log(Enumerator([]).first()); //=> undefined
 *
 * @param {Number} n
 * @return {Number|undefined|Enumerator}
 */
Enumerable.prototype.first = function (n) {
	if (arguments.length === 0) {
		return this.take(1).to_a()[0];
	} else {
		return this.take(n);
	}
};

/**
 * Return map and concat Enumerator(Array).
 * Callback must return array.
 *
 * @call_see
 *   flat_map() -> Enumerator
 *   flat_map(callback(Array)) -> Enumerator(Array)
 *   collect_concat() -> Enumerator
 *   collect_concat(callback(Array)) -> Enumerator(Array)
 *
 * @example
 *   var flat = Enumerator({'a':1,'b':2}).flat_map(function(i,j){
 *     return i;
 *   }).to_a();
 *   console.log(flat); //=> ['a','b']
 * @return
 */
Enumerable.prototype.flat_map = function (callback) {
	var self = this;
	var e = Enumerator(function(y){
		var array = [];
		var maped = self.collect(y).each(function(i){
			if (Array.isArray(i)) {
				array = array.concat(i);
			} else {
				array.push(i);
			}
		});
		return Enumerator(array);
	});

	if (typeof callback === 'function') {
		return e.each(callback);
	} else {
		return e;
	}
};
Enumerable.prototype.collect_concat = Enumerable.prototype.flat_map;

/**
 * Search and return all match object into Array.
 *
 * @call_see
 *   grep(pattern) -> Enumeratelemr
 *   grep(pattern, callback) -> Enumerator
 *
 * @example
 *   var e = Enumerator([10,16,30]);
 *   console.log(e.grep(/10|30/).to_a()); //=> [10,30]
 *   console.log(e.grep(10).to_a()); //=> [10]
 *   console.log(e.grep(/\d+/, function(i){
 *     return i < 15;
 *   }).to_a());
 *   //=> [true, false, false]
 *
 * @param {object} pattern
 * @param {function(*):*} callback
 * @return {Enumerator}
 */
Enumerable.prototype.grep = function (pattern, callback) {
	var ret = [];

	if (pattern instanceof RegExp) {
		this.each(function(i){
			var arg = Array.prototype.slice.call(arguments);
			if (arg.length === 1) {
				arg = arg[0];
			}
			if (pattern.test(arg)) ret.push(arg);
		});
	} else {
		this.each(function(i){
			var arg = Array.prototype.slice.call(arguments);
			if (arg.length === 1) {
				arg = arg[0];
			}
			if (Enumerable.eql(arg, pattern)) ret.push(arg);
		});
	}

	var e = Enumerator(ret);
	if (typeof callback === 'function') {
		return e.collect(callback);
	} else {
		return e;
	}
};

/**
 * Create Hash of Enumerator by result of the callback
 *
 * @call_see
 *   group_by() -> Enumerator
 *   group_by(callback) -> Enumerator
 *
 * @example
 *   var e = Enumerator([10,16,30]);
 *   var hash = e.group_by(function(i){
 *     return i % 5 === 0 ? 't' : 'f';
 *   }).obj;
 *   console.log(hash) //=> {'t':[10,30], 'f':[16]}
 *
 * @return {Enumerator}
 */
Enumerable.prototype.group_by = function (callback) {
	var self = this
	var e = Enumerator(function(y){
		var hash = {};
		var handler = 1 < y.length ? 'apply' : 'call';
		self.each(function(i){
			var arg = Array.prototype.slice.call(arguments);
			var key;
			if (1 < arg.length) {
				key = y.apply(this, arg);
			} else {
				key = y[handler](this, i);
			}
			if (!hash.hasOwnProperty(key)) {
				hash[key] = [];
			}
			if (1 < arg.length) {
				hash[key].push(arg);
			} else {
				hash[key].push(i);
			}
		});
		return Enumerator(hash);
	});

	if (typeof callback === 'function') {
		return e.each(callback);
	} else {
		return e;
	}
};

/**
 * Return true if find object.
 *
 * @call_see
 *   include(val) -> bool
 *   member(val) -> bool
 *
 * @example
 *   var e = Enumerator([10,16,{'a':1}]);
 *   console.log(e.include(16)); //=> true
 *   console.log(e.include(15)); //=> false
 *   console.log(e.include({'a':1})); //=> true
 *
 * @return {bool}
 */
Enumerable.prototype.include = function (val) {
	try {
		this.each(function(i){
			var arg = Array.prototype.slice.call(arguments);
			if (1 < arg.length) {
				if (Enumerable.eql(arg, val)) throw true;
			} else {
				if (Enumerable.eql(i, val)) throw true;
			}
		});
	} catch (e) {
		if (e instanceof Error) throw e;
		return true;
	}
	return false;
};
Enumerable.prototype.member = Enumerable.prototype.include

/**
 * Combines all object of Enumerator.
 *
 * @call_see
 *   inject(init = this.first(), callback(result, item)) -> object
 *   reduce(init = this.first(), callback(result, item)) -> object
 *
 * @example
 *   var e = Enumerator([10,16,30]);
 *   console.log(e.inject(function(r, i){ return r + i })); //=> 56
 *   console.log(e.inject(2, function(r, i){ return r * i })); //=> 9600
 *
 * @param {*} init initial value
 * @param {function(memo, object):*} callback
 */
Enumerable.prototype.inject = function (init, callback) {
	this.each(function(i){
		var arg = Array.prototype.slice.call(arguments);
		if (1 < arg.length) {
			i = arg;
		}
		if (callback === undefined) {
			callback = init;
			if (typeof callback !== 'function') {
				Enumerator.raise('LocalJumpError', "no callback given");
			}
			init = i;
		} else {
			init = callback.call(this, init, i);
		}
	});
	return init;
};
Enumerable.prototype.reduce = Enumerable.prototype.inject;

/**
 * Return maximum value in Enumerator.
 *
 * @call_see
 *   max() -> object | null
 *   max(callback(a,b)) -> object | null
 *
 * @example
 *   var e = Enumerator([2,-2,10]);
 *   console.log(e.max()); //=> 10
 *   console.log(e.max(function(a,b){ return b - a })); //=> -2
 *
 * @param {function(a,b):Number} callback
 */
Enumerable.prototype.max = function (callback) {
	var pool = [];
	var index = 0;
	var first_class;
	var ship = (typeof callback === 'function') ? callback : function (a, b) {
		if (a < b) return -1;
		if (a > b) return 1;
		return 0;
	};

	function first_atomic (obj) {
		if (toString(obj) === '[object Object]') {
			for (var key in obj) return first_atomic(key);
		}
		return obj;
	};

	this.each(function(i){
		var arg = Array.prototype.slice.call(arguments);
		if (1 < arg.length) {
			i = arg;
		}
		pool.unshift(i);
		if (0 === index) {
			first_class = toString(first_atomic(i));
		} else {
			var result = ship.call(this, pool[0], pool[1]);
			var check_class = toString(first_atomic(i));
			if (check_class !== first_class || result instanceof Number) {
				Enumerator.raise('ArgumentError', "comparison of "+check_class+" with "+pool[1]+" failed");
			}
			pool[(0 < result) ? 'pop' : 'shift']()
		}
		index += 1;
	});
	if (pool.length === 0) return null;
	return pool[0];
};

/**
 * Return maximum value in Enumerator by callback.
 *
 * @call_see
 *   max_by() -> Enumerator
 *   max_by(callback) -> object | null
 *
 * @example
 *   var e = Enumerator([1,2,-3]);
 *   console.log(e.max_by(function(i){ return Math.abs(i) }); //=> -3
 *
 * @return {Enumerator|object|null}
 */
Enumerable.prototype.max_by = function (callback) {
	var self = this
	var e = Enumerator(function(y){
		var handler = 1 < y.length ? 'apply' : 'call';
		return self.collect(function(i){
			var arg = Array.prototype.slice.call(arguments);
			if (1 < arg.length) {
				return [y.apply(this, arg), arg];
			} else {
				return [y[handler](this, i), i];
			}
		}).max(function(a, b){
			if (a[0] < b[0]) return -1;
			if (a[0] > b[0]) return 1;
			return 0;
		})[1];
	});

	if (typeof callback === 'function') {
		return e.each(callback);
	} else {
		return e;
	}
};

/**
 * Return minimum value in Enumerator.
 *
 * @call_see
 *   min() -> object | null
 *   min(callback(a,b)) -> object | null
 *
 * @example
 *   var e = Enumerator([2,-2,10]);
 *   console.log(e.min()); //=> -2
 *   console.log(e.min(function(a,b){ return b - a })); //=> 10
 *
 * @param {function(a,b):Number} callback
 */
Enumerable.prototype.min = function (callback) {
	var pool = [];
	var index = 0;
	var first_class;
	var ship = (typeof callback === 'function') ? callback : function (a,b) {
		if (a < b) return -1;
		if (a > b) return 1;
		return 0;
	};

	function first_atomic (obj) {
		if (toString(obj) === '[object Object]') {
			for (var key in obj) return first_atomic(key);
		}
		return obj;
	};

	this.each(function(i){
		var arg = Array.prototype.slice.call(arguments);
		if (1 < arg.length) {
			i = arg;
		}
		pool.unshift(i);
		if (0 === index) {
			first_class = toString(first_atomic(i));
		} else {
			var result = ship.call(this, pool[0], pool[1]);
			var check_class = toString(first_atomic(i));
			if (check_class !== first_class || result instanceof Number) {
				Enumerator.raise('ArgumentError', "comparison of "+check_class+" with "+pool[1]+" failed");
			}
			pool[(result < 0) ? 'pop' : 'shift']()
		}
		index += 1;
	});
	if (pool.length === 0) return null;
	return pool[0];
};

/**
 * Return minimum value in Enumerator by callback.
 *
 * @call_see
 *   min_by() -> Enumerator
 *   min_by(callback) -> object | null
 *
 * @example
 *   var e = Enumerator([1,2,-3]);
 *   console.log(e.min_by(function(i){ return Math.abs(i) }); //=> 1
 *
 * @return {Enumerator|object|null}
 */
Enumerable.prototype.min_by = function (callback) {
	var self = this
	var e = Enumerator(function(y){
		var handler = 1 < y.length ? 'apply' : 'call';
		return self.collect(function(i){
			var arg = Array.prototype.slice.call(arguments);
			if (1 < arg.length) {
				return [y.apply(this, arg), arg];
			} else {
				return [y[handler](this, i), i];
			}
		}).min(function(a, b){
			if (a[0] < b[0]) return -1;
			if (a[0] > b[0]) return 1;
			return 0;
		})[1];
	});

	if (typeof callback === 'function') {
		return e.each(callback);
	} else {
		return e;
	}
};

/**
 * Return two values that minimum and miximum.
 *
 * @call_see
 *   minmax() -> Enumerator([object, object])
 *   minmax(callback) -> Enumerator([object, object])
 *
 * @example
 *   console.log(e.minmax().obj) //=> [-3, 2]
 *   console.log(e.minmax(function(a,b){
 *     return b - a;
 *   }).obj);
 *   //=> [2, -3]
 *
 * @return {Enumerator}
 */
Enumerable.prototype.minmax = function (callback) {
	var max = this.max(callback);
	var min = this.min(callback);
	return Enumerator([min, max]);
};

/**
 * Return two values that minimum and miximum by callback.
 *
 * @call_see
 *   minmax_by() -> Enumerator
 *   minmax_by(callback) -> Enumerator([object, object])
 *
 * @example
 *   var e = Enumerator([2,-3,1]);
 *   console.log(e.minmax_by(function(i){
 *     return Math.abs(i);
 *   }).obj);
 *   //=> [1, -3]
 *
 * @return {Enumerator}
 */
Enumerable.prototype.minmax_by = function (callback) {
	var self = this;
	var e = Enumerator(function(y){
		var handler = (1 < y.length) ? 'apply' : 'call';
		var ret = self.collect(function(i){
			var arg = Array.prototype.slice.call(arguments);
			if (1 < arg.length) {
				return [y.apply(this, arg), arg];
			} else {
				return [y[handler](this, i), i];
			}
		}).minmax(function(a, b){
			if (a[0] < b[0]) return -1;
			if (a[0] > b[0]) return 1;
			return 0;
		}).obj;
		return Enumerator([ret[0][1], ret[1][1]]);
	});

	if (typeof callback === 'function') {
		return e.each(callback);
	} else {
		return e;
	}
};

/**
 * Return true if all object is false.
 *
 * @call_see
 *   none([callback(item)]) -> true or false
 *
 * @example
 *   var e = Enumerator(['ant', 'bear', 'cat']);
 *   console.log(e.none(function(word){ return word.length === 5 })); //=> true
 *   console.log(e.none(function(word){ return word.length >= 4 })); //=> false
 *   console.log(Enumerator([]).none()); //=> true
 *
 * @return {bool}
 */
Enumerable.prototype.none = function (callback) {
	return !this.any.apply(this, arguments);
};

/**
 * Return true when true is one object in all object.
 *
 * @call_see
 *   one([callback]) -> true or false
 *
 * @example
 *   var e = Enumerator(['ant', 'bear', 'cat']);
 *   console.log(e.one(function(i){ return i.length === 4 })); //=> true
 *
 * @return {bool}
 */
Enumerable.prototype.one = function (callback) {
	var count = 0;
	try {
		if (typeof callback === 'function') {
			var handler = (1 < callback.length) ? 'apply' : 'call';
			var alen;
			this.each(function(i){
				var answer;
				alen = alen || arguments.length;
				if (1 < alen) {
					answer = callback.apply(this, arguments);
				} else {
					answer = callback[handler](this, arguments[0]);
				}

				if (answer) {
					count += 1;
					if (1 < count) throw false;
				}
			});
		} else {
			this.each(function(i){
				if (i) {
					count += 1;
					if (1 < count) throw false;
				}
			});
		}
	} catch (e) {
		if (e instanceof Error) throw e;
		return e;
	};
	return (count === 1);
};

/**
 * Returns two arrays what callback return true and false.
 *
 * @call_see
 *   partition() -> Enumerator
 *   partition(callback(item)) -> Enumerator([true_array, false_array])
 *
 * @example
 *   var e = Enumerator(1,2,3);
 *   console.log(e.partition(function(i){
 *     return i % 2 === 0;
 *   }).to_a());
 *   //=> [[2],[1,3]]
 *
 * @return {Enumerator}
 */
Enumerable.prototype.partition = function (callback) {
	var self = this;
	var e = Enumerator(function(y){
		var partition = [[],[]];
		var handler = (1 < y.length) ? 'apply' : 'call';
		self.each(function(i){
			var arg = Array.prototype.slice.call(arguments);
			if (1 < arg.length) {
				i = arg;
			}
			if (y[handler](this,i)) {
				partition[0].push(i);
			} else {
				partition[1].push(i);
			}
		});
		return Enumerator(partition);
	});

	if (typeof callback === 'function') {
		return e.each(callback);
	} else {
		return e;
	}
};

/**
 * Return array if callback return false.
 *
 * @call_see
 *   reject() -> Enumerator
 *   reject(callback) -> Enumerator([object])
 *
 * @example
 *   var e = Enumerator([10, 16, 30]);
 *   console.log(e.reject(function(i){
 *     return i % 5 === 0;
 *   }).to_a());
 *   //=> [16]
 *
 * @return {Enumerator}
 */
Enumerable.prototype.reject = function (callback) {
	var self = this;
	var e = Enumerator(function(y){
		var ret = [];
		var alen;
		var handler = (1 < y.length) ? 'apply' : 'call';
		self.each(function(i){
			alen = alen || arguments.length;
			if (1 < alen) {
				var arg = Array.prototype.slice.call(arguments);
				if (!y.apply(this, arg)) ret.push(arg);
			} else {
				if (!y[handler](this, i)) ret.push(i);
			}
		});
		return Enumerator(ret);
	});

	if (typeof callback === 'function') {
		return e.each(callback);
	} else {
		return e;
	}
};

/**
 * Each loop by reverse order.
 *
 * @call_see
 *   reverse_each() -> Enumerator
 *   reverse_each(callback(item)) -> self
 *
 * @example
 *   var e = Enumerator([1,2,3]);
 *   console.log(e.reverse_each().to_a()); //=> [3,2,1]
 */
Enumerable.prototype.reverse_each = function (callback) {
	var self = this;
	var e = Enumerator(function(y){
		var handler = (1 < y.length) ? 'apply' : 'call';
		var array = [];

		self.each(function(i){
			array.push([this, arguments]);
		});

		var i = array.length;
		self.each(function(){
			i--;
			if (1 < array[i][1].length) {
				y.apply(array[i][0], array[i][1]);
			} else {
				y[handler](array[i][0], array[i][1][0]);
			}
		});
		return self;
	});

	if (typeof callback === 'function') {
		return e.each(callback);
	} else {
		return e;
	}
};

/**
 * Each object chunk begin callback return true.
 *
 * @call_see
 *   slice_before(pattern) -> Enumerator
 *   slice_before(callback(item)) -> Enumerator
 *   slice_before(initial_state, callback(item)) -> Enumerator
 *
 * @example
 *   var e = Enumerator(['abc','bcd','cde']);
 *   console.log(e.slice_before(/cde/).to_a()); //=> [['abc','bcd'],['cde']]
 *
 * @example
 *   var sliced = e.slice_before(function(i){
 *     return /cde/.test(i);
 *   });
 *   console.log(sliced); //=> [['abc','bcd'],['cde']]
 *
 * @example
 *   var array = [];
 *   var tmp = [];
 *   var sliced = e.slice_before(array, function(i, obj){
 *     obj.push(i);
 *     tmp.push(obj);
 *     return /cde/.test(i);
 *   });
 *   console.log(sliced.to_a()); //=> [['abc','bcd'],['cde']]
 *   console.log(tmp); //=> [[['abc'],['bcd'],['cde']],[['abc'],['bcd'],['cde']],[['abc'],['bcd'],['cde']]]
 *   console.log(array); //=> []
 */
Enumerable.prototype.slice_before = function (initial_state, callback) {
	switch (arguments.length) {
	case 1:
		if (typeof initial_state === 'function') {
			callback = initial_state;
		} else if (initial_state instanceof RegExp) {
			(function(reg){
				callback = function (item) {
					return reg.test(item);
				};
			})(initial_state);
		} else {
			(function(value){
				callback = function (item) {
					return Enumerable.eql(value, item);
				};
			})(initial_state);
		}
		initial_state = undefined;
		break;
	case 2:
		// clone initial_state
		var str = toString(initial_state);
		if (/Array/.test(str)) {
			initial_state = Array.prototype.slice.call(initial_state);
		} else if (!/Number|String/.test(str)) {
			var dup = function(){};
			dup.prototype = initial_state;
			initial_state = new dup();
		} else {
			Enumerator.raise('TypeError', "can't clone " + str);
		}
		break;
	}

	var self = this;
	return Enumerator(function(y){
		var flg = false;
		var chosen = [];
		var y_handler = 1 < y.length ? 'apply' : 'call';
		var c_handler = 1 < callback.length ? 'apply' : 'call';
		self.each(function(i){
			var arg = Array.prototype.slice.call(arguments);
			var answer;

			if (arg.length === 1) {
				arg = arg[0];
			}

			if (initial_state) {
				answer = callback.apply(this, [arg, initial_state]);
			} else {
				answer = callback[c_handler](this, arg);
			}

			if (answer && flg) {
				y[y_handler](chosen,chosen);
				chosen = [];
			}
			if (1 < arg.length) {
				chosen.push(arg);
			} else {
				chosen.push(i);
			}
			flg = true;
		});
		y[y_handler](chosen,chosen);
		return null;
	});
};

/**
 * Return array if callback return true.
 *
 * @call_see
 *   select() -> Enumerator
 *   select(callback) -> Enumerator([object])
 *   find_all() -> Enumerator
 *   find_all(callback) -> Enumerator([object])
 *
 * @example
 *   var e = Enumerator([10, 16, 30]);
 *   console.log(e.select(function(i){
 *     return i % 5 === 0;
 *   }).obj);
 *   //=> [10, 30]
 *
 * @return {Enumerator}
 */
Enumerable.prototype.select = function (callback) {
	var self = this;
	var e = Enumerator(function(y){
		var ret = [];
		var handler = (1 < y.length) ? 'apply' : 'call';
		self.each(function(i){
			var arg = Array.prototype.slice.call(arguments);
			if (1 < arg.length) {
				if (y.apply(this, arg)) ret.push(arg);
			} else {
				if (y[handler](this, i)) ret.push(i);
			}
		});
		return Enumerator(ret);
	});

	if (typeof callback === 'function') {
		return e.each(callback);
	} else {
		return e;
	}
};
Enumerable.prototype.find_all = Enumerable.prototype.select;

/**
 * Return sorted array.
 * Default sort algorithm use javascript Array.prototype.sort.
 *
 * @call_see
 *   sort() -> Enumerator(Array)
 *   sort(callback) -> Enumerator(Array)
 *
 * @example
 *   var e = Enumerator([2,-3,10]);
 *   console.log(e.sort());
 *   //=> [-3,10,2] (javascript Array.prototype.sort change Number to String)
 *   console.log(e.sort(function(a,b){
 *     return b - a;
 *   });
 *   //=> [10,2,-3]
 *
 * @return {Enumerator}
 */
Enumerable.prototype.sort = function () {
	var array = Array.prototype.sort.apply(this.to_a(), arguments);
	return Enumerator(array);
};

/**
 * Return sorted array by callback.
 *
 * @call_see
 *   sort_by() -> Enumerator
 *   sort_by(callback) -> Enumerator(Array)
 *
 * @example
 *   var e = Enumerator([2,-3,10]);
 *   console.log(e.sort_by(function(i){
 *     return +i;
 *   }).to_a();
 *   //=> [-3,2,10]
 *
 * @return {Enumerator}
 */
Enumerable.prototype.sort_by = function (callback) {
	var self = this;
	var e = Enumerator(function(y){
		var handler = 1 < y.length ? 'apply' : 'call';
		var alen;
		return self.collect(function(i){
			alen = alen || arguments.length;
			if (1 < alen) {
				var arg = Array.prototype.slice.call(arguments);
				return [y.apply(this, arg), arg];
			} else {
				return [y[handler](this, i), i];
			}
		}).sort(function(a, b){
			if (a[0] < b[0]) return -1;
			if (a[0] > b[0]) return 1;
			return 0;
		}).collect(function(i){ return i[1] });
	});

	if (typeof callback === 'function') {
		return e.each(callback);
	} else {
		return e;
	}
};

/**
 * Take first some object from Enumerator.
 *
 * @call_see
 *   take -> Enumerator(Array)
 *
 * @example
 *   var e = Enumerator(function(y){
 *     var a = 1;
 *     var b = 1;
 *     var tmp;
 *     for (;;) {
 *       y(a);
 *       tmp = b;
 *       b = a + b;
 *       a = tmp;
 *     }
 *   });
 *   var a = e.take(10);
 *   console.log(a.to_a()); //=> [1,1,2,3,5,8,13,21,34,55]
 *
 * @param {number} n size of objects take first.
 * @return {Enumerator}
 */
Enumerable.prototype.take = function (n) {
	var str = toString(n);
	if (str !== '[object Number]') {
		Enumerator.raise('TypeError', "can't convert "+str+" into Number")
	}
	var count = 0;
	var ret = [];
	try {
		this.each(function(i){
			if (count < n) {
				var arg = Array.prototype.slice.call(arguments);
				if (1 < arg.length) {
					ret.push(arg);
				} else {
					ret.push(i);
				}
			} else {
				throw true;
			}
			count += 1;
		});
	} catch(e) {
		if (e instanceof Error) throw e;
	}
	return Enumerator(ret);
};

/**
 * Take first some object from Enumerator
 *
 * @call_see
 *   take_while -> Enumerator(Array)
 * @example
 *   var e = Enumerator(function(y){
 *     var a = 1;
 *     var b = 1;
 *     var tmp;
 *     for (;;) {
 *       y(a);
 *       tmp = b;
 *       b = a + b;
 *       a = tmp;
 *     }
 *   });
 *   var a = e.take_while(function(i){
 *     return i < 100;
 *   });
 *   console.log(a.to_a()) //=> [1,1,2,3,5,8,13,21,34,55,89]
 *
 * @param {number} callback size of objects take first.
 * @return {Enumerator}
 */
Enumerable.prototype.take_while = function (callback) {
	var count = 0;
	var ret = [];
	var handler = (1 < callback.length) ? 'apply' : 'call';
	try {
		this.each(function(i){
			var arg = Array.prototype.slice.call(arguments);
			if (arg.length === 1) {
				arg = arg[0];
			}
			if (callback[handler](this, arg)) {
				ret.push(arg);
			} else {
				throw true;
			}
		});
	} catch(e) {}
	return Enumerator(ret);
};

/**
 * Convert Enumerator to Array.
 *
 * @call_see
 *   to_a() -> [object]
 *   entries() -> [object]
 *
 * @example
 *   var e = Enumerator([1,2,3]);
 *   console.log(e.to_a()); //=> [1,2,3]
 *
 * @example
 *   var e = Enumerator({'a':1,'b':2,'c':3});
 *   console.log(e.to_a()); //=> [['a',1],['b',2],['c',3]]
 *
 * @return {Array}
 */
Enumerable.prototype.to_a = function () {
	if (this.method === Enumerator.default_method.array) {
		return Array.prototype.slice.call(this.obj);
	} else {
		var ret = [];
		this.each(function(i){
			var arg = Array.prototype.slice.call(arguments);
			if (1 < arg.length) {
				ret.push(arg);
			} else {
				ret.push(i);
			}
		});
		return ret;
	}
};

/**
 * Merge other object.
 *
 * @call_see
 *   zip(*Array) -> Enumerator([[object]])
 *   zip(*Array, callback) -> null
 *
 * @example
 *   var e = Enumerator([1,2,3]);
 *   console.log(e.zip([4,5,6]).to_a()) //=> [[1,4],[2,5],[3,6]]
 *   console.log(e.zip([4,5,6],[7,8]).to_a()); //=> [[1,4,7],[2,5,8],[3,6,undefined]]
 */
Enumerable.prototype.zip = function () {
	var self = this;
	var lists = Array.prototype.slice.call(arguments);
	var callback = (typeof lists[lists.length - 1] === 'function') ? lists.pop() : null;
	var e = Enumerator(function(y){
		var t = 0;
		self.each(function(i){
			var arg = Array.prototype.slice.call(arguments);
			if (1 === arg.length) {
				arg = arg[0];
			}
			var chosen = [arg];
			for (var l = 0, ll = lists.length; l < ll; l += 1) {
				var list = lists[l];
				switch (toString(list)) {
				case '[object Array]':
					break;
				case '[object Object]':
					list = Enumerator(list).to_a();
					break;
				default:
					list = Array.prototype.slice.call(list);
					break;
				}
				chosen.push(list[t]);
			}
			y(chosen);
			t += 1;
		});
		return null;
	});

	if (typeof callback === 'function') {
		return e.each(callback);
	} else {
		return e;
	}
};

/**
 * Object equals other object.
 *
 * @call_see
 *   Enumerable.eql(a,b) -> true or false
 *
 * @example
 *   console.log(Enumerable.eql(123,124)); //=> false
 *   console.log(Enumerable.eql({'a':1},{'a':1})); //=> true
 *
 * @return {bool}
 */
Enumerable.eql = function (a, b) {
	var k, ka, kb, key, keysa, keysb, i, len;
	if (a === b) {
		return true;
	} else if (a === null || a === undefined || b === null || b === undefined) {
		return false;
	} else if (a.prototype !== b.prototype) {
		return false;
	} else if (a.valueOf() === b.valueOf()) {
		return true;
	} else if (a instanceof Date && b instanceof Date) {
		return a.getTime() === b.getTime();
	} else if (typeof a != 'object' && typeof b != 'object') {
		return a === b;
	}

	try {
		keysa = [], keysb = [];
		// Object.keys
		for (k in a) if (a.hasOwnProperty(k)) {
			keysa.push(k);
		}
		for (k in b) if (b.hasOwnProperty(k)) {
			keysb.push(k);
		}
	} catch (ex) {
		return false;
	}
	if (keysa.length !== keysb.length) return false;
	keysa.sort();
	keysb.sort();
	for (i = 0, len = keysa.length; i < len; i += 1) {
		if (keysa[i] !== keysb[i]) return false;
	}
	for (i = keysa.length - 1; 0 <= i; i--) {
		key = keysa[i];
		if (!Enumerable.eql(a[key], b[key])) return false;
	}
	return true;
};

/**
 * Include other Module.
 *
 * @call_see
 *   Enumerable.include(obj) -> this
 *
 * @example
 *   Enumerable.include(Enumerator); //=> Enumerator instance can use Enumerable methods
 *
 * @return {this}
 */
Enumerable.include = function (obj) {
	obj.prototype = new this;
	obj.prototype.constructor = obj;
	return this;
};

Enumerable.include(Enumerator);

// }}}

// {{{ Enumerator

/**
 * @lends Enumerator
 */

/**
 * Receiver object of Enumerator.
 * Can get this.obj any time.
 * But should not be change this.
 *
 * @type {object}
 */
Enumerator.prototype.obj = undefined;

/**
 * Caller of Enumerator.
 * to run this function for each cycle.
 * @type {function(function(*, ...[*]):*):*}
 */
Enumerator.prototype.method = undefined;

/**
 * Use {`next`,`next_values`,`peek`,`peek_values`} function index.
 * @type {number}
 */
Enumerator.prototype.index = undefined;

/**
 * Enumerator initializer
 *
 * @example
 *   var e = Enumerator([1,1,2,2,3]);
 *   e.each(function(i){
 *     console.log(i); //=> 1,1,2,2,3
 *   });
 *
 * @example
 *   Enumerator(function(y){
 *       y('first');
 *       y('second');
 *       y('third');
 *   }).each(function(i){
 *       console.log(i + ' next'); //=> 'first next', 'second next', 'third next'
 *   });
 *
 * @example
 *   var e = Enumerator([1,2,3], Array.prototype.map);
 *   var array = e.each(function(i){
 *     return i * i;
 *   }));
 *   // array => [1,4,9]
 *
 * @param {Array|Object|String} obj Enumerator receiver object
 * @param {function(function(*):*):*} method execute method when execute `each`. if this is nothing set default method by `obj`
 * @return {Enumerator}
 */
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

/**
 * Start run enumerator function.
 *
 * @call_see
 *   each() -> this
 *   each(callback(item)) -> *
 *
 * @example
 *   Enumerator([1,2,3]).each(function(i){
 *     console.log(i); //=> 1,2,3
 *   });
 *
 * @params {function(*):*} callback callback in enumerator method.
 *
 * @return {*} something object to `method` returns.
 */
Enumerator.prototype.each = function (callback) {
	if (typeof callback === 'function') {
		return this.method.call(this.obj, callback);
	} else {
		return this;
	}
};

/**
 * Return object from Receiver object at now `index`
 * and `index` increment.
 *
 * @example
 *   var e = Enumerator([1,2,3]);
 *   e.next(); //=> 1
 *   e.next(); //=> 2
 *   e.next(); //=> 3
 *   e.next(); //=> throw StopIteration
 *
 * @return {*} something object at now index
 */
Enumerator.prototype.next = function () {
	var ret = this.peek_values();
	this._index += 1;
	return ret[0];
};

/**
 * Return Array that object by `next` put in.
 * this function judgment to use call yield arguments nothing or undefined.
 *
 * @example
 *   var e = Enumerator(function(y){
 *     y();
 *     y(undefined);
 *     y(null);
 *   });
 *   e.next_values(); //=> []
 *   e.next_values(); //=> [undefined]
 *   e.next_values(); //=> [null]
 *
 * @return {Array} at now index object put in
 */
Enumerator.prototype.next_values = function () {
	var ret = this.peek_values();
	this._index += 1;
	return ret;
};

/**
 * This is same `next`.
 * but not increment `index`.
 *
 * @example
 *   var e = Enumerator([1,2,3]);
 *   e.peek(); //=> 1
 *   e.peek(); //=> 1
 *   e.peek(); //=> 1
 *
 * @return {*} something object at now index
 */
Enumerator.prototype.peek = function () {
	var ret = this.peek_values();
	return ret[0];
};

/**
 * This is same `next_values`.
 * but not increment `index`.
 *
 * @example
 *   var e = Enumerator(function(y){
 *     y();
 *     y(undefined);
 *     y(null);
 *   });
 *   e.peek_values(); //=> []
 *   e.peek_values(); //=> []
 *   e.peek_values(); //=> []
 *
 * @return {Array} at now index object put in.
 */
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

/**
 * Reset `index`
 * if `obj` have rewind function then call it.
 *
 * @return {Enumerator} this
 */
Enumerator.prototype.rewind = function () {
	this._index = 0;
	if (this.obj && typeof this.obj.rewind === 'function') {
		this.obj.rewind();
	}
	return this;
};

/**
 * Loop with index number.
 * index start `offset`(default 0).
 *
 * @example
 *   var e = Enumerator([1,2,3]).with_index();
 *   e.each(function(i, index){
 *     console.log([i, index]); //=> [1,0], [2,1], [3,2]
 *   });
 *
 * @example
 *   Enumerator([1,2,3]).with_index(10,function(i, index){
 *     console.log([i, index]); //=> [1,10], [2,11], [3,12]
 *   });
 *
 * @return {Enumerator|*}
 */
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

/**
 * Loop with any object.
 * `obj` is cloned and keep value in `with_object` function.
 *
 * @call_see
 *   with_object(object) -> object
 *   each_with_object(object) -> object
 *
 * @example
 *   var a = [];
 *   var e = Enumerator([1,2,3]).with_object(a);
 *   e.each(function(i, obj){
 *     obj.push(i);
 *     console.log([i, obj]); //=> [1,[1]], [2,[1,2]], [3,[1,2,3]]
 *   });
 *   console.log(a); //=> []
 *
 * @example
 *   Enumerator([1,2,3]).with_object(a,function(i, obj){
 *     obj.push(i);
 *     console.log([i, obj]); //=> [1,[1]], [2,[1,2]], [3,[1,2,3]]
 *   });
 *   console.log(a); //=> []
 *
 * @return {Enumerator|*}
 */
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

/**
 * if don't set this.method when create Enumerator then
 * this function is set.
 *
 * @return {function(function(*):*):*} default method
 */
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

/**
 * Extend Enumerator method to other object.
 *
 * @example
 *   Enumerator.extend(jQuery);
 *   //=> jQuery object can use Enumerator methods.
 *
 * @return {Array} extended methods.
 */
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

/**
 * Throw named error.
 *
 * @param {string} name error name.
 * @param {string} message error message.
 * @throws {*} named exception
 */
Enumerator.raise = function (name, message) {
	var error     = new Error(name);
	error.name    = name;
	error.message = message;
	throw error;
};

/**
 * Parallel run enumerator loops
 *
 * @example
 *   Enumerator.parallel([
 *     [1,2,3],             // something object
 *     {'a':1,'b':2},       // can use Array or Object
 *     Enumerator([4,5,6]), // or Enumerator object
 *   ]).each(function(values){
 *     console.log(values); //=> [1,['a',1],4], [2,['b',2],5], [3,undefined,6]
 *   });
 *
 * @param {(Array|Object).<Array,Object,Enumerator>} enumerators
 *
 * @return {Enumerator}
 */
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

// @private
function toString (obj) {
	return {}.toString.call(obj);
};

this.Enumerable = Enumerable;
this.Enumerator = Enumerator;

}).call(this);
