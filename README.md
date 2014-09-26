Bad Argument JS
===============

Terse, pure JavaScript function argument type checker.
Implements contract pre-conditions for functions.
Built for speed.


```javascript
var tag = require('badargument')


function myImportantFunction(aVeryImportantArgument, thisIsNotImportantReally, thisMustBeAFunction) {
  tag 'defined ignore function';

  whooohooo.some(code);
}

myImportantFunction('anyNonNullGoes', null, 'thisInsteadShouldBeAFunction');
```

Throws:
```
BadArgumentError: arg 2 of myImportantFunction is not a function. Arguments: ["anyNonNullGoes",null,"thisInsteadShouldBeAFunction"]
```

Bad Argument uses [Function.caller](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/caller)
and will degrade gracefully if it is not available.


Default error conditions
------------------------
 * `function` or `F`: `typeof arg !== "function"`
 * `object` or `O`: `!(arg instanceof Object)`
 * `number` or `N`: `typeof arg !== "number"`
 * `string` or `S`: `typeof arg === "string" || arg instanceof String`
 * `array` or `A`: `!Array.isArray(arg)`
 * `truthy` or `t`: `!arg`
 * `defined` or `*`: `arg == null`
 * `ignore` or `_`: `false`

As a guideline, single-char versions of conditions that test for type are uppercase letters.


Custom error conditions
-----------------------
```javascript
var badargument = require 'badargument'

var myTag = badargument.factory badargument.defaultTests({
  e: 'is not even -> arg % 2 !== 0'
  red: 'is not red -> !arg || arg.color !== "red"'
});


function eat(howMany, appleType, where, callback) {
  myTag 'e red string function'
}

var apple = {color: 'blue'}
eat(4, apple, 'on the moon');
```
Will throw `BadArgumentError: arg 1 of eat is not red. Arguments: [4,{"color":"blue"},"on the moon"]`


TODO
----
How good is it to output the whole `JSON.stringify`cation of `arguments`?
