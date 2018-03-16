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
const zka = require('zka')(baseUrl, apiPath)
zka.init(accountId, apiKey, secret)

```