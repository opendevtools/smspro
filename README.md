# Smspro

This is created to send and recieve sms from https://www.smspro.se


## Usage: 
### Send
```javascript
const SmsPro = require('smspro')

const smsPro = new SmsPro({
  'customerId': '',
  'customerPassword': '',
  'username': '',
  'password': '',
  'endpoint': '',
  'from': ''
})

await smsPro.sendMtSms({ to: ['phoneNumber'], message: 'k-dot is amazing'})
```
Returns:
```javascript
{
  datetime: '2018-03-16 15:58:19',
  message: 'The MT SMS request is being processed.',
  code: '0',
  status: '0',
  errorCode: '0',
  customerId: 'kdot',
  mobilectrlId: '9123812831238'
}
```

### Parse incoming the xml-message to JSON:
```javascript
smsPro.parseIncoming(xml)
```
Returns:
```javascript
{
  message: 'Text message from mobile',
  phoneNumber: '+46708651052',
  phoneNumberNormalized: '0708651052'
}
```

### Send flash sms
```javascript
const SmsPro = require('smspro')

const smsPro = new SmsPro({
  'customerId': '',
  'customerPassword': '',
  'username': '',
  'password': '',
  'endpoint': '',
  'from': ''
})

await smsPro.sendFlashSms({ to: ['phoneNumber'], message: 'k-dot is amazing'})
```
