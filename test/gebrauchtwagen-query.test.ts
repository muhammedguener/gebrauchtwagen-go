import { describe, expect, it } from 'vitest';
import {
    buildFindManyArgs,
    buildGebrauchtwagenWhere,
    buildPagination,
    parseGebrauchtwagenSearchParams,
} from '../src/gebrauchtwagen-query.mts';

describe('gebrauchtwagen-query', () => {
    it('liefert Defaults fuer page und size', () => {
        const parsed = parseGebrauchtwagenSearchParams({ marke: 'VW' });

        expect(parsed.page).toBe(1);
        expect(parsed.size).toBe(5);
    });

    it('baut Where-Filter fuer Marke und Modell', () => {
        const parsed = parseGebrauchtwagenSearchParams({
            marke: 'vw',
            modell: 'golf',
        });

        expect(buildGebrauchtwagenWhere(parsed)).toEqual({
            AND: [
                { marke: { contains: 'vw', mode: 'insensitive' } },
                { modell: { contains: 'golf', mode: 'insensitive' } },
            ],
        });
    });

    it('unterstuetzt kombinierte Filter', () => {
        const parsed = parseGebrauchtwagenSearchParams({
            fahrzeugklasse: 'KOMPAKTKLASSE',
            kraftstoffart: 'BENZIN',
            schadenfrei: false,
        });

        expect(buildGebrauchtwagenWhere(parsed)).toEqual({
            AND: [
                { fahrzeugklasse: 'KOMPAKTKLASSE' },
                { kraftstoffart: 'BENZIN' },
                { schadenfrei: false },
            ],
        });
    });

    it('berechnet reproduzierbare Pagination', () => {
        const parsed = parseGebrauchtwagenSearchParams({ page: 2, size: 3 });

        expect(buildPagination(parsed)).toEqual({
            skip: 3,
            take: 3,
        });

        const args = buildFindManyArgs(parsed);
        expect(args.skip).toBe(3);
        expect(args.take).toBe(3);
        expect(args.orderBy).toEqual([{ id: 'asc' }]);
    });

    it('validiert ungueltige Filterwerte', () => {
        expect(() =>
            parseGebrauchtwagenSearchParams({
                kraftstoffart: 'STROM',
            }),
        ).toThrowError();
    });
});
