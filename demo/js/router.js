/**
 * 路由系统
 * 基于 location.hash 的 SPA 路由
 */
export class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = null;
    this.beforeEachHooks = [];
    this._init();
  }

  /**
   * 注册路由
   * @param {string} path - 路由路径 如 '/dashboard'
   * @param {object} config - 路由配置 { title, handler, fullscreen }
   */
  register(path, config) {
    this.routes[path] = config;
  }

  /**
   * 注册前置守卫
   * @param {Function} hook - (to, from) => boolean
   */
  beforeEach(hook) {
    this.beforeEachHooks.push(hook);
  }

  /**
   * 导航到指定路由
   * @param {string} path
   */
  navigate(path) {
    window.location.hash = '#' + path;
  }

  /**
   * 获取当前路由路径
   * @returns {string}
   */
  getCurrentPath() {
    const hash = window.location.hash || '#/dashboard';
    return hash.slice(1); // 去掉 #
  }

  /**
   * 内部初始化
   */
  _init() {
    window.addEventListener('hashchange', () => this._handleRouteChange());
    // 首次加载也触发路由
    window.addEventListener('load', () => this._handleRouteChange());
  }

  /**
   * 处理路由变化
   */
  async _handleRouteChange() {
    const path = this.getCurrentPath();
    const from = this.currentRoute;
    const to = path;

    // 执行前置守卫
    for (const hook of this.beforeEachHooks) {
      const canProceed = hook(to, from);
      if (canProceed === false) {
        // 恢复之前的hash
        if (from) {
          window.location.hash = '#' + from;
        }
        return;
      }
    }

    this.currentRoute = path;
    const route = this.routes[path];

    if (route) {
      // 更新页面标题
      if (route.title) {
        document.title = `${route.title} - LiFocus`;
      }
      // 处理全屏模式（如认证页）
      if (route.fullscreen) {
        document.body.classList.add('auth-page');
      } else {
        document.body.classList.remove('auth-page');
      }
      // 调用路由处理函数
      if (route.handler) {
        await route.handler();
      }
    } else {
      // 未匹配路由，跳转到默认路由
      this.navigate('/dashboard');
    }

    // 触发自定义事件
    window.dispatchEvent(new CustomEvent('routeChanged', { detail: { path, from } }));
  }
}

// 创建全局路由实例
export const router = new Router();
export default router;
