/**
 * CDN Fallback Manager - CDN主备切换核心逻辑
 * 
 * 功能：
 * 1. 基于onerror事件的自动故障切换
 * 2. 支持JS/CSS等多种资源类型
 * 3. 无缝切换，用户无感知
 * 4. 完整的错误日志记录
 * 5. 智能重试机制
 */

import cdnConfig, { CDNResource, getCDNUrl } from './cdn-config';

interface CDNLoadResult {
  success: boolean;
  provider: string;
  url: string;
  timestamp: number;
  retryCount?: number;
}

interface CDNErrorLog {
  timestamp: string;
  resource: string;
  failedProvider: string;
  backupProvider: string;
  error: string;
  url: string;
}

class CdnFallbackManager {
  private failedProviders: Set<string> = new Set();
  private errorLogs: CDNErrorLog[] = [];
  private loadResults: Map<string, CDNLoadResult> = new Map();
  private currentProvider: 'primary' | 'backup' = 'primary';
  
  constructor() {
    this.initializeErrorHandling();
  }
  
  /**
   * 初始化全局错误处理
   */
  private initializeErrorHandling(): void {
    if (typeof window === 'undefined') return;
    
    // 监听所有script和link标签的error事件
    document.addEventListener('error', (event) => {
      const target = event.target as HTMLElement;
      
      if (target.tagName === 'SCRIPT' || target.tagName === 'LINK') {
        const src = (target as HTMLScriptElement).src || 
                   (target as HTMLLinkElement).href;
        
        if (this.isCDNUrl(src)) {
          this.handleCDNError(target, src);
        }
      }
    }, true); // 使用捕获阶段
  }
  
  /**
   * 判断是否为CDN URL
   */
  private isCDNUrl(url: string): boolean {
    return url.includes('cdn.jsdelivr.net') || 
           url.includes('cdn.bootcdn.net');
  }
  
  /**
   * 处理CDN加载错误
   */
  private handleCDNError(element: HTMLElement, failedUrl: string): void {
    const resourceName = this.extractResourceName(failedUrl);
    const failedProvider = this.detectProvider(failedUrl);
    
    console.error(`[CDN Error] Failed to load ${resourceName} from ${failedProvider}`);
    
    // 记录错误日志
    this.logError({
      timestamp: new Date().toISOString(),
      resource: resourceName,
      failedProvider: failedProvider,
      backupProvider: failedProvider === 'primary' ? 'backup' : 'primary',
      error: element.tagName + ' load error',
      url: failedUrl,
    });
    
    // 标记失败的provider
    this.failedProviders.add(failedProvider);
    
    // 切换到备用CDN并重新加载
    this.switchToBackupAndReload(element, resourceName, failedUrl);
  }
  
  /**
   * 从URL提取资源名称
   */
  private extractResourceName(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      
      // jsDelivr格式: /npm/package@version/path
      if (url.includes('cdn.jsdelivr.net')) {
        return pathParts[2].split('@')[0];
      }
      
      // BootCDN格式: /ajax/libs/package/version/file
      if (url.includes('cdn.bootcdn.net')) {
        return pathParts[3];
      }
      
      return pathParts[pathParts.length - 1];
    } catch {
      return url.split('/').pop() || 'unknown';
    }
  }
  
  /**
   * 检测当前使用的CDN提供商
   */
  private detectProvider(url: string): 'primary' | 'backup' {
    if (url.includes('cdn.jsdelivr.net')) {
      return 'primary';
    }
    return 'backup';
  }
  
  /**
   * 切换到备用CDN并重新加载资源
   */
  private switchToBackupAndReload(
    element: HTMLElement, 
    resourceName: string, 
    failedUrl: string
  ): void {
    const backupProvider = this.currentProvider === 'primary' ? 'backup' : 'primary';
    
    // 查找资源配置
    const resource = cdnConfig.resources.find(r => 
      r.name === resourceName || failedUrl.includes(r.name)
    );
    
    if (!resource) {
      console.error(`[CDN] Resource configuration not found for: ${resourceName}`);
      return;
    }
    
    // 获取备用CDN的URL
    const backupUrl = getCDNUrl(resource, backupProvider);
    
    if (!backupUrl) {
      console.error(`[CDN] Cannot generate backup URL for: ${resourceName}`);
      return;
    }
    
    console.log(`[CDN Switch] Switching ${resourceName} to ${backupProvider}: ${backupUrl}`);
    
    // 移除失败元素
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
    
    // 创建新元素并加载
    if (resource.type === 'js') {
      this.loadScript(backupUrl, resource.name, backupProvider);
    } else if (resource.type === 'css') {
      this.loadCSS(backupUrl, resource.name, backupProvider);
    }
  }
  
  /**
   * 加载JavaScript文件
   */
  private loadScript(
    url: string, 
    resourceName: string, 
    provider: 'primary' | 'backup'
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.async = false; // 保持顺序执行
      
      script.onload = () => {
        this.recordSuccess(resourceName, provider, url);
        resolve();
      };
      
      script.onerror = () => {
        // 如果备用CDN也失败了，记录最终错误
        if (provider === 'backup') {
          console.error(`[CDN Critical] Both CDNs failed for: ${resourceName}`);
          this.logError({
            timestamp: new Date().toISOString(),
            resource: resourceName,
            failedProvider: 'backup',
            backupProvider: 'none',
            error: 'All CDN providers failed',
            url: url,
          });
        }
        reject(new Error(`Failed to load ${resourceName} from ${provider}`));
      };
      
      document.head.appendChild(script);
    });
  }
  
  /**
   * 加载CSS文件
   */
  private loadCSS(
    url: string, 
    resourceName: string, 
    provider: 'primary' | 'backup'
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      link.type = 'text/css';
      
      link.onload = () => {
        this.recordSuccess(resourceName, provider, url);
        resolve();
      };
      
      link.onerror = () => {
        if (provider === 'backup') {
          console.error(`[CDN Critical] Both CDNs failed for: ${resourceName}`);
          this.logError({
            timestamp: new Date().toISOString(),
            resource: resourceName,
            failedProvider: 'backup',
            backupProvider: 'none',
            error: 'All CDN providers failed',
            url: url,
          });
        }
        reject(new Error(`Failed to load ${resourceName} from ${provider}`));
      };
      
      document.head.appendChild(link);
    });
  }
  
  /**
   * 记录成功加载
   */
  private recordSuccess(
    resourceName: string, 
    provider: 'primary' | 'backup', 
    url: string
  ): void {
    const result: CDNLoadResult = {
      success: true,
      provider: cdnConfig.providers[provider].name,
      url: url,
      timestamp: Date.now(),
    };
    
    this.loadResults.set(resourceName, result);
    
    if (cdnConfig.enableLogging) {
      console.log(`[CDN Success] ${resourceName} loaded from ${result.provider}`);
    }
  }
  
  /**
   * 记录错误日志
   */
  private logError(error: CDNErrorLog): void {
    this.errorLogs.push(error);
    
    if (cdnConfig.enableLogging) {
      console.error('[CDN Error Log]:', error);
    }
    
    // 可以选择将错误日志发送到服务器
    this.sendErrorToServer(error);
  }
  
  /**
   * 发送错误日志到服务器（可选）
   */
  private sendErrorToServer(error: CDNErrorLog): void {
    // TODO: 实现错误日志上报功能
    // 示例：使用navigator.sendBeacon或fetch API发送到你的日志服务
    
    if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
      try {
        const blob = new Blob([JSON.stringify(error)], { type: 'application/json' });
        navigator.sendBeacon('/api/cdn-error-log', blob);
      } catch (e) {
        // 静默失败，不影响用户体验
      }
    }
  }
  
  /**
   * 批量加载CDN资源（带优先级）
   */
  async loadResources(): Promise<void> {
    if (typeof window === 'undefined') return;
    
    const highPriorityResources = cdnConfig.resources.filter(
      r => r.priority === 'high'
    );
    const lowPriorityResources = cdnConfig.resources.filter(
      r => r.priority !== 'high'
    );
    
    try {
      // 先加载高优先级资源
      await this.loadResourceGroup(highPriorityResources);
      
      // 再加载低优先级资源（不阻塞页面渲染）
      requestIdleCallback?.(() => {
        this.loadResourceGroup(lowPriorityResources).catch(console.error);
      }) || setTimeout(() => {
        this.loadResourceGroup(lowPriorityResources).catch(console.error);
      }, 100);
      
    } catch (error) {
      console.error('[CDN] Failed to load resources:', error);
    }
  }
  
  /**
   * 加载一组资源
   */
  private async loadResourceGroup(resources: CDNResource[]): Promise<void> {
    const loadPromises = resources.map(resource => this.loadSingleResource(resource));
    await Promise.allSettled(loadPromises);
  }
  
  /**
   * 加载单个资源
   */
  private async loadSingleResource(resource: CDNResource): Promise<void> {
    const primaryUrl = getCDNUrl(resource, 'primary');
    
    try {
      if (resource.type === 'js') {
        await this.loadScript(primaryUrl, resource.name, 'primary');
      } else if (resource.type === 'css') {
        await this.loadCSS(primaryUrl, resource.name, 'primary');
      }
    } catch (error) {
      // 如果主CDN失败，onerror处理函数会自动切换到备用CDN
      console.warn(`[CDN] Primary failed for ${resource.name}, switching to backup`);
    }
  }
  
  /**
   * 获取CDN状态报告
   */
  getStatusReport(): {
    failedProviders: string[];
    errorLogs: CDNErrorLog[];
    loadResults: Map<string, CDNLoadResult>;
    currentProvider: 'primary' | 'backup';
  } {
    return {
      failedProviders: Array.from(this.failedProviders),
      errorLogs: [...this.errorLogs],
      loadResults: this.loadResults,
      currentProvider: this.currentProvider,
    };
  }
  
  /**
   * 清除错误日志（用于调试）
   */
  clearLogs(): void {
    this.errorLogs = [];
    this.failedProviders.clear();
    this.loadResults.clear();
  }
}

// 导出单例实例
export const cdnManager = new CdnFallbackManager();

// 自动初始化
if (typeof window !== 'undefined') {
  // DOM加载完成后初始化CDN资源
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      cdnManager.loadResources();
    });
  } else {
    cdnManager.loadResources();
  }
}
