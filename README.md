# zka
zero knowledge api key

## install
```bash
npm install zka
```

## usage
```javascript 1.6
const baseUrl = "https://your-domain"
const apiPath = "/api/v1" 
// create zka with base url and api path
const zka = require('zka')(baseUrl, apiPath)
// provide accountid, apikey and secret to support rest and socket communication with server 
zka.init(accountId, apiKey, secret)
// use rest call
zka.rest.get('/account')
```
