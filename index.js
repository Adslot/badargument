
evalInSmallestLocalScope = function(condition) {
  var arg;
  return eval(condition);
};


// TODO: Still not sold on thhis way of creating a custom Error
// TODO: Stringifying `arguments` can produce a very long `error.message`. Is this ok?
function BadArgumentError(index, keyMessage, caller) {
  Error.captureStackTrace(this);
  var args = JSON.stringify(Array.prototype.slice.call(caller.arguments));
  this.message = "arg " + index + " of " + (caller.name || 'function') + " " + keyMessage + ". Arguments: " + args;
}
BadArgumentError.prototype = Object.create(Error.prototype);
BadArgumentError.prototype.name = "BadArgumentError";
exports.BadArgumentError = BadArgumentError


// Transform an arguments string definition into a test function
var makeTestFunction = function(testsString, testsByKey) {

  var testsCode = testsString.split(' ').map(function(key, index) {

    var test = testsByKey[key]
    if (!test) {throw new Error("Invalid key " + key + " from " + testsString);}
    if (test.condition === "false") {return "";}

    jsExpression = test.condition.replace(/(^|[^a-zA-Z0-9$_])arg([^a-zA-Z0-9$_]|$)/g, "$1(args[" + index + "])$2");
    return " if(" + jsExpression + ") {throw new BadArgumentError(" + index + ", '" + test.message + "', caller)};";
  });

  return eval("(function(caller) { var args = caller.arguments;\n" + (testsCode.join('\n')) + "\n})");
};


exports.tagFactory = function(testDefinitionsByKey) {

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
      throw new Error("Cannot eval() condition in \"" + definition + "\": " + error.message);
    }
  }

  testFunctions = {};
  return function tester(test) {
    var fn = testFunctions[test] || (testFunctions[test] = makeTestFunction(test, keys));
    return fn(tester.caller);
  };
};


exports.defaultTests = function() {
  var keys = {
    F: "is not a function -> typeof arg !== 'function'",
    O: "is not an object -> !arg || typeof arg !== 'object'",
    N: "is not a number -> typeof arg !== 'number'",
    S: "is not a string -> typeof arg !== 'string'",
    A: 'is not an Array -> !Array.isArray(arg)',
    t: 'is falsy -> !arg',
    '*': 'must be defined -> arg == null',
    _: 'ignore the argument -> false'
  }

  for (var index = 0; index < arguments.length; index++) {
    var arg = arguments[index]
    for (var key in arg) keys[key] = arg[key]
  }

  return keys;
};


exports.tag = exports.tagFactory(exports.defaultTests());
