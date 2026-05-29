import http from 'k6/http';
import { check, sleep } from 'k6';
import type { Options } from 'k6/options';

const baseUrl = (__ENV['BASE_URL'] ?? 'http://127.0.0.1:3000').replace(
    /\/$/,
    '',
);
const restPath = __ENV['REST_PATH'] ?? '/api/gebrauchtwagen';
const graphqlPath = __ENV['GRAPHQL_PATH'] ?? '/graphql';
const healthPath = __ENV['HEALTH_PATH'] ?? '/health/liveness';
const enableGraphql =
    (__ENV['ENABLE_GRAPHQL'] ?? 'false').toLowerCase() === 'true';
const pauseSeconds = Number(__ENV['PAUSE_SECONDS'] ?? '0.4');
const restRampUpDuration = __ENV['REST_RAMP_UP_DURATION'] ?? '20s';
const restHoldDuration = __ENV['REST_HOLD_DURATION'] ?? '40s';
const restMaxVus = Number(__ENV['REST_MAX_VUS'] ?? '10');
const graphqlRampUpDuration = __ENV['GRAPHQL_RAMP_UP_DURATION'] ?? '20s';
const graphqlHoldDuration = __ENV['GRAPHQL_HOLD_DURATION'] ?? '30s';
const graphqlMaxVus = Number(__ENV['GRAPHQL_MAX_VUS'] ?? '6');
const thresholdFailedRate = __ENV['THRESHOLD_FAILED_RATE'] ?? 'rate<0.03';
const thresholdP95 = __ENV['THRESHOLD_P95'] ?? 'p(95)<1200';
const thresholdAvg = __ENV['THRESHOLD_AVG'] ?? 'avg<600';
const thresholdChecks = __ENV['THRESHOLD_CHECKS'] ?? 'rate>0.97';

const scenarios: NonNullable<Options['scenarios']> = {
    rest_read: {
        exec: 'restReadScenario',
        executor: 'ramping-vus',
        stages: [
            {
                duration: restRampUpDuration,
                target: Math.max(1, Math.floor(restMaxVus / 2)),
            },
            { duration: restHoldDuration, target: restMaxVus },
            { duration: '20s', target: 0 },
        ],
        gracefulRampDown: '5s',
    },
};

if (enableGraphql) {
    scenarios['graphql_query'] = {
        exec: 'graphqlQueryScenario',
        executor: 'ramping-vus',
        startTime: '10s',
        stages: [
            {
                duration: graphqlRampUpDuration,
                target: Math.max(1, Math.floor(graphqlMaxVus / 2)),
            },
            { duration: graphqlHoldDuration, target: graphqlMaxVus },
            { duration: '20s', target: 0 },
        ],
        gracefulRampDown: '5s',
    };
}

export const options: Options = {
    scenarios,
    summaryTrendStats: ['avg', 'min', 'med', 'p(90)', 'p(95)', 'max'],
    thresholds: {
        http_req_failed: [thresholdFailedRate],
        http_req_duration: [thresholdP95, thresholdAvg],
        checks: [thresholdChecks],
    },
};

export function setup(): void {
    const healthResponse = http.get(`${baseUrl}${healthPath}`, {
        tags: { endpoint: 'health' },
        headers: {
            Accept: 'application/json',
        },
    });

    const isHealthy = check(healthResponse, {
        'Healthcheck vor Lasttest: Status 200': (response) =>
            response.status === 200,
    });

    if (!isHealthy) {
        throw new Error(
            `App nicht bereit fuer Lasttest: ${baseUrl}${healthPath}`,
        );
    }
}

export function restReadScenario(): void {
    const listResponse = http.get(`${baseUrl}${restPath}?page=1&size=10`, {
        tags: { endpoint: 'rest_list' },
        headers: {
            Accept: 'application/json',
        },
    });

    const listOk = check(listResponse, {
        'REST Liste: Status 200': (response) => response.status === 200,
        'REST Liste: Antwortzeit < 1000ms': (response) =>
            response.timings.duration < 1000,
    });

    if (listOk) {
        const detailResponse = http.get(`${baseUrl}${restPath}/1`, {
            tags: { endpoint: 'rest_detail' },
            headers: {
                Accept: 'application/json',
            },
        });

        check(detailResponse, {
            'REST Detail: Status 200': (response) => response.status === 200,
            'REST Detail: Antwortzeit < 1000ms': (response) =>
                response.timings.duration < 1000,
        });
    }

    sleep(pauseSeconds);
}

export function graphqlQueryScenario(): void {
    const payload = JSON.stringify({
        query: 'query HealthProbe { __typename }',
    });

    const response = http.post(`${baseUrl}${graphqlPath}`, payload, {
        tags: { endpoint: 'graphql_query' },
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
    });

    check(response, {
        'GraphQL Query: Status 200': (result) => result.status === 200,
        'GraphQL Query: Antwortzeit < 1000ms': (result) =>
            result.timings.duration < 1000,
    });

    sleep(pauseSeconds);
}
