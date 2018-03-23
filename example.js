const SmsPro = require('./index')

const smsPro = new SmsPro({
  "customerId": "",
  "customerPassword": "",
  "username": "",
  "password": "",
  "endpoint": ""
})

smsPro.sendMtSms({ to: ['phoneNumber'], from: 'from', message: 'k-dot is amazing'})