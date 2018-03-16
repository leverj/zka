var util   = require('util')

module.exports = (function () {
  var nonce      = {}
  nonce.offset   = undefined
  nonce.forNonce = { POST: true, PUT: true, DELETE: true, OPTIONS: true, TRACE: true }
  nonce.logging  = false

  nonce.calibrateREST = function (clientTimestamp, serverTimestamp, method, url) {
    if (nonce.forNonce[method] || nonce.offset === undefined)
      nonce.calibrate(clientTimestamp, serverTimestamp, method, url)
  }

  nonce.calibrate = function (clientTimestamp, serverTimestamp) {
    if(!clientTimestamp || !serverTimestamp) return
    nonce.offset =  clientTimestamp - serverTimestamp
    log(clientTimestamp, serverTimestamp)
  }

  nonce.getNonce = function () {
    return Date.now() - ( nonce.offset || 0)
  }

  nonce.reset = function() {
    nonce.offset = undefined
  }

  function log(clientTimestamp, serverTimestamp) {
    if(!nonce.logging) return
    util.log(Date.now(), 'Nonce offset:', nonce.offset, 'clientTimestamp:', clientTimestamp, 'serverTimestamp:', serverTimestamp)
  }

  return nonce
})()
