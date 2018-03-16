const ethUtil = require('ethereumjs-util');
const affirm  = require('affirm.js');

module.exports = (function () {
  const crypto                  = {};
  const defaultLatencyTolerance = 10;

  crypto.getAuthorization = function (accountId, secret, method, uri, body, nonce) {
    affirm(accountId, 'Need accountId to generate authorization token')
    if (!secret) return `SIGN ${accountId}`
    const payload   = hashPayload(method, uri, body, nonce);
    const {v, r, s} = ethUtil.ecsign(payload, ethUtil.toBuffer(secret))
    const apiKey    = ethUtil.toChecksumAddress(ethUtil.bufferToHex(ethUtil.privateToAddress(ethUtil.toBuffer(secret))))
    return `SIGN ${accountId}.${apiKey}.${v}.${ethUtil.bufferToHex(r)}.${ethUtil.bufferToHex(s)}`
  }

  crypto.authenticate = function (apiKey, auth, method, uri, body, nonce, receivedTime, nonceLatencyTolerance) {
    if (!apiKey) return true
    authenticateSignature(apiKey, auth, method, uri, body, nonce)
    validateNonce(receivedTime, nonce, nonceLatencyTolerance)
  }

  function authenticateSignature(apiKey, auth, method, uri, body, nonce) {
    let [accountId, apikeyFromAuth, v, r, s] = crypto.parseAuth(auth)
    const payload                            = hashPayload(method, uri, body, nonce)
    let recoveredPublicAddress               = ethUtil.ecrecover(payload, v, ethUtil.toBuffer(r), ethUtil.toBuffer(s))
    let recoveredApiKey                      = ethUtil.bufferToHex(ethUtil.publicToAddress(recoveredPublicAddress))
    let recoveredCaseSensitiveApiKey         = ethUtil.toChecksumAddress(recoveredApiKey)
    affirm(apikeyFromAuth === apiKey, 'Authentication failed. SIGN mismatch')
    affirm(recoveredCaseSensitiveApiKey === apiKey, 'Authentication failed. SIGN mismatch')
    return true
  }

  function hashPayload(method, uri, body, nonce) {
    const message = JSON.stringify({method: method, uri: uri, body: body, nonce: nonce});
    return ethUtil.hashPersonalMessage(ethUtil.toBuffer(message))
  }

  crypto.parseAuth = function (auth) {
    let authParts = auth.split(' ')
    affirm(authParts[0] === "SIGN" && authParts.length === 2, 'Invalid auth header')
    let auths = authParts[1].split(".")
    affirm(auths.length === 5, 'Invalid auth header')
    return [auths[0], auths[1], auths[2], auths[3], auths[4]]
  }

  function validateNonce(receivedTime, nonce, nonceLatencyTolerance) {
    affirm(nonce && !isNaN(nonce), 'Authentication failed. Invalid Nonce ' + nonce, 401)
    affirm(!nonceLatencyTolerance || typeof nonceLatencyTolerance === 'number', 'Nonce tolerance should be numeric: ' + nonceLatencyTolerance)
    const diff                   = receivedTime - nonce;
    const nonceWithInGracePeriod = Math.abs(receivedTime - nonce) <= (nonceLatencyTolerance || defaultLatencyTolerance) * 1000;
    affirm(nonceWithInGracePeriod, 'Authentication failed. Nonce ' + nonce + ' stale by ' + diff + 'ms', 401)
  }

  return crypto
})()
