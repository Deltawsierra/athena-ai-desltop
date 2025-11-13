// Build script for Electron production server
// Build script for Electron production server
const { build } = require('esbuild');
const path = require('path');
const fs = require('fs');

async function buildElectronServer() {
    console.log('Building Electron server bundle...');

    try {
        // Build the server as **CommonJS**, not ESM
        await build({
            entryPoints: ['server/index-electron.ts'],
            bundle: true,
            platform: 'node',
            target: 'node20',
            format: 'cjs',                           // <-- CHANGED
            outfile: 'dist/server-electron.cjs',     // <-- CHANGED
            external: [
                'better-sqlite3',  // native module
                'sqlite3',         // native module (if used)
                'electron',        // Electron itself
            ],
            loader: {
                '.ts': 'ts',
                '.tsx': 'tsx',
                '.js': 'js',
                '.jsx': 'jsx',
            },
            define: {
                'process.env.NODE_ENV': '"production"',
                'process.env.USE_SQLITE': '"true"',
            },
            minify: false,
            sourcemap: false,
        });

        console.log('✓ Server bundled successfully to dist/server-electron.cjs');

        // ---- copy better-sqlite3 native module into dist ----
        const sqliteSource = path.join('node_modules', 'better-sqlite3');
        const sqliteDest = path.join('dist', 'node_modules', 'better-sqlite3');

        if (!fs.existsSync(path.join('dist', 'node_modules'))) {
            fs.mkdirSync(path.join('dist', 'node_modules'), { recursive: true });
        }

        function copyDir(src, dest) {
            fs.mkdirSync(dest, { recursive: true });
            const entries = fs.readdirSync(src, { withFileTypes: true });

            for (const entry of entries) {
                const srcPath = path.join(src, entry.name);
                const destPath = path.join(dest, entry.name);

                try {
                    if (entry.isDirectory()) {
                        // Skip junk dirs
                        if (entry.name === 'node_gyp_bins' || entry.name === '.git') continue;
                        copyDir(srcPath, destPath);
                    } else if (
                        entry.name.endsWith('.node') ||
                        entry.name.endsWith('.js') ||
                        entry.name.endsWith('.json') ||
                        entry.name.endsWith('.dll') ||
                        entry.name.endsWith('.so') ||
                        entry.name.endsWith('.dylib')
                    ) {
                        fs.copyFileSync(srcPath, destPath);
                    }
                } catch (err) {
                    if (err.code === 'EACCES') {
                        console.log(` Skipping file due to permissions: ${entry.name}`);
                    } else {
                        throw err;
                    }
                }
            }
        }

        if (fs.existsSync(sqliteSource)) {
            console.log('Copying better-sqlite3 native module...');
            copyDir(sqliteSource, sqliteDest);
            console.log('✓ Native modules copied to dist/node_modules');
        }

        console.log('\n✅ Electron server build complete!');
        console.log('Files created:');
        console.log(' - dist/server-electron.cjs (bundled server)');
        console.log(' - dist/node_modules/better-sqlite3/ (native module)');
    } catch (error) {
        console.error('Build failed:', error);
        process.exit(1);
    }
}

buildElectronServer();
