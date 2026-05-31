/**
 * CDN Configuration - CDN主备切换配置文件 (完整版)
 * 
 * 配置说明：
 * - primary: jsDelivr (首选CDN，全球加速)
 * - backup: BootCDN (备用CDN，国内加速)
 * - 支持自动故障切换和负载均衡
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
  globalVar?: string; // 全局变量名（用于检测是否加载成功）
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
    {
      name: 'katex',
      version: '0.16.9',
      path: 'katex/dist/katex.min.css',
      type: 'css',
      priority: 'critical',
    },
    {
      name: 'katex',
      version: '0.16.9',
      path: 'katex/dist/katex.min.js',
      type: 'js',
      priority: 'critical',
      globalVar: 'katex',
    },
    {
      name: 'katex',
      version: '0.16.9',
      path: 'katex/dist/contrib/auto-render.min.js',
      type: 'js',
      priority: 'critical',
      globalVar: 'renderMathInElement',
    },
    
    // ==================== OverlayScrollbars 自定义滚动条 ====================
    {
      name: 'overlayscrollbars',
      version: '2.4.5',
      path: 'overlayscrollbars/overlayscrollbars.css',
      type: 'css',
      priority: 'high',
    },
    {
      name: 'overlayscrollbars',
      version: '2.4.5',
      path: 'overlayscrollbars/overlayscrollbars.esm.js',
      type: 'js',
      priority: 'high',
    },
    
    // ==================== PhotoSwipe 图片灯箱 ====================
    {
      name: 'photoswipe',
      version: '5.3.8',
      path: 'photoswipe/style.css',
      type: 'css',
      priority: 'low',
    },
    {
      name: 'photoswipe',
      version: '5.3.8',
      path: 'photoswipe/photoswipe.esm.js',
      type: 'js',
      priority: 'low',
    },
    {
      name: 'photoswipe',
      version: '5.3.8',
      path: 'photoswipe/lightbox/lightbox.esm.js',
      type: 'js',
      priority: 'low',
    },
    
    // ==================== 可选：字体优化（如果需要）====================
    /*
    {
      name: 'fontsource-roboto',
      version: '5.0.8',
      path: '@fontsource/roboto/400.css',
      type: 'css',
      priority: 'low',
    },
    */
  ],
  
  retryDelay: 1000,
  maxRetries: 2,
  enableLogging: true,
};

export default cdnConfig;

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
    // jsDelivr URL格式: https://cdn.jsdelivr.net/npm/package@version/path
    return `${config.baseUrl}/${resource.name}@${resource.version}/${resource.path}`;
  } else {
    // BootCDN URL格式: https://cdn.bootcdn.net/ajax/libs/package/version/file
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
