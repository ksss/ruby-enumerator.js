ruby-enumerator.js

ruby-enumerator is object that usefull to loop.

if you write array loop in javascript. you write it?
```javascript
var a = [1,2,3];
for (var i = 0, len = a.length; i < len; i++) {
  console.log(i); //=> 1,2,3
}
```
or
```javascript
[1,2,3].forEach(function(i){
  console.log(i); //=> 1,2,3
});
```


ruby-enumerator.js
```javascript
Enumerator([1,2,3]).each(function(i){
  console.log(i); //=> 1,2,3
});
```

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
}).take(10) //=> [1,1,2,3,5,8,13,21,34,55]
```
