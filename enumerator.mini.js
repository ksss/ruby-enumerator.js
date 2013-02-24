// Rubylike.js (https://github.com/ksss/ruby-enumerator.js)
// Copyright (c) 2013 ksss <co000ri@gmail.com>
function Enumerable(){}function Enumerator(k,a){return this instanceof Enumerator?this.initialize.apply(this,arguments):new Enumerator(k,a)}
(function(){function k(a){return{}.toString.call(a)}Enumerable.prototype.all=function(a){var c=this;try{if("function"===typeof a)return Enumerator(function(a){var b,e=1<a.length?"apply":"call";c.each(function(c){b=b||arguments.length;if(1<b){if(!a.apply(this,arguments))throw!1;}else if(!a[e](this,c))throw!1;});return!0}).each(a);this.each(function(a){if(!a)throw!1;})}catch(b){if(b instanceof Error)throw b;return b}return!0};Enumerable.prototype.any=function(a){var c=this;try{if("function"===typeof a)return Enumerator(function(a){var b,
e=1<a.length?"apply":"call";c.each(function(c){b=b||arguments.length;if(1<b){if(a.apply(this,arguments))throw!0;}else if(a[e](this,c))throw!0;});return!1}).each(a);this.each(function(a){if(a)throw!0;})}catch(b){if(b instanceof Error)throw b;return b}return!1};Enumerable.prototype.chunk=function(a,c){switch(arguments.length){case 1:c=a;a=void 0;break;case 2:var b=k(a);/Array/.test(b)?a=Array.prototype.slice.call(a):/Number|String/.test(b)?Enumerator.raise("TypeError","can't clone "+b):(b=function(){},
b.prototype=a,a=new b)}"function"!==typeof c&&Enumerator.raise("ArgumentError","no callback given");var d=this,f=1<c.length?"apply":"call";return Enumerator(function(b){var h,g,j=!1,m=[];d.each(function(d){var k=Array.prototype.slice.call(arguments);h=a?1<k.length?c.apply(this,[k,a]):c.apply(this,[d,a]):1<k.length?c.apply(this,k):c[f](this,d);null!==h&&(!0===j&&h!==g?(b(g,m),m=[]):j=!0,1<k.length?m.push(k):m.push(d),g=h)});b(g,m);return null})};Enumerable.prototype.collect=function(a){var c=this,
b=Enumerator(function(a){var b=1<a.length?"apply":"call",e=[];c.each(function(c){var g=Array.prototype.slice.call(arguments);1<g.length?e.push(a.apply(this,g)):e.push(a[b](this,c))});return Enumerator(e)});return"function"===typeof a?b.each(a):b};Enumerable.prototype.map=Enumerable.prototype.collect;Enumerable.prototype.count=function(a){if(0===arguments.length)return"function"===typeof this.size?this.size():this.to_a().length;var c=0;if("function"===typeof a){var b=1<a.length?"apply":"call";this.each(function(d){var f=
Array.prototype.slice.call(arguments);1<f.length?a.apply(this,f)&&c++:a[b](this,d)&&c++})}else this.each(function(b){var f=Array.prototype.slice.call(arguments);1<f.length?Enumerable.eql(a,f)&&c++:Enumerable.eql(a,b)&&c++});return c};Enumerable.prototype.cycle=function(a,c){switch(arguments.length){case 0:Enumerator.raise("ArgumentError","wrong number of arguments ("+arguments.length+" for 1)");break;case 1:"number"!==typeof a&&Enumerator.raise("TypeError","must set cycle count")}var b={},d=this,
f=Enumerator(function(c){for(var h=1<c.length?"apply":"call",f=0;f<a;f+=1){var j=0;d.each(function(a){var d=Array.prototype.slice.call(arguments);b.hasOwnProperty(j)||(b[j]=d);if(1<d.length)c.apply(this,b[j]);else c[h](this,b[j][0]);j+=1})}return null});return"function"===typeof c?f.each(c):f};Enumerable.prototype.drop=function(a){var c=[],b=0;this.each(function(d){if(a<=b){var f=Array.prototype.slice.call(arguments);1<f.length?c.push(f):c.push(d)}b+=1});return Enumerator(c)};Enumerable.prototype.drop_while=
function(a){var c=this,b=Enumerator(function(a){var b=1<a.length?"apply":"call",e=!1,h=[];c.each(function(c){var j=Array.prototype.slice.call(arguments);1===j.length&&(j=j[0]);!e&&!a[b](this,j)&&(e=!0);e&&h.push(j)});return Enumerator(h)});return"function"===typeof a?b.each(a):b};Enumerable.prototype.each_cons=function(a,c){switch(arguments.length){case 0:Enumerator.raise("ArgumentError","wrong number of arguments ("+arguments.length+" for 1)");break;case 1:"number"!==typeof a&&Enumerator.raise("TypeError",
"must set cons num")}var b=this,d=Enumerator(function(c){var d=[],h=1,g=1<c.length?"apply":"call";b.each(function(b){var k=Array.prototype.slice.call(arguments);1<k.length?d.push(k):d.push(b);if(a<=h)c[g](this,d.slice(h-a,h));h+=1});return null});return"function"===typeof c?d.each(c):d};Enumerable.prototype.each_slice=function(a,c){var b=1,d=[],f=this,e=Enumerator(function(c){var e;f.each(function(f){var k=Array.prototype.slice.call(arguments);1<k.length?d.push(k):d.push(f);0===b%a&&(e=e||(1<c.length?
"apply":"call"),c[e](d,d),d=[]);b+=1});c[e||"call"](d,d);return null});return"function"===typeof c?e.each(c):e};Enumerable.prototype.each_with_index=function(a){var c=0,b=this,d=Enumerator(function(a){b.each(function(b){var d=Array.prototype.slice.call(arguments);1<d.length?a.call(this,d,c):a.call(this,b,c);c+=1});return b});return"function"===typeof a?d.each(a):d};Enumerable.prototype.each_with_object=function(a,c){var b=this,d=Enumerator(function(c){b.each(function(b){var d=Array.prototype.slice.call(arguments);
1<d.length?c.call(this,d,a):c.call(this,b,a)});return a});return"function"===typeof c?d.each(c):d};Enumerable.prototype.find=function(a,c){1===arguments.length&&(c=a,a=null);var b=this,d=Enumerator(function(c){var d=1<c.length?"apply":"call";try{b.each(function(a){var b=Array.prototype.slice.call(arguments);if(1<b.length){if(c.apply(this,b))throw b;}else if(c[d](this,a))throw a;})}catch(h){if(h instanceof Error)throw h;return h}return a});return"function"===typeof c?d.each(c):d};Enumerable.prototype.detect=
Enumerable.prototype.find;Enumerable.prototype.find_index=function(a){var c=this,b=Enumerator(function(a){var b=0,e=1<a.length?"apply":"call";try{c.each(function(c){var h=Array.prototype.slice.call(arguments);if(1<h.length){if(a.apply(this,h))throw b;}else if(a[e](this,c))throw b;b+=1})}catch(h){if(h instanceof Error)throw h;return h}return null});return"function"===typeof a?b.each(a):b};Enumerable.prototype.first=function(a){return 0===arguments.length?this.take(1).to_a()[0]:this.take(a)};Enumerable.prototype.flat_map=
function(a){var c=this,b=Enumerator(function(a){var b=[];c.collect(a).each(function(a){Array.isArray(a)?b=b.concat(a):b.push(a)});return Enumerator(b)});return"function"===typeof a?b.each(a):b};Enumerable.prototype.collect_concat=Enumerable.prototype.flat_map;Enumerable.prototype.grep=function(a,c){var b=[];a instanceof RegExp?this.each(function(c){var d=Array.prototype.slice.call(arguments);1===d.length&&(d=d[0]);a.test(d)&&b.push(d)}):this.each(function(c){var d=Array.prototype.slice.call(arguments);
1===d.length&&(d=d[0]);Enumerable.eql(d,a)&&b.push(d)});var d=Enumerator(b);return"function"===typeof c?d.collect(c):d};Enumerable.prototype.group_by=function(a){var c=this,b=Enumerator(function(a){var b={},e=1<a.length?"apply":"call";c.each(function(c){var g=Array.prototype.slice.call(arguments),j;j=1<g.length?a.apply(this,g):a[e](this,c);b.hasOwnProperty(j)||(b[j]=[]);1<g.length?b[j].push(g):b[j].push(c)});return Enumerator(b)});return"function"===typeof a?b.each(a):b};Enumerable.prototype.include=
function(a){try{this.each(function(b){var c=Array.prototype.slice.call(arguments);if(1<c.length){if(Enumerable.eql(c,a))throw!0;}else if(Enumerable.eql(b,a))throw!0;})}catch(c){if(c instanceof Error)throw c;return!0}return!1};Enumerable.prototype.member=Enumerable.prototype.include;Enumerable.prototype.inject=function(a,c){this.each(function(b){var d=Array.prototype.slice.call(arguments);1<d.length&&(b=d);void 0===c?(c=a,"function"!==typeof c&&Enumerator.raise("LocalJumpError","no callback given"),
a=b):a=c.call(this,a,b)});return a};Enumerable.prototype.reduce=Enumerable.prototype.inject;Enumerable.prototype.max=function(a){function c(a){if("[object Object]"===k(a))for(var b in a)return c(b);return a}var b=[],d=0,f,e="function"===typeof a?a:function(a,b){return a<b?-1:a>b?1:0};this.each(function(a){var g=Array.prototype.slice.call(arguments);1<g.length&&(a=g);b.unshift(a);if(0===d)f=k(c(a));else{var g=e.call(this,b[0],b[1]),j=k(c(a));(j!==f||g instanceof Number)&&Enumerator.raise("ArgumentError",
"comparison of "+j+" with "+b[1]+" failed");b[0<g?"pop":"shift"]()}d+=1});return 0===b.length?null:b[0]};Enumerable.prototype.max_by=function(a){var c=this,b=Enumerator(function(a){var b=1<a.length?"apply":"call";return c.collect(function(c){var h=Array.prototype.slice.call(arguments);return 1<h.length?[a.apply(this,h),h]:[a[b](this,c),c]}).max(function(a,b){return a[0]<b[0]?-1:a[0]>b[0]?1:0})[1]});return"function"===typeof a?b.each(a):b};Enumerable.prototype.min=function(a){function c(a){if("[object Object]"===
k(a))for(var b in a)return c(b);return a}var b=[],d=0,f,e="function"===typeof a?a:function(a,b){return a<b?-1:a>b?1:0};this.each(function(a){var g=Array.prototype.slice.call(arguments);1<g.length&&(a=g);b.unshift(a);if(0===d)f=k(c(a));else{var g=e.call(this,b[0],b[1]),j=k(c(a));(j!==f||g instanceof Number)&&Enumerator.raise("ArgumentError","comparison of "+j+" with "+b[1]+" failed");b[0>g?"pop":"shift"]()}d+=1});return 0===b.length?null:b[0]};Enumerable.prototype.min_by=function(a){var c=this,b=Enumerator(function(a){var b=
1<a.length?"apply":"call";return c.collect(function(c){var h=Array.prototype.slice.call(arguments);return 1<h.length?[a.apply(this,h),h]:[a[b](this,c),c]}).min(function(a,b){return a[0]<b[0]?-1:a[0]>b[0]?1:0})[1]});return"function"===typeof a?b.each(a):b};Enumerable.prototype.minmax=function(a){var c=this.max(a);a=this.min(a);return Enumerator([a,c])};Enumerable.prototype.minmax_by=function(a){var c=this,b=Enumerator(function(a){var b=1<a.length?"apply":"call",e=c.collect(function(c){var e=Array.prototype.slice.call(arguments);
return 1<e.length?[a.apply(this,e),e]:[a[b](this,c),c]}).minmax(function(a,b){return a[0]<b[0]?-1:a[0]>b[0]?1:0}).obj;return Enumerator([e[0][1],e[1][1]])});return"function"===typeof a?b.each(a):b};Enumerable.prototype.none=function(a){return!this.any.apply(this,arguments)};Enumerable.prototype.one=function(a){var c=0;try{if("function"===typeof a){var b=1<a.length?"apply":"call",d;this.each(function(e){d=d||arguments.length;if(1<d?a.apply(this,arguments):a[b](this,arguments[0]))if(c+=1,1<c)throw!1;
})}else this.each(function(a){if(a&&(c+=1,1<c))throw!1;})}catch(f){if(f instanceof Error)throw f;return f}return 1===c};Enumerable.prototype.partition=function(a){var c=this,b=Enumerator(function(a){var b=[[],[]],e=1<a.length?"apply":"call";c.each(function(c){var g=Array.prototype.slice.call(arguments);1<g.length&&(c=g);a[e](this,c)?b[0].push(c):b[1].push(c)});return Enumerator(b)});return"function"===typeof a?b.each(a):b};Enumerable.prototype.reject=function(a){var c=this,b=Enumerator(function(a){var b=
[],e,h=1<a.length?"apply":"call";c.each(function(c){e=e||arguments.length;if(1<e){var j=Array.prototype.slice.call(arguments);a.apply(this,j)||b.push(j)}else a[h](this,c)||b.push(c)});return Enumerator(b)});return"function"===typeof a?b.each(a):b};Enumerable.prototype.reverse_each=function(a){var c=this,b=Enumerator(function(a){var b=1<a.length?"apply":"call",e=[];c.each(function(a){e.push([this,arguments])});var h=e.length;c.each(function(){h--;if(1<e[h][1].length)a.apply(e[h][0],e[h][1]);else a[b](e[h][0],
e[h][1][0])});return c});return"function"===typeof a?b.each(a):b};Enumerable.prototype.slice_before=function(a,c){switch(arguments.length){case 1:if("function"===typeof a)c=a;else if(a instanceof RegExp){var b=a;c=function(a){return b.test(a)}}else{var d=a;c=function(a){return Enumerable.eql(d,a)}}a=void 0;break;case 2:var f=k(a);/Array/.test(f)?a=Array.prototype.slice.call(a):/Number|String/.test(f)?Enumerator.raise("TypeError","can't clone "+f):(f=function(){},f.prototype=a,a=new f)}var e=this;
return Enumerator(function(b){var d=!1,f=[],k=1<b.length?"apply":"call",l=1<c.length?"apply":"call";e.each(function(e){var n=Array.prototype.slice.call(arguments);1===n.length&&(n=n[0]);if((a?c.apply(this,[n,a]):c[l](this,n))&&d)b[k](f,f),f=[];1<n.length?f.push(n):f.push(e);d=!0});b[k](f,f);return null})};Enumerable.prototype.select=function(a){var c=this,b=Enumerator(function(a){var b=[],e=1<a.length?"apply":"call";c.each(function(c){var g=Array.prototype.slice.call(arguments);1<g.length?a.apply(this,
g)&&b.push(g):a[e](this,c)&&b.push(c)});return Enumerator(b)});return"function"===typeof a?b.each(a):b};Enumerable.prototype.find_all=Enumerable.prototype.select;Enumerable.prototype.sort=function(){var a=Array.prototype.sort.apply(this.to_a(),arguments);return Enumerator(a)};Enumerable.prototype.sort_by=function(a){var c=this,b=Enumerator(function(a){var b=1<a.length?"apply":"call",e;return c.collect(function(c){e=e||arguments.length;if(1<e){var g=Array.prototype.slice.call(arguments);return[a.apply(this,
g),g]}return[a[b](this,c),c]}).sort(function(a,b){return a[0]<b[0]?-1:a[0]>b[0]?1:0}).collect(function(a){return a[1]})});return"function"===typeof a?b.each(a):b};Enumerable.prototype.take=function(a){var c=k(a);"[object Number]"!==c&&Enumerator.raise("TypeError","can't convert "+c+" into Number");var b=0,d=[];try{this.each(function(c){if(b<a){var f=Array.prototype.slice.call(arguments);1<f.length?d.push(f):d.push(c)}else throw!0;b+=1})}catch(f){if(f instanceof Error)throw f;}return Enumerator(d)};
Enumerable.prototype.take_while=function(a){var c=[],b=1<a.length?"apply":"call";try{this.each(function(d){var e=Array.prototype.slice.call(arguments);1===e.length&&(e=e[0]);if(a[b](this,e))c.push(e);else throw!0;})}catch(d){}return Enumerator(c)};Enumerable.prototype.to_a=function(){if(this.method===Enumerator.default_method.array)return Array.prototype.slice.call(this.obj);var a=[];this.each(function(c){var b=Array.prototype.slice.call(arguments);1<b.length?a.push(b):a.push(c)});return a};Enumerable.prototype.zip=
function(){var a=this,c=Array.prototype.slice.call(arguments),b="function"===typeof c[c.length-1]?c.pop():null,d=Enumerator(function(b){var d=0;a.each(function(a){var g=Array.prototype.slice.call(arguments);1===g.length&&(g=g[0]);for(var g=[g],j=0,m=c.length;j<m;j+=1){var l=c[j];switch(k(l)){case "[object Array]":break;case "[object Object]":l=Enumerator(l).to_a();break;default:l=Array.prototype.slice.call(l)}g.push(l[d])}b(g);d+=1});return null});return"function"===typeof b?d.each(b):d};Enumerable.eql=
function(a,c){var b,d,f,e;if(a===c)return!0;if(null===a||(void 0===a||null===c||void 0===c)||a.prototype!==c.prototype)return!1;if(a.valueOf()===c.valueOf())return!0;if(a instanceof Date&&c instanceof Date)return a.getTime()===c.getTime();if("object"!=typeof a&&"object"!=typeof c)return a===c;try{f=[];d=[];for(b in a)a.hasOwnProperty(b)&&f.push(b);for(b in c)c.hasOwnProperty(b)&&d.push(b)}catch(h){return!1}if(f.length!==d.length)return!1;f.sort();d.sort();b=0;for(e=f.length;b<e;b+=1)if(f[b]!==d[b])return!1;
for(b=f.length-1;0<=b;b--)if(d=f[b],!Enumerable.eql(a[d],c[d]))return!1;return!0};Enumerable.include=function(a){a.prototype=new this;a.prototype.constructor=a;return this};Enumerable.include(Enumerator);Enumerator.prototype.obj=void 0;Enumerator.prototype.method=void 0;Enumerator.prototype.index=void 0;Enumerator.prototype.initialize=function(a,c){switch(typeof a){case "undefined":return this;case "function":c=a,a=null}this.obj=a;this.method=c||Enumerator.default_method(a);this._index=0;return this};
Enumerator.prototype.each=function(a){return"function"===typeof a?this.method.call(this.obj,a):this};Enumerator.prototype.next=function(){var a=this.peek_values();this._index+=1;return a[0]};Enumerator.prototype.next_values=function(){var a=this.peek_values();this._index+=1;return a};Enumerator.prototype.peek=function(){return this.peek_values()[0]};Enumerator.prototype.peek_values=function(){var a=0,c=this,b=Array.isArray&&Array.isArray(this.obj)||"[object Array]"===k(this.obj),b=this.method===Enumerator.default_method.array&&
b;void 0===this._index&&(this._index=0);if(b&&this._index<this.obj.length)return[this.obj[this._index]];try{this.each(function(b){if(a===c._index){if(1<arguments.length)throw[Array.prototype.slice.call(arguments)];if(0===arguments.length)throw[];throw[b];}a+=1})}catch(d){if(d instanceof Error)throw d;return d}Enumerator.raise("StopIteration","iteration reached an end")};Enumerator.prototype.rewind=function(){this._index=0;this.obj&&"function"===typeof this.obj.rewind&&this.obj.rewind();return this};
Enumerator.prototype.with_index=function(a,c){"function"===typeof a&&(c=a,a=0);a=a||0;var b=this,d=Enumerator(function(c){b.each(function(b){var d=Array.prototype.slice.call(arguments);1<d.length?c.call(d,d,a):c.call(b,b,a);a+=1});return b.obj});return"function"===typeof c?d.each(c):d};Enumerator.prototype.with_object=function(a,c){var b=this,d=Enumerator(function(c){b.each(function(){var b=Array.prototype.slice.call(arguments);1<b.length?c.apply(this,[b,a]):c.apply(this,[b[0],a])});return a});return"function"===
typeof c?d.each(c):d};Enumerator.default_method=function(a){return/Array|Arguments/.test(k(a))?Enumerator.default_method.array:"object"===typeof a?Enumerator.default_method.hash:Enumerator.default_method.other};Enumerator.default_method.hash=function(a){var c=1<a.length?"apply":"call",b;for(b in this)if(this.hasOwnProperty(b))a[c](this,[b,this[b]]);return this};Enumerator.default_method.array=function(a){for(var c=0,b=this.length;c<b;c+=1)a.call(this,this[c]);return this};Enumerator.default_method.other=
function(a){for(var c in this)this.hasOwnProperty(c)&&a.call(this,this[c]);return this};Enumerator.extend=function(a){var c=Enumerator.prototype,b=[],d;for(d in c)void 0===a[d]&&(a[d]=c[d],b.push(d));return b};Enumerator.raise=function(a,c){var b=Error(a);b.name=a;b.message=c;throw b;};Enumerator.parallel=function(a){var c=Array.isArray&&Array.isArray(a)||"[object Array]"===k(a),b;for(b in a)if(a.hasOwnProperty(b)){var d=a[b];a[b]=d instanceof Enumerator?d:Enumerator(d)}return Enumerator(function(b){for(;;){var d=
[],h=0,g;for(g in a)if(a.hasOwnProperty(g))try{var j=a[g].next();d.push(c?j:[g,j]);h+=1}catch(k){if("StopIteration"===k.name)d.push(c?void 0:[g,void 0]);else throw k;}if(0===h)return null;b(d)}})};this.Enumerable=Enumerable;this.Enumerator=Enumerator}).call(this);
