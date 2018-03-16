const crypto = require('../src/crypto')
const expect = require("expect.js")
const fixtures = require("./fixtures/crypto.spec")
const testUtils = require('test-utils.js')
describe('crypto', function () {
  fixtures.auth.forEach(function (test, index) {
    testUtils.run([], index)(`${index}: should able to generate AUTH header`, function () {
      let signature = crypto.getAuthorization(test.accountid, test.secret, test.method, test.uri, test.body, test.nonce)
      expect(signature).to.eql(test.result)
    })
  })
  fixtures.auth.forEach(function (test, index) {
    testUtils.run([], index)(`${index}: Requests with proper Authorization should pass`, function () {
      crypto.authenticate(test.apiKey, test.result, test.method, test.uri, test.body, test.nonce, test.received)
    })
  })

  it('Requests without Authorization should fail', function () {
    const test = fixtures.noauthfailure;
    expect(crypto.authenticate)
      .withArgs(test.apiKey, test.result, test.method, test.uri, test.body, test.nonce, test.received)
      .to.throwException(/Invalid auth header/)
  })

  it('Requests with improper Authorization should fail', function () {
    const test = fixtures.badauthfailure;
    expect(crypto.authenticate)
      .withArgs(test.apiKey, test.result, test.method, test.uri, test.body, test.nonce, test.received)
      .to.throwException(/Authentication failed. SIGN mismatch/)
  })

  it('Requests that are outside nonce tolerance should fail', function () {
    const test = fixtures.noncefailure;
    expect(crypto.authenticate)
      .withArgs(test.apiKey, test.result, test.method, test.uri, test.body, test.nonce, test.received)
      .to.throwException(/Authentication failed. Nonce 1452154049511 stale by 20000000088ms/)
  })
})