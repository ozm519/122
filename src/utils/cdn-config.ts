/**
 * CDN Configuration - CDN主备切换配置文件 (版本同步版)
 * 
 * ⚠️ 重要：此文件的版本号必须与 package.json 中的实际安装版本完全一致！
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
  type: 'js' | 'css';
  priority: 'critical' | 'high' | 'low';
  globalVar?: string;
}

interface CDNConfig {
  providers: {
    primary: CDNProvider;
    backup: CDNProvider;
  };
  resources: CDNResource[];
  retryDelay: number;
  maxRetries: number;
  enableLogging: boolean;
}

const cdnConfig: CDNConfig = {
  providers: {
    primary: {
      name: 'jsDelivr',
      baseUrl: 'https://cdn.jsdelivr.net/npm',
      enabled: true,
    },
    backup: {
      name: 'BootCDN',
      baseUrl: 'https://cdn.bootcdn.net/ajax/libs',
      enabled: true,
    },
  },
  
  resources: [
    // ==================== KaTeX 数学公式渲染库 ====================
    // 实际安装版本: katex@0.16.27
    {
      name: 'katex',
      version: '0.16.27',  // ✅ 与 package.json 一致
      path: 'katex/dist/katex.min.css',
      type: 'css',
      priority: 'critical',
    },
    {
      name: 'katex',
      version: '0.16.27',
      path: 'katex/dist/katex.min.js',
      type: 'js',
      priority: 'critical',
      globalVar: 'katex',
    },
    {
      name: 'katex',
      version: '0.16.27',
      path: 'katex/dist/contrib/auto-render.min.js',
      type: 'js',
      priority: 'critical',
      globalVar: 'renderMathInElement',
    },
    
    // ==================== OverlayScrollbars 自定义滚动条 ====================
    // 实际安装版本: overlayscrollbars@2.12.0
    {
      name: 'overlayscrollbars',
      version: '2.12.0',  // ✅ 与 package.json 一致
      path: 'overlayscrollbars/overlayscrollbars.css',
      type: 'css',
      priority: 'high',
    },
    {
      name: 'overlayscrollbars',
      version: '2.12.0',
      path: 'overlayscrollbars/overlayscrollbars.esm.js',
      type: 'js',
      priority: 'high',
    },
    
    // ==================== PhotoSwipe 图片灯箱 ====================
    // 实际安装版本: photoswipe@5.4.4
    {
      name: 'photoswipe',
      version: '5.4.4',  // ✅ 与 package.json 一致
      path: 'photoswipe/style.css',
      type: 'css',
      priority: 'low',
    },
    {
      name: 'photoswipe',
      version: '5.4.4',
      path: 'photoswipe/photoswipe.esm.js',
      type: 'js',
      priority: 'low',
    },
    {
      name: 'photoswipe',
      version: '5.4.4',
      path: 'photoswipe/lightbox/lightbox.esm.js',
      type: 'js',
      priority: 'low',
    },
  ],
  
  retryDelay: 1000,
  maxRetries: 2,
  enableLogging: true,
};

export default cdnConfig;
export { cdnConfig }; // 同时提供命名导出，供组件使用

/**
 * 获取资源在指定CDN上的完整URL
 */
export function getCDNUrl(
  resource: CDNResource, 
  provider: 'primary' | 'backup' = 'primary'
): string {
  const config = cdnConfig.providers[provider];
  
  if (!config.enabled) {
    console.warn(`[CDN] ${config.name} is disabled`);
    return '';
  }
  
  if (provider === 'primary') {
    return `${config.baseUrl}/${resource.name}@${resource.version}/${resource.path}`;
  } else {
    const fileName = resource.path.split('/').pop() || '';
    return `${config.baseUrl}/${resource.name}/${resource.version}/${fileName}`;
  }
}

/**
 * 根据优先级分组获取资源
 */
export function getResourcesByPriority() {
  const critical = cdnConfig.resources.filter(r => r.priority === 'critical');
  const high = cdnConfig.resources.filter(r => r.priority === 'high');
  const low = cdnConfig.resources.filter(r => r.priority === 'low');
  
  return { critical, high, low };
}
