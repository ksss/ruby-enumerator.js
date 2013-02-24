ruby-enumerator.js

ruby-enumerator is object that usefull to loop.

install
```
npm install ruby-enumerator
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
