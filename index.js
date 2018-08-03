const Rest   = require('./src/Rest');
const Socket = require('./src/Socket');
const nonce  = require('./src/nonce')

module.exports = function zka(origin, apiPath) {
  const zka     = {};
  const baseUrl = origin + apiPath;
  zka.rest      = Rest(baseUrl)
  zka.socket    = Socket(origin)
  zka.nonce     = nonce

  zka.init = function (accountId, apiKey, secret) {
    zka.account = {id: accountId, apiKey, secret}
    zka.rest.setAccount(zka.account)
    zka.socket.setAccount(zka.account)
  }

  return zka
}
