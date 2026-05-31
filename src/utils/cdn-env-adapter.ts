/**
 * CDN Environment Adapter - CDN环境适配器
 * 
 * 功能：
 * - 检测运行环境（开发/生产/Cloudflare）
 * - 根据环境调整CDN策略
 * - 提供环境特定的优化配置
 */

export type Environment = 'development' | 'production' | 'cloudflare' | 'unknown';

interface EnvironmentConfig {
  name: Environment;
  enableCDN: boolean;
  preferLocal: boolean; // 是否优先使用本地资源
  retryCount: number;
  timeout: number;
  enableLogging: boolean;
}

class CDNEnvironmentAdapter {
  private currentEnvironment: Environment = 'unknown';
  private config: EnvironmentConfig;

  constructor() {
    this.detectEnvironment();
    this.config = this.getEnvironmentConfig();
  }

  /**
   * 检测当前运行环境
   */
  private detectEnvironment(): void {
    if (typeof window === 'undefined') {
      // 服务端环境检测
      const env = process.env?.NODE_ENV || process.env?.ASTRO_ENV;
      
      if (process.env?.CLOUDFLARE || process.env?.CF_PAGES) {
        this.currentEnvironment = 'cloudflare';
      } else if (env === 'production') {
        this.currentEnvironment = 'production';
      } else if (env === 'development') {
        this.currentEnvironment = 'development';
      }
    } else {
      // 客户端环境检测
      if (window.location.hostname === 'localhost' || 
          window.location.hostname === '127.0.0.1') {
        this.currentEnvironment = 'development';
      } else {
        // 检查是否在Cloudflare Workers/Pages上
        if (window.location.hostname.endsWith('.workers.dev') ||
            window.location.hostname.endsWith('.pages.dev')) {
          this.currentEnvironment = 'cloudflare';
        } else {
          this.currentEnvironment = 'production';
        }
      }
    }

    if (this.config.enableLogging) {
      console.log(`[CDN Env] Detected environment: ${this.currentEnvironment}`);
    }
  }

  /**
   * 获取环境特定配置
   */
  private getEnvironmentConfig(): EnvironmentConfig {
    const configs: Record<Environment, EnvironmentConfig> = {
      development: {
        name: 'development',
        enableCDN: true,           // 开发环境也启用CDN（便于测试）
        preferLocal: false,       // 不优先使用本地
        retryCount: 1,            // 减少重试次数
        timeout: 5000,            // 较短超时
        enableLogging: true,      // 启用详细日志
      },
      
      production: {
        name: 'production',
        enableCDN: true,
        preferLocal: false,
        retryCount: 2,
        timeout: 10000,
        enableLogging: false,     // 生产环境减少日志
      },
      
      cloudflare: {
        name: 'cloudflare',
        enableCDN: true,
        preferLocal: false,       // Cloudflare本身就有CDN，可以双重加速
        retryCount: 3,            // 增加重试次数（边缘节点可能不稳定）
        timeout: 8000,
        enableLogging: true,      // Cloudflare环境启用日志以便调试
      },
      
      unknown: {
        name: 'unknown',
        enableCDN: true,
        preferLocal: false,
        retryCount: 2,
        timeout: 10000,
        enableLogging: true,
      },
    };

    return configs[this.currentEnvironment];
  }

  /**
   * 获取当前环境
   */
  getEnvironment(): Environment {
    return this.currentEnvironment;
  }

  /**
   * 获取当前配置
   */
  getConfig(): EnvironmentConfig {
    return this.config;
  }

  /**
   * 判断是否应该使用CDN
   */
  shouldUseCDN(): boolean {
    return this.config.enableCDN;
  }

  /**
   * 判断是否在Cloudflare环境
   */
  isCloudflare(): boolean {
    return this.currentEnvironment === 'cloudflare';
  }

  /**
   * 获取优化的CDN URL（根据环境）
   */
  getOptimizedURL(originalUrl: string): string {
    if (!this.shouldUseCDN()) {
      return originalUrl; // 返回原始URL（可能是本地路径）
    }

    // Cloudflare环境下可以添加额外的查询参数
    if (this.isCloudflare()) {
      const separator = originalUrl.includes('?') ? '&' : '?';
      return `${originalUrl}${separator}_cf_cache=v${Date.now()}`;
    }

    return originalUrl;
  }

  /**
   * 获取环境特定的错误处理策略
   */
  getErrorHandlingStrategy(): {
    shouldRetry: boolean;
    shouldFallbackToLocal: boolean;
    shouldReportToServer: boolean;
  } {
    return {
      shouldRetry: this.config.retryCount > 0,
      shouldFallbackToLocal: this.config.preferLocal || this.isCloudflare(),
      shouldReportToServer: this.currentEnvironment === 'production' || 
                          this.currentEnvironment === 'cloudflare',
    };
  }
}

// 导出单例实例
export const cdnEnvAdapter = new CDNEnvironmentAdapter();

// 全局暴露（用于客户端脚本）
if (typeof window !== 'undefined') {
  (window as any).__CDN_ENV__ = {
    environment: cdnEnvAdapter.getEnvironment(),
    config: cdnEnvAdapter.getConfig(),
  };
}
