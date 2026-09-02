import { defineMiddleware } from "astro:middleware";

/**
 * 全局响应头中间件
 *
 * 修复：
 * - P1-3 添加安全响应头（X-Frame-Options / X-Content-Type-Options / HSTS / CSP / Referrer-Policy）
 * - P1-4 移除 X-Powered-By: Astro 版本泄露
 * - P1-5 收紧 CORS，仅允许同源（默认同源即拒绝跨域）
 * - P2-6 静态资源设置合理 Cache-Control，让 Cloudflare 边缘缓存生效
 */

// 允许的跨域来源（CORS 白名单）。默认仅允许同源；如需 API 跨域访问，把域名加到这里。
const CORS_ALLOW_ORIGINS = [
	// 'https://your-frontend.example.com',
];

// 静态资源缓存时长：1 年（不可变），符合 Astro 资源带 hash 的特性
const IMMUTABLE_CACHE = "public, max-age=31536000, immutable";
// 其它静态资源缓存时长：1 天
const STATIC_CACHE = "public, max-age=86400, must-revalidate";
// HTML 页面缓存：短时缓存
const HTML_CACHE = "public, max-age=0, must-revalidate";

function isImmutableAsset(pathname: string): boolean {
	// Astro 构建产物带 hash，如 /_astro/foo.123abc.css
	return /\/_astro\/[^/]+\.[a-z0-9_-]+\.[a-z0-9_-]+$/i.test(pathname);
}

function isStaticAsset(pathname: string): boolean {
	return (
		pathname.startsWith("/vendor/") ||
		pathname.startsWith("/favicon/") ||
		pathname.startsWith("/pagefind/") ||
		pathname.startsWith("/assets/") ||
		/\.(?:png|jpg|jpeg|webp|gif|svg|ico|woff2?|ttf|otf|eot|mp4|webm|pdf|css|js|map)$/i.test(pathname)
	);
}

function buildCspHeader(origin: string | null): string {
	// 基础 CSP。允许同源 + 内联样式（Tailwind/Astro 需要）+ 必要的远程图片源。
	// 注意：若站点使用外部图片/字体源，需把对应域名加到对应指令中。
	const directives = [
		`default-src 'self'`,
		// swup 主题切换使用内联脚本；Astro island 也会输出内联脚本
		`script-src 'self' 'unsafe-inline'`,
		`style-src 'self' 'unsafe-inline'`,
		`img-src 'self' data: blob: https:`,
		`font-src 'self' data:`,
		`connect-src 'self' https://api.iconify.design`,
		`frame-ancestors 'none'`,
		`base-uri 'self'`,
		`form-action 'self'`,
		`object-src 'none'`,
	];
	if (origin) directives.push(`frame-ancestors 'none'`);
	return directives.join("; ");
}

export const onRequest = defineMiddleware(async (context, next) => {
	const response = await next();

	// 必须能修改响应头
	try {
		const headers = new Headers(response.headers);

		// P1-4：移除版本泄露头
		headers.delete("X-Powered-By");

		// P1-3：安全响应头
		headers.set("X-Frame-Options", "SAMEORIGIN");
		headers.set("X-Content-Type-Options", "nosniff");
		headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
		headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
		headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
		// 仅对 HTML 响应设置 CSP，避免影响下载资源
		const ct = headers.get("content-type") || "";
		if (ct.includes("text/html")) {
			headers.set("Content-Security-Policy", buildCspHeader(context.request.headers.get("origin")));
		}

		// P1-5：收紧 CORS
		const requestOrigin = context.request.headers.get("origin");
		if (requestOrigin) {
			if (CORS_ALLOW_ORIGINS.includes(requestOrigin)) {
				headers.set("Access-Control-Allow-Origin", requestOrigin);
				headers.set("Vary", "Origin");
			} else {
				// 非白名单 origin：不返回 Access-Control-Allow-Origin，相当于禁止跨域读取
				headers.delete("Access-Control-Allow-Origin");
			}
		}

		// P2-6：合理的缓存控制
		const url = new URL(context.request.url);
		const pathname = url.pathname;

		// 已有 Cache-Control 则不覆盖（如 Cloudflare 边缘已经处理过）
		const existingCacheControl = headers.get("cache-control");
		if (!existingCacheControl || existingCacheControl === "no-store") {
			if (isImmutableAsset(pathname)) {
				headers.set("Cache-Control", IMMUTABLE_CACHE);
			} else if (isStaticAsset(pathname)) {
				headers.set("Cache-Control", STATIC_CACHE);
			} else if (ct.includes("text/html")) {
				headers.set("Cache-Control", HTML_CACHE);
			}
		}

		return new Response(response.body, {
			status: response.status,
			statusText: response.statusText,
			headers,
		});
	} catch (e) {
		// 若响应不可修改（如流式响应），直接返回原始响应
		return response;
	}
});
