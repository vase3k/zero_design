// vite-plugin-convert-to-webp.js
import fs from "fs";
import { readdirSync, statSync } from "fs";
import { join, extname, dirname, basename } from "path";
import sharp from "sharp";

function convertWebp(options = {}) {
    const inputDir = options.inputDir || "dist";
    const excludeFolders = options.excludeFolder || ["images"];
    const excludeFilesPrefix = options.excludeFilesPrefix || [
        "android-chrome",
        "apple-touch-icon",
        "favicon-",
        "yandex-browser",
    ];
    const quality = options.quality || 80;
    const width = options.width || null;

    let totalOriginalBytes = 0;
    let totalNewBytes = 0;

    function isExcluded(filePath) {
        if (
            excludeFolders.some((folder) =>
                filePath.startsWith(join(inputDir, folder)),
            )
        )
            return true;

        const name = basename(filePath);
        if (excludeFilesPrefix.some((prefix) => name.startsWith(prefix)))
            return true;

        return false;
    }

    async function convertFile(filePath) {
        const ext = extname(filePath).toLowerCase();
        if (![".jpg", ".jpeg", ".png"].includes(ext)) return;
        if (isExcluded(filePath)) return;

        const outputPath = join(
            dirname(filePath),
            basename(filePath, ext) + ".webp",
        );

        try {
            const originalSize = statSync(filePath).size;
            let pipeline = sharp(filePath);
            if (width)
                pipeline = pipeline.resize({ width, withoutEnlargement: true });

            const data = await pipeline
                .toFormat("webp", { quality })
                .toBuffer();
            await fs.promises.writeFile(outputPath, data);
            await fs.promises.unlink(filePath);

            const newSize = data.length;

            totalOriginalBytes += originalSize;
            totalNewBytes += newSize;

            const savedPercent = (
                ((originalSize - newSize) / originalSize) *
                100
            ).toFixed(1);

            console.log(
                `✔ converted: ${filePath} → ${outputPath} | ${(
                    originalSize /
                    1024 /
                    1024
                ).toFixed(
                    2,
                )} MB → ${(newSize / 1024 / 1024).toFixed(2)} MB | saved ${savedPercent}%`,
            );
        } catch (err) {
            console.warn(`✖ skip: ${filePath} (${err.message})`);
        }
    }

    async function walkDir(dir) {
        const files = readdirSync(dir);
        for (const file of files) {
            const filePath = join(dir, file);
            const stats = statSync(filePath);
            if (stats.isDirectory()) await walkDir(filePath);
            else await convertFile(filePath);
        }
    }

    function updateHtmlUrls(dir) {
        const files = readdirSync(dir);
        for (const file of files) {
            const filePath = join(dir, file);
            const stats = statSync(filePath);
            if (stats.isDirectory()) updateHtmlUrls(filePath);
            else if (extname(filePath) === ".html") {
                let html = fs.readFileSync(filePath, "utf-8");
                html = html.replace(/(\.jpg|\.jpeg|\.png)/gi, ".webp");
                fs.writeFileSync(filePath, html, "utf-8");
                console.log(`✔ updated HTML: ${filePath}`);
            }
        }
    }

    return {
        name: "vite-plugin-convert-to-webp",
        async closeBundle() {
            await walkDir(inputDir);
            updateHtmlUrls(inputDir);

            const savedPercent = (
                ((totalOriginalBytes - totalNewBytes) / totalOriginalBytes) *
                100
            ).toFixed(1);
            console.log(
                `\n💾 Total: ${(totalOriginalBytes / 1024 / 1024).toFixed(2)} MB → ${(totalNewBytes / 1024 / 1024).toFixed(2)} MB | saved ${savedPercent}%`,
            );
        },
    };
}

export default convertWebp;
