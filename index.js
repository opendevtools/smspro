const smsProUtil = require('./lib/util/smsPro')
const fetch = require('node-fetch')
const btoa = require('btoa')

function smsPro ({customerId, customerid, username, customerPassword, customerpassword, endpoint, password}) {
  this.customerId = customerId || customerid
  this.customerPassword = customerPassword || customerpassword
  this.username = username
  this.password = password
  this.endpoint = endpoint
}

smsPro.prototype.send = async function (body) {
  return fetch(this.endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(`${this.username}:${this.password}`)}`,
      'Content-Type': 'text/xml'
    },
    body
  }).then(async data => smsProUtil.parseResult(await data.text()))
}

smsPro.prototype.sendMtSms = async function (messageProps) {
  return this.send(smsProUtil.mtSms(Object.assign({}, messageProps, this)))
}

smsPro.prototype.parseIncoming = async function (data) {
  return smsProUtil.parseIncoming(data)
}

module.exports = smsPro