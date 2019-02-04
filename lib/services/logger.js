const bunyan = require('bunyan')
const { createStream } = require('bunyan-logstash-tcp')

function info (settings, log, requestData) {
  console.log(requestData)
  log.info(
    Object.assign(
      {},
      {
        time: new Date(),
        source: settings.source,
        requestData,
      }
    )
  )
}

module.exports = settings => {
  if (settings.logstashUrl) {
    const log = bunyan.createLogger({
      streams: [
        {
          type: 'raw',
          stream: createStream({
            host: settings.logstashUrl,
            port: settings.logstashPort,
          }).on('error', console.log),
        },
      ],
      serializers: {
        err: bunyan.stdSerializers.err,
      },
      name: 'smspro-log',
      tags: ['logging'],
    })

    return {
      info: info.bind(null, settings, log),
    }
  } else {
    if (settings.shouldMockSms) {
      console.log('Logstash was not provided, using console.log.')
    }

    return {
      info: console.log,
    }
  }
}
