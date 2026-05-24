export const createBaseUrl = (request: Request): string => request.url;

export const createLocation = (request: Request, id: number): string => {
    const location = new URL(createBaseUrl(request));
    location.pathname = `${location.pathname}/${id}`;

    return location.href;
};
