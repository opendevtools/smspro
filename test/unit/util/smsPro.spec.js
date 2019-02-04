const chai = require('chai')
const expect = chai.expect
const { useFakeTimers } = require('sinon')
const dedent = require('dedent')

chai.use(require('sinon-chai'))

describe('util/smsPro', () => {
  let smsProUtil
  let time

  beforeEach(() => {
    time = useFakeTimers(new Date('2018-03-16 15:58:19').getTime())
    smsProUtil = require(process.cwd() + '/lib/util/smsPro')
  })

  afterEach(() => {
    time.restore()
  })

  describe('#mtSms', () => {
    it('returns a correctly formated xml', () => {
      const response = smsProUtil.mtSms({
        customerId: 'kdot',
        customerPassword: 'goodkid',
        from: '07013371337',
        to: ['073013371337'],
        message: 'Is your tests only Kendrick Lamar references?',
      })

      expect(dedent(response)).to.eql(
        dedent(`
        <?xml version='1.0'?>
        <mobilectrl_sms>
        <header>
            <customer_id>kdot</customer_id>
            <password>goodkid</password>
            <valid_until>201803161608</valid_until>
            <from_msisdn>07013371337</from_msisdn>
        </header>
        <payload>
            <sms msg_class='1'>
                <message>Is your tests only Kendrick Lamar references?</message>
                <to_msisdn>073013371337</to_msisdn>
            </sms>
        </payload>
        </mobilectrl_sms>
      `)
      )
    })
  })
  describe('#parseIncoming', () => {
    it('returns correctly formated JSON', () => {
      const xmlForIncoming =
        '<?xml version="1.0" encoding="ISO-8859-1"?> <mobilectrl_received_sms><header><customer_id>CUSTOMER</customer_id> <mobilectrl_id>5aa434:eac0a56a0b:-845c</mobilectrl_id> <datetime>2014-10-25 13:43:19</datetime></header> <payload><sms account="71700" premiumrate="0"><message>Text message from mobile</message><from_msisdn operator="operator">+46708651052</from_msisdn></sms> </payload></mobilectrl_received_sms>'

      const data = smsProUtil.parseIncoming(xmlForIncoming)
      expect(data).to.eql({
        message: 'Text message from mobile',
        phoneNumber: '+46708651052',
        phoneNumberNormalized: '0708651052',
        datetime: '2014-10-25T11:43:19.000Z',
        operator: 'operator',
        customerId: 'CUSTOMER',
      })
    })
  })
  describe('#parseResult', () => {
    it('returns correctly formated JSON', () => {
      const resultAsXml =
        '<?xml version="1.0" encoding="ISO-8859-1"?><mobilectrl_response><customer_id>kdot</customer_id><mobilectrl_id>9123812831238</mobilectrl_id><status>0</status><code>0</code><errorcode>0</errorcode><message><![CDATA[The MT SMS request is being processed.]]></message><datetime>2018-03-16 15:58:19</datetime></mobilectrl_response>'
      const data = smsProUtil.parseResult(resultAsXml)

      expect(data).to.eql({
        datetime: '2018-03-16 15:58:19',
        message: 'The MT SMS request is being processed.',
        code: '0',
        status: '0',
        errorCode: '0',
        customerId: 'kdot',
        mobilectrlId: '9123812831238',
      })
    })
  })

  describe('#flashSms', () => {
    it('returns a correctly formated xml', () => {
      const response = smsProUtil.flashSms({
        customerId: 'kdot',
        customerPassword: 'goodkid',
        from: '07013371337',
        to: ['073013371337'],
        message: 'Is your tests only Kendrick Lamar references?',
      })

      expect(dedent(response)).to.eql(
        dedent(`
        <?xml version='1.0'?>
        <mobilectrl_sms>
        <header>
            <customer_id>kdot</customer_id>
            <password>goodkid</password>
            <valid_until>201803161608</valid_until>
            <from_msisdn>07013371337</from_msisdn>
        </header>
        <payload>
            <sms msg_class='0'>
                <message>Is your tests only Kendrick Lamar references?</message>
                <to_msisdn>073013371337</to_msisdn>
            </sms>
        </payload>
        </mobilectrl_sms>
      `)
      )
    })
  })
})
