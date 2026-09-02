#!/usr/bin/env node
/**
 * scripts/sync-vendor.js
 *
 * 将 node_modules 中 katex / overlayscrollbars / photoswipe 的核心文件
 * 复制到 public/vendor/，确保部署后所有第三方 JS/CSS 都从本地加载。
 *
 * 用法：node scripts/sync-vendor.js
 */

import { existsSync, mkdirSync, copyFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PUBLIC_VENDOR = join(ROOT, "public", "vendor");

function ensureDir(p) {
	if (!existsSync(p)) mkdirSync(p, { recursive: true });
}

function copyFile(src, dest) {
	if (!existsSync(src)) {
		console.warn(`[skip] not found: ${src}`);
		return false;
	}
	ensureDir(dirname(dest));
	copyFileSync(src, dest);
	console.log(`[copy] ${src.replace(ROOT + "\\", "")} -> ${dest.replace(ROOT + "\\", "")}`);
	return true;
}

const tasks = [
	// KaTeX
	{ src: "node_modules/katex/dist/katex.min.css", dest: "public/vendor/katex/katex.min.css" },
	{ src: "node_modules/katex/dist/katex.min.js", dest: "public/vendor/katex/katex.min.js" },
	{ src: "node_modules/katex/dist/contrib/auto-render.min.js", dest: "public/vendor/katex/auto-render.min.js" },
	{ src: "node_modules/katex/dist/fonts", dest: "public/vendor/katex/fonts", isDir: true, filter: /\.woff2$/i },

	// OverlayScrollbars
	{ src: "node_modules/overlayscrollbars/styles/overlayscrollbars.min.css", dest: "public/vendor/overlayscrollbars/overlayscrollbars.min.css" },
	{ src: "node_modules/overlayscrollbars/overlayscrollbars.esm.js", dest: "public/vendor/overlayscrollbars/overlayscrollbars.esm.js" },

	// PhotoSwipe
	{ src: "node_modules/photoswipe/dist/photoswipe.css", dest: "public/vendor/photoswipe/photoswipe.css" },
	{ src: "node_modules/photoswipe/dist/photoswipe.esm.min.js", dest: "public/vendor/photoswipe/photoswipe.esm.min.js" },
	{ src: "node_modules/photoswipe/dist/photoswipe-lightbox.esm.min.js", dest: "public/vendor/photoswipe/lightbox/lightbox.esm.min.js" },
];

let ok = 0;
let skip = 0;
for (const t of tasks) {
	const src = join(ROOT, t.src);
	const dest = join(ROOT, t.dest);
	if (t.isDir) {
		if (!existsSync(src)) {
			console.warn(`[skip] dir not found: ${src}`);
			skip++;
			continue;
		}
		ensureDir(dest);
		const re = t.filter || /.*/;
		const files = readdirSync(src).filter((f) => re.test(f));
		for (const f of files) {
			if (copyFile(join(src, f), join(dest, f))) ok++;
		}
	} else if (copyFile(src, dest)) {
		ok++;
	} else {
		skip++;
	}
}

console.log(`\nDone. copied=${ok}, skipped=${skip}`);
console.log(`vendor dir: ${PUBLIC_VENDOR}`);
