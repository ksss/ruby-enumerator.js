ruby-enumerator.js
==================


[![Build Status](https://travis-ci.org/ksss/ruby-enumerator.js.png?branch=master)](https://travis-ci.org/ksss/ruby-enumerator.js)

ruby-enumerator.js is object can use Ruby(v1.9.3) all **Enumerator** and **Enumerable** methods in javascript.

## synopsis
Code of Ruby Enumerator like this ...
```ruby
e = Enumerator.new([1,3,4,6])
e.chunk { |i|
  i.even?
}.each { |res, i|
  p [res,i]
  #=> [false, [1, 3]]
  #=> [true, [4, 6]]
}
```
_ruby-enumerator.js_ can write as Ruby like this code.
```javascript
var e = new Enumerator([1,3,4,6]);
e.chunk(function(i){
  return i % 2 === 0;
}).each(function(res, i){
  console.log([res, i]);
  //=> [false, [1, 3]]
  //=> [true, [4, 6]]
});
```

## installation
_node_
```
npm install ruby-enumerator
```
```javascript
var Enumerator = require('ruby-enumerator').Enumerator;
```

_html_
```
<script src="https://raw.github.com/ksss/ruby-enumerator.js/master/enumerator.js"></script>
```


## doc
see [https://github.com/ksss/ruby-enumerator.js/tree/master/doc](https://github.com/ksss/ruby-enumerator.js/tree/master/doc)

and more

[http://doc.ruby-lang.org/ja/1.9.3/class/Enumerator.html](http://doc.ruby-lang.org/ja/1.9.3/class/Enumerator.html)

[http://doc.ruby-lang.org/ja/1.9.3/class/Enumerable.html](http://doc.ruby-lang.org/ja/1.9.3/class/Enumerable.html)

## example
_array_ is basic use way.
```javascript
var e = Enumerator([1,2,3])
e.each(function(i){
  console.log(i); //=> 1,2,3
});
console.log(e.next()) //=> 1
console.log(e.next()) //=> 2
console.log(e.next()) //=> 3
```

_object_ can use in the same way as array.
```javascript
var e = Enumerator({"a":1,"b":2,"c":3});
e.each(function(key,value){
  console.log([key,value]); //=> ['a',1],['b':2],['c',3]
});
console.log(e.next()) //=> ['a',1]
console.log(e.next()) //=> ['b',2]
console.log(e.next()) //=> ['c',3]
```

_function_ can use infinity list
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

async each
```
var e = new Enumerator(function(y){
  setTimeout(function(){
    y(2);
    setTimeout(function(){
      y(4);
    }, 0);
    y(3);
  }, 0);
  y(1);
});
e.each(function(i){
  console.log(i); //=> 1,2,3,4
});
```

and can extend other object.
```javascript
Enumerator.extend(jQuery);
jQuery('.foo').chunk(function(i){
  //...
}).each(function(res,i){
  //...
});
```

## LICENSE
see [https://github.com/ksss/ruby-enumerator.js/blob/master/enumerator.js](https://github.com/ksss/ruby-enumerator.js/blob/master/enumerator.js)

