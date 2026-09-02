<!--
  Icon.svelte - 轻量 Iconify 图标组件（用于 Svelte 文件）
  
  移除 @iconify/svelte 依赖后，本组件在浏览器端按需从 Iconify API 加载 SVG，
  并通过 onMount + 缓存避免重复请求。
-->
<script lang="ts">
	import { onMount } from "svelte";

	interface Props {
		icon: string;
		class?: string;
		width?: string | number;
		height?: string | number;
		"aria-hidden"?: boolean | string;
		role?: string;
	}

	let {
		icon,
		class: className = "",
		width,
		height,
		"aria-hidden": ariaHidden = true,
		role = "img",
	}: Props = $props();

	// 内存缓存 + 持久化缓存（sessionStorage）
	const cache = new Map<string, string>();
	const CACHE_VERSION = "v1";

	function getFromStorage(key: string): string | null {
		try {
			if (typeof sessionStorage === "undefined") return null;
			return sessionStorage.getItem(key);
		} catch {
			return null;
		}
	}

	function setToStorage(key: string, value: string) {
		try {
			if (typeof sessionStorage === "undefined") return;
			sessionStorage.setItem(key, value);
		} catch {
			/* quota exceeded */
		}
	}

	function storageKey(prefix: string, name: string) {
		return `icon:${CACHE_VERSION}:${prefix}:${name}`;
	}

	async function fetchIcon(prefix: string, name: string): Promise<string> {
		const key = `${prefix}:${name}`;
		if (cache.has(key)) return cache.get(key) ?? "";

		const sk = storageKey(prefix, name);
		const fromStorage = getFromStorage(sk);
		if (fromStorage) {
			cache.set(key, fromStorage);
			return fromStorage;
		}

		const url = `https://api.iconify.design/${prefix}/${name}.svg?inline=1&svgProps=vertical-align%3A%20middle`;
		try {
			const resp = await fetch(url);
			if (!resp.ok) {
				console.warn(`[Icon] fetch failed: ${url} (${resp.status})`);
				return "";
			}
			const text = await resp.text();
			cache.set(key, text);
			setToStorage(sk, text);
			return text;
		} catch (e) {
			console.warn(`[Icon] fetch error: ${url}`, e);
			return "";
		}
	}

	let svg = $state("");

	$effect(() => {
		const name = icon;
		if (!name || !name.includes(":")) {
			svg = "";
			return;
		}
		const [prefix, ic] = name.split(":", 2);
		fetchIcon(prefix, ic).then((text) => {
			// 提取 <svg ...>...</svg>
			const m = text.match(/<svg[\s\S]*?<\/svg>/i);
			let inner = m ? m[0] : "";

			// 注入 class
			if (inner && className) {
				if (/\bclass\s*=\s*"/.test(inner)) {
					inner = inner.replace(/<svg([^>]*?)\bclass\s*=\s*"([^"]*)"/i, (_m, pre, c) => `<svg${pre}class="${c} ${className}"`);
				} else {
					inner = inner.replace(/<svg/i, `<svg class="${className}"`);
				}
			}

			// 注入宽高
			if (inner && (width || height)) {
				const sizeAttrs = `${width ? ` width="${width}"` : ""}${height ? ` height="${height}"` : ""}`;
				inner = inner.replace(/<svg/i, `<svg${sizeAttrs}`);
			}

			// 注入 aria/role
			if (inner) {
				inner = inner.replace(/<svg/i, `<svg aria-hidden="${ariaHidden}" role="${role}"`);
			}

			svg = inner;
		});
	});
</script>

{@html svg}
