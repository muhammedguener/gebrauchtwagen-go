import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { platform } from 'node:os';
import { resolve } from 'node:path';

const isWindows = platform() === 'win32';
const scanner = resolve(
    isWindows ? 'C:/' : '/',
    'Zimmermann',
    'sonar-scanner',
    'bin',
    isWindows ? 'sonar-scanner.bat' : 'sonar-scanner',
);

if (!existsSync(scanner)) {
    console.error(
        `Sonar Scanner nicht gefunden: ${scanner}. Installation lokal bereitstellen oder Issue #17/#15 dokumentieren.`,
    );
    process.exitCode = 1;
} else {
    console.log(`script=${scanner}`);
    const child = spawn(scanner, { shell: isWindows, stdio: 'inherit' });
    child.on('exit', (code) => {
        process.exitCode = code ?? 1;
    });
}
