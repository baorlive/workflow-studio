import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],

    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/__tests__/setup.js'],
        pool: 'threads',
        poolOptions: {
            threads: {
                singleThread: true,
            },
        },
        exclude: [
            'node_modules/**',
            '.backups/**',
            '.claude/**',
            'old-wf-studio-fe-main/**',
            'dist/**',
            'run-copy/**',
        ],
        watchExclude: [
            '**/node_modules/**',
            '**/.backups/**',
            '**/.claude/**',
            '**/old-wf-studio-fe-main/**',
            '**/dist/**',
            '**/run-copy/**',
        ],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'src/__tests__/',
                '**/*.test.{js,jsx}',
                '**/*.spec.{js,jsx}',
                '**/mockData.js',
                '.backups/**',
                '.claude/**',
                'old-wf-studio-fe-main/**',
            ],
        },
    },

    server: {
        watch: {
            ignored: ['**/.backups/**', '**/node_modules/**', '**/dist/**']
        }
    },

    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@components': path.resolve(__dirname, './src/components'),
            '@hooks': path.resolve(__dirname, './src/hooks'),
            '@utils': path.resolve(__dirname, './src/utils'),
            '@services': path.resolve(__dirname, './src/services'),
            '@data': path.resolve(__dirname, './src/data'),
            '@styles': path.resolve(__dirname, './src/styles'),
            '@config': path.resolve(__dirname, './src/config'),
        },
    },
});
