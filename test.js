
var should = require('should');
var badargument = require('./index');


describe('badargument', function() {


  describe('default tag', function() {

    it('should complain about invalid keys', function() {
      function invalidKeys() { badargument('function lolIamInvalid') }
      invalidKeys.should.throw(/lolIamInvalid/)
    })

    it('should degrade gracefully if Function.caller is not available', function() {
      var functionalTag = badargument.factory()

      eval(badargument.factory.toString().replace(/'caller' in Function/, "'notHere' in Function"))
      var degradedTag = factory()

      var garble = 'garblegarble!!!!'
      degradedTag.bind(null, garble)()
      functionalTag.bind(null, garble).should.throw(Error)
    })


    describe('with named functions', function() {
      function namedFunction(a, b, c, d, e, f, g) {
        badargument('function ignored defined array number truthy')
        return 'ok'
      }

      it('should pass when arguments are ok', function() {
        for (var i = 0; i < 3; i++)
          namedFunction((function(){}), undefined, '', [], 0, 1).should.equal('ok')
      })

      it('should throw when arguments are bad', function() {
        function xyz(){}
        var f = namedFunction.bind(null, xyz, undefined, null, [], 0, 1)
        for (var i = 0; i < 3; i++)
          f.should.throw(badargument.BadArgumentError)
        for (var i = 0; i < 3; i++)
          f.should.throw('arg 2 of namedFunction must be defined.')
        try { f() } catch(error) {
          error.arguments.should.eql([xyz, undefined, null, [], 0, 1])
        }
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

        try { f() } catch(error) {
          error.arguments.should.eql(['', '', null, {}])
        }
      })
    })
  })


  describe('custom tags', function() {

    function Banana() {}
    var customTag = badargument.factory(badargument.defaultTests(), {
      banana: {message: 'is not a banana', condition: function(arg) {return !(arg instanceof Banana)}},
      huzzah: {message: 'NO HUZZA!', condition: '!arg || !arg.huzza'}
    })
    function withCustomTag() {customTag('string banana huzzah')}

    it('should accept valid custom keys', function() {
      withCustomTag('', new Banana, {huzza: 'woot!'})
    })

    it('should reject by custom function condition', function() {
      var f = withCustomTag.bind(null, '', {}, {huzza: 'woot!'})
      f.should.throw(badargument.BadArgumentError)
      f.should.throw(/is not a banana/)
    })

    it('should reject by snipper condition', function() {
      var f = withCustomTag.bind(null, '', new Banana, {})
      f.should.throw(badargument.BadArgumentError)
      f.should.throw(/NO HUZZA/)
    })

    it('should reject invalid conditions', function() {
      badargument.factory.bind(null, badargument.defaultTests(), {
        huzzah: {message: 'NO HUZZA!', condition: '(!arg || !arg.huzza'}
      }).should.throw(/Cannot eval/)
    })

    it('should reject brittle conditions', function() {
      badargument.factory.bind(null, badargument.defaultTests(), {
        huzzah: {message: 'NO HUZZA!', condition: '!arg.huzza'}
      }).should.throw(/Cannot eval/)
    })
  })
})
