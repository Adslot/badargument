
function evalInSmallestLocalScope(condition) {
  var arg;
  return eval(condition);
};


function BadArgumentError(index, keyMessage, caller) {
  Error.captureStackTrace(this);
  this.message = 'arg ' + index + ' of ' + (caller.name || 'function') + ' ' + keyMessage + '.';
  this.arguments = caller.arguments
}
BadArgumentError.prototype = Object.create(Error.prototype);
BadArgumentError.prototype.name = 'BadArgumentError';


// Transform a string that describes the argument requirements into a function that actually runs the tests
function makeTestFunction(testsString, testsByKey) {

  var testsCode = testsString.split(' ').map(function(key, index) {

    var test = testsByKey[key]
    if (!test) {throw new Error('Invalid key "' + key + '" from "' + testsString + '"');}
    if (test.condition === 'false') {return '';}

    var jsExpression = (typeof test.condition === 'function') ?
      ('testsByKey["' + key + '"].condition(args[' + index + '])') :
      test.condition.replace(/(^|[^a-zA-Z0-9$_])arg([^a-zA-Z0-9$_]|$)/g, '$1(args[' + index + '])$2');

    return ' if(' + jsExpression + ') {throw new BadArgumentError(' + index + ', "' + test.message + '", caller)};';
  });

  return eval('(function(caller) { var args = caller.arguments;\n' + (testsCode.join('\n')) + '\n})');
};


function factory() {

  // `caller` is supported pretty much everywhere but is not standard.
  if (!('caller' in Function.prototype)) {return function() {};}

  testDefinitionsByKey = {}

  for (var index = 0; index < arguments.length; index++) {
    var arg = arguments[index];
    for (var key in arg) testDefinitionsByKey[key] = arg[key];
  };


  var keys = {};
  for (var key in testDefinitionsByKey) {

    var definition = testDefinitionsByKey[key]
    keys[key] = {message: definition.message, condition: definition.condition};

    if (typeof definition.condition !== 'function') {
      try { evalInSmallestLocalScope(keys[key].condition); } catch (error) {
        throw new Error('Cannot eval() condition in "' + definition.condition + '": ' + error.message);
      }
    }
  }

  testFunctions = {};
  return function tester(test) {
    var fn = testFunctions[test] || (testFunctions[test] = makeTestFunction(test, keys));
    return fn(tester.caller);
  };
};


function defaultTests() {

  var ff = {message: 'is not a function', condition: 'typeof arg !== "function"'};
  var oo = {message: 'is not an object', condition: '!(arg instanceof Object)'};
  var nn = {message: 'is not a number', condition: 'typeof arg !== "number"'};
  var ss = {message: 'is not a string', condition: 'typeof arg !== "string" && !(arg instanceof String)'};
  var aa = {message: 'is not an Array', condition: '!Array.isArray(arg)'};
  var tt = {message: 'is falsy', condition: '!arg'};
  var dd = {message: 'must be defined', condition: 'arg == null'};
  var ii = {message: 'ignore the argument', condition: 'false'};

  return {
    function: ff, F: ff,
    object: oo, O: oo,
    number: nn, N: nn,
    string: ss, S: ss,
    array: aa, A: aa,
    truthy: tt, t: tt,
    defined: dd, '*': dd,
    ignored: ii, _: ii
  };

};


module.exports = factory(defaultTests());
module.exports.BadArgumentError = BadArgumentError
module.exports.factory = factory
module.exports.defaultTests = defaultTests
