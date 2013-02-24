ruby-enumerator.js
==================


[![Build Status](https://travis-ci.org/ksss/ruby-enumerator.js.png?branch=master)](https://travis-ci.org/ksss/ruby-enumerator.js)

ruby-enumerator.js is object can use Ruby **Enumerator** and **Enumerable** methods in javascript.

## install
_node_
```
npm install ruby-enumerator
```
_html_
```
<script src="https://raw.github.com/ksss/ruby-enumerator.js/master/enumerator.js">
```

## doc
see [https://github.com/ksss/ruby-enumerator.js/tree/master/doc](https://github.com/ksss/ruby-enumerator.js/tree/master/doc)

and [http://doc.ruby-lang.org/ja/1.9.3/class/Enumerator.html](http://doc.ruby-lang.org/ja/1.9.3/class/Enumerator.html)

## example

_array_
```javascript
var e = Enumerator([1,2,3])
e.each(function(i){
  console.log(i); //=> 1,2,3
});
console.log(e.next()) //=> 1
console.log(e.next()) //=> 2
console.log(e.next()) //=> 3
```

_object_
```javascript
var e = Enumerator({"a":1,"b":2,"c":3});
e.each(function(key,value){
  console.log([key,value]); //=> ['a',1],['b':2],['c',3]
});
console.log(e.next()) //=> ['a',1]
console.log(e.next()) //=> ['b',2]
console.log(e.next()) //=> ['c',3]
```

_function_
```javascript
Enumerator(function(y){
  var a = 1;
  var b = 1;
  var tmp;
  for (;;) {
    y(a);
    tmp = b;
    b = a + b;
    a = tmp;
  }
}).take(10).to_a() //=> [1,1,2,3,5,8,13,21,34,55]
```

## LICENSE
see [https://github.com/ksss/ruby-enumerator.js/blob/master/enumerator.js](https://github.com/ksss/ruby-enumerator.js/blob/master/enumerator.js)
