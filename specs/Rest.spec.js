const expect   = require('expect.js');
const sinon    = require('sinon');
const restjs   = require('rest.js');
const Rest     = require('../src/Rest');
const nonce    = require('../src/nonce');

describe('Rest', function () {
  const account = {
    'id'    : '0x4CCaeF6429A7809e3D3FF1F5E1480F0A815Ea646',
    'secret': '0x06e0f6f2e4070376784bb74b1d84ae32e0bce1c2b7cb80cf60037938ebcdf7ba'
  };

  it('should make call with Authorization and Nonce', async function () {
    const stub1 = sinon.stub(restjs, "get").callsFake(async function (uri, headers) {
      expect(headers.Authorization).to.be.ok()
      expect(headers.Nonce).to.be.ok()
      return {body: true}
    });
    const rest  = Rest("http://localhost", account);
    const spy   = sinon.spy(nonce.calibrateREST);
    const stub2 = sinon.stub(nonce, 'calibrateREST').callsFake(function () {
      spy(arguments)
    });
    await rest.get("/")
    expect(spy.called).to.be(true)
    stub1.restore()
    stub2.restore()

  })

  it('should call OPTIONS method when encountering 401', async function () {
    let first  = true;
    const opts = sinon.stub(restjs, "options").callsFake(async function (uri, headers) {
      return {body: true}
    });
    const stub = sinon.stub(restjs, 'put').callsFake(async function (uri, headers) {
      if (first) {
        first    = false
        const e  = new Error();
        e.status = 401
        throw e
      } else {
        return {body: true}
      }
    });
    const rest = Rest("http://localhost", account);
    await rest.put("/")
    expect(opts.called).to.be(true)
    stub.restore()
    opts.restore()
  })
})
