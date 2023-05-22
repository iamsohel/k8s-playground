const express = require('express');
const app = express();
const { createLogger, transports } = require("winston");
const LokiTransport = require("winston-loki");

const logger = createLogger({
    transports: [
        new LokiTransport({
            host: "http://loki-grafana.dev",
            // Only for development purposes
            interval: 5,
            labels: {
                job: 'ms1'
            }
        }),
        new transports.Console(),

    ]
})

app.get('/api/ms1/getAll', (req, res) => {
    logger.info('this is from micro-service 1 get all')
    console.log('this is from micro-service 1 get all')
    logger.error('error micro-service 1 get all')
    res.send({ data: 'hello from micro-service 1 get all' })
})

app.get('/api/ms1', (req, res) => {
    logger.info('hello from micro-service 1')
    res.send({ data: 'hello from micro-service 1' })
})

app.listen(4001, () => {
    console.log('server is running');
})