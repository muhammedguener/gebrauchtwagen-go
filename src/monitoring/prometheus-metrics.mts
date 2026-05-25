import { type Context, type Next } from 'hono';
import { createMiddleware } from 'hono/factory';
import { Counter, Histogram, collectDefaultMetrics } from 'prom-client';

const secondsPerMillisecond = 1000;
const bucketFast = 0.1;
const bucketNormal = 0.3;
const bucketMedium = 0.5;
const bucketSlow = 0.7;
const bucketOneSecond = 1;
const bucketThreeSeconds = 3;
const bucketFiveSeconds = 5;
const durationBucketsSeconds = [
    bucketFast,
    bucketNormal,
    bucketMedium,
    bucketSlow,
    bucketOneSecond,
    bucketThreeSeconds,
    bucketFiveSeconds,
];
const statusCodeLabel = 'status_code';

collectDefaultMetrics();

const httpRequestsTotal = new Counter({
    name: 'http_requests_total',
    help: 'Gesamte Anzahl an HTTP-Requests',
    labelNames: ['method', 'path', statusCodeLabel],
});

const httpRequestDurationSeconds = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Dauer von HTTP-Requests in Sekunden',
    labelNames: ['method', 'path', statusCodeLabel],
    buckets: durationBucketsSeconds,
});

export const trackMetrics = createMiddleware(
    async (context: Context, next: Next) => {
        const start = Date.now();
        const { method, path } = context.req;

        await next();

        const statusCode = context.res.status;
        const durationSeconds = (Date.now() - start) / secondsPerMillisecond;
        const labels = {
            method,
            path,
            [statusCodeLabel]: statusCode,
        };

        httpRequestsTotal.inc(labels);
        httpRequestDurationSeconds.observe(labels, durationSeconds);
    },
);
