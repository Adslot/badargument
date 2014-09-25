Bad Argument JS
===============

Minimalistic pure JavaScript function contracts.

```javascript
var tag = require('badargument').tag


function myImportantFunction(aVeryImportantArgument, thisIsNotImportantReally, thisMustBeAFunction) {
  tag '* _ F';

  whooohooo.some(code);
}

myImportantFunction('anyNonNullGoes', null, 'thisInsteadShouldBeAFunction');
```

Throws:
```
BadArgumentError: arg 2 of myImportantFunction is not a function. Arguments: ["anyNonNullGoes",null,"thisInsteadShouldBeAFunction"]
```


Default error conditions
------------------------
 * `F`: `typeof arg !== 'function'`
 * `O`: `typeof arg !== 'object'`
 * `N`: `typeof arg !== 'number'`
 * `S`: `typeof arg !== 'string'`
 * `A`: `!Array.isArray(arg)`
 * `t`: `!arg`
 * `*`: `arg == null`
 * `_`: ignore the argument


Custom error conditions
-----------------------
```javascript
var badargument = require 'badargument'

var myTag = badargument.tagFactory badargument.defaultTests({
  E: 'is not even -> arg % 2 !== 0'
  red: 'is not red -> !arg || arg.color !== "red"'
});


function eat(howMany, appleType, where, otherStuffWeDontCareAbout) {
  myTag 'E red S'
}

var apple = {color: 'blue'}
eat(4, apple, 'on the moon');
```
Will throw `BadArgumentError: arg 1 of eat is not red. Arguments: [4,{"color":"blue"},"on the moon"]`


TODO
----
How good is it to output the whole `JSON.stringify`cation of `arguments`?
