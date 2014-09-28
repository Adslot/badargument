
var should = require('should');
var badargument = require('./index');


describe('badargument', function() {

  // should correctly replace arg no matter what's around

  describe('default tag', function() {

    describe('with named functions', function() {
      function namedFunction(a, b, c, d, e, f, g) {
        badargument('function ignore defined array number truthy')
        return 'ok'
      }

      it('should pass when arguments are ok', function() {
        for (var i = 0; i < 3; i++)
          namedFunction((function(){}), undefined, '', [], 0, 1).should.equal('ok')
      })

      it('should throw when arguments are bad', function() {
        var f = namedFunction.bind(null, (function(){}), undefined, null, [], 0, 1)
        for (var i = 0; i < 3; i++)
          f.should.throw(badargument.BadArgumentError)
        for (var i = 0; i < 3; i++)
          f.should.throw('arg 2 of namedFunction must be defined.')
      })
    })

    describe('with anonymous functions', function() {
      anonymousFunction = function(a, b, c, d, e, f, g) {
        badargument('_ S O')
        return 'kk'
      }

      it('should pass when arguments are ok', function() {
        for (var i = 0; i < 3; i++)
          anonymousFunction('', '', {}, {}).should.equal('kk')
      })

      it('should throw when arguments are bad', function() {
        var f = anonymousFunction.bind(null, '', '', null, {})
        for (var i = 0; i < 3; i++)
          f.should.throw(badargument.BadArgumentError)
        for (var i = 0; i < 3; i++)
          f.should.throw('arg 2 of function is not an object.')
      })
    })

  })
})

