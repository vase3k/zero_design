import { join, dirname } from "node:path";
import { promises as fs } from "node:fs";

function createFiles() {
    return {
        name: "vite-create-files",
        apply: "serve",

        async configResolved(config) {
            const rootDir = config.root || process.cwd();

            async function makeFile(filePath, content = "") {
                try {
                    const dir = dirname(filePath);
                    await fs.mkdir(dir, { recursive: true });
                    await fs.access(filePath).catch(async () => {
                        await fs.writeFile(filePath, content);
                    });
                } catch (err) {
                    console.error(`Error creating ${filePath}:`, err.message);
                }
            }

            const files = [
                {
                    path: "index.html",
                    content: `<!doctype html>
                    <html lang="en">
                      <head>
                        <meta charset="UTF-8" />
                        <link rel="icon" type="image/svg+xml" href="/vite.svg" />
                        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                        <title>title</title>
                        <script src="https://www.youtube.com/iframe_api"></script>
                      </head>
                      <body>
                        <header class=""></header>
                        <main class=""></main>
                        <footer class=""></footer>
                        <script type="module" src="/src/js/script.js"></script>
                      </body>
                    </html>
                    `,
                },
                {
                    path: "src/sass/styles.scss",
                    content: `@use '/src/sass/base/basic.scss';`,
                },
                {
                    path: "src/sass/base/basic.scss",
                    content: ``,
                },
                {
                    path: "index.html",
                    content: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" />
                            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                            <title>title</title></head><body><div id="app"></div>
                            <script type="module" src="/src/js/script.js"></script></body></html>`,
                },
                {
                    path: "src/js/main.js",
                    content: `'use strict';
                            window.addEventListener('DOMContentLoaded',()=>{});`,
                },
                {
                    path: "src/js/script.js",
                    content: `'use strict';
                    import '/src/sass/utils/tailwind.css';
                    import '/src/sass/styles.scss';
                    import '/src/js/main.js';`,
                },
                {
                    path: ".prettierrc",
                    content: `{"plugins": ["prettier-plugin-tailwindcss"],
                    "tailwindStylesheet": "src/sass/utils/tailwind.css"
                    }`,
                },
                {
                    path: "note.txt",
                    content: "",
                },
                {
                    path: "eslint.config.js",
                    content: `import js from '@eslint/js';
                    import globals from 'globals';
                    import { defineConfig } from 'eslint/config';

                    export default defineConfig([
                    {
                        rules: {
                                    'no-unused-vars': 'off',
                                },
                        files: ['**/*.{js,mjs,cjs}'],
                        plugins: { js },
                        extends: ['js/recommended'],
                        languageOptions: {
                            globals: {
                                ...globals.browser,
                                ...globals.node,
                            },
                        },
                    },
                ]);`,
                },
                {
                    path: "postcss.config.cjs",
                    content: `
          module.exports = {
          plugins: {
          'postcss-pxtorem': {
            rootValue: 16,
            propList: ['*'], // Преобразовывать все свойства
            selectorBlackList: [], // Селекторы, которые нужно исключить из преобразования
            replace: true, // Заменять px на rem
            mediaQuery: true, // Преобразовывать px внутри media queries
            minPixelValue: 0, // Минимальное значение px для преобразования
                    },
                },
            }; 
          `,
                },
                {
                    path: ".gitignore",
                    content: `# Logs
                    logs
                    *.log
                    npm-debug.log*
                    yarn-debug.log*
                    yarn-error.log*
                    pnpm-debug.log*
                    lerna-debug.log*

                    node_modules
                    dist
                    dist-ssr
                    *.local

                    # Editor directories and files
                    .vscode/*
                    !.vscode/extensions.json
                    .idea
                    .DS_Store
                    *.suo
                    *.ntvs*
                    *.njsproj
                    *.sln
                    *.sw?`,
                },
            ];

            await Promise.all(
                files.map((f) => makeFile(join(rootDir, f.path), f.content)),
            );
        },
    };
}

export default createFiles;
