const { parse: toXml } = require('js2xmlparser')
const parser = require('xml2json')
const moment = require('moment-timezone')
const telefonnummer = require('telefonnummer')

function mtSms ({ customerId, customerPassword, from, message, to, msgClass = 1 }) {
  return toXml('mobilectrl_sms', {
    'header': Object.assign({
      'customer_id': customerId,
      'password': customerPassword,
      'valid_until': moment().tz('Europe/Stockholm').add(10, 'minutes').format('YYYYMMDDHHmm'),
    }, /\d/.test(from) ? { 'from_msisdn': from } : {}),
    'payload': {
      'sms':
      [
        {
          '@': Object.assign({
            msg_class: msgClass
           }, /\d/.test(from) ? {} : { account: from }),
          'message': message,
          'to_msisdn': to
        }
      ]
    }
  })
}

function parseIncoming (xml) {
  const {
    mobilectrl_received_sms: {
      payload: {
        sms: {
          message,
          from_msisdn: {
            $t: phoneNumber
          }
        }
      }
    }
  } = JSON.parse(parser.toJson(xml))
  return { message, phoneNumber, phoneNumberNormalized: telefonnummer.normalize(phoneNumber)}
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
      mobilectrl_id: mobilectrlId
    }
  } = JSON.parse(parser.toJson(xml))

  return { datetime, message, code, status, errorCode, customerId, mobilectrlId }
}

function flashSms (properties) {
  return mtSms(Object.assign({}, properties, { msgClass: 0 }))
}

module.exports = {
  mtSms,
  parseIncoming,
  parseResult,
  flashSms
}