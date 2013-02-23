// Rubylike.js (https://github.com/ksss/enumerator.js)
// Copyright (c) 2013 ksss <co000ri@gmail.com>
function Enumerable () {
};
function Enumerator (obj, method) {
	return (this instanceof Enumerator) ? this.initialize.apply(this, arguments) : new Enumerator(obj, method);
};

(function(){
'use strict';
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
Enumerable.prototype.chunk = function (initial_state, callback) {
	switch (arguments.length) {
	case 1:
		callback = initial_state;
		initial_state = undefined;
		break;
	case 2:
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
Enumerable.prototype.first = function (n) {
	if (arguments.length === 0) {
		return this.take(1).to_a()[0];
	} else {
		return this.take(n);
	}
};
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
Enumerable.prototype.minmax = function (callback) {
	var max = this.max(callback);
	var min = this.min(callback);
	return Enumerator([min, max]);
};
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
Enumerable.prototype.none = function (callback) {
	return !this.any.apply(this, arguments);
};
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
Enumerable.prototype.sort = function () {
	var array = Array.prototype.sort.apply(this.to_a(), arguments);
	return Enumerator(array);
};
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
Enumerable.include = function (obj) {
	obj.prototype = new this;
	obj.prototype.constructor = obj;
	return this;
};

Enumerable.include(Enumerator);
Enumerator.prototype.obj = undefined;
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

this.Enumerable = Enumerable;
this.Enumerator = Enumerator;

}).call(this);
