const SmsPro = require('.')

const smsPro = new SmsPro({
  from: '71220',
  customerid: '',
  customerpassword: '',
  username: '',
  password: '',
  endpoint: '',
  shouldMockSms: false,
  logstashUrl: 'localhost',
  logstashPort: 5505,
})

smsPro.sendMtSms({
  to: [''],
  message: 'test',
})
