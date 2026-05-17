import asciidoctor from '@asciidoctor/core';
import kroki from 'asciidoctor-kroki';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const sourceFile = join('docs', 'projekthandbuch.adoc');

if (!existsSync(sourceFile)) {
    console.error(
        `Projekthandbuch fehlt noch: ${sourceFile}. Umsetzung erfolgt in Issue #14.`,
    );
    process.exitCode = 1;
} else {
    const adoc = asciidoctor();
    console.log(`Asciidoctor.js ${adoc.getVersion()}`);

    kroki.register(adoc.Extensions);
    adoc.convertFile(sourceFile, {
        safe: 'safe',
        attributes: { linkcss: true },
        base_dir: 'docs',
        to_dir: join('docs', 'html'),
        mkdirs: true,
    });

    console.log(`HTML-Datei ${join('docs', 'html', 'projekthandbuch.html')}`);
}
