#! /usr/bin/env node

var Enumerator = require('../enumerator.js').Enumerator;
var Limited = require('../enumerator.limited.js').Enumerator;

function benchmark (obj) {
	for (var name in obj) (function(callback){
		console.log('*' + name);
		for (var key in callback) {
			console.time(key);
			callback[key]();
			console.timeEnd(key);
		}
	})(obj[name]);
}

var array = [];
var obj = {};
for (i = 0; i < 1000; i++) {
	array.push(i);
	obj[i] = i;
}
var clone = JSON.parse(JSON.stringify(obj));

benchmark({
	"new": {
		"Array": function(){
			for (var i = 0, len = array.length; i < len * len; i++) {
				new Array();
			}
		},
		"Enumerator": function(){
			for (var i = 0, len = array.length; i < len * len; i++) {
				new Enumerator();
			}
		},
		"Limited": function(){
			for (var i = 0, len = array.length; i < len * len; i++) {
				new Limited();
			}
		},
	},
	"array one loop": {
		"forEach": function () {
			array.forEach(function(i){
			});
		},
		"enumerator": function () {
			Enumerator(array).each(function(i){
			});
		},
		"Limited": function () {
			Limited(array).each(function(i){
			});
		},
	},
	"array double loop": {
		"forEach": function () {
			array.forEach(function(i){
				array.forEach(function(i){
				});
			});
		},
		"enumerator": function () {
			Enumerator(array).each(function(i){
				Enumerator(array).each(function(j){
				});
			});
		},
		"Limited": function () {
			Limited(array).each(function(i){
				Limited(array).each(function(i){
				});
			});
		},
	},
	"array next": {
		"Enumerator": function () {
			var e = Enumerator(array);
			try {
				while (0 <= e.next());
			} catch (ex) {}
		},
		"Limited": function () {
			var e = Limited(array);
			try {
				while (0 <= e.next());
			} catch (ex) {}
		},
	},
	"obj one loop": {
		"for in": function () {
			for (var key in obj) if (obj.hasOwnProperty(key)) {
			}
		},
		"enumerator": function () {
			Enumerator(obj).each(function(i){
			});
		},
		"Limited": function () {
			Limited(obj).each(function(i){
			});
		},
	},
	"obj double loop": {
		"for in": function () {
			for (var key in obj) if (obj.hasOwnProperty(key)) {
				for (var k in clone) if (obj.hasOwnProperty(k)) {
				}
			}
		},
		"enumerator": function () {
			Enumerator(obj).each(function(i){
				Enumerator(clone).each(function(j){
				});
			});
		},
		"Limited": function () {
			Limited(obj).each(function(i){
				Limited(clone).each(function(j){
				});
			});
		},
	},
	"obj next": {
		"Enumerator": function () {
			var e = Enumerator(obj);
			try {
				while (e.next());
			} catch (ex) {
			}
		},
		"Limited": function () {
			var e = Enumerator(obj);
			try {
				while (e.next());
			} catch (ex) {
			}
		},
	},
	"fibonacci": {
		"Enumerator": function () {
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
			e.take(10000).to_a();
		},
	}
});
