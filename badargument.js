
evalInSmallestLocalScope = function(condition) {
  var arg;
  return eval(condition);
};


//-----------------------------------------------

// ?????
// http://j-query.blogspot.com.au/2014/03/custom-error-objects-in-javascript.html

exports.ContractError = function ContractError(index, keyMessage, caller) {
  var args = JSON.stringify(Array.prototype.slice.call(caller["arguments"]));
  this.message = "arg " + index + " of " + (caller.name || 'function') + " " + keyMessage + ". Arguments: " + args;
}

//for (var key in Error) { ContractError[key] = Error[key]; }

function ctor() { this.constructor = ContractError; }
ctor.prototype = Error.prototype;
ContractError.prototype = new ctor();

ContractError.prototype.name = 'ContractError';

//-----------------------------------------------



var makeTestFunction = function(testsString, testsByKey) {

  var testsCode = testsString.split(' ').map(function(key, index) {

    var test = testsByKey[key]
    if (!test) {throw new Error("Invalid key " + key + " from " + testsString);}
    if (test.condition === "false") {return "";}

    jsExpression = test.condition.replace(/[^a-zA-Z0-9]arg[^a-zA-Z0-9]/g, " (args[" + index + "]) ");
    return " if(" + jsExpression + ") {throw new ContractError(" + index + ", '" + test.message + "', caller)};";
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
    O: "is not an object -> typeof arg !== 'object'",
    N: "is not a number -> typeof arg !== 'number'",
    S: "is not a string -> typeof arg !== 'string'",
    A: 'is not an Array -> Array.isArray(arg)',
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
