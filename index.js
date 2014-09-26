
function evalInSmallestLocalScope(condition) {
  var arg;
  return eval(condition);
};


// TODO: Still not sold on this way of creating a custom Error
// TODO: Stringifying `arguments` can produce a very long `error.message`. Is this ok?
function BadArgumentError(index, keyMessage, caller) {
  Error.captureStackTrace(this);
  var args = JSON.stringify(Array.prototype.slice.call(caller.arguments));
  this.message = 'arg ' + index + ' of ' + (caller.name || 'function') + ' ' + keyMessage + '. Arguments: ' + args;
}
BadArgumentError.prototype = Object.create(Error.prototype);
BadArgumentError.prototype.name = 'BadArgumentError';


// Transform a string that describes the argument requirements into a function that actually runs the tests
function makeTestFunction(testsString, testsByKey) {

  var testsCode = testsString.split(' ').map(function(key, index) {

    var test = testsByKey[key]
    if (!test) {throw new Error('Invalid key ' + key + ' from ' + testsString);}
    if (test.condition === 'false') {return '';}

    jsExpression = test.condition.replace(/(^|[^a-zA-Z0-9$_])arg([^a-zA-Z0-9$_]|$)/g, '$1(args[' + index + '])$2');
    return ' if(' + jsExpression + ') {throw new BadArgumentError(' + index + ', "' + test.message + '", caller)};';
  });

  return eval('(function(caller) { var args = caller.arguments;\n' + (testsCode.join('\n')) + '\n})');
};


function factory(testDefinitionsByKey) {

  // `caller` is supported pretty much everywhere but is not standard.
  if (!('caller' in Function.prototype)) {return function() {};}

  var keys = {};
  for (var key in testDefinitionsByKey) {
    var definition = testDefinitionsByKey[key];

    var split = definition.split('->');
    keys[key] = {
      message: split[0].trim(),
      condition: split[1].trim()
    };

    try { evalInSmallestLocalScope(keys[key].condition); } catch (error) {
      throw new Error('Cannot eval() condition in "' + definition + '": ' + error.message);
    }
  }

  testFunctions = {};
  return function tester(test) {
    var fn = testFunctions[test] || (testFunctions[test] = makeTestFunction(test, keys));
    return fn(tester.caller);
  };
};


function defaultTests() {

  var ff = 'is not a function -> typeof arg !== "function"';
  var oo = 'is not an object -> !(arg instanceof Object)';
  var nn = 'is not a number -> typeof arg !== "number"';
  var ss = 'is not a string -> typeof arg !== "string" && !(arg instanceof String)';
  var aa = 'is not an Array -> !Array.isArray(arg)';
  var tt = 'is falsy -> !arg';
  var dd = 'must be defined -> arg == null';
  var ii = 'ignore the argument -> false';

  var keys = {
    function: ff, F: ff,
    object: oo, O: oo,
    number: nn, N: nn,
    string: ss, S: ss,
    array: aa, A: aa,
    truthy: tt, t: tt,
    defined: dd, '*': dd,
    ignore: ii, _: ii
  };

  for (var index = 0; index < arguments.length; index++) {
    var arg = arguments[index];
    for (var key in arg) keys[key] = arg[key];
  };

  return keys;
};


module.exports = factory(defaultTests());
exports.BadArgumentError = BadArgumentError
exports.factory = factory
exports.defaultTests = defaultTests
