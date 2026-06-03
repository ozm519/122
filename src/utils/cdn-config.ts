/**
 * CDN Configuration - CDN资源加载策略配置文件
 *
 * 策略说明：
 * - 首选CDN：BootCDN (国内访问速度快)
 * - 备选CDN：jsDelivr (全球覆盖广，稳定性高)
 * - 自动切换：BootCDN加载失败时无缝切换至jsDelivr
 */

export interface CDNProvider {
	name: string;
	baseUrl: string;
	enabled: boolean;
}

export interface CDNResource {
	name: string;
	version: string;
	path: string;
	type: "js" | "css";
	priority: "critical" | "high" | "low";
	globalVar?: string;
}

interface CDNConfig {
	providers: {
		primary: CDNProvider; // 首选CDN → BootCDN
		backup: CDNProvider; // 备选CDN → jsDelivr
	};
	resources: CDNResource[];
	timeout: number; // 超时时间（毫秒）
	maxRetries: number; // 最大重试次数
	enableLogging: boolean; // 是否启用日志
}

const cdnConfig: CDNConfig = {
	providers: {
		// ==================== 首选CDN：BootCDN ====================
		// 国内访问速度快，资源丰富，适合国内用户优先使用
		primary: {
			name: "BootCDN",
			baseUrl: "https://cdn.bootcdn.net/ajax/libs",
			enabled: true,
		},

		// ==================== 备选CDN：jsDelivr ====================
		// 全球CDN网络，稳定性高，作为BootCDN的备用方案
		backup: {
			name: "jsDelivr",
			baseUrl: "https://cdn.jsdelivr.net/npm",
			enabled: true,
		},
	},

	resources: [
		// ==================== KaTeX 数学公式渲染库 ====================
		// 版本: katex@0.16.27
		{
			name: "katex",
			version: "0.16.27",
			path: "katex/dist/katex.min.css",
			type: "css",
			priority: "critical",
		},
		{
			name: "katex",
			version: "0.16.27",
			path: "katex/dist/katex.min.js",
			type: "js",
			priority: "critical",
			globalVar: "katex",
		},
		{
			name: "katex",
			version: "0.16.27",
			path: "katex/dist/contrib/auto-render.min.js",
			type: "js",
			priority: "critical",
			globalVar: "renderMathInElement",
		},

		// ==================== OverlayScrollbars 自定义滚动条 ====================
		// 版本: overlayscrollbars@2.12.0
		{
			name: "overlayscrollbars",
			version: "2.12.0",
			path: "overlayscrollbars/overlayscrollbars.css",
			type: "css",
			priority: "high",
		},
		{
			name: "overlayscrollbars",
			version: "2.12.0",
			path: "overlayscrollbars/overlayscrollbars.esm.js",
			type: "js",
			priority: "high",
		},

		// ==================== PhotoSwipe 图片灯箱 ====================
		// 版本: photoswipe@5.4.4
		{
			name: "photoswipe",
			version: "5.4.4",
			path: "photoswipe/style.css",
			type: "css",
			priority: "low",
		},
		{
			name: "photoswipe",
			version: "5.4.4",
			path: "photoswipe/photoswipe.esm.js",
			type: "js",
			priority: "low",
		},
		{
			name: "photoswipe",
			version: "5.4.4",
			path: "photoswipe/lightbox/lightbox.esm.js",
			type: "js",
			priority: "low",
		},
	],

	timeout: 8000, // 超时时间：8秒
	maxRetries: 2, // 最大重试次数
	enableLogging: true, // 启用日志输出
};

export default cdnConfig;
export { cdnConfig };

/**
 * 获取资源在指定CDN上的完整URL
 *
 * @param resource - 资源配置对象
 * @param provider - CDN提供商 ('primary'=BootCDN | 'backup'=jsDelivr)
 * @returns 完整的CDN URL
 */
export function getCDNUrl(
	resource: CDNResource,
	provider: "primary" | "backup" = "primary",
): string {
	const config = cdnConfig.providers[provider];

	if (!config.enabled) {
		if (cdnConfig.enableLogging) {
			console.warn(`[CDN] ${config.name} is disabled`);
		}
		return "";
	}

	// BootCDN URL格式: /{name}/{version}/{filename}
	if (provider === "primary") {
		const fileName = resource.path.split("/").pop() || "";
		return `${config.baseUrl}/${resource.name}/${resource.version}/${fileName}`;
	}

	// jsDelivr URL格式: /npm/{name}@{version}/{path}
	if (provider === "backup") {
		return `${config.baseUrl}/${resource.name}@${resource.version}/${resource.path}`;
	}

	return "";
}

/**
 * 获取首选CDN的URL（BootCDN）
 */
export function getPrimaryUrl(resource: CDNResource): string {
	return getCDNUrl(resource, "primary");
}

/**
 * 获取备选CDN的URL（jsDelivr）
 */
export function getBackupUrl(resource: CDNResource): string {
	return getCDNUrl(resource, "backup");
}

/**
 * 根据优先级分组获取资源
 */
export function getResourcesByPriority() {
	const critical = cdnConfig.resources.filter((r) => r.priority === "critical");
	const high = cdnConfig.resources.filter((r) => r.priority === "high");
	const low = cdnConfig.resources.filter((r) => r.priority === "low");

	return { critical, high, low };
}

/**
 * 获取CDN配置信息（用于调试）
 */
export function getCDNConfig() {
	return {
		primaryName: cdnConfig.providers.primary.name,
		primaryBase: cdnConfig.providers.primary.baseUrl,
		backupName: cdnConfig.providers.backup.name,
		backupBase: cdnConfig.providers.backup.baseUrl,
		timeout: cdnConfig.timeout,
		maxRetries: cdnConfig.maxRetries,
		totalResources: cdnConfig.resources.length,
	};
}
