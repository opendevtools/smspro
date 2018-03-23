const SmsPro = require('./index')

const smsPro = new SmsPro({
  'customerId': '',
  'customerPassword': '',
  'username': '',
  'password': '',
  'endpoint': ''
})

smsPro.sendMtSms({ to: ['phoneNumber'], message: 'k-dot is amazing'})