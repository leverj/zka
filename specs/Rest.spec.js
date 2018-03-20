var expect   = require('expect.js')
var bluebird = require('bluebird')
var sinon    = require('sinon')
var restjs   = require('rest.js')
var Rest     = require('../src/Rest')
var nonce    = require('../src/nonce')

describe('Rest', function() {
  var account = { 'id' : '0x4CCaeF6429A7809e3D3FF1F5E1480F0A815Ea646' ,
      'secret': '0x06e0f6f2e4070376784bb74b1d84ae32e0bce1c2b7cb80cf60037938ebcdf7ba' }

  it('should make call with Authorization and Nonce', function() {
    var stub1 = sinon.stub(restjs, "get").callsFake(function(uri, headers) {
      expect(headers.Authorization).to.be.ok()
      expect(headers.Nonce).to.be.ok()
      return bluebird.resolve({body: true})
    })
    var rest = Rest("http://localhost", account)
    var spy = sinon.spy(nonce.calibrateREST)
    var stub2 = sinon.stub(nonce, 'calibrateREST').callsFake(function() {
      spy(arguments)
    })
    rest.get("/").then(function() {
      expect(spy.called).to.be(true)
      stub1.restore()
      stub2.restore()
    })
  })

  it('should call OPTIONS method when encountering 401', function() {
    var first = true
    var opts = sinon.stub(restjs, "options").callsFake(function(uri, headers) {
      return bluebird.resolve({ body: true})
    })
    var stub = sinon.stub(restjs, 'put').callsFake(function(uri, headers) {
      return new bluebird(function(resolve, reject) {
        if(first) {
          first = false
          var e = new Error()
          e.status = 401
          reject(e)
        } else {
          resolve({body: true})
        }
      })
    })
    var rest = Rest("http://localhost", account)
    rest.put("/").then(function(result) {
      expect(opts.called).to.be(true)
    })
    stub.restore()
  })
})
