var expect = require('expect.js')
//var Socket = require('../src/Socket')
var nonce  = require('../src/nonce')
var sinon  = require('sinon')

describe.skip('Socket', function() {
  var account = { 'id' : '0x4CCaeF6429A7809e3D3FF1F5E1480F0A815Ea646' ,
      'secret': '0x06e0f6f2e4070376784bb74b1d84ae32e0bce1c2b7cb80cf60037938ebcdf7ba',
       'apiKey': '0x4CCaeF6429A7809e3D3FF1F5E1480F0A815Ea645' }

  //var socket = Socket("http://localhost", account)

  it('should send message with authorization headers', function() {
    var stub = sinon.stub(socket, 'emit').callsFake(function(topic, message) {
      expect(message.headers.Authorization).to.be.ok()
      expect(message.headers.Nonce).to.be.ok()
    })
    socket.send({ method:'GET', uri: '/'})
    stub.restore()
  })

  it('should calibrate and re-send on socketError', function() {
    var auth
    var stub = sinon.stub(socket, 'emit').callsFake(function(topic, message) {
      expect(auth = message.headers.Authorization).to.be.ok()
      expect(message.headers.Nonce).to.be.ok()
    })
    socket.send({ method:'GET', uri: '/'})
    socket.onAuthError({ data: { method: 'GET', uri: '/', retry: false, headers: { Authorization: auth } }})
    stub.restore()
  })

  it('should ignore invalid server message', function() {
    var auth
    var stub = sinon.stub(socket, 'emit').callsFake(function(topic, message) {
      expect(auth = message.headers.Authorization).to.be.ok()
      expect(message.headers.Nonce).to.be.ok()
    })
    expect(socket.onAuthError).to.not.throwException()
    expect(socket.onAuthError.bind(socket, {})).to.not.throwException()
    expect(socket.onAuthError.bind(socket, {data:{}})).to.not.throwException()
    expect(socket.onAuthError.bind(socket, {data:{headers:{}}})).to.not.throwException()
    expect(socket.onAuthError.bind(socket, {data:{headers:{Authorization:true}}})).to.not.throwException()
    stub.restore()
  })

})
