const Rest   = require('./src/Rest');
const Socket = require('./src/Socket');

module.exports = function zka(origin, apiPath) {
  const zka  = {};
  const baseUrl    = origin + apiPath;
  zka.rest   = Rest(baseUrl)
  zka.socket = Socket(origin)

  zka.init = function (accountId, apiKey, secret) {
    zka.account = {id: accountId, apiKey, secret}
    zka.rest.setAccount(zka.account)
    zka.socket.setAccount(zka.account)
  }

  return loginless
}
