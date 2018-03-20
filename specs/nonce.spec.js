const expect = require('expect.js');
const nonce  = require('../src/nonce');

describe('Nonce', function() {
  afterEach(function() {
    nonce.reset()
  })

  it('Nonce should use current time by default', function() {
    const clientTimestamp = Date.now();
    const nonceValue      = nonce.getNonce();
    expect(Math.abs(nonceValue - clientTimestamp) < 100).to.be(true)
  })

  it('Nonce should use adjusted clock when clocks out of sync', function() {
    let now = Date.now();
    let clientTimestamp = now;
    let serverTimestamp = now - 2000;
    nonce.calibrateREST(clientTimestamp, serverTimestamp, 'PUT')
    let nonceValue = nonce.getNonce();
    expect(Math.abs(nonceValue - serverTimestamp) < 100).to.be(true)

    now = Date.now()
    clientTimestamp = now
    serverTimestamp = now + 2000
    nonce.calibrateREST(clientTimestamp, serverTimestamp, 'PUT')
    nonceValue = nonce.getNonce()
    expect(Math.abs(nonceValue - serverTimestamp) < 100).to.be(true)
  })

  it('Should calibrate for first call', function() {
    const now = Date.now();
    const clientTimestamp = now;
    const serverTimestamp = now - 2000;

    nonce.calibrateREST(clientTimestamp, serverTimestamp, 'GET')
    nonceValue = nonce.getNonce()
    expect(Math.abs(nonceValue - serverTimestamp) < 100).to.be(true)
  })
})
