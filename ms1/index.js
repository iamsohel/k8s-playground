const express = require('express');
const client = require('prom-client');
const { histogram } = require('./histogram');
const { gauge } = require('./gauge');
const { summary } = require('./summary');
const { counter } = require('./counter');

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
});

const app = express();

// Create a Registry to register the metrics
const register = new client.Registry();

// Add a default metrics and enable the collection of it
client.collectDefaultMetrics({
    app: 'node-application-monitoring-app',
    prefix: 'node_',
    timeout: 10000,
    gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5], // These are the default buckets.
    register
});

// Create a histogram metric
const httpRequestDurationMicroseconds = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'code'],
    buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10] // 0.1 to 10 seconds
});

// Register the histogram
register.registerMetric(httpRequestDurationMicroseconds);
histogram(register);

// gauge
gauge(register);

// summary
summary(register);

// counter
counter(register);

// Handlers
const createDelayHandler = async (req, res) => {
    if ((Math.floor(Math.random() * 100)) === 0) {
        throw new Error('Internal Error')
    }

    // delay for 3-6 seconds
    const delaySeconds = Math.floor(Math.random() * (6 - 3)) + 3
    await new Promise(res => setTimeout(res, delaySeconds * 1000))

    res.end('Slow url accessed !!');
};

app.get('/metrics', async (req, res) => {
    // Start the timer
    const end = httpRequestDurationMicroseconds.startTimer();
    const route = req.route.path;

    res.setHeader('Content-Type', register.contentType);
    res.send(await register.metrics());

    // End timer and add labels
    end({ route, code: res.statusCode, method: req.method });
});

app.get('/slow', async (req, res) => {
    // Start the timer
    const end = httpRequestDurationMicroseconds.startTimer();
    const route = req.route.path;

    await createDelayHandler(req, res);

    // End timer and add labels
    end({ route, code: res.statusCode, method: req.method });
});


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
    console.log('server is running 4001');
})