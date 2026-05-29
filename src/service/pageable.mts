export type Pageable = {
    page: number;
    size: number;
};

export type Slice<T> = {
    data: T[];
    total: number;
};

export type Page<T> = Slice<T> & Pageable;

type CreatePage = <T>(slice: Slice<T>, pageable: Pageable) => Page<T>;

export const createPageable = (pageable: Pageable): Pageable => ({
    page: pageable.page,
    size: pageable.size,
});

export const createPage: CreatePage = (slice, pageable) => ({
    data: slice.data,
    page: pageable.page,
    size: pageable.size,
    total: slice.total,
});
