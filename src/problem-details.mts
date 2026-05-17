export const unauthorized = 401;
export const forbidden = 403;
export const notFound = 404;
export const preconditionFailed = 412;
export const unprocessableContent = 422;
export const preconditionRequired = 428;

const titles = new Map<number, string>([
    [unauthorized, 'Unauthorized'],
    [forbidden, 'Forbidden'],
    [notFound, 'Not Found'],
    [preconditionFailed, 'Precondition Failed'],
    [unprocessableContent, 'Unprocessable Content'],
    [preconditionRequired, 'Precondition Required'],
]);

export type ProblemDetails = {
    title: string;
    statusCode: number;
    detail: unknown;
};

export const createProblemDetails = (
    statusCode: number,
    detail: unknown,
): Response => {
    const body: ProblemDetails = {
        title: titles.get(statusCode) ?? 'Client Error',
        statusCode,
        detail,
    };

    const headers = new Headers();
    headers.set('Content-Type', 'application/problem+json');

    return Response.json(body, {
        status: statusCode,
        headers,
    });
};
