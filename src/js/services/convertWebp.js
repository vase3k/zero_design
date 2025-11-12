// vite-plugin-convert-to-webp.js
import fs from "fs";
import { readdirSync, statSync } from "fs";
import { join, extname, dirname, basename } from "path";
import sharp from "sharp";

function convertWebp(options = {}) {
    const inputDir = options.inputDir || "dist";
    const excludeFolders = options.excludeFolder || ["images"]; // array of folder names
    const excludeFilesPrefix = options.excludeFilesPrefix || [
        "android-chrome",
        "apple-touch-icon",
        "favicon-",
        "yandex-browser",
    ]; // files to skip
    const quality = options.quality || 80;
    const width = options.width || null;

    function isExcluded(filePath) {
        // skip folder
        if (
            excludeFolders.some((folder) =>
                filePath.startsWith(join(inputDir, folder)),
            )
        )
            return true;
        // skip file by prefix
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
            const originalMetadata = await sharp(filePath).metadata();
            const originalWidth = originalMetadata.width || 0;
            const originalSize = statSync(filePath).size; // bytes

            let pipeline = sharp(filePath);
            if (width)
                pipeline = pipeline.resize({ width, withoutEnlargement: true });

            const data = await pipeline
                .toFormat("webp", { quality })
                .toBuffer();
            await fs.promises.writeFile(outputPath, data);
            await fs.promises.unlink(filePath);

            const newMetadata = await sharp(outputPath).metadata();
            const newWidth = newMetadata.width || originalWidth;
            const newSize = data.length; // bytes
            const percentSaved = (
                ((originalSize - newSize) / originalSize) *
                100
            ).toFixed(1);

            const formatSize = (size) =>
                size > 1024 * 1024
                    ? (size / 1024 / 1024).toFixed(2) + "MB"
                    : (size / 1024).toFixed(1) + "KB";

            const widthLog =
                newWidth && originalWidth !== newWidth
                    ? ` | width ${originalWidth} → ${newWidth}`
                    : ` | no change`;

            console.log(
                `✔ converted: ${filePath} → ${outputPath} | ${formatSize(
                    originalSize,
                )} → ${formatSize(newSize)} | saved ${percentSaved}%${widthLog}`,
            );
        } catch (err) {
            console.warn(`✖ skip: ${filePath} (${err.message})`);
        }
    }

    function walkDir(dir) {
        for (const file of readdirSync(dir)) {
            const filePath = join(dir, file);
            const stats = statSync(filePath);
            if (stats.isDirectory()) walkDir(filePath);
            else convertFile(filePath);
        }
    }

    function updateHtmlUrls(dir) {
        for (const file of readdirSync(dir)) {
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
        closeBundle() {
            walkDir(inputDir);
            updateHtmlUrls(inputDir);
        },
    };
}

export default convertWebp;
