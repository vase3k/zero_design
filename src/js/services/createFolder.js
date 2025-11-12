import fs from "fs";
import path from "path";

function createFoldersPlugin(
    folders = [
        "public/images",
        "src/img/",
        "src/sass/base",
        "src/sass/blocks",
        "src/sass/libs",
        "src/sass/ui",
        "src/sass/utils",
        "src/font",
        "src/js",
        "src/js/modules",
        "src/js/services",
        "src/logo",
        "src/icons",
        "src/favicon",
    ],
) {
    return {
        name: "vite-plugin-create-folders",
        apply: "serve",
        configResolved(config) {
            const rootDir = config.root || process.cwd();

            folders.forEach((folder) => {
                const fullPath = path.join(rootDir, folder);
                if (!fs.existsSync(fullPath)) {
                    fs.mkdirSync(fullPath, { recursive: true });
                }
            });
        },
    };
}

export default createFoldersPlugin;
