var hash = {'a':1,'b':2,'c':3};
var e_hash = Enumerator(hash);
var e_hash_2 = Enumerator(hash, function(y){
	for (var key in this) if (this.hasOwnProperty(key)) {
		y.call(this, key, this[key]);
	}
	return this;
});

this.test = {
	test_new: function(){
		var enumerable = new Enumerable();
		var enumerator = new Enumerator();
		assert.ok(/function\sEnumerable/.test(enumerable.constructor+'') === true);
		assert.ok(/function\sEnumerator/.test(enumerator.constructor+'') === true);

		enumerator = Enumerator();
		assert.ok(/function\sEnumerator/.test(enumerator.constructor+'') === true);
	},
	test_default_method: function () {
		var e = Enumerator([]);
		var ee = Enumerator([2]);
		assert.ok(e.method === e.method);
		assert.ok(e.method === ee.method);
		assert.ok(e.method !== e_hash.method);
	},
	test_each: function () {
		var e = new Enumerator(function(y){
			y(3);
			y(5);
			y(7);
		});
		var tmp = [];
		assert.ok(e.each(function(i){
			tmp.push(i);
		}) === undefined);
		assert.deepEqual(tmp, [3,5,7]);

		var a = [4,6,8]
		e = Enumerator(a);
		tmp = [];
		assert.ok(e.each(function(i){
			tmp.push(i * i);
		}) === a);
		assert.deepEqual(tmp, [16,36,64]);

		e = Enumerator(hash);
		tmp = [];
		assert.ok(e.each(function(i){
			tmp.push(i);
		}) === hash);
		assert.deepEqual(tmp, [['a',1],['b',2],['c',3]]);

		tmp = [];
		e.each(function(k,v){
			tmp.push([k,v]);
		});
		assert.deepEqual(tmp, [['a',1],['b',2],['c',3]]);

		tmp = [];
		e_hash_2.each(function(k,v){
			tmp.push([k,v]);
		});
		assert.deepEqual(tmp, [['a',1],['b',2],['c',3]]);

		e = Enumerator([1,2,3], Array.prototype.map);
		assert.deepEqual(e.each(function(i){
			return i * i;
		}), [1,4,9]);

		tmp = [];
		Enumerator('abcdefg').each(function(i){
			tmp.push(i);
		});
		assert.deepEqual(tmp, ['a','b','c','d','e','f','g']);
	},
	test_obj: function () {
		var e = new Enumerator([3,5,7], Array.prototype.forEach);
		assert.deepEqual(e.obj, [3,5,7]);
		assert.deepEqual(e_hash.obj, hash);
	},
	test_next: function () {
		var a = [3,5,7];
		var e = new Enumerator(a);
		assert.deepEqual(e.next(), 3);
		assert.deepEqual(e.next(), 5);
		assert.deepEqual(e.next(), 7);
		assert.throws(function(){ e.next() });
		assert.throws(function(){ e.next() });

		var a = [3,5,7];
		e = new Enumerator(a, Array.prototype.forEach);
		assert.deepEqual(e.next(), [3,0,a]);
		assert.deepEqual(e.next(), [5,1,a]);
		assert.deepEqual(e.next(), [7,2,a]);
		assert.throws(function(){ e.next() });
		assert.throws(function(){ e.next() });

		e = new Enumerator(function(y){
			var a = 1;
			var b = 1;
			var tmp;
			for (;;) {
				y(a);
				tmp = b;
				b = a + b;
				a = tmp;
			}
		});
		assert.deepEqual(e.next(), 1);
		assert.deepEqual(e.next(), 1);
		assert.deepEqual(e.next(), 2);
		assert.deepEqual(e.next(), 3);
		assert.deepEqual(e.next(), 5);
		assert.deepEqual(e.next(), 8);
		assert.deepEqual(e.next(), 13);
		assert.deepEqual(e.next(), 21);

		e_hash = Enumerator(hash);
		assert.deepEqual(e_hash.next(),['a',1]);
		assert.deepEqual(e_hash.next(),['b',2]);
		assert.deepEqual(e_hash.next(),['c',3]);
		e_hash.rewind();

		e_hash_2 = Enumerator(hash);
		assert.deepEqual(e_hash_2.next(),['a',1]);
		assert.deepEqual(e_hash_2.next(),['b',2]);
		assert.deepEqual(e_hash_2.next(),['c',3]);
		e_hash_2.rewind();

		e = Enumerator('abcdefg');
		assert.ok(e.next() === 'a');
		assert.ok(e.next() === 'b');
		assert.ok(e.next() === 'c');
		assert.ok(e.next() === 'd');
		assert.ok(e.next() === 'e');
		assert.ok(e.next() === 'f');
		assert.ok(e.next() === 'g');
	},
	test_next_values: function () {
		var e = new Enumerator(function(y){
			y();
			y(undefined);
			y(null);
		});
		assert.ok(e.next() === undefined);
		assert.ok(e.next() === undefined);
		assert.ok(e.next() === null);

		var e = new Enumerator(function(y){
			y();
			y(undefined);
			y(null);
		});

		assert.deepEqual(e.next(), undefined);
		assert.deepEqual(e.next(), undefined);
		assert.deepEqual(e.next(), null);
		e.rewind();
		assert.deepEqual(e.next_values(), []);
		assert.deepEqual(e.next_values(), [undefined]);
		assert.deepEqual(e.next_values(), [null]);

		assert.deepEqual(e_hash.next_values(), [['a',1]]);
		assert.deepEqual(e_hash.next_values(), [['b',2]]);
		assert.deepEqual(e_hash.next_values(), [['c',3]]);
		assert.deepEqual(e_hash_2.next_values(), [['a',1]]);
		assert.deepEqual(e_hash_2.next_values(), [['b',2]]);
		assert.deepEqual(e_hash_2.next_values(), [['c',3]]);
		e_hash.rewind();
		e_hash_2.rewind();
	},
	test_peek: function () {
		var e = Enumerator([0,1,2,2,3,4,5]);
		assert.strictEqual(e.peek(), 0);
		assert.strictEqual(e.peek(), 0);
		assert.strictEqual(e.next(), 0);
		assert.strictEqual(e.next(), 1);
		assert.strictEqual(e.peek(), 2);
		assert.strictEqual(e.peek(), 2);
		assert.strictEqual(e.next(), 2);
		assert.strictEqual(e.next(), 2);
		assert.strictEqual(e.peek(), 3);
		e = Enumerator(function(y){
			y(10);
			y(20);
			y(30);
		});
		assert.strictEqual(e.peek(), 10);
		assert.strictEqual(e.peek(), 10);

		assert.deepEqual(e_hash.peek(), ['a',1]);
		assert.deepEqual(e_hash.peek(), ['a',1]);

		assert.deepEqual(e_hash_2.peek(), ['a',1]);
		assert.deepEqual(e_hash_2.peek(), ['a',1]);
	},
	test_peek_values: function () {
		var e = Enumerator(function(y){
			y();
			y(undefined);
			y(null);
		});
		assert.deepEqual(e.peek(), undefined);
		assert.deepEqual(e.peek_values(), []);
		e.next();
		assert.deepEqual(e.peek(), undefined);
		assert.deepEqual(e.peek_values(), [undefined]);
		e.next();
		assert.deepEqual(e.peek(), null);
		assert.deepEqual(e.peek_values(), [null]);

		a = [1,2,3]
		e = Enumerator(a, Array.prototype.forEach);
		assert.deepEqual(e.peek(), [1,0,a]);
		assert.deepEqual(e.peek_values(), [[1,0,a]]);

		assert.deepEqual(e_hash.peek_values(), [['a',1]]);
		assert.deepEqual(e_hash.peek_values(), [['a',1]]);

		assert.deepEqual(e_hash_2.peek_values(), [['a',1]]);
		assert.deepEqual(e_hash_2.peek_values(), [['a',1]]);
	},
	test_rewind: function () {
		var e = Enumerator([1,1,2,2,3,4,5]);
		assert.ok(e.next() === 1);
		assert.deepEqual(e_hash.next(), ["a",1]);
		assert.deepEqual(e_hash.next(), ["b",2]);
		assert.deepEqual(e_hash_2.next(), ["a",1]);
		assert.deepEqual(e_hash_2.next(), ["b",2]);
		assert.ok(e.next() === 1);
		assert.ok(e.rewind() === e);
		assert.ok(e_hash.rewind() === e_hash);
		assert.ok(e_hash_2.rewind() === e_hash_2);
		assert.deepEqual(e_hash.next(), ["a",1]);
		assert.deepEqual(e_hash.next(), ["b",2]);
		assert.deepEqual(e_hash_2.next(), ["a",1]);
		assert.deepEqual(e_hash_2.next(), ["b",2]);
		assert.ok(e.next() === 1);
		assert.ok(e.next() === 1);
		assert.ok(e.next() === 2);
		assert.ok(e.rewind() === e);
		assert.ok(e_hash.rewind() === e_hash);
		assert.ok(e_hash_2.rewind() === e_hash_2);
	},
	test_with_index: function () {
		var array = [10,20,30];
		var e = Enumerator(array);
		var tmp = [];
		assert.ok(e.with_index(function(i,index){
			tmp.push([i,index]);
		}) === array);
		assert.deepEqual(tmp, [[10,0],[20,1],[30,2]]);

		tmp = [];
		e.with_index(10).each(function(i, index){
			tmp.push([i,index]);
		});
		assert.deepEqual(tmp, [[10,10],[20,11],[30,12]]);

		assert.deepEqual(e.with_index(30).peek(), [10,30]);

		tmp = [];
		e.with_index(2, function(i, index){
			tmp.push([i, index]);
		});
		assert.deepEqual(tmp, [[10,2],[20,3],[30,4]]);

		tmp = [];
		e = e_hash.with_index(function(i, index){
			tmp.push([i,index]);
		});
		assert.deepEqual(tmp, [[['a',1],0],[['b',2],1],[['c',3],2]]);

		tmp = [];
		e = e_hash_2.with_index(function(i, index){
			tmp.push([i,index]);
		});
		assert.deepEqual(tmp, [[['a',1],0],[['b',2],1],[['c',3],2]]);
	},
	test_with_object: function () {
		var e = Enumerator(function(y){
			y(0);
			y(1);
			y(2);
		});
		var tmp = [];
		var foo = "foo";
		assert.ok(e.with_object(foo).each(function(i, string){
			tmp.push(string + ':' + i);
		}) === foo);
		assert.deepEqual(tmp, ["foo:0","foo:1","foo:2"]);

		tmp = [];
		assert.ok(e.with_object(foo, function(i, string){
			tmp.push(string + ':' + i);
		}) === foo);
		assert.deepEqual(tmp, ["foo:0","foo:1","foo:2"]);

		tmp = [];
		assert.ok(e.with_object(tmp, function(i, obj){
			obj.push(i);
		}) === tmp);
		assert.deepEqual(tmp, [0,1,2]);

		tmp = [];
		e_hash.with_object(tmp, function(i, obj){
			obj.push(i);
		});
		assert.deepEqual(tmp, [['a',1],['b',2],['c',3]]);

		tmp = [];
		e_hash_2.with_object(tmp, function(i, obj){
			obj.push(i);
		});
		assert.deepEqual(tmp, [['a',1],['b',2],['c',3]]);
	},
	test_all: function () {
		assert.ok(Enumerator(function(y){
			y(true); y('1'); y(1);
		}).all() === true);
		assert.ok(Enumerator(function(y){
			y(true); y(''); y(1);
		}).all() === false);

		assert.ok(Enumerator(function(y){
			y(10); y(15); y(30);
		}).all(function(i){
			return i % 5 === 0;
		}) === true);
		assert.ok(Enumerator(function(y){
			y(10); y(15); y(32);
		}).all(function(i){
			return i % 5 === 0;
		}) === false);

		assert.strictEqual(e_hash.all(function(i){
			return 0 < i[1];
		}), true);
		assert.strictEqual(e_hash.all(function(i){
			return 1 === i[1];
		}), false);
		assert.strictEqual(e_hash.all(function(k,v){
			return 0 < v;
		}), true);
		assert.strictEqual(e_hash.all(function(k,v){
			return 1 === v;
		}), false);

		assert.strictEqual(e_hash_2.all(function(k){
			return /[abc]/.test(k);
		}), true);
		assert.strictEqual(e_hash_2.all(function(k){
			return k === 'a';
		}), false);
		assert.strictEqual(e_hash_2.all(function(k,v){
			return 0 < v;
		}), true);
		assert.strictEqual(e_hash_2.all(function(k,v){
			return 1 === v;
		}), false);
	},
	test_any: function () {
		assert.ok(Enumerator(function(y){
			y(true); y(''); y(0);
		}).any() === true);
		assert.ok(Enumerator(function(y){
			y(); y(''); y(0);
		}).any() === false);

		assert.ok(Enumerator(function(y){
			y(10); y(16); y(32);
		}).any(function(i){
			return i % 5 === 0;
		}) === true);
		assert.ok(Enumerator(function(y){
			y(11); y(16); y(32);
		}).any(function(i){
			return i % 5 === 0;
		}) === false);

		assert.strictEqual(e_hash.any(function(i){
			return 1 === i[1];
		}), true);
		assert.strictEqual(e_hash.any(function(i){
			return 0 === i[1];
		}), false);

		assert.strictEqual(e_hash.any(function(k,v){
			return 1 === v;
		}), true);
		assert.strictEqual(e_hash.any(function(k,v){
			return 0 === v;
		}), false);

		assert.strictEqual(e_hash_2.any(function(k,v){
			return 1 === v;
		}), true);
		assert.strictEqual(e_hash_2.any(function(k,v){
			return 0 === v;
		}), false);
	},
	test_chunk: function () {
		var e = Enumerator([1,1,2,2,3,4,5]);
		var tmp = [];
		assert.ok(e.chunk(function(i){
			tmp.push(i);
			return (i % 2) === 0;
		}).each(function(i,j){
			tmp.push([i,j]);
		}) === null);
		assert.deepEqual(tmp, [1,1,2,[false,[1,1]],2,3,[true,[2,2]],4,[false,[3]],5,[true,[4]],[false,[5]]]);

		tmp = [];
		e.chunk(function(i){
			tmp.push(i);
			if (2 < i) return (i % 2) === 0;
			return null;
		}).each(function(i,j){
			tmp.push([i,j]);
		});
		assert.deepEqual(tmp, [1,1,2,2,3,4,[false,[3]],5,[true,[4]],[false,[5]]]);

		tmp = [];
		var obj = [];
		e.chunk(obj, function(i, o){
			o.push(i);
			tmp.push(JSON.parse(JSON.stringify(o)));
			return 'finish';
		}).each(function(i,j){
			tmp.push([i,j]);
		});
		assert.deepEqual(obj, []);
		assert.deepEqual(tmp, [[1],[1,1],[1,1,2],[1,1,2,2],[1,1,2,2,3],[1,1,2,2,3,4],[1,1,2,2,3,4,5],["finish",[1,1,2,2,3,4,5]]]);

		tmp = null;
		var obj = {};
		e.chunk(obj, function(i, o){
			o[i] = 1;
			tmp = o;
		}).each(function(i,j){ });
		assert.deepEqual(obj, {});
		assert.deepEqual(tmp, {"1":1,"2":1,"3":1,"4":1,"5":1});

		tmp = [];
		e_hash.chunk(function(i){
			return i[0];
		}).each(function(res,i){
			tmp.push([res,i]);
		});
		assert.deepEqual(tmp, [['a',[['a',1]]],['b',[['b',2]]],['c',[['c',3]]]]);

		tmp = [];
		e_hash.chunk(obj,function(i,o){
			return i[0];
		}).each(function(res,i){
			tmp.push([res,i]);
		});
		assert.deepEqual(tmp, [['a',[['a',1]]],['b',[['b',2]]],['c',[['c',3]]]]);

		tmp = [];
		e_hash.chunk(function(k,v){
			return k;
		}).each(function(res,i){
			tmp.push([res,i]);
		});
		assert.deepEqual(tmp, [['a',[['a',1]]],['b',[['b',2]]],['c',[['c',3]]]]);

		tmp = [];
		e_hash.chunk(obj,function(i,o){
			return i[0];
		}).each(function(res,i){
			tmp.push([res,i]);
		});
		assert.deepEqual(tmp, [['a',[['a',1]]],['b',[['b',2]]],['c',[['c',3]]]]);

		tmp = [];
		e_hash_2.chunk(function(k,v){
			return k;
		}).each(function(res,i){
			tmp.push([res,i]);
		});
		assert.deepEqual(tmp, [['a',[['a',1]]],['b',[['b',2]]],['c',[['c',3]]]]);

		tmp = [];
		e_hash_2.chunk(obj,function(i,o){
			return i[0];
		}).each(function(res,i){
			tmp.push([res,i]);
		});
		assert.deepEqual(tmp, [['a',[['a',1]]],['b',[['b',2]]],['c',[['c',3]]]]);

		assert.throws(function(){ e.chunk() });
		assert.throws(function(){ e.chunk([]) });
		assert.throws(function(){ e.chunk(1) });
		assert.throws(function(){ e.chunk('1') });
	},
	test_collect: function () {
		var e = Enumerator(function(y){
			y(10); y(16); y(30);
		});
		assert.deepEqual(e.collect(function(i){
			return i % 5 === 0;
		}).to_a(), [true, false, true]);

		assert.deepEqual(e.collect().each(function(i){
			return i % 5 === 0;
		}).to_a(), [true, false, true]);

		assert.ok(e.collect(function(i){
			return i % 5 === 0;
		}).count(true) === 2);

		assert.deepEqual(e_hash.collect(function(i){
			return i[0];
		}).to_a(), ['a','b','c']);
		assert.deepEqual(e_hash.collect(function(k,v){
			return v;
		}).to_a(), [1,2,3]);
		assert.deepEqual(e_hash_2.collect(function(k,v){
			return v;
		}).to_a(), [1,2,3]);
	},
	test_count: function () {
		assert.ok(Enumerator(function(y){
			y(10); y(16); y(30);
		}).count() === 3);

		assert.ok(Enumerator(function(y){
			y(10); y(16); y(30);
		}).count(10) === 1);

		assert.ok(Enumerator(function(y){
			y(10); y(16); y(30);
		}).count(function(i){
			return i % 5 === 0;
		}) === 2);

		assert.strictEqual(e_hash.count(), 3);
		assert.strictEqual(e_hash.count(['a',1]), 1);
		var ret = e_hash.count(function(i){
			return i[1] === 1;
		});
		assert.strictEqual(ret, 1);

		ret = e_hash.count(function(k,v){
			return v === 1;
		});
		assert.strictEqual(ret, 1);

		assert.strictEqual(e_hash_2.count(['a',1]), 1);
		ret = e_hash_2.count(function(k,v){
			return v === 1;
		});
		assert.strictEqual(ret, 1);
	},
	test_cycle: function () {
		var tmp = [];
		var e = Enumerator(function(y){
			y(10); y(16); y(30);
		});
		assert.ok(e.cycle(3, function(i){
			tmp.push(i);
		}) === null);
		assert.deepEqual(tmp, [10,16,30,10,16,30,10,16,30]);

		tmp = [];
		assert.ok(e.cycle(3).each(function(i){
			tmp.push(i);
		}) === null);
		assert.deepEqual(tmp, [10,16,30,10,16,30,10,16,30]);

		tmp = [];
		e_hash.cycle(2).each(function(i){
			tmp.push(i);
		});
		assert.deepEqual(tmp, [['a',1],['b',2],['c',3],['a',1],['b',2],['c',3]]);

		tmp = [];
		e_hash.cycle(2).each(function(k,v){
			tmp.push([k,v]);
		});
		assert.deepEqual(tmp, [['a',1],['b',2],['c',3],['a',1],['b',2],['c',3]]);

		tmp = [];
		e_hash_2.cycle(2).each(function(k,v){
			tmp.push([k,v]);
		});
		assert.deepEqual(tmp, [['a',1],['b',2],['c',3],['a',1],['b',2],['c',3]]);
	},
	test_drop: function () {
		assert.deepEqual(Enumerator(function(y){
			y(10); y(16); y(30);
		}).drop(1).to_a(), [16,30]);

		assert.deepEqual(e_hash.drop(2).to_a(), [['c',3]]);
		assert.deepEqual(e_hash_2.drop(2).to_a(), [['c',3]]);
	},
	test_drop_while: function () {
		assert.deepEqual(Enumerator(function(y){
			y(10); y(16); y(30);
		}).drop_while(function(i){
			return i % 5 === 0
		}).to_a(), [16,30]);

		var e = Enumerator(function(y){
			y(10); y(16); y(30);
		}).drop_while();
		assert.ok(e instanceof Enumerator);
		assert.deepEqual(e.each(function(i){
			return i % 5 === 0;
		}).to_a(), [16,30]);

		var ret = e_hash.drop_while(function(i){
			return i[1] < 3;
		});
		assert.deepEqual(ret.to_a(), [['c',3]]);

		ret = e_hash.drop_while(function(k,v){
			return v < 3;
		});
		assert.deepEqual(ret.to_a(), [['c',3]]);

		ret = e_hash_2.drop_while(function(k,v){
			return v < 3;
		});
		assert.deepEqual(ret.to_a(), [['c',3]]);
	},
	test_each_cons: function () {
		var tmp = [];
		var e = Enumerator(function(y){
			y(10); y(16); y(30);
		});
		assert.ok(e.each_cons(2, function(i){
			tmp.push(i);
		}) === null);
		assert.deepEqual(tmp, [[10,16],[16,30]]);

		tmp = [];
		assert.ok(e.each_cons(2).each(function(i){
			tmp.push(i);
		}) === null);
		assert.deepEqual(tmp, [[10,16],[16,30]]);

		tmp = [];
		assert.ok(e_hash.each_cons(2).each(function(i){
			tmp.push(i);
		}) === null);
		assert.deepEqual(tmp, [[['a',1],['b',2]],[['b',2],['c',3]]]);

		tmp = [];
		assert.ok(e_hash.each_cons(2).each(function(i,j){
			tmp.push([i,j]);
		}) === null);
		assert.deepEqual(tmp, [[['a',1],['b',2]],[['b',2],['c',3]]]);

		tmp = [];
		assert.ok(e_hash_2.each_cons(2).each(function(i,j){
			tmp.push([i,j]);
		}) === null);
		assert.deepEqual(tmp, [[['a',1],['b',2]],[['b',2],['c',3]]]);
	},
	test_each_slice: function () {
		var tmp = [];
		var e = Enumerator(function(y){
			y(10); y(16); y(30);
		});
		assert.ok(e.each_slice(2, function(i){
			tmp.push(i);
		}) === null);
		assert.deepEqual(tmp, [[10,16],[30]]);

		tmp = [];
		assert.ok(e.each_slice(2).each(function(i){
			tmp.push(i);
		}) === null);
		assert.deepEqual(tmp, [[10,16],[30]]);

		tmp = [];
		e_hash.each_slice(2).each(function(i){
			tmp.push(i);
		});
		assert.deepEqual(tmp, [[["a",1],["b",2]],[["c",3]]]);

		tmp = [];
		e_hash.each_slice(2).each(function(i,j){
			tmp.push([i,j]);
		});
		assert.deepEqual(tmp, [[["a",1],["b",2]],[["c",3],undefined]]);

		tmp = [];
		e_hash_2.each_slice(2).each(function(i,j){
			tmp.push([i,j]);
		});
		assert.deepEqual(tmp, [[["a",1],["b",2]],[["c",3],undefined]]);

		tmp = [];
		e = Enumerator([]);
		e.each_slice(1).each(function(i){
			assert.deepEqual(this, []);
		});
	},
	test_each_with_index: function () {
		var tmp = [];
		var e = Enumerator(function(y){
			y(10); y(16); y(30);
		});
		var ret = e.each_with_index(function(i, index){
			tmp.push([i, index]);
		});
		assert.deepEqual(tmp, [[10,0],[16, 1],[30,2]]);
		assert.strictEqual(ret, e);

		tmp = [];
		e.each_with_index(function(i, index){
			tmp.push([i, index]);
		});
		assert.deepEqual(tmp, [[10,0],[16, 1],[30,2]]);

		tmp = [];
		e_hash.each_with_index(function(i, index){
			tmp.push([i,index]);
		});
		assert.deepEqual(tmp, [[['a',1],0],[['b',2],1],[['c',3],2]]);

		tmp = [];
		e_hash_2.each_with_index(function(i, index){
			tmp.push([i,index]);
		});
		assert.deepEqual(tmp, [[['a',1],0],[['b',2],1],[['c',3],2]]);
	},
	test_each_with_object: function () {
		var tmp = [];
		var ret = Enumerator(function(y){
			y(10); y(16); y(30);
		}).each_with_object(tmp, function(i, memo){
			memo.push(i);
		});
		assert.strictEqual(ret, tmp);
		assert.deepEqual(ret, [10,16,30]);

		ret = e_hash.each_with_object([], function(i, memo){
			memo.push(i);
		});
		assert.deepEqual(ret, [['a',1],['b',2],['c',3]]);

		ret = e_hash_2.each_with_object([], function(i, memo){
			memo.push(i);
		});
		assert.deepEqual(ret, [['a',1],['b',2],['c',3]]);
	},
	test_find: function () {
		assert.ok(Enumerator(function(y){
			y(10); y(16); y(30);
		}).find(function(i){
			return i % 5 !== 0;
		}) === 16);

		assert.ok(Enumerator(function(y){
			y(10); y(16); y(30);
		}).find().each(function(i){
			return i % 5 !== 0;
		}) === 16);

		assert.deepEqual(e_hash.find(function(i){
			return i[1] === 2;
		}), ['b',2]);
		assert.deepEqual(e_hash.find(function(k,v){
			return v === 2;
		}), ['b',2]);
		assert.deepEqual(e_hash_2.find(function(k,v){
			return v === 2;
		}), ['b',2]);
	},
	test_find_index: function () {
		assert.ok(Enumerator(function(y){
			y(10); y(16); y(30);
		}).find_index(function(i){
			return i % 5 !== 0;
		}) === 1);

		assert.ok(Enumerator(function(y){
			y(10); y(16); y(30);
		}).find_index().each(function(i){
			return i % 5 !== 0;
		}) === 1);

		assert.strictEqual(e_hash.find_index(function(i){
			return i[1] === 2;
		}), 1);
		assert.strictEqual(e_hash.find_index(function(k,v){
			return v === 2;
		}), 1);
		assert.strictEqual(e_hash_2.find_index(function(k,v){
			return v === 2;
		}), 1);
	},
	test_first: function () {
		var e = Enumerator(function(y){
			for (var i = 10;; i++) {
				y(i);
			}
		});
		assert.ok(e.first() === 10);
		assert.deepEqual(e.first(3).to_a(), [10,11,12]);
		assert.ok(Enumerator([]).first() === undefined);
		assert.deepEqual(e_hash.first(), ['a',1]);
		assert.deepEqual(e_hash_2.first(), ['a',1]);
	},
	test_flat_map: function () {
		var e = Enumerator([[1,2],[3,4]]);
		assert.deepEqual(e.flat_map(function(i){
			return i.map(function(j){ return j * 2 })
		}).to_a(), [2,4,6,8]);
		assert.deepEqual(e.flat_map().each(function(i){
			return i.map(function(j){ return j * 2 })
		}).to_a(), [2,4,6,8]);
		assert.deepEqual(e.flat_map().each(function(i,j){
			return j * 2;
		}).to_a(), [4,8]);

		assert.deepEqual(Enumerator([[[1,2]],[[3,4]]]).flat_map(function(i){
			return i;
		}).to_a(), [[1,2],[3,4]]);
		assert.deepEqual(Enumerator([1,2,[[3,4]]]).flat_map().each(function(i){
			return i;
		}).to_a(), [1,2,[3,4]]);

		assert.deepEqual(e_hash.flat_map(function(i){
			return i[0];
		}).to_a(), ['a','b','c']);
		assert.deepEqual(e_hash.flat_map().each(function(i,j){
			return i;
		}).to_a(), ['a','b','c']);
		assert.deepEqual(e_hash_2.flat_map().each(function(i,j){
			return i;
		}).to_a(), ['a','b','c']);
	},
	test_grep: function () {
		var e = Enumerator(function(y){
			y(10); y(16); y(30);
		});
		assert.deepEqual(e.grep(/10|30/).to_a(), [10,30]);
		assert.deepEqual(e.grep(10).to_a(), [10]);
		assert.deepEqual(e.grep(/\d+/, function(i){
			return i < 15;
		}).to_a(), [true, false, false]);
		assert.deepEqual(e_hash.grep(['b',2], function(i){
			return i[1];
		}).to_a(), [2]);
		assert.deepEqual(e_hash.grep(['b',2], function(k,v){
			return v;
		}).to_a(), [2]);
		assert.deepEqual(e_hash_2.grep(['b',2], function(k,v){
			return v;
		}).to_a(), [2]);
	},
	test_group_by: function () {
		var e = Enumerator(function(y){
			y(10); y(16); y(30);
		});
		assert.deepEqual(e.group_by(function(i){
			return i % 5 === 0 ? 't' : 'f';
		}).obj, {'t':[10,30], 'f':[16]});

		assert.deepEqual(e.group_by().each(function(i){
			return i % 5 === 0 ? 't' : 'f';
		}).obj, {'t':[10,30], 'f':[16]});

		assert.deepEqual(e_hash.group_by().each(function(i){
			return i[1] % 2 === 0 ? 't' : 'f';
		}).obj, {'t':[['b',2]], 'f':[['a',1],['c',3]]});
		assert.deepEqual(e_hash.group_by().each(function(k,v){
			return v % 2 === 0 ? 't' : 'f';
		}).obj, {'t':[['b',2]], 'f':[['a',1],['c',3]]});
		assert.deepEqual(e_hash_2.group_by().each(function(k,v){
			return v % 2 === 0 ? 't' : 'f';
		}).obj, {'t':[['b',2]], 'f':[['a',1],['c',3]]});

	},
	test_include: function () {
		var e = Enumerator(function(y){
			y(10); y(16); y({'a':1});
		});
		assert.ok(e.include(16) === true);
		assert.ok(e.include(15) === false);
		assert.ok(e.include({'a':1}) === true);

		assert.strictEqual(e_hash.include(['d',4]), false);
		assert.strictEqual(e_hash.include(['b',2]), true);

		assert.strictEqual(e_hash_2.include(['d',4]), false);
		assert.strictEqual(e_hash_2.include(['b',2]), true);

		(function(){
			e = Enumerator(arguments);
			assert.ok(e.include(3) === true);
		})(1,2,3);
	},
	test_inject: function () {
		var e = Enumerator(function(y){
			y(10); y(16); y(30);
		});
		assert.ok(e.inject(function(result,i){
			return result + i;
		}) === 56);
		assert.ok(e.inject(2, function(result,i){
			return result * i;
		}) === 9600);
		assert.throws(function(){ e.inject() });

		assert.strictEqual(e_hash.inject('',function(result,i){
			return result + i[0] + i[1];
		}), 'a1b2c3');
		assert.strictEqual(e_hash_2.inject('',function(result,i){
			return result + i[0] + i[1];
		}), 'a1b2c3');
	},
	test_max: function () {
		var e = Enumerator([2,-3,1]);
		assert.strictEqual(e.max(), 2);
		assert.strictEqual(e.max(function(a,b){ return b - a }), -3);
		assert.strictEqual(Enumerator({}).max(), null);
		assert.throws(function(){ Enumerator([1,'2']).max() });

		e = Enumerator({'a':{},'b':2,'c':1});
		assert.deepEqual(e.max(), ['c',1]);

		assert.deepEqual(e_hash.max(), ['c',3]);
		assert.deepEqual(e_hash.max(function(a,b){
			return b[1] - a[1];
		}), ['a',1]);
		assert.deepEqual(e_hash_2.max(), ['c',3]);
		assert.deepEqual(e_hash_2.max(function(a,b){
			return b[1] - a[1];
		}), ['a',1]);
	},
	test_max_by: function () {
		var e = Enumerator([2,-3,1]);
		assert.strictEqual(e.max_by(function(i){
			return Math.abs(i);
		}), -3);
		assert.strictEqual(e.max_by().each(function(i){
			return Math.abs(i);
		}), -3);

		assert.deepEqual(e_hash.max_by(function(i){
			return i[0];
		}), ['c',3]);
		assert.deepEqual(e_hash.max_by(function(k,v){
			return v;
		}), ['c',3]);
		assert.deepEqual(e_hash_2.max_by(function(k,v){
			return v;
		}), ['c',3]);
	},
	test_min: function () {
		var e = Enumerator([2,-3,1]);
		assert.strictEqual(e.min(), -3);
		assert.strictEqual(e.min(function(a,b){ return b - a }), 2);
		assert.strictEqual(Enumerator({}).min(), null);

		assert.deepEqual(e_hash.min(), ['a',1]);
		assert.deepEqual(e_hash.min(function(a,b){
			return b[1] - a[1];
		}), ['c',3]);
		assert.deepEqual(e_hash_2.min(), ['a',1]);
		assert.deepEqual(e_hash_2.min(function(a,b){
			return b[1] - a[1];
		}), ['c',3]);
	},
	test_min_by: function () {
		var e = Enumerator(function(y){
			y(2);
			y(-3);
			y(1);
		});
		assert.strictEqual(e.min_by(function(i){
			return Math.abs(i);
		}), 1);
		assert.strictEqual(e.min_by().each(function(i){
			return Math.abs(i);
		}), 1);

		assert.deepEqual(e_hash.min_by(function(i){
			return i[0];
		}), ['a',1]);
		assert.deepEqual(e_hash.min_by(function(k,v){
			return v;
		}), ['a',1]);
		assert.deepEqual(e_hash_2.min_by(function(k,v){
			return v;
		}), ['a',1]);
	},
	test_minmax: function () {
		var e = Enumerator([2,-3,1]);
		assert.deepEqual(e.minmax().to_a(), [-3, 2]);
		assert.deepEqual(e.minmax(function(a,b){
			return b - a;
		}).to_a(), [2, -3]);

		assert.deepEqual(e_hash.minmax().to_a(), [['a',1],['c',3]]);
		assert.deepEqual(e_hash.minmax(function(a,b){
			return b[1] - a[1];
		}).to_a(), [['c',3],['a',1]]);

		assert.deepEqual(e_hash_2.minmax().to_a(), [['a',1],['c',3]]);
		assert.deepEqual(e_hash_2.minmax(function(a,b){
			return b[1] - a[1];
		}).to_a(), [['c',3],['a',1]]);
	},
	test_minmax_by: function () {
		var e = Enumerator([2,-3,1]);
		assert.deepEqual(e.minmax_by(function(i){
			return Math.abs(i);
		}).to_a(), [1, -3]);

		var ret = e_hash.minmax_by(function(i){
			return -i[1];
		});
		assert.deepEqual(ret.to_a(), [['c',3],['a',1]]);
		ret = e_hash.minmax_by(function(k,v){
			return -v;
		});
		assert.deepEqual(ret.to_a(), [['c',3],['a',1]]);
		ret = e_hash_2.minmax_by(function(k,v){
			return -v;
		});
		assert.deepEqual(ret.to_a(), [['c',3],['a',1]]);
	},
	test_none: function () {
		var e = Enumerator(['ant', 'bear', 'cat']);
		assert.ok(e.none(function(word){ return word.length === 5 }) === true);
		assert.ok(e.none(function(word){ return word.length >= 4 }) === false);
		assert.ok(Enumerator([]).none() === true);
		assert.ok(Enumerator([null]).none() === true);
		assert.ok(Enumerator([null,false]).none() === true);

		assert.strictEqual(e_hash.none(), false);
		assert.strictEqual(e_hash.none(function(k,v){
			return v === 4;
		}), true);

		assert.strictEqual(e_hash_2.none(), false);
		assert.strictEqual(e_hash_2.none(function(k,v){
			return v === 4;
		}), true);
	},
	test_one: function () {
		var e = Enumerator(['ant', 'bear', 'cat']);
		assert.ok(e.one(function(word){ return word.length === 4 }) === true);
		assert.ok(e.one(function(word){ return word.length < 4 }) === false);
		assert.ok(Enumerator([null,true,99]).one() === false);
		assert.ok(Enumerator([null,true,false]).one() === true);

		assert.strictEqual(e_hash.one(function(k,v){ return v === 2; }), true);
		assert.strictEqual(e_hash.one(function(k,v){ return v < 3; }), false);

		assert.strictEqual(e_hash_2.one(function(k,v){ return v === 2; }), true);
		assert.strictEqual(e_hash_2.one(function(k,v){ return v < 3; }), false);
	},
	test_partition: function () {
		var e = Enumerator([6,5,4,3,2,1,0]);
		var empty = Enumerator([]);
		assert.deepEqual(e.partition(function(i){ return i % 3 === 0}).to_a(), [[6,3,0],[5,4,2,1]]);
		assert.deepEqual(e.partition().each(function(i){ return i % 3 === 0}).to_a(), [[6,3,0],[5,4,2,1]]);
		assert.deepEqual(empty.partition(function(){}).to_a(), [[],[]]);

		var ret = e_hash.partition(function(k,v){
			return 1 < v;
		});
		assert.deepEqual(ret.to_a(), [[['b',2],['c',3]],[['a',1]]]);

		ret = e_hash_2.partition(function(k,v){
			return 1 < v;
		});
		assert.deepEqual(ret.to_a(), [[['b',2],['c',3]],[['a',1]]]);
	},
	test_reject: function () {
		var e = Enumerator([1,2,3,2,1]);
		var copy = e;
		assert.deepEqual(e.reject(function(i){ return i === 2 }).to_a(), [1,3,1]);
		assert.ok(e === copy);
		assert.deepEqual(e.to_a(), [1,2,3,2,1]);

		var ret = e_hash.reject(function(k,v){
			return v === 2;
		});
		assert.deepEqual(ret.to_a(), [['a',1],['c',3]]);

		ret = e_hash_2.reject(function(k,v){
			return v === 2;
		});
		assert.deepEqual(ret.to_a(), [['a',1],['c',3]]);
	},
	test_reverse_each: function () {
		var e = Enumerator([2,-3,1]);
		var tmp = [];
		assert.deepEqual(e.reverse_each().to_a(), [1,-3,2]);
		assert.ok(e.reverse_each(function (i) { tmp.push(i) }) === e);
		assert.deepEqual(e.to_a(), [2,-3,1]);
		assert.deepEqual(tmp, [1,-3,2]);

		e = Enumerator([[],[]]);
		e.reverse_each(function(i){
			i.push(1);
		});
		assert.deepEqual(e.obj, [[1],[1]]);

		tmp = [];
		e_hash.reverse_each(function(k,v){
			tmp.push([k,v]);
		});
		assert.deepEqual(tmp, [['c',3],['b',2],['a',1]]);

		tmp = [];
		e_hash_2.reverse_each(function(k,v){
			tmp.push([k,v]);
		});
		assert.deepEqual(tmp, [['c',3],['b',2],['a',1]]);
	},
	test_select: function () {
		var e = Enumerator(function(y){
			y(10);
			y(16);
			y(30);
		});
		assert.deepEqual(e.select(function(i){
			return i % 5 === 0;
		}).to_a(), [10, 30]);
		assert.deepEqual(e.select().each(function(i){
			return i % 5 === 0;
		}).to_a(), [10, 30]);

		var ret = e_hash.select(function(k,v){
			return v < 3;
		});
		assert.deepEqual(ret.to_a(), [['a',1],['b',2]]);

		ret = e_hash_2.select(function(k,v){
			return v < 3;
		});
		assert.deepEqual(ret.to_a(), [['a',1],['b',2]]);
	},
	test_slice_before: function () {
		var a = [0,2,4,1,2,4,5,3,1,4,2];
		var e = Enumerator(a);
		assert.deepEqual(e.slice_before(function(i){
			return i % 2 === 0;
		}).to_a(), [[0],[2],[4,1],[2],[4,5,3,1],[4],[2]]);
		assert.deepEqual(e.slice_before(function(i){
			return i % 2 === 1;
		}).to_a(), [[0,2,4],[1,2,4],[5],[3],[1,4,2]]);

		e = Enumerator(['abc','bcd','cde']);
		assert.deepEqual(e.slice_before(/cd/).to_a(),[['abc'],['bcd'],['cde']]);
		assert.deepEqual(e.slice_before('cde').to_a(),[['abc','bcd'],['cde']]);

		var array = [];
		var tmp = [];
		var sliced = e.slice_before(array, function(i, obj){
			obj.push(i);
			tmp.push(obj);
			return /cde/.test(i);
		});
		assert.deepEqual(tmp, []);
		assert.deepEqual(sliced.to_a(),[['abc','bcd'],['cde']])
		assert.deepEqual(tmp, [['abc','bcd','cde'],['abc','bcd','cde'],['abc','bcd','cde']]);
		assert.deepEqual(array, []);

		sliced = e_hash.slice_before(function(k,v){
			return k === 'b';
		});
		assert.deepEqual(sliced.to_a(), [[["a",1]],[["b",2],["c",3]]]);

		sliced = e_hash_2.slice_before(function(k,v){
			return k === 'b';
		});
		assert.deepEqual(sliced.to_a(), [[["a",1]],[["b",2],["c",3]]]);
	},
	test_sort: function () {
		var e = Enumerator([2,-3,10]);
		assert.deepEqual(e.sort().to_a(), [-3,10,2]);
		assert.deepEqual(e.sort(function(a,b){
			return b - a;
		}).to_a(), [10,2,-3]);
		assert.deepEqual(e.to_a(), [2,-3,10]);

		assert.deepEqual(e_hash.sort().to_a(), [['a',1],['b',2],['c',3]]);
		assert.deepEqual(e_hash.sort(function(a,b){
			return b[1] - a[1];
		}).to_a(), [['c',3],['b',2],['a',1]]);

		assert.deepEqual(e_hash_2.sort().to_a(), [['a',1],['b',2],['c',3]]);
		assert.deepEqual(e_hash_2.sort(function(a,b){
			return b[1] - a[1];
		}).to_a(), [['c',3],['b',2],['a',1]]);
	},
	test_sort_by: function () {
		var e = Enumerator([2,-3,10]);
		assert.deepEqual(e.sort_by(function(i){
			return +i;
		}).to_a(), [-3,2,10]);
		assert.deepEqual(e.sort_by().each(function(i){
			return +i;
		}).to_a(), [-3,2,10]);

		assert.deepEqual(e_hash.sort_by(function(i){
			return -i[1];
		}).to_a(), [['c',3],['b',2],['a',1]]);
		assert.deepEqual(e_hash.sort_by().each(function(k,v){
			return -v;
		}).to_a(), [['c',3],['b',2],['a',1]]);

		assert.deepEqual(e_hash_2.sort_by().each(function(k,v){
			return -v;
		}).to_a(), [['c',3],['b',2],['a',1]]);
	},
	test_take: function () {
		var e = Enumerator(function(y){
			var a = 1;
			var b = 1;
			var tmp;
			for (;;) {
				y(a);
				tmp = b;
				b = a + b;
				a = tmp;
			}
		});
		assert.deepEqual(e.take(10).to_a(), [1,1,2,3,5,8,13,21,34,55]);

		e = Enumerator([1,2,3]).take(2);
		assert.deepEqual(e.to_a(), [1,2]);

		assert.deepEqual(e_hash.take(2).to_a(), [['a',1],['b',2]]);

		assert.deepEqual(e_hash_2.take(2).to_a(), [['a',1],['b',2]]);
	},
	test_take_while: function () {
		assert.deepEqual(Enumerator(function(y){
			var a = 1;
			var b = 1;
			var tmp;
			for (;;) {
				y(a);
				tmp = b;
				b = a + b;
				a = tmp;
			}
		}).take_while(function(i){
			return i < 100;
		}).to_a(), [1,1,2,3,5,8,13,21,34,55,89]);

		e = Enumerator([1,2,3]).take_while(function(i){
			return i < 3;
		});
		assert.deepEqual(e.to_a(), [1,2]);

		e = Enumerator(hash).take_while(function(i){
			return i[1] < 3;
		});
		assert.deepEqual(e.to_a(), [['a',1],['b',2]]);

		var ret = e_hash.take_while(function(k,v){
			return v < 3;
		});
		assert.deepEqual(ret.to_a(), [['a',1],['b',2]]);

		ret = e_hash_2.take_while(function(k,v){
			return v < 3;
		});
		assert.deepEqual(ret.to_a(), [['a',1],['b',2]]);
	},
	test_to_a: function () {
		function assertToA1 (obj, expected) {
			var e = Enumerator(obj);
			assert.deepEqual(e.to_a(), expected);
		};
		assertToA1([1,2,3], [1,2,3]);
		assertToA1(hash, [['a',1],['b',2],['c',3]]);
		assertToA1(function(y){ y(1); y(2); y(3,4); }, [1,2,[3,4]]);

		function assertToA2 (obj, expected) {
			var e = Enumerator(obj, function(y){
				for (var key in this) if (this.hasOwnProperty(key)) {
					y.call(this, key, this[key]);
				}
				return this;
			});
			assert.deepEqual(e.to_a(), expected);
		};
		assertToA2([1,2,3], [['0',1],['1',2],['2',3]]);
		assertToA2(hash, [['a',1],['b',2],['c',3]]);
		assertToA2(function(y){ y(1); y(2); y(3,4); }, [1,2,[3,4]]);
	},
	test_zip: function () {
		var e = Enumerator([1,2,3]);
		assert.deepEqual(e.zip().to_a(), [[1],[2],[3]]);
		assert.deepEqual(e.zip([4,5,6]).to_a(), [[1,4],[2,5],[3,6]]);
		assert.deepEqual(e.zip([4,5,6],[7,8]).to_a(), [[1,4,7],[2,5,8],[3,6,undefined]]);
		assert.deepEqual(e.zip(hash).to_a(), [[1,['a',1]],[2,['b',2]],[3,['c',3]]]);

		assert.deepEqual(e_hash.zip().to_a(), [[['a',1]],[['b',2]],[['c',3]]]);
		assert.deepEqual(e_hash.zip({'e':5,'f':6,'g':7}).to_a(), [
			[['a',1],['e',5]],
			[['b',2],['f',6]],
			[['c',3],['g',7]]
		]);

		assert.deepEqual(e_hash_2.zip().to_a(), [[['a',1]],[['b',2]],[['c',3]]]);
		assert.deepEqual(e_hash_2.zip({'e':5,'f':6,'g':7}).to_a(), [
			[['a',1],['e',5]],
			[['b',2],['f',6]],
			[['c',3],['g',7]]
		]);
	},
	test_parallel: function () {
		var tmp = [];
		Enumerator.parallel([
			[1,2,3,4],
			Enumerator(hash),
			'xyz',
			Enumerator(function(y){
				y(5);
				y(6);
				y(7);
				y(8);
			})
		]).each(function(values){
			tmp.push(values);
		});
		assert.deepEqual(tmp, [
			[1,["a",1],"x",5],
			[2,["b",2],"y",6],
			[3,["c",3],"z",7],
			[4,undefined,undefined,8]
		]);

		tmp = [];
		Enumerator.parallel({
			array: Enumerator([1,2,3,4]),
			object: hash,
			string: Enumerator('xyz'),
			enumerator: function(y){
				y(5);
				y('b');
				y(7);
				y('d');
			}
		}).each(function(values){
			tmp.push(values);
		});
		assert.deepEqual(tmp, [
			[['array',1],['object',["a",1]],  ['string',"x"],      ['enumerator',5]],
			[['array',2],['object',["b",2]],  ['string',"y"],      ['enumerator','b']],
			[['array',3],['object',["c",3]],  ['string',"z"],      ['enumerator',7]],
			[['array',4],['object',undefined],['string',undefined],['enumerator','d']]
		]);
	},
	test_deferred: function () {
		var tmp = [];
		var e = new Enumerator(function(y){
			setTimeout(function(){
				y(2);
				setTimeout(function(){
					y(4);
					setTimeout(function(){
						y(6);
					}, 0);
					y(5);
				}, 0);
				y(3);
			}, 0);
			y(1);
		});
		e.each(function(i){
			tmp.push(i);
		});
		setTimeout(function(){
			assert.deepEqual(tmp, [1,2,3,4,5,6]);
		}, 100);
		assert.deepEqual(tmp, [1]);
	}
};
