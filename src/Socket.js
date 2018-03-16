const util   = require('util');
const io     = require('socket.io-client');
const affirm = require('affirm.js');
const cache  = require('ephemeral-cache')();
const crypto = require('./crypto');
const nonce  = require('./nonce');
const _      = require('lodash');

module.exports = function (baseUrl, account, errorHandler) {
  let socket     = io(baseUrl, {rejectUnauthorized: true});
  socket.logging = false

  if (account) {
    validateKey(account)
  }

  socket.setAccount = function (_account) {
    account = _account
    validateKey(account)
  }

  socket.reconnect = function () {
    socket = _.assign(socket, io(baseUrl, {rejectUnauthorized: true}))
  }

  socket.send = function (request) {
    let method  = request.method;
    let uri     = request.uri;
    let headers = request.headers || {};
    const body  = request.body;
    let params  = request.params || {};
    const retry = request.retry;
    affirm(typeof method === 'string', 'Invalid method')
    affirm(typeof uri === 'string', 'Invalid uri')

    params                = params || {}
    const requestNonce    = nonce.getNonce();
    const authorization   = account && crypto.getAuthorization(account.id, account.secret, method, uri, {
      body  : body,
      params: params
    }, requestNonce);
    headers               = headers || {}
    headers.Authorization = authorization
    headers.Nonce         = requestNonce

    if (socket.logging) util.log(Date.now(), "sending on socket", method, uri)
    const data = {headers: headers, method: method, uri: uri, params: params, body: body, retry: retry};
    cache.put(authorization, data)
    socket.emit(method + " " + uri, data)
  }

  socket.onAuthError = function (message) {
    if (!account) return
    if (!validMessage(message)) return console.log('*** WARNING: Ignoring invalid server message: ', message)
    if (message.data.retry) return errorHandler && errorHandler(message.error)
    nonce.calibrate(Date.now(), message['server_time'])
    const auth = message.data.headers.Authorization;
    let data   = cache.get(auth);
    if (!data) return console.log('*** WARNING: Skipping retry for invalid Authorization', auth)
    socket.send({
      method : data.method,
      uri    : data.uri,
      headers: data.headers,
      body   : data.body,
      params : data.params,
      retry  : true
    })
  }

  socket.register = function () {
    if (account)
      socket.send({method: "GET", uri: "/register", body: {accountId: account.id, apiKey: account.apiKey}})
  }

  socket.unregister = function () {
    if (account)
      socket.send({method: "GET", uri: "/unregister", body: {accountId: account.id, apiKey: account.apiKey}})
  }

  socket.on('server_time', function (serverTime) {
    nonce.calibrate(Date.now(), serverTime)
  })

  function validMessage(message) {
    return message && message.data && message.data.headers && message.data.headers.Authorization
  }

  function validateKey(account) {
    affirm(account.apiKey, 'Missing apiKey in account')
    affirm(account.id, 'Missing accountId in account')
    affirm(account.secret, 'Missing secret in account')
  }

  return socket
}
