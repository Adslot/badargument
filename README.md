Bad Argument JS
===============

Terse, pure JavaScript function argument type checker.
Implements contract pre-conditions for functions.
Built for speed.


```javascript
var argsMustBe = require('badargument');


function importantFunction(veryImportant, notImportant, thisMustBeAFunction) {
  argsMustBe('defined ignored function');

  whooohooo.some(code);
}

myImportantFunction('anyNonNullGoes', null, 'thisInsteadShouldBeAFunction');
```

Throws:
```
BadArgumentError: arg 2 of myImportantFunction is not a function.
```
Call arguments will also be stored in the Error's `.arguments` attribute.

Bad Argument uses [Function.caller](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/caller)
and will degrade gracefully if it is not available [citation needed]().


Default error conditions
------------------------
 * `function` or `F`: `typeof arg !== "function"`
 * `object` or `O`: `!(arg instanceof Object)`
 * `number` or `N`: `typeof arg !== "number"`
 * `string` or `S`: `typeof arg === "string" || arg instanceof String`
 * `array` or `A`: `!Array.isArray(arg)`
 * `truthy` or `t`: `!arg`
 * `defined` or `*`: `arg == null`
 * `ignored` or `_`: `false`

As a guideline, single-char versions of conditions that test for type are uppercase letters.


Custom error conditions
-----------------------
```javascript
var badargument = require('badargument');
function Banana(){}

var myArgsMustBe = badargument.factory(
  badargument.defaultTests(),
  {
    B: {message: 'is not a banana', condition: function(arg) {return !(arg instanceof Banana)}},
    red: {message: 'is not red', condition: '!arg || arg.color !== "red"'}
  }
);


function picnic(howMany, appleType, where, callback) {
  myArgsMustBe('B red string function');
}

var apple = {color: 'blue'};
picnic(new Banana, apple, 'on the moon');
```
Will throw `BadArgumentError: arg 1 of picnic is not red.`


TODO
----
* Add tests for `arguments` attribute
* Add tests for graceful degradation
* Add documentation for function conditions
