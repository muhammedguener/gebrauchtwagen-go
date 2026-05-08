import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        include: ['test/**/*.test.ts'],
        setupFiles: ['test/integration/setup.ts'],
        globals: true,
        restoreMocks: true,
        clearMocks: true,
    },
});
