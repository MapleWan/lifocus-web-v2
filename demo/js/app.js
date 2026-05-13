/**
 * 应用主入口
 */
import { router } from './router.js';
import { store } from './store.js';
import { currentUser } from './mock-data.js';
import { renderSidebar, initSidebarEvents, updateSidebarActive } from './components/sidebar.js';
import { render as renderProject, init as initProject } from './pages/project.js';
import * as knowledgePage from './pages/knowledge.js';
import { render as renderAuth, init as initAuth } from './pages/auth.js';
import { render as renderDashboard, init as initDashboard } from './pages/dashboard.js';

// 页面标题映射
const pageTitles = {
  '/dashboard': '仪表盘',
  '/project': '项目工作台',
  '/resource': '资源管理',
  '/knowledge': '知识库',
  '/chat': 'AI 对话',
  '/auth': '登录',
};

/**
 * 初始化应用
 */
function initApp() {
  // 设置当前用户
  store.set('currentUser', currentUser);

  // 渲染侧边栏
  const sidebarContainer = document.getElementById('sidebar-container');
  if (sidebarContainer) {
    sidebarContainer.innerHTML = renderSidebar();
    initSidebarEvents();
  }

  // 注册路由
  registerRoutes();

  // 监听路由变化，更新侧边栏状态
  window.addEventListener('routeChanged', () => {
    updateSidebarActive();
  });

  // 设置默认hash
  if (!window.location.hash) {
    window.location.hash = '#/dashboard';
  }
}

/**
 * 注册所有路由
 */
function registerRoutes() {
  router.register('/auth', {
    title: '登录',
    fullscreen: true,
    handler: () => renderPage('/auth'),
  });

  router.register('/dashboard', {
    title: '仪表盘',
    handler: () => renderPage('/dashboard'),
  });

  router.register('/project', {
    title: '项目工作台',
    handler: () => renderPage('/project'),
  });

  router.register('/resource', {
    title: '资源管理',
    handler: () => renderModulePage('/resource', () => import('./pages/resource.js')),
  });

  router.register('/knowledge', {
    title: '知识库',
    handler: () => renderModulePage('/knowledge', () => Promise.resolve(knowledgePage)),
  });

  router.register('/chat', {
    title: 'AI 对话',
    handler: () => renderModulePage('/chat', () => import('./pages/chat.js')),
  });

  // 认证守卫
  router.beforeEach((to, from) => {
    const isAuthenticated = store.get('isAuthenticated');
    if (!isAuthenticated && to !== '/auth') {
      router.navigate('/auth');
      return false;
    }
    if (isAuthenticated && to === '/auth') {
      router.navigate('/dashboard');
      return false;
    }
    return true;
  });
}

/**
 * 渲染页面内容
 * @param {string} path - 路由路径
 */
function renderPage(path) {
  const pageContent = document.getElementById('page-content');
  if (!pageContent) return;

  const title = pageTitles[path] || '';

  if (path === '/auth') {
    // 认证页面 - 使用auth模块
    pageContent.innerHTML = renderAuth();
    initAuth();
    return;
  }

  if (path === '/dashboard') {
    // 仪表盘页面 - 使用dashboard模块
    pageContent.innerHTML = renderDashboard();
    initDashboard();
    return;
  }

  // 项目工作台页面
  if (path === '/project') {
    pageContent.innerHTML = renderProject();
    initProject();
    return;
  }

  // 普通页面 - 带header
  pageContent.innerHTML = `
    <header class="page-header">
      <div class="page-header-left">
        <h2>${title}</h2>
      </div>
      <div class="page-header-right"></div>
    </header>
    <div class="page-body" id="page-body">
      <div class="empty-state">
        <div class="empty-state-icon" style="font-size:48px;opacity:0.3">📄</div>
        <div class="empty-state-title">${title}</div>
        <div class="empty-state-desc">该页面模块正在开发中，敬请期待</div>
      </div>
    </div>
  `;
}

/**
 * 动态加载页面模块并渲染
 * @param {string} path - 路由路径
 * @param {Function} importFn - 动态 import 函数
 */
async function renderModulePage(path, importFn) {
  const pageContent = document.getElementById('page-content');
  if (!pageContent) return;

  try {
    // 支持传入动态import函数或已导入的模块对象
    const module = typeof importFn === 'function' ? await importFn() : importFn;
    pageContent.innerHTML = module.render();
    if (module.init) module.init();
  } catch (err) {
    console.error(`Failed to load page module for ${path}:`, err);
    const title = pageTitles[path] || '';
    pageContent.innerHTML = `
      <header class="page-header">
        <div class="page-header-left"><h2>${title}</h2></div>
      </header>
      <div class="page-body">
        <div class="empty-state">
          <div class="empty-state-title">页面加载失败</div>
          <div class="empty-state-desc">${err.message}</div>
        </div>
      </div>
    `;
  }
}

// 启动应用
initApp();
