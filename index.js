const smsProUtil = require('./lib/util/smsPro')
const fetch = require('node-fetch')
const btoa = require('btoa')

class smsPro {
  constructor ({
    customerId,
    customerid,
    username,
    customerPassword,
    customerpassword,
    endpoint,
    password,
    from,
    shouldMockSms,
    logstashUrl,
    logstashPort,
  }) {
    this.customerId = customerId || customerid
    this.customerPassword = customerPassword || customerpassword
    this.username = username
    this.password = password
    this.endpoint = endpoint
    this.from = from
    this.shouldMockSms = shouldMockSms
    this.logstashUrl = logstashUrl
    this.logger = require('./lib/services/logger')({
      source: 'smspro',
      logstashUrl,
      logstashPort,
      shouldMockSms,
    })
  }
  async send (body) {
    if (this.shouldMockSms) {
      return this.logger.info(body)
    }

    const headers = {
      Authorization: `Basic ${btoa(`${this.username}:${this.password}`)}`,
      'Content-Type': 'text/xml',
    }

    const data = await fetch(this.endpoint, {
      method: 'POST',
      headers,
      body,
    })

    if (this.logstashUrl) {
      await this.logger.info(body)
    }

    return smsProUtil.parseResult(await data.text())
  }
  async sendMtSms (messageProps) {
    return this.send(smsProUtil.mtSms(Object.assign({}, this, messageProps)))
  }
  async parseIncoming (data) {
    const smsAsJson = await smsProUtil.parseIncoming(data)

    if (this.logstashUrl) {
      this.logger.info(smsAsJson)
    }

    return smsAsJson
  }
  async sendFlashSms (messageProps) {
    return this.send(smsProUtil.flashSms(Object.assign({}, this, messageProps)))
  }
}

module.exports = smsPro
