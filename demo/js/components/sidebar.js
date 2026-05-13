/**
 * 侧边栏组件
 */
import { icon } from '../utils.js';
import { router } from '../router.js';
import { store } from '../store.js';
import { currentUser } from '../mock-data.js';

const navItems = [
  { path: '/dashboard', icon: 'dashboard', label: '仪表盘' },
  { path: '/project', icon: 'project', label: '项目' },
  { path: '/resource', icon: 'resource', label: '资源' },
  { path: '/knowledge', icon: 'knowledge', label: '知识库' },
  { path: '/chat', icon: 'chat', label: 'AI 对话' },
];

/**
 * 渲染侧边栏
 * @returns {string}
 */
export function renderSidebar() {
  const currentPath = router.getCurrentPath();
  const user = store.get('currentUser') || currentUser;

  const navHtml = navItems.map(item => {
    const isActive = currentPath === item.path;
    return `
      <div class="nav-item ${isActive ? 'active' : ''}" data-path="${item.path}">
        <span class="nav-icon">${icon(item.icon)}</span>
        <span>${item.label}</span>
      </div>
    `;
  }).join('');

  return `
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-brand">
        <h1>LiFocus</h1>
        <div class="brand-subtitle">专注效率，聚焦价值</div>
      </div>
      <nav class="sidebar-nav">
        ${navHtml}
      </nav>
      <div class="sidebar-footer">
        <div class="user-info">
          <div class="user-avatar">${user.avatar}</div>
          <span class="user-name">${user.name}</span>
          <span class="user-logout" id="btn-logout" title="退出登录">${icon('logout')}</span>
        </div>
      </div>
    </aside>
  `;
}

/**
 * 初始化侧边栏事件
 */
export function initSidebarEvents() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  // 导航点击
  sidebar.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const path = item.dataset.path;
      router.navigate(path);
    });
  });

  // 退出登录
  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      store.set('isAuthenticated', false);
      router.navigate('/auth');
    });
  }
}

/**
 * 更新侧边栏激活状态
 */
export function updateSidebarActive() {
  const currentPath = router.getCurrentPath();
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  sidebar.querySelectorAll('.nav-item').forEach(item => {
    const path = item.dataset.path;
    item.classList.toggle('active', path === currentPath);
  });
}
