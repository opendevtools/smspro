const { parse: toXml } = require('js2xmlparser')
const parser = require('xml2json')
const moment = require('moment-timezone')
const telefonnummer = require('telefonnummer')

function mtSms ({
  customerId,
  customerPassword,
  from,
  message,
  to,
  msgClass = 1,
}) {
  const fromContainsDigit = /\d/.test(from)
  return toXml('mobilectrl_sms', {
    header: Object.assign(
      {
        customer_id: customerId,
        password: customerPassword,
        valid_until: moment()
          .tz('Europe/Stockholm')
          .add(10, 'minutes')
          .format('YYYYMMDDHHmm'),
      },
      fromContainsDigit ? { from_msisdn: from } : {}
    ),
    payload: {
      sms: [
        {
          '@': Object.assign(
            {
              msg_class: msgClass,
            },
            fromContainsDigit ? {} : { account: from }
          ),
          message: message,
          to_msisdn: to,
        },
      ],
    },
  })
}

function parseIncoming (xml) {
  const {
    mobilectrl_received_sms: {
      header: { datetime, customer_id: customerId },
      payload: {
        sms: {
          message,
          from_msisdn: { $t: phoneNumber, operator },
        },
      },
    },
  } = JSON.parse(parser.toJson(xml))

  return {
    message,
    phoneNumber,
    phoneNumberNormalized: telefonnummer.normalize(phoneNumber),
    datetime: moment(datetime)
      .tz('Europe/Stockholm')
      .toISOString(),
    customerId,
    operator,
  }
}

function parseResult (xml) {
  const {
    mobilectrl_response: {
      datetime,
      message,
      code,
      status,
      errorcode: errorCode,
      customer_id: customerId,
      mobilectrl_id: mobilectrlId,
    },
  } = JSON.parse(parser.toJson(xml))

  return {
    datetime,
    message,
    code,
    status,
    errorCode,
    customerId,
    mobilectrlId,
  }
}

function flashSms (properties) {
  return mtSms(Object.assign({}, properties, { msgClass: 0 }))
}

module.exports = {
  mtSms,
  parseIncoming,
  parseResult,
  flashSms,
}
