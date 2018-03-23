const smsProUtil = require('./lib/util/smsPro')
const fetch = require('node-fetch')
const btoa = require('btoa')

function smsPro ({ customerId, customerid, username, customerPassword, customerpassword, endpoint, password, from }) {
  this.customerId = customerId || customerid
  this.customerPassword = customerPassword || customerpassword
  this.username = username
  this.password = password
  this.endpoint = endpoint
  this.from = from
}

smsPro.prototype.send = async function (body) {
  const headers = {
    'Authorization': `Basic ${btoa(`${this.username}:${this.password}`)}`,
    'Content-Type': 'text/xml'
  }

  const data = await fetch(this.endpoint, {
    method: 'POST',
    headers,
    body
  })

  return smsProUtil.parseResult(await data.text())
}

smsPro.prototype.sendMtSms = async function (messageProps) {
  return this.send(smsProUtil.mtSms(Object.assign({}, this, messageProps)))
}

smsPro.prototype.parseIncoming = async function (data) {
  return smsProUtil.parseIncoming(data)
}

smsPro.prototype.sendFlashSms = async function (messageProps) {
  return this.send(smsProUtil.flashSms(Object.assign({}, this, messageProps)))
}

module.exports = smsPro