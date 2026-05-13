/**
 * 项目工作台页面
 */
import { store } from '../store.js';
import { categories, articles, projects, users } from '../mock-data.js';
import { formatDate, icon, debounce, generateId, truncate } from '../utils.js';
import { renderButton, renderTag, renderEmptyState, renderSearchBox } from '../components.js';
import { renderTree, initTreeEvents } from '../components/tree.js';
import { openModal, closeModal, confirmModal } from '../components/modal.js';
import { message } from '../components/message.js';

// ---- Local State ----
let localCategories = [...categories];
let localArticles = [...articles];
let selectedCategoryId = null; // null = "全部文章"
let searchKeyword = '';
let sortField = 'updatedAt';
let sortOrder = 'desc';
let displayCount = 8; // 每次显示的文章数

/**
 * 获取当前项目
 */
function getCurrentProject() {
  const p = store.get('currentProject');
  if (p) return p;
  return projects[0];
}

/**
 * 获取当前项目的分类
 */
function getProjectCategories() {
  const project = getCurrentProject();
  return localCategories.filter(c => c.projectId === project.id);
}

/**
 * 构建分类树结构
 */
function buildCategoryTree(flatCategories) {
  const map = {};
  const roots = [];

  flatCategories.forEach(c => {
    map[c.id] = { ...c, children: [] };
  });

  flatCategories.forEach(c => {
    if (c.parentId && map[c.parentId]) {
      map[c.parentId].children.push(map[c.id]);
    } else if (!c.parentId) {
      roots.push(map[c.id]);
    }
  });

  // 排序
  const sortNodes = (nodes) => {
    nodes.sort((a, b) => (a.order || 0) - (b.order || 0));
    nodes.forEach(n => sortNodes(n.children));
  };
  sortNodes(roots);

  return roots;
}

/**
 * 统计分类下的文章数量 (包含子分类)
 */
function countArticlesInCategory(categoryId) {
  const project = getCurrentProject();
  const projectArticles = localArticles.filter(a => a.projectId === project.id);

  // 获取该分类及所有子分类的ID
  const allIds = getAllChildCategoryIds(categoryId);
  allIds.push(categoryId);

  return projectArticles.filter(a => allIds.includes(a.categoryId)).length;
}

/**
 * 递归获取所有子分类ID
 */
function getAllChildCategoryIds(parentId) {
  const children = localCategories.filter(c => c.parentId === parentId);
  let ids = [];
  children.forEach(c => {
    ids.push(c.id);
    ids = ids.concat(getAllChildCategoryIds(c.id));
  });
  return ids;
}

/**
 * 获取过滤/排序后的文章列表
 */
function getFilteredArticles() {
  const project = getCurrentProject();
  let result = localArticles.filter(a => a.projectId === project.id);

  // 按分类过滤
  if (selectedCategoryId) {
    const allIds = getAllChildCategoryIds(selectedCategoryId);
    allIds.push(selectedCategoryId);
    result = result.filter(a => allIds.includes(a.categoryId));
  }

  // 按关键字搜索
  if (searchKeyword.trim()) {
    const kw = searchKeyword.trim().toLowerCase();
    result = result.filter(a => a.title.toLowerCase().includes(kw));
  }

  // 排序
  result.sort((a, b) => {
    let valA, valB;
    if (sortField === 'updatedAt' || sortField === 'createdAt') {
      valA = new Date(a[sortField]).getTime();
      valB = new Date(b[sortField]).getTime();
    } else if (sortField === 'title') {
      valA = a.title.toLowerCase();
      valB = b.title.toLowerCase();
      if (sortOrder === 'asc') return valA < valB ? -1 : valA > valB ? 1 : 0;
      return valA > valB ? -1 : valA < valB ? 1 : 0;
    }
    return sortOrder === 'desc' ? valB - valA : valA - valB;
  });

  return result;
}

/**
 * 获取分类名称
 */
function getCategoryName(categoryId) {
  if (!categoryId) return '未分类';
  const cat = localCategories.find(c => c.id === categoryId);
  return cat ? cat.name : '未分类';
}

/**
 * 获取用户名称
 */
function getUserName(userId) {
  const user = users.find(u => u.id === userId);
  return user ? user.name : '未知';
}

// ================================================
// RENDER
// ================================================

/**
 * 渲染带文章数量的树节点
 */
function renderCategoryTreeWithCount(treeNodes) {
  if (!treeNodes || treeNodes.length === 0) return '';

  const renderNode = (node) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = node.expanded !== false;
    const isActive = node.id === selectedCategoryId;
    const articleCount = countArticlesInCategory(node.id);

    const toggleHtml = hasChildren
      ? `<span class="tree-toggle ${isExpanded ? 'expanded' : ''}" data-id="${node.id}">${icon('arrow-right')}</span>`
      : `<span class="tree-toggle" style="visibility:hidden">${icon('arrow-right')}</span>`;

    const actionsHtml = `
      <span class="tree-node-actions">
        <span class="btn-icon" data-action="add" data-id="${node.id}" title="添加子分类">${icon('add')}</span>
        <span class="btn-icon" data-action="edit" data-id="${node.id}" title="编辑">${icon('edit')}</span>
        <span class="btn-icon" data-action="delete" data-id="${node.id}" title="删除">${icon('delete')}</span>
      </span>
    `;

    const childrenHtml = hasChildren && isExpanded
      ? `<div class="tree-children">${node.children.map(renderNode).join('')}</div>`
      : '';

    return `
      <div class="tree-node" data-id="${node.id}">
        <div class="tree-node-content ${isActive ? 'active' : ''}" data-id="${node.id}">
          ${toggleHtml}
          <span class="tree-node-label">${icon('folder')} ${node.name}</span>
          <span class="tree-node-count">${articleCount}</span>
          ${actionsHtml}
        </div>
        ${childrenHtml}
      </div>
    `;
  };

  return `<div class="tree">${treeNodes.map(renderNode).join('')}</div>`;
}

/**
 * 渲染左侧分类面板
 */
function renderSidebar() {
  const project = getCurrentProject();
  const projectCategories = getProjectCategories();
  const treeData = buildCategoryTree(projectCategories);
  const totalArticles = localArticles.filter(a => a.projectId === project.id).length;

  const treeHtml = renderCategoryTreeWithCount(treeData);

  return `
    <div class="project-sidebar">
      <div class="project-sidebar-header">
        <h3>分类管理</h3>
        ${renderButton('', { type: 'ghost', size: 'sm', iconName: 'add', className: 'btn-icon', attrs: 'id="btn-add-root-category" title="添加根分类"' })}
      </div>
      <div class="project-sidebar-body">
        <div class="category-all ${!selectedCategoryId ? 'active' : ''}" id="category-all">
          ${icon('list')}
          <span>全部文章</span>
          <span class="category-count">${totalArticles}</span>
        </div>
        <div id="category-tree-container">
          ${treeHtml}
        </div>
      </div>
    </div>
  `;
}

/**
 * 渲染文章卡片
 */
function renderArticleCard(article) {
  const categoryName = getCategoryName(article.categoryId);
  const typeTag = article.status === 'published'
    ? renderTag('NOTE', 'primary')
    : renderTag('DAILY', 'warning');
  const statusTag = article.status === 'published'
    ? renderTag('ACTIVE', 'success')
    : renderTag('ARCHIVED', 'info');
  const shareHtml = article.shared
    ? `<span class="article-card-share">${icon('share')} 已分享</span>`
    : '';

  return `
    <div class="article-card" data-article-id="${article.id}">
      <div class="article-card-title">${article.title}</div>
      <div class="article-card-meta">
        <span class="article-card-category">${icon('folder')} ${categoryName}</span>
        ${typeTag}
        ${statusTag}
      </div>
      <div class="article-card-bottom">
        <span class="article-card-time">${icon('clock')} ${formatDate(article.updatedAt)}</span>
        ${shareHtml}
      </div>
      <div class="article-card-actions">
        <span class="btn-icon" data-action="view" data-id="${article.id}" title="查看">${icon('eye')}</span>
        <span class="btn-icon" data-action="edit" data-id="${article.id}" title="编辑">${icon('edit')}</span>
        <span class="btn-icon" data-action="share" data-id="${article.id}" title="分享">${icon('share')}</span>
        <span class="btn-icon danger" data-action="delete" data-id="${article.id}" title="删除">${icon('delete')}</span>
      </div>
    </div>
  `;
}

/**
 * 渲染右侧主区域
 */
function renderMainContent() {
  const filteredArticles = getFilteredArticles();
  const displayArticles = filteredArticles.slice(0, displayCount);
  const hasMore = filteredArticles.length > displayCount;

  const articlesHtml = displayArticles.length > 0
    ? displayArticles.map(renderArticleCard).join('')
    : renderEmptyState('暂无文章', selectedCategoryId ? '该分类下暂无文章，点击右上角按钮创建' : '点击右上角按钮创建第一篇文章', 'file');

  const loadMoreHtml = hasMore
    ? `<div class="load-more-container">
        <button class="btn-load-more" id="btn-load-more">加载更多 (${filteredArticles.length - displayCount} 篇)</button>
      </div>`
    : '';

  return `
    <div class="project-main">
      <div class="project-toolbar">
        ${renderSearchBox('搜索文章标题...', 'article-search')}
        <select class="sort-select" id="article-sort">
          <option value="updatedAt-desc" ${sortField === 'updatedAt' && sortOrder === 'desc' ? 'selected' : ''}>更新时间 ↓</option>
          <option value="updatedAt-asc" ${sortField === 'updatedAt' && sortOrder === 'asc' ? 'selected' : ''}>更新时间 ↑</option>
          <option value="createdAt-desc" ${sortField === 'createdAt' && sortOrder === 'desc' ? 'selected' : ''}>创建时间 ↓</option>
          <option value="createdAt-asc" ${sortField === 'createdAt' && sortOrder === 'asc' ? 'selected' : ''}>创建时间 ↑</option>
          <option value="title-asc" ${sortField === 'title' && sortOrder === 'asc' ? 'selected' : ''}>标题 A-Z</option>
          <option value="title-desc" ${sortField === 'title' && sortOrder === 'desc' ? 'selected' : ''}>标题 Z-A</option>
        </select>
        ${renderButton('新建文章', { type: 'primary', size: '', iconName: 'add', attrs: 'id="btn-new-article"' })}
      </div>
      <div class="article-list" id="article-list">
        ${articlesHtml}
        ${loadMoreHtml}
      </div>
    </div>
  `;
}

/**
 * render() - 返回页面 HTML
 */
export function render() {
  const project = getCurrentProject();

  return `
    <header class="page-header">
      <div class="page-header-left">
        <h2>项目工作台</h2>
        <span style="font-size:13px;color:var(--text-muted);margin-left:4px">— ${project.name}</span>
      </div>
      <div class="page-header-right"></div>
    </header>
    <div class="project-layout">
      ${renderSidebar()}
      ${renderMainContent()}
    </div>
  `;
}

// ================================================
// ARTICLE MODAL
// ================================================

/**
 * 打开文章弹窗
 * @param {'add'|'edit'|'view'} mode
 * @param {object|null} article
 */
function openArticleModal(mode, article = null) {
  const isView = mode === 'view';
  const isEdit = mode === 'edit';
  const isAdd = mode === 'add';

  const titleMap = { add: '新建文章', edit: '编辑文章', view: '查看文章' };

  const projectCategories = getProjectCategories();
  const categoryOptions = projectCategories.map(c => {
    const depth = getCategoryDepth(c.id);
    const prefix = '　'.repeat(depth);
    const selected = article && article.categoryId === c.id ? 'selected' : '';
    return `<option value="${c.id}" ${selected}>${prefix}${c.name}</option>`;
  }).join('');

  const content = `
    <div class="article-form">
      <div class="form-group">
        <label class="form-label">文章标题</label>
        ${isView
          ? `<div class="field-readonly">${article ? article.title : ''}</div>`
          : `<input class="input" type="text" id="article-title" placeholder="请输入文章标题" value="${article ? article.title : ''}">`
        }
      </div>
      <div class="form-group">
        <label class="form-label">所属分类</label>
        ${isView
          ? `<div class="field-readonly">${article ? getCategoryName(article.categoryId) : ''}</div>`
          : `<select class="select" id="article-category">
              <option value="">未分类</option>
              ${categoryOptions}
            </select>`
        }
      </div>
      <div class="form-group">
        <label class="form-label">文章类型</label>
        ${isView
          ? `<div class="field-readonly">${article ? (article.status === 'published' ? 'NOTE' : 'DAILY') : ''}</div>`
          : `<select class="select" id="article-type">
              <option value="published" ${article && article.status === 'published' ? 'selected' : ''}>NOTE（笔记）</option>
              <option value="draft" ${article && article.status === 'draft' ? 'selected' : ''}>DAILY（日记）</option>
            </select>`
        }
      </div>
      <div class="form-group">
        <label class="form-label">文章内容</label>
        ${isView
          ? `<div class="field-readonly content-preview">${article ? article.content : ''}</div>`
          : `<textarea class="textarea" id="article-content" placeholder="使用 Markdown 编写内容..." rows="8">${article ? article.content : ''}</textarea>`
        }
      </div>
      ${isEdit ? `
      <div class="form-group">
        <label class="form-label">文章状态</label>
        <select class="select" id="article-status">
          <option value="published" ${article && article.status === 'published' ? 'selected' : ''}>ACTIVE</option>
          <option value="draft" ${article && article.status === 'draft' ? 'selected' : ''}>ARCHIVED</option>
        </select>
      </div>` : ''}
      <div class="form-group">
        <label class="form-label">分享设置</label>
        <div class="share-setting">
          ${isView
            ? `<span>${article && article.shared ? '已启用分享' : '未启用分享'}</span>
               ${article && article.shared && article.sharePassword ? `<span style="color:var(--text-muted)">密码: ${article.sharePassword}</span>` : ''}`
            : `<label>
                <input type="checkbox" id="article-share-enabled" ${article && article.shared ? 'checked' : ''}>
                启用分享
              </label>
              <input type="text" class="share-password" id="article-share-password"
                placeholder="分享密码（可选）"
                value="${article && article.sharePassword ? article.sharePassword : ''}"
                ${article && article.shared ? '' : 'disabled'}>`
          }
        </div>
      </div>
    </div>
  `;

  let footer = '';
  if (isAdd) {
    footer = `
      <button class="btn btn-ghost" id="modal-cancel">取消</button>
      <button class="btn btn-primary" id="modal-save">创建文章</button>
    `;
  } else if (isEdit) {
    footer = `
      <button class="btn btn-ghost" id="modal-cancel">取消</button>
      <button class="btn btn-primary" id="modal-save">保存更改</button>
    `;
  } else {
    footer = `
      <button class="btn btn-ghost" id="modal-cancel">关闭</button>
      <button class="btn btn-primary" id="modal-to-edit">编辑</button>
    `;
  }

  openModal({ title: titleMap[mode], content, footer, width: '600px' });

  // Bind events after DOM is ready
  setTimeout(() => {
    // Cancel/Close
    const cancelBtn = document.getElementById('modal-cancel');
    if (cancelBtn) cancelBtn.addEventListener('click', () => closeModal());

    // Share checkbox toggle
    const shareCheckbox = document.getElementById('article-share-enabled');
    const sharePasswordInput = document.getElementById('article-share-password');
    if (shareCheckbox && sharePasswordInput) {
      shareCheckbox.addEventListener('change', () => {
        sharePasswordInput.disabled = !shareCheckbox.checked;
        if (!shareCheckbox.checked) sharePasswordInput.value = '';
      });
    }

    // Save (add/edit)
    const saveBtn = document.getElementById('modal-save');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const titleInput = document.getElementById('article-title');
        const categorySelect = document.getElementById('article-category');
        const typeSelect = document.getElementById('article-type');
        const contentTextarea = document.getElementById('article-content');
        const shareEnabled = document.getElementById('article-share-enabled');
        const sharePassword = document.getElementById('article-share-password');
        const statusSelect = document.getElementById('article-status');

        const titleVal = titleInput ? titleInput.value.trim() : '';
        if (!titleVal) {
          message.warning('请输入文章标题');
          return;
        }

        if (isAdd) {
          const newArticle = {
            id: generateId(),
            projectId: getCurrentProject().id,
            categoryId: categorySelect ? categorySelect.value || null : null,
            title: titleVal,
            content: contentTextarea ? contentTextarea.value : '',
            status: typeSelect ? typeSelect.value : 'published',
            author: 'u1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            wordCount: contentTextarea ? contentTextarea.value.length : 0,
            shared: shareEnabled ? shareEnabled.checked : false,
            sharePassword: sharePassword ? sharePassword.value : '',
          };
          localArticles.unshift(newArticle);
          message.success('文章创建成功');
        } else if (isEdit && article) {
          const idx = localArticles.findIndex(a => a.id === article.id);
          if (idx !== -1) {
            localArticles[idx] = {
              ...localArticles[idx],
              title: titleVal,
              categoryId: categorySelect ? categorySelect.value || null : null,
              status: statusSelect ? statusSelect.value : localArticles[idx].status,
              content: contentTextarea ? contentTextarea.value : '',
              updatedAt: new Date().toISOString(),
              shared: shareEnabled ? shareEnabled.checked : false,
              sharePassword: sharePassword ? sharePassword.value : '',
            };
            // Also update type if changed
            if (typeSelect) {
              localArticles[idx].status = typeSelect.value;
            }
            message.success('文章已更新');
          }
        }

        closeModal();
        refreshPage();
      });
    }

    // View → Edit
    const toEditBtn = document.getElementById('modal-to-edit');
    if (toEditBtn && article) {
      toEditBtn.addEventListener('click', () => {
        closeModal();
        setTimeout(() => openArticleModal('edit', article), 250);
      });
    }
  }, 0);
}

/**
 * 获取分类深度
 */
function getCategoryDepth(categoryId) {
  let depth = 0;
  let current = localCategories.find(c => c.id === categoryId);
  while (current && current.parentId) {
    depth++;
    current = localCategories.find(c => c.id === current.parentId);
  }
  return depth;
}

// ================================================
// CATEGORY OPERATIONS
// ================================================

function addCategory(parentId) {
  const name = prompt(parentId ? '请输入子分类名称：' : '请输入根分类名称：');
  if (!name || !name.trim()) return;

  const project = getCurrentProject();
  const newCat = {
    id: generateId(),
    projectId: project.id,
    name: name.trim(),
    parentId: parentId || null,
    order: localCategories.filter(c => c.projectId === project.id && c.parentId === (parentId || null)).length + 1,
  };
  localCategories.push(newCat);
  message.success(`分类「${name.trim()}」添加成功`);
  refreshPage();
}

function editCategory(categoryId) {
  const cat = localCategories.find(c => c.id === categoryId);
  if (!cat) return;
  const newName = prompt('请输入新的分类名称：', cat.name);
  if (!newName || !newName.trim() || newName.trim() === cat.name) return;
  cat.name = newName.trim();
  message.success(`分类已重命名为「${newName.trim()}」`);
  refreshPage();
}

async function deleteCategory(categoryId) {
  const cat = localCategories.find(c => c.id === categoryId);
  if (!cat) return;

  const childCount = getAllChildCategoryIds(categoryId).length;
  const articleCount = countArticlesInCategory(categoryId);
  const msg = childCount > 0
    ? `确定删除分类「${cat.name}」及其 ${childCount} 个子分类吗？该操作将影响 ${articleCount} 篇文章。`
    : `确定删除分类「${cat.name}」吗？该操作将影响 ${articleCount} 篇文章。`;

  const confirmed = await confirmModal(msg, { title: '删除分类', confirmText: '删除', type: 'danger' });
  if (!confirmed) return;

  // Remove category and all children
  const allIds = getAllChildCategoryIds(categoryId);
  allIds.push(categoryId);
  localCategories = localCategories.filter(c => !allIds.includes(c.id));

  // Reset articles' categoryId
  localArticles.forEach(a => {
    if (allIds.includes(a.categoryId)) {
      a.categoryId = null;
    }
  });

  if (selectedCategoryId && allIds.includes(selectedCategoryId)) {
    selectedCategoryId = null;
  }

  message.success(`分类「${cat.name}」已删除`);
  refreshPage();
}

// ================================================
// ARTICLE OPERATIONS
// ================================================

async function deleteArticle(articleId) {
  const article = localArticles.find(a => a.id === articleId);
  if (!article) return;

  const confirmed = await confirmModal(`确定删除文章「${article.title}」吗？此操作不可恢复。`, {
    title: '删除文章',
    confirmText: '删除',
    type: 'danger',
  });
  if (!confirmed) return;

  localArticles = localArticles.filter(a => a.id !== articleId);
  message.success('文章已删除');
  refreshPage();
}

function toggleShare(articleId) {
  const article = localArticles.find(a => a.id === articleId);
  if (!article) return;
  article.shared = !article.shared;
  if (article.shared) {
    message.success('已开启分享');
  } else {
    article.sharePassword = '';
    message.info('已关闭分享');
  }
  refreshPage();
}

// ================================================
// PAGE REFRESH
// ================================================

function refreshPage() {
  const pageContent = document.getElementById('page-content');
  if (!pageContent) return;
  pageContent.innerHTML = render();
  init();
}

// ================================================
// INIT - Bindall events
// ================================================

/**
 * init() - 绑定所有事件
 */
export function init() {
  // ---- Category tree events ----
  const treeContainer = document.getElementById('category-tree-container');
  if (treeContainer) {
    initTreeEvents(treeContainer, {
      onToggle: (nodeId) => { /* toggle handled by tree.js */ },
      onClick: (nodeId) => {
        selectedCategoryId = nodeId;
        displayCount = 8;
        refreshPage();
      },
      onAction: (action, nodeId) => {
        if (action === 'add') addCategory(nodeId);
        else if (action === 'edit') editCategory(nodeId);
        else if (action === 'delete') deleteCategory(nodeId);
      },
    });
  }

  // ---- "全部文章" click ----
  const categoryAll = document.getElementById('category-all');
  if (categoryAll) {
    categoryAll.addEventListener('click', () => {
      selectedCategoryId = null;
      displayCount = 8;
      refreshPage();
    });
  }

  // ---- Add root category ----
  const addRootBtn = document.getElementById('btn-add-root-category');
  if (addRootBtn) {
    addRootBtn.addEventListener('click', () => addCategory(null));
  }

  // ---- Search ----
  const searchInput = document.getElementById('article-search');
  if (searchInput) {
    searchInput.value = searchKeyword;
    const debouncedSearch = debounce((val) => {
      searchKeyword = val;
      displayCount = 8;
      refreshPage();
    }, 300);
    searchInput.addEventListener('input', (e) => debouncedSearch(e.target.value));
  }

  // ---- Sort ----
  const sortSelect = document.getElementById('article-sort');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      const [field, order] = e.target.value.split('-');
      sortField = field;
      sortOrder = order;
      displayCount = 8;
      refreshPage();
    });
  }

  // ---- New article ----
  const newArticleBtn = document.getElementById('btn-new-article');
  if (newArticleBtn) {
    newArticleBtn.addEventListener('click', () => openArticleModal('add'));
  }

  // ---- Article card actions ----
  const articleList = document.getElementById('article-list');
  if (articleList) {
    articleList.addEventListener('click', (e) => {
      const actionBtn = e.target.closest('[data-action]');
      if (!actionBtn) return;

      const action = actionBtn.dataset.action;
      const articleId = actionBtn.dataset.id;
      const article = localArticles.find(a => a.id === articleId);
      if (!article) return;

      e.stopPropagation();

      if (action === 'view') openArticleModal('view', article);
      else if (action === 'edit') openArticleModal('edit', article);
      else if (action === 'delete') deleteArticle(articleId);
      else if (action === 'share') toggleShare(articleId);
    });
  }

  // ---- Load more ----
  const loadMoreBtn = document.getElementById('btn-load-more');
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      displayCount += 8;
      refreshPage();
    });
  }
}
