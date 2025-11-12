import path from "path";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { meta } from "vite-plugin-meta-tags";
import vitePluginFaviconsInject from "vite-plugin-favicons-inject";
import convertWebp from "./src/js/services/convertWebp";
import legacy from "@vitejs/plugin-legacy";
import { webfontDownload } from "vite-plugin-webfont-dl";

const baseName = `/${path.basename(process.cwd())}`;

export default defineConfig({
    base: baseName + "/dist/",
    build: {
        rollupOptions: {
            input: {
                index: "index.html",
            },
        },
    },

    plugins: [
        tailwindcss(),
        webfontDownload(
            [
                "https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,100..900;1,100..900&display=swap",
            ],
            {
                injectAsStyleTag: false,
                minifyCss: true,
                assetsSubfolder: "fonts",
            },
        ),
        meta({
            title: "title",
            description: "описание",
            url: "https://liongroup.by/",
            img: "/images/meta-og-image.jpg",
            color: "#ffffff",
        }),
        vitePluginFaviconsInject("src/favicon/favicon.png", {
            background: "#fff",
            path: "assets/fav",
            icons: {
                android: true,
                appleIcon: true,
                appleStartup: false,
                favicons: true,
                windows: false,
                yandex: true,
            },
            appName: "title",
            appShortName: "title",
            appDescription: "title",
        }),
        convertWebp({
            inputDir: "dist",
            width: 180,
            quality: 80,
            excludeFolder: ["images"],
        }),
        // legacy({
        // 	targets: ["defaults"],
        // }),
    ],
});
