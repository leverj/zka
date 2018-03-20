var expect = require('expect.js')
var nonce = require('../src/nonce')

describe('Nonce', function() {
  afterEach(function() {
    nonce.reset()
  })

  it('Nonce should use current time by default', function() {
    var now = Date.now()
    var clientTimestamp = now
    var nonceValue = nonce.getNonce()
    expect(Math.abs(nonceValue - clientTimestamp) < 100).to.be(true)
  })

  it('Nonce should use adjusted clock when clocks out of sync', function() {
    var now = Date.now()
    var clientTimestamp = now
    var serverTimestamp = now - 2000
    nonce.calibrateREST(clientTimestamp, serverTimestamp, 'PUT')
    var nonceValue = nonce.getNonce()
    expect(Math.abs(nonceValue - serverTimestamp) < 100).to.be(true)

    now = Date.now()
    clientTimestamp = now
    serverTimestamp = now + 2000
    nonce.calibrateREST(clientTimestamp, serverTimestamp, 'PUT')
    nonceValue = nonce.getNonce()
    expect(Math.abs(nonceValue - serverTimestamp) < 100).to.be(true)
  })

  it('Should calibrate for first call', function() {
    var now = Date.now()
    var clientTimestamp = now
    var serverTimestamp = now - 2000

    nonce.calibrateREST(clientTimestamp, serverTimestamp, 'GET')
    nonceValue = nonce.getNonce()
    expect(Math.abs(nonceValue - serverTimestamp) < 100).to.be(true)
  })
})
