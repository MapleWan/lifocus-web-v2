/**
 * 知识库管理页面
 */
import { knowledgeBases, articles, resources, projects } from '../mock-data.js';
import { formatDate, icon, truncate, generateId, debounce } from '../utils.js';
import { renderButton, renderTag, renderTabs, renderSearchBox, renderEmptyState, renderFormGroup } from '../components.js';
import { renderHeader } from '../components/header.js';
import { openModal, closeModal, confirmModal } from '../components/modal.js';
import { message } from '../components/message.js';

// 内部状态
let currentView = 'list'; // 'list' | 'detail'
let currentKbId = null;
let activeTab = 'all';
let searchKeyword = '';

// 模拟已索引资源数据
const indexedResources = [
  { id: 'ir1', kbId: 'kb1', name: 'Vue3 组合式API最佳实践', type: 'article', sourceId: 'a9', status: 'indexed', indexedAt: '2026-05-01T10:00:00Z' },
  { id: 'ir2', kbId: 'kb1', name: 'React Server Components 实战', type: 'article', sourceId: 'a10', status: 'indexed', indexedAt: '2026-05-02T14:00:00Z' },
  { id: 'ir3', kbId: 'kb1', name: 'Monorepo 工程实践', type: 'article', sourceId: 'a11', status: 'indexing', indexedAt: '2026-05-12T09:00:00Z' },
  { id: 'ir4', kbId: 'kb1', name: '代码规范手册.docx', type: 'resource', sourceId: 'r6', status: 'indexed', indexedAt: '2026-04-20T10:00:00Z' },
  { id: 'ir5', kbId: 'kb1', name: 'https://vuejs.org/guide/introduction', type: 'web', sourceId: null, status: 'indexed', indexedAt: '2026-05-08T11:00:00Z' },
  { id: 'ir6', kbId: 'kb1', name: 'https://react.dev/learn', type: 'web', sourceId: null, status: 'failed', indexedAt: '2026-05-10T09:00:00Z' },
  { id: 'ir7', kbId: 'kb2', name: '色彩系统升级方案', type: 'article', sourceId: 'a17', status: 'indexed', indexedAt: '2026-05-03T10:00:00Z' },
  { id: 'ir8', kbId: 'kb2', name: '组件规范文档', type: 'article', sourceId: 'a18', status: 'indexed', indexedAt: '2026-05-04T10:00:00Z' },
  { id: 'ir9', kbId: 'kb2', name: '图标资源包.zip', type: 'resource', sourceId: 'r14', status: 'indexed', indexedAt: '2026-04-25T10:00:00Z' },
  { id: 'ir10', kbId: 'kb2', name: '设计Token规范.docx', type: 'resource', sourceId: 'r15', status: 'indexing', indexedAt: '2026-05-09T15:00:00Z' },
  { id: 'ir11', kbId: 'kb3', name: 'Docker容器化部署手册', type: 'article', sourceId: 'a13', status: 'indexed', indexedAt: '2026-05-01T10:00:00Z' },
  { id: 'ir12', kbId: 'kb3', name: '接口文档v2.0.pdf', type: 'resource', sourceId: 'r4', status: 'indexed', indexedAt: '2026-04-15T10:00:00Z' },
  { id: 'ir13', kbId: 'kb3', name: '数据库设计文档.pdf', type: 'resource', sourceId: 'r13', status: 'indexed', indexedAt: '2026-04-16T10:00:00Z' },
  { id: 'ir14', kbId: 'kb3', name: 'https://kubernetes.io/docs', type: 'web', sourceId: null, status: 'indexed', indexedAt: '2026-05-05T10:00:00Z' },
  { id: 'ir15', kbId: 'kb4', name: '用户研究方法论', type: 'article', sourceId: 'a14', status: 'indexed', indexedAt: '2026-04-28T10:00:00Z' },
  { id: 'ir16', kbId: 'kb4', name: '项目周报模板.docx', type: 'resource', sourceId: 'r5', status: 'indexed', indexedAt: '2026-04-10T10:00:00Z' },
  { id: 'ir17', kbId: 'kb4', name: '季度汇报.pptx', type: 'resource', sourceId: 'r8', status: 'indexed', indexedAt: '2026-04-20T10:00:00Z' },
];

// 模拟搜索结果
const mockSearchResults = [
  { title: 'Vue3 组合式API最佳实践', content: '使用 <mark>setup</mark> 语法糖和 composable 函数进行逻辑复用，推荐使用 ref 和 reactive 管理响应式状态...', source: 'article', relevance: 95 },
  { title: 'Monorepo 工程实践', content: '使用 Turborepo 管理多包项目的配置和<mark>最佳实践</mark>，包括任务编排、缓存策略和依赖管理...', source: 'article', relevance: 82 },
  { title: '代码规范手册.docx', content: '前端代码<mark>规范</mark>包括命名约定、文件组织结构、注释要求和代码审查标准...', source: 'resource', relevance: 70 },
  { title: 'https://vuejs.org/guide/introduction', content: 'Vue 是一款用于构建用户界面的 JavaScript <mark>框架</mark>，基于标准 HTML、CSS 和 JavaScript 构建...', source: 'web', relevance: 65 },
];

/**
 * 获取知识库的资源统计
 */
function getKbStats(kbId) {
  const items = indexedResources.filter(r => r.kbId === kbId);
  return {
    articles: items.filter(r => r.type === 'article').length,
    resources: items.filter(r => r.type === 'resource').length,
    web: items.filter(r => r.type === 'web').length,
    total: items.length,
  };
}

/**
 * 渲染知识库列表视图
 */
function renderListView() {
  const filtered = searchKeyword
    ? knowledgeBases.filter(kb => kb.name.toLowerCase().includes(searchKeyword.toLowerCase()))
    : knowledgeBases;

  const header = renderHeader({
    title: '知识库',
    showSearch: true,
    searchPlaceholder: '搜索知识库...',
    actions: renderButton('创建知识库', { type: 'primary', iconName: 'add', attrs: 'id="btn-create-kb"' }),
  });

  let gridHtml = '';
  if (filtered.length === 0) {
    gridHtml = renderEmptyState('暂无知识库', searchKeyword ? '没有匹配的知识库' : '点击上方按钮创建第一个知识库');
  } else {
    gridHtml = `<div class="kb-grid">${filtered.map(kb => {
      const stats = getKbStats(kb.id);
      const hasIndexing = indexedResources.some(r => r.kbId === kb.id && r.status === 'indexing');
      return `
        <div class="kb-card" data-kb-id="${kb.id}">
          <div class="kb-card-header">
            <div class="kb-card-icon">${icon(kb.icon || 'folder')}</div>
            <div class="kb-card-actions">
              <button class="btn btn-ghost btn-sm" data-action="detail" data-id="${kb.id}">详情</button>
              <button class="btn btn-ghost btn-sm" data-action="delete-kb" data-id="${kb.id}" style="color:var(--danger)">删除</button>
            </div>
          </div>
          <div class="kb-card-title">${kb.name}</div>
          <div class="kb-card-desc">${kb.description}</div>
          <div class="kb-card-stats">
            <span class="kb-card-stat"><span class="kb-card-stat-value">${stats.articles}</span> 文章</span>
            <span class="kb-card-stat"><span class="kb-card-stat-value">${stats.resources}</span> 资源</span>
            <span class="kb-card-stat"><span class="kb-card-stat-value">${stats.web}</span> 网络</span>
          </div>
          <div class="kb-card-meta">
            <span class="kb-status ${hasIndexing ? 'kb-status-indexing' : 'kb-status-ready'}">${hasIndexing ? '索引中' : '已就绪'}</span>
            <span class="kb-card-time">${formatDate(kb.createdAt)}</span>
          </div>
        </div>
      `;
    }).join('')}</div>`;
  }

  return `${header}<div class="page-body">${gridHtml}</div>`;
}

/**
 * 渲染知识库详情视图
 */
function renderDetailView() {
  const kb = knowledgeBases.find(k => k.id === currentKbId);
  if (!kb) {
    currentView = 'list';
    return renderListView();
  }

  const stats = getKbStats(kb.id);
  const allItems = indexedResources.filter(r => r.kbId === currentKbId);
  let filteredItems = allItems;
  if (activeTab === 'article') filteredItems = allItems.filter(r => r.type === 'article');
  else if (activeTab === 'resource') filteredItems = allItems.filter(r => r.type === 'resource');
  else if (activeTab === 'web') filteredItems = allItems.filter(r => r.type === 'web');

  const header = `
    <header class="page-header">
      <div class="page-header-left">
        <button class="btn btn-ghost btn-sm" id="btn-back">${icon('arrow-left')} 返回</button>
      </div>
      <div class="page-header-right"></div>
    </header>
  `;

  const breadcrumb = `
    <div class="kb-breadcrumb">
      <a id="breadcrumb-home">知识库</a>
      <span class="kb-breadcrumb-sep">›</span>
      <span>${kb.name}</span>
    </div>
  `;

  const detailHeader = `
    <div class="kb-detail-header">
      <div class="kb-detail-title">${kb.name}</div>
      <div class="kb-detail-desc">${kb.description}</div>
      <div class="kb-stats-row">
        <div class="kb-stat-card">
          <div class="kb-stat-card-value">${stats.articles}</div>
          <div class="kb-stat-card-label">文章数量</div>
        </div>
        <div class="kb-stat-card">
          <div class="kb-stat-card-value">${stats.resources}</div>
          <div class="kb-stat-card-label">资源数量</div>
        </div>
        <div class="kb-stat-card">
          <div class="kb-stat-card-value">${stats.web}</div>
          <div class="kb-stat-card-label">网络内容数量</div>
        </div>
      </div>
      <div class="kb-detail-actions">
        ${renderButton('添加资源', { type: 'primary', iconName: 'add', attrs: 'id="btn-add-resource"' })}
        ${renderButton('搜索知识库', { type: 'ghost', iconName: 'search', attrs: 'id="btn-search-kb"' })}
        ${renderButton('编辑', { type: 'ghost', iconName: 'edit', attrs: 'id="btn-edit-kb"' })}
        ${renderButton('删除', { type: 'ghost', attrs: 'id="btn-delete-kb" style="color:var(--danger)"' })}
      </div>
    </div>
  `;

  const tabs = renderTabs([
    { id: 'all', label: `全部 (${allItems.length})` },
    { id: 'article', label: `文章 (${allItems.filter(r => r.type === 'article').length})` },
    { id: 'resource', label: `文件资源 (${allItems.filter(r => r.type === 'resource').length})` },
    { id: 'web', label: `网络内容 (${allItems.filter(r => r.type === 'web').length})` },
  ], activeTab);

  let resourceListHtml = '';
  if (filteredItems.length === 0) {
    resourceListHtml = renderEmptyState('暂无资源', '点击"添加资源"按钮添加内容到知识库');
  } else {
    resourceListHtml = `<div class="kb-resource-list">${filteredItems.map(item => {
      const iconClass = item.type === 'article' ? 'kb-resource-icon-article' : item.type === 'resource' ? 'kb-resource-icon-file' : 'kb-resource-icon-web';
      const iconChar = item.type === 'article' ? '📄' : item.type === 'resource' ? '📁' : '🌐';
      const sourceClass = `kb-resource-source-${item.type === 'web' ? 'web' : item.type}`;
      const sourceLabel = item.type === 'article' ? '文章' : item.type === 'resource' ? '资源' : '网络';
      const statusHtml = item.status === 'indexed'
        ? '<span class="kb-status kb-status-ready">已索引</span>'
        : item.status === 'indexing'
          ? '<span class="kb-status kb-status-indexing">索引中</span>'
          : '<span class="kb-status kb-status-failed">失败</span>';

      return `
        <div class="kb-resource-item" data-resource-id="${item.id}">
          <div class="kb-resource-icon ${iconClass}">${iconChar}</div>
          <div class="kb-resource-info">
            <div class="kb-resource-name">${item.name}</div>
            <div class="kb-resource-meta">
              <span class="kb-resource-source ${sourceClass}">${sourceLabel}</span>
              <span>${formatDate(item.indexedAt)}</span>
            </div>
          </div>
          <div class="kb-resource-status">${statusHtml}</div>
          <div class="kb-resource-actions">
            <button class="btn btn-ghost btn-sm" data-action="view-resource" data-id="${item.id}">查看</button>
            <button class="btn btn-ghost btn-sm" data-action="remove-resource" data-id="${item.id}" style="color:var(--danger)">移除</button>
          </div>
        </div>
      `;
    }).join('')}</div>`;
  }

  return `${header}<div class="page-body">${breadcrumb}${detailHeader}${tabs}${resourceListHtml}</div>`;
}

/**
 * render 主函数
 */
export function render() {
  if (currentView === 'detail') {
    return renderDetailView();
  }
  return renderListView();
}

/**
 * init 事件绑定
 */
export function init() {
  if (currentView === 'list') {
    initListEvents();
  } else {
    initDetailEvents();
  }
}

/**
 * 列表视图事件
 */
function initListEvents() {
  // 搜索
  const searchInput = document.getElementById('page-search');
  if (searchInput) {
    searchInput.value = searchKeyword;
    searchInput.addEventListener('input', debounce((e) => {
      searchKeyword = e.target.value;
      reRender();
    }, 300));
  }

  // 创建知识库
  const createBtn = document.getElementById('btn-create-kb');
  if (createBtn) {
    createBtn.addEventListener('click', openCreateModal);
  }

  // 卡片点击事件（事件委托）
  document.querySelectorAll('.kb-card').forEach(card => {
    card.addEventListener('click', (e) => {
      const actionBtn = e.target.closest('[data-action]');
      if (actionBtn) {
        const action = actionBtn.dataset.action;
        const id = actionBtn.dataset.id;
        if (action === 'detail') {
          navigateToDetail(id);
        } else if (action === 'delete-kb') {
          e.stopPropagation();
          handleDeleteKb(id);
        }
        return;
      }
      // 点击卡片本身进入详情
      const kbId = card.dataset.kbId;
      if (kbId) navigateToDetail(kbId);
    });
  });
}

/**
 * 详情视图事件
 */
function initDetailEvents() {
  // 返回按钮
  const backBtn = document.getElementById('btn-back');
  if (backBtn) {
    backBtn.addEventListener('click', navigateToList);
  }

  // 面包屑
  const breadcrumbHome = document.getElementById('breadcrumb-home');
  if (breadcrumbHome) {
    breadcrumbHome.addEventListener('click', navigateToList);
  }

  // Tab切换
  document.querySelectorAll('.tab-item').forEach(tab => {
    tab.addEventListener('click', () => {
      activeTab = tab.dataset.tab;
      reRender();
    });
  });

  // 添加资源
  const addBtn = document.getElementById('btn-add-resource');
  if (addBtn) {
    addBtn.addEventListener('click', openAddResourceModal);
  }

  // 搜索知识库
  const searchBtn = document.getElementById('btn-search-kb');
  if (searchBtn) {
    searchBtn.addEventListener('click', openSearchPanel);
  }

  // 编辑
  const editBtn = document.getElementById('btn-edit-kb');
  if (editBtn) {
    editBtn.addEventListener('click', () => {
      message.info('编辑功能：可修改知识库名称和描述');
    });
  }

  // 删除
  const deleteBtn = document.getElementById('btn-delete-kb');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => handleDeleteKb(currentKbId));
  }

  // 资源操作（事件委托）
  document.querySelectorAll('.kb-resource-item').forEach(item => {
    item.addEventListener('click', (e) => {
      const actionBtn = e.target.closest('[data-action]');
      if (!actionBtn) return;
      const action = actionBtn.dataset.action;
      const id = actionBtn.dataset.id;
      if (action === 'view-resource') {
        message.info('查看资源详情');
      } else if (action === 'remove-resource') {
        handleRemoveResource(id);
      }
    });
  });
}

/**
 * 导航到详情
 */
function navigateToDetail(kbId) {
  currentView = 'detail';
  currentKbId = kbId;
  activeTab = 'all';
  reRender();
}

/**
 * 返回列表
 */
function navigateToList() {
  currentView = 'list';
  currentKbId = null;
  activeTab = 'all';
  reRender();
}

/**
 * 重新渲染页面
 */
function reRender() {
  const pageContent = document.getElementById('page-content');
  if (pageContent) {
    pageContent.innerHTML = render();
    init();
  }
}

/**
 * 打开创建知识库弹窗
 */
function openCreateModal() {
  const projectOptions = projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('');

  const content = `
    ${renderFormGroup('知识库名称', '<input class="input" id="kb-name" placeholder="输入知识库名称">')}
    ${renderFormGroup('描述', '<textarea class="textarea" id="kb-desc" placeholder="描述知识库的用途和内容范围"></textarea>')}
    ${renderFormGroup('关联项目', `<select class="select" id="kb-project"><option value="">不关联项目</option>${projectOptions}</select>`)}
  `;

  openModal({
    title: '创建知识库',
    content,
    footer: `
      <button class="btn btn-ghost" id="modal-cancel">取消</button>
      <button class="btn btn-primary" id="modal-confirm-create">确认创建</button>
    `,
  });

  setTimeout(() => {
    const cancelBtn = document.getElementById('modal-cancel');
    const confirmBtn = document.getElementById('modal-confirm-create');
    if (cancelBtn) cancelBtn.addEventListener('click', () => closeModal());
    if (confirmBtn) confirmBtn.addEventListener('click', () => {
      const name = document.getElementById('kb-name')?.value?.trim();
      if (!name) {
        message.warning('请输入知识库名称');
        return;
      }
      closeModal();
      message.success(`知识库「${name}」创建成功`);
    });
  }, 0);
}

/**
 * 删除知识库
 */
async function handleDeleteKb(kbId) {
  const kb = knowledgeBases.find(k => k.id === kbId);
  if (!kb) return;
  const confirmed = await confirmModal(`确定要删除知识库「${kb.name}」吗？此操作不可撤销。`);
  if (confirmed) {
    message.success(`知识库「${kb.name}」已删除`);
    if (currentView === 'detail') {
      navigateToList();
    }
  }
}

/**
 * 移除资源
 */
async function handleRemoveResource(resourceId) {
  const res = indexedResources.find(r => r.id === resourceId);
  if (!res) return;
  const confirmed = await confirmModal(`确定要从知识库中移除「${res.name}」吗？`);
  if (confirmed) {
    message.success('资源已从知识库中移除');
    reRender();
  }
}

/**
 * 打开添加资源弹窗
 */
function openAddResourceModal() {
  let modalTab = 'articles';

  function renderModalContent(tab) {
    if (tab === 'articles') {
      const list = articles.map(a => `
        <label class="kb-add-resource-item">
          <input type="checkbox" value="${a.id}">
          <span class="kb-add-resource-item-name">${a.title}</span>
          <span class="kb-add-resource-item-meta">${a.status === 'published' ? '已发布' : '草稿'}</span>
        </label>
      `).join('');
      return `
        <div class="kb-modal-search"><input class="input" placeholder="搜索文章..." id="modal-article-search"></div>
        <div class="kb-add-resource-content"><div class="kb-add-resource-list">${list}</div></div>
      `;
    } else if (tab === 'resources') {
      const list = resources.map(r => `
        <label class="kb-add-resource-item">
          <input type="checkbox" value="${r.id}">
          <span class="kb-add-resource-item-name">${r.name}</span>
          <span class="kb-add-resource-item-meta">${r.size}</span>
        </label>
      `).join('');
      return `
        <div class="kb-modal-search"><input class="input" placeholder="搜索资源..." id="modal-resource-search"></div>
        <div class="kb-add-resource-content"><div class="kb-add-resource-list">${list}</div></div>
      `;
    } else {
      return `
        <div class="kb-url-input-group">
          <input class="input" placeholder="输入网页URL，如 https://example.com/article" id="modal-url-input">
          <div class="kb-url-hint">
            输入网页URL后，系统将自动抓取页面内容并建立索引。<br>
            支持大多数公开可访问的网页，建议使用文章、文档类页面。
          </div>
        </div>
      `;
    }
  }

  function getTabsHtml(active) {
    return `
      <div class="kb-add-resource-tabs">
        <div class="kb-add-resource-tab ${active === 'articles' ? 'active' : ''}" data-modal-tab="articles">从文章添加</div>
        <div class="kb-add-resource-tab ${active === 'resources' ? 'active' : ''}" data-modal-tab="resources">从资源添加</div>
        <div class="kb-add-resource-tab ${active === 'url' ? 'active' : ''}" data-modal-tab="url">从URL添加</div>
      </div>
    `;
  }

  const content = `
    ${getTabsHtml(modalTab)}
    <div id="modal-tab-content">${renderModalContent(modalTab)}</div>
  `;

  openModal({
    title: '添加资源到知识库',
    content,
    footer: `
      <button class="btn btn-ghost" id="modal-cancel">取消</button>
      <button class="btn btn-primary" id="modal-confirm-add">确认添加</button>
    `,
    width: '600px',
  });

  setTimeout(() => {
    // Tab切换
    document.querySelectorAll('.kb-add-resource-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        modalTab = tab.dataset.modalTab;
        document.querySelectorAll('.kb-add-resource-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const tabContent = document.getElementById('modal-tab-content');
        if (tabContent) tabContent.innerHTML = renderModalContent(modalTab);
      });
    });

    // 按钮事件
    const cancelBtn = document.getElementById('modal-cancel');
    const confirmBtn = document.getElementById('modal-confirm-add');
    if (cancelBtn) cancelBtn.addEventListener('click', () => closeModal());
    if (confirmBtn) confirmBtn.addEventListener('click', () => {
      if (modalTab === 'url') {
        const urlInput = document.getElementById('modal-url-input');
        if (urlInput && urlInput.value.trim()) {
          closeModal();
          message.success('URL已添加，正在索引中...');
        } else {
          message.warning('请输入有效的URL');
        }
      } else {
        const checked = document.querySelectorAll('.kb-add-resource-item input[type="checkbox"]:checked');
        if (checked.length === 0) {
          message.warning('请至少选择一项');
          return;
        }
        closeModal();
        message.success(`已添加 ${checked.length} 项资源，正在索引中...`);
      }
    });
  }, 0);
}

/**
 * 打开搜索面板
 */
function openSearchPanel() {
  // 创建搜索面板 + 遮罩层
  const panelHtml = `
    <div class="kb-overlay" id="kb-search-overlay"></div>
    <div class="kb-search-panel" id="kb-search-panel">
      <div class="kb-search-panel-header">
        <span class="kb-search-panel-title">搜索知识库</span>
        <span class="kb-search-panel-close" id="kb-search-close">${icon('close')}</span>
      </div>
      <div class="kb-search-panel-body">
        <div class="kb-search-input-row">
          <input class="input" placeholder="输入关键词搜索..." id="kb-search-input">
          <button class="btn btn-primary" id="kb-search-btn">搜索</button>
        </div>
        <div id="kb-search-results"></div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', panelHtml);

  // 延时激活动画
  requestAnimationFrame(() => {
    document.getElementById('kb-search-panel')?.classList.add('active');
    document.getElementById('kb-search-overlay')?.classList.add('active');
  });

  // 关闭事件
  const closePanel = () => {
    const panel = document.getElementById('kb-search-panel');
    const overlay = document.getElementById('kb-search-overlay');
    if (panel) panel.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    setTimeout(() => {
      panel?.remove();
      overlay?.remove();
    }, 300);
  };

  document.getElementById('kb-search-close')?.addEventListener('click', closePanel);
  document.getElementById('kb-search-overlay')?.addEventListener('click', closePanel);

  // 搜索事件
  const doSearch = () => {
    const input = document.getElementById('kb-search-input');
    const keyword = input?.value?.trim();
    if (!keyword) {
      message.warning('请输入搜索关键词');
      return;
    }
    const resultsContainer = document.getElementById('kb-search-results');
    if (resultsContainer) {
      resultsContainer.innerHTML = mockSearchResults.map(item => {
        const sourceClass = `kb-resource-source-${item.source === 'web' ? 'web' : item.source}`;
        const sourceLabel = item.source === 'article' ? '文章' : item.source === 'resource' ? '资源' : '网络';
        return `
          <div class="kb-search-result-item">
            <div class="kb-search-result-title">${item.title}</div>
            <div class="kb-search-result-content">${item.content}</div>
            <div class="kb-search-result-footer">
              <span class="kb-resource-source ${sourceClass}">${sourceLabel}</span>
              <div class="kb-relevance-bar"><div class="kb-relevance-bar-fill" style="width:${item.relevance}%"></div></div>
            </div>
          </div>
        `;
      }).join('');
    }
  };

  document.getElementById('kb-search-btn')?.addEventListener('click', doSearch);
  document.getElementById('kb-search-input')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doSearch();
  });
}
