/**
 * 资源管理页面
 */
import { resources, knowledgeBases } from '../mock-data.js';
import { icon, formatDate, truncate, getFileIcon, debounce } from '../utils.js';
import { renderButton, renderTag, renderSearchBox, renderTabs } from '../components.js';
import { renderHeader } from '../components/header.js';
import { openModal, closeModal } from '../components/modal.js';
import { message } from '../components/message.js';

// 页面状态
let currentView = 'grid'; // grid | list
let currentFilter = 'all'; // all | image | doc | video | other
let searchKeyword = '';
let uploadZoneVisible = true;
let uploadingFiles = [];

/**
 * 获取过滤后的资源列表
 */
function getFilteredResources() {
  let filtered = [...resources];

  // 按类型筛选
  if (currentFilter !== 'all') {
    if (currentFilter === 'doc') {
      filtered = filtered.filter(r => ['pdf', 'doc', 'ppt'].includes(r.type));
    } else if (currentFilter === 'other') {
      filtered = filtered.filter(r => !['image', 'pdf', 'doc', 'ppt', 'video'].includes(r.type));
    } else {
      filtered = filtered.filter(r => r.type === currentFilter);
    }
  }

  // 按关键词搜索
  if (searchKeyword) {
    const kw = searchKeyword.toLowerCase();
    filtered = filtered.filter(r => r.name.toLowerCase().includes(kw));
  }

  return filtered;
}

/**
 * 获取资源类型标签配置
 */
function getTypeConfig(type) {
  const configs = {
    image: { label: '图片', tagType: 'primary', color: '#818cf8' },
    pdf: { label: 'PDF', tagType: 'danger', color: '#ef4444' },
    doc: { label: '文档', tagType: 'info', color: '#3b82f6' },
    ppt: { label: 'PPT', tagType: 'warning', color: '#f59e0b' },
    video: { label: '视频', tagType: 'success', color: '#10b981' },
    file: { label: '文件', tagType: 'primary', color: '#6b7280' },
  };
  return configs[type] || configs.file;
}

/**
 * 渲染缩略图区域
 */
function renderThumb(resource) {
  const config = getTypeConfig(resource.type);
  if (resource.type === 'image') {
    // 模拟图片色块
    const colors = ['#e0e7ff', '#dbeafe', '#d1fae5', '#fef3c7', '#fce7f3', '#ede9fe'];
    const colorIdx = resource.id.charCodeAt(1) % colors.length;
    return `<div class="thumb-color" style="background:${colors[colorIdx]}"></div>`;
  }
  return `<svg class="thumb-icon" width="48" height="48"><use href="assets/icons.svg#icon-${getFileIcon(resource.type)}"/></svg>`;
}

/**
 * 渲染网格视图
 */
function renderGridView(items) {
  if (items.length === 0) {
    return `<div class="empty-state">
      <div class="empty-state-icon" style="font-size:48px;opacity:0.3">📂</div>
      <div class="empty-state-title">暂无资源</div>
      <div class="empty-state-desc">上传文件或从网络抓取内容</div>
    </div>`;
  }

  return `<div class="resource-grid">${items.map(r => {
    const config = getTypeConfig(r.type);
    return `
      <div class="resource-card" data-id="${r.id}">
        <div class="resource-card-thumb">
          ${renderThumb(r)}
          <div class="resource-card-actions">
            <button class="action-btn" data-action="preview" data-id="${r.id}" title="预览">
              <svg width="16" height="16"><use href="assets/icons.svg#icon-search"/></svg>
            </button>
            <button class="action-btn" data-action="download" data-id="${r.id}" title="下载">
              <svg width="16" height="16"><use href="assets/icons.svg#icon-download"/></svg>
            </button>
            <button class="action-btn" data-action="addKb" data-id="${r.id}" title="添加到知识库">
              <svg width="16" height="16"><use href="assets/icons.svg#icon-folder"/></svg>
            </button>
            <button class="action-btn danger" data-action="delete" data-id="${r.id}" title="删除">
              <svg width="16" height="16"><use href="assets/icons.svg#icon-close"/></svg>
            </button>
          </div>
        </div>
        <div class="resource-card-info">
          <div class="resource-card-name" title="${r.name}">${truncate(r.name, 28)}</div>
          <div class="resource-card-meta">
            ${renderTag(config.label, config.tagType)}
            <span>${r.size}</span>
          </div>
          <div class="resource-card-time">${formatDate(r.createdAt)}</div>
        </div>
      </div>`;
  }).join('')}</div>`;
}

/**
 * 渲染列表视图
 */
function renderListView(items) {
  if (items.length === 0) {
    return `<div class="empty-state">
      <div class="empty-state-icon" style="font-size:48px;opacity:0.3">📂</div>
      <div class="empty-state-title">暂无资源</div>
      <div class="empty-state-desc">上传文件或从网络抓取内容</div>
    </div>`;
  }

  return `
    <table class="resource-list-table">
      <thead>
        <tr>
          <th>文件名</th>
          <th>类型</th>
          <th>大小</th>
          <th>上传时间</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        ${items.map(r => {
          const config = getTypeConfig(r.type);
          return `
            <tr data-id="${r.id}">
              <td>
                <div class="file-info">
                  <div class="file-icon">
                    <svg width="16" height="16"><use href="assets/icons.svg#icon-${getFileIcon(r.type)}"/></svg>
                  </div>
                  <span class="file-name-text">${truncate(r.name, 36)}</span>
                </div>
              </td>
              <td>${renderTag(config.label, config.tagType)}</td>
              <td>${r.size}</td>
              <td>${formatDate(r.createdAt)}</td>
              <td>
                <div class="actions-cell">
                  <button class="btn btn-ghost btn-sm" data-action="preview" data-id="${r.id}">预览</button>
                  <button class="btn btn-ghost btn-sm" data-action="download" data-id="${r.id}">下载</button>
                  <button class="btn btn-ghost btn-sm" data-action="delete" data-id="${r.id}">删除</button>
                </div>
              </td>
            </tr>`;
        }).join('')}
      </tbody>
    </table>`;
}

/**
 * 渲染上传进度列表
 */
function renderUploadProgress() {
  if (uploadingFiles.length === 0) return '';
  return `<div class="upload-progress-list">
    ${uploadingFiles.map(f => `
      <div class="upload-progress-item ${f.progress < 100 ? 'progress-anim' : ''}">
        <svg width="16" height="16"><use href="assets/icons.svg#icon-${getFileIcon(f.type)}"/></svg>
        <span class="file-name">${f.name}</span>
        <div class="upload-progress-bar">
          <div class="upload-progress-bar-inner" style="width:${f.progress}%"></div>
        </div>
        <span class="progress-text">${f.progress}%</span>
      </div>
    `).join('')}
  </div>`;
}

/**
 * 渲染页面
 */
export function render() {
  const items = getFilteredResources();

  const header = renderHeader({
    title: '资源管理',
    actions: `
      ${renderButton('上传文件', { type: 'primary', iconName: 'upload', className: 'btn-upload-toggle' })}
      ${renderButton('网络抓取', { type: 'ghost', iconName: 'globe', className: 'btn-crawl' })}
    `,
  });

  const uploadZone = `
    <div class="section-toggle" id="upload-toggle">
      <span class="toggle-arrow ${uploadZoneVisible ? '' : 'collapsed'}">▼</span>
      <span>上传区域</span>
    </div>
    <div class="upload-zone ${uploadZoneVisible ? '' : 'collapsed'}" id="upload-zone">
      <div class="upload-zone-icon">
        <svg width="48" height="48"><use href="assets/icons.svg#icon-upload"/></svg>
      </div>
      <div class="upload-zone-text">拖拽文件到此处，或点击上传</div>
      <div class="upload-zone-hint">支持图片、PDF、Word、PPT、视频等</div>
    </div>
  `;

  const toolbar = `
    <div class="resource-toolbar">
      <div class="filter-group">
        <button class="filter-btn ${currentFilter === 'all' ? 'active' : ''}" data-filter="all">全部</button>
        <button class="filter-btn ${currentFilter === 'image' ? 'active' : ''}" data-filter="image">图片</button>
        <button class="filter-btn ${currentFilter === 'doc' ? 'active' : ''}" data-filter="doc">文档</button>
        <button class="filter-btn ${currentFilter === 'video' ? 'active' : ''}" data-filter="video">视频</button>
        <button class="filter-btn ${currentFilter === 'other' ? 'active' : ''}" data-filter="other">其他</button>
      </div>
      <div class="search-box">
        <span class="search-box-icon">${icon('search')}</span>
        <input class="input" type="text" placeholder="搜索文件名..." id="resource-search" value="${searchKeyword}">
      </div>
      <div class="view-toggle">
        <div class="view-toggle-btn ${currentView === 'grid' ? 'active' : ''}" data-view="grid" title="网格视图">
          <svg width="16" height="16"><use href="assets/icons.svg#icon-grid"/></svg>
        </div>
        <div class="view-toggle-btn ${currentView === 'list' ? 'active' : ''}" data-view="list" title="列表视图">
          <svg width="16" height="16"><use href="assets/icons.svg#icon-file"/></svg>
        </div>
      </div>
      <span class="resource-count">共 ${items.length} 个资源</span>
    </div>
  `;

  const listContent = currentView === 'grid' ? renderGridView(items) : renderListView(items);

  return `
    ${header}
    <div class="page-body">
      ${uploadZone}
      ${renderUploadProgress()}
      ${toolbar}
      <div id="resource-list">${listContent}</div>
    </div>
  `;
}

/**
 * 重新渲染列表区域
 */
function refreshList() {
  const listEl = document.getElementById('resource-list');
  if (!listEl) return;
  const items = getFilteredResources();
  listEl.innerHTML = currentView === 'grid' ? renderGridView(items) : renderListView(items);
  // 更新数量统计
  const countEl = document.querySelector('.resource-count');
  if (countEl) countEl.textContent = `共 ${items.length} 个资源`;
  // 重新绑定资源项事件
  bindResourceActions();
}

/**
 * 模拟上传文件
 */
function simulateUpload(fileName) {
  const ext = fileName.split('.').pop().toLowerCase();
  let type = 'file';
  if (['png', 'jpg', 'jpeg', 'gif', 'fig', 'svg', 'webp'].includes(ext)) type = 'image';
  else if (['pdf'].includes(ext)) type = 'pdf';
  else if (['doc', 'docx'].includes(ext)) type = 'doc';
  else if (['ppt', 'pptx'].includes(ext)) type = 'ppt';
  else if (['mp4', 'mov', 'avi'].includes(ext)) type = 'video';

  const fileObj = { name: fileName, type, progress: 0 };
  uploadingFiles.push(fileObj);

  // 刷新进度区域
  const pageBody = document.querySelector('.page-body');
  const progressList = document.querySelector('.upload-progress-list');
  if (progressList) {
    progressList.outerHTML = renderUploadProgress();
  } else {
    const toolbar = document.querySelector('.resource-toolbar');
    if (toolbar) toolbar.insertAdjacentHTML('beforebegin', renderUploadProgress());
  }

  // 模拟进度
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.floor(Math.random() * 20) + 10;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      fileObj.progress = 100;

      // 上传完成
      setTimeout(() => {
        uploadingFiles = uploadingFiles.filter(f => f !== fileObj);
        const pl = document.querySelector('.upload-progress-list');
        if (pl) pl.outerHTML = renderUploadProgress() || '';
        message.success(`"${fileName}" 上传成功`);
      }, 500);
    } else {
      fileObj.progress = progress;
      // 更新进度条
      const pl = document.querySelector('.upload-progress-list');
      if (pl) pl.outerHTML = renderUploadProgress();
    }
  }, 400);
}

/**
 * 打开资源预览弹窗
 */
function openPreviewModal(resourceId) {
  const resource = resources.find(r => r.id === resourceId);
  if (!resource) return;

  const config = getTypeConfig(resource.type);
  let previewHtml = '';

  if (resource.type === 'image') {
    const colors = ['#e0e7ff', '#dbeafe', '#d1fae5', '#fef3c7', '#fce7f3', '#ede9fe'];
    const colorIdx = resource.id.charCodeAt(1) % colors.length;
    previewHtml = `
      <div class="preview-image" style="background:${colors[colorIdx]}">
        <span style="color:var(--text-muted);font-size:14px">图片预览区域</span>
      </div>`;
  } else if (resource.type === 'video') {
    previewHtml = `
      <div class="preview-video">
        <div class="play-btn">▶</div>
        <div class="video-progress"><div class="video-progress-inner"></div></div>
      </div>`;
  } else {
    const pageCount = Math.floor(Math.random() * 30) + 5;
    previewHtml = `
      <div class="preview-doc">
        <svg class="preview-doc-icon" width="48" height="48"><use href="assets/icons.svg#icon-${getFileIcon(resource.type)}"/></svg>
        <div class="preview-doc-title">${resource.name}</div>
        <div class="preview-doc-info">
          <p>页数：${pageCount} 页</p>
          <p>该文件为${config.label}格式，可下载后查看完整内容。</p>
        </div>
      </div>`;
  }

  const detailsHtml = `
    <div class="preview-details">
      <p><strong>名称：</strong>${resource.name}</p>
      <p><strong>大小：</strong>${resource.size}</p>
      <p><strong>类型：</strong>${config.label}</p>
      <p><strong>上传时间：</strong>${formatDate(resource.createdAt)}</p>
    </div>`;

  openModal({
    title: '资源预览',
    content: `<div class="preview-content">${previewHtml}${detailsHtml}</div>`,
    footer: `
      <button class="btn btn-ghost" id="preview-download">下载</button>
      <button class="btn btn-danger btn-sm" id="preview-delete" data-id="${resource.id}">删除</button>
      <button class="btn btn-primary" id="preview-add-kb" data-id="${resource.id}">添加到知识库</button>
    `,
    width: '600px',
  });

  // 绑定弹窗按钮事件
  setTimeout(() => {
    const downloadBtn = document.getElementById('preview-download');
    const deleteBtn = document.getElementById('preview-delete');
    const addKbBtn = document.getElementById('preview-add-kb');

    if (downloadBtn) downloadBtn.addEventListener('click', () => {
      message.success('开始下载...');
    });
    if (deleteBtn) deleteBtn.addEventListener('click', () => {
      closeModal();
      message.warning(`"${resource.name}" 已删除`);
    });
    if (addKbBtn) addKbBtn.addEventListener('click', () => {
      message.success(`已添加到知识库`);
    });
  }, 0);
}

/**
 * 打开网络抓取弹窗
 */
function openCrawlPanel() {
  let activeTab = 'url';

  const renderCrawlContent = (tab) => {
    if (tab === 'url') {
      return `
        <div class="crawl-input-group">
          <input class="input" type="text" placeholder="输入网页URL..." id="crawl-url-input" value="https://example.com/article">
          <button class="btn btn-primary" id="crawl-fetch-btn">抓取</button>
        </div>
        <div id="crawl-url-results"></div>`;
    }
    return `
      <div class="crawl-input-group">
        <input class="input" type="text" placeholder="输入搜索关键词..." id="crawl-search-input" value="">
        <button class="btn btn-primary" id="crawl-search-btn">搜索</button>
      </div>
      <div id="crawl-search-results"></div>`;
  };

  const tabsHtml = renderTabs([
    { id: 'url', label: 'URL抓取' },
    { id: 'search', label: '网络搜索' },
  ], activeTab);

  openModal({
    title: '网络抓取 / 搜索',
    content: `<div class="crawl-panel">${tabsHtml}<div id="crawl-tab-content">${renderCrawlContent('url')}</div></div>`,
    width: '640px',
  });

  setTimeout(() => bindCrawlEvents(activeTab), 0);
}

/**
 * 绑定抓取弹窗事件
 */
function bindCrawlEvents(activeTab) {
  // Tab 切换
  const tabItems = document.querySelectorAll('.crawl-panel .tab-item');
  tabItems.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabId = tab.dataset.tab;
      tabItems.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const contentEl = document.getElementById('crawl-tab-content');
      if (contentEl) {
        if (tabId === 'url') {
          contentEl.innerHTML = `
            <div class="crawl-input-group">
              <input class="input" type="text" placeholder="输入网页URL..." id="crawl-url-input" value="https://example.com/article">
              <button class="btn btn-primary" id="crawl-fetch-btn">抓取</button>
            </div>
            <div id="crawl-url-results"></div>`;
        } else {
          contentEl.innerHTML = `
            <div class="crawl-input-group">
              <input class="input" type="text" placeholder="输入搜索关键词..." id="crawl-search-input" value="">
              <button class="btn btn-primary" id="crawl-search-btn">搜索</button>
            </div>
            <div id="crawl-search-results"></div>`;
        }
        bindCrawlActionButtons(tabId);
      }
    });
  });

  bindCrawlActionButtons(activeTab);
}

/**
 * 绑定抓取面板操作按钮
 */
function bindCrawlActionButtons(tab) {
  if (tab === 'url') {
    const fetchBtn = document.getElementById('crawl-fetch-btn');
    if (fetchBtn) {
      fetchBtn.addEventListener('click', () => {
        const urlInput = document.getElementById('crawl-url-input');
        const url = urlInput ? urlInput.value.trim() : '';
        if (!url) { message.warning('请输入URL'); return; }

        fetchBtn.textContent = '抓取中...';
        fetchBtn.disabled = true;

        setTimeout(() => {
          fetchBtn.textContent = '抓取';
          fetchBtn.disabled = false;
          const results = document.getElementById('crawl-url-results');
          if (results) {
            results.innerHTML = `
              <div class="crawl-results">
                <div class="crawl-result-item">
                  <div class="crawl-result-title">前端性能优化实战指南</div>
                  <div class="crawl-result-summary">本文介绍了前端性能优化的核心策略，包括代码分割、懒加载、缓存优化、资源压缩等多种手段...</div>
                  <div class="crawl-result-url">${url}</div>
                  <div class="crawl-result-actions">
                    <button class="btn btn-primary btn-sm" onclick="window._resourceSaveToLib && window._resourceSaveToLib()">保存到资源库</button>
                    <button class="btn btn-ghost btn-sm" onclick="window._resourceAddToKb && window._resourceAddToKb()">添加到知识库</button>
                  </div>
                </div>
              </div>`;
          }
          message.success('抓取完成');
        }, 1500);
      });
    }
  } else {
    const searchBtn = document.getElementById('crawl-search-btn');
    if (searchBtn) {
      searchBtn.addEventListener('click', () => {
        const searchInput = document.getElementById('crawl-search-input');
        const kw = searchInput ? searchInput.value.trim() : '';
        if (!kw) { message.warning('请输入搜索关键词'); return; }

        searchBtn.textContent = '搜索中...';
        searchBtn.disabled = true;

        setTimeout(() => {
          searchBtn.textContent = '搜索';
          searchBtn.disabled = false;
          const results = document.getElementById('crawl-search-results');
          if (results) {
            results.innerHTML = `
              <div class="crawl-results">
                <div class="crawl-result-item">
                  <div class="crawl-result-title">${kw} - 深度解析与实践</div>
                  <div class="crawl-result-summary">深入探讨 ${kw} 的核心概念和最佳实践方案，涵盖从基础到高级的完整知识体系...</div>
                  <div class="crawl-result-url">https://tech-blog.example.com/${kw.replace(/\s/g, '-')}</div>
                  <div class="crawl-result-actions">
                    <button class="btn btn-ghost btn-sm" onclick="window._resourceViewDetail && window._resourceViewDetail()">查看详情</button>
                    <button class="btn btn-primary btn-sm" onclick="window._resourceSaveToLib && window._resourceSaveToLib()">保存到资源库</button>
                  </div>
                </div>
                <div class="crawl-result-item">
                  <div class="crawl-result-title">${kw} 技术方案对比评测</div>
                  <div class="crawl-result-summary">对比主流 ${kw} 解决方案的优缺点、性能表现和适用场景...</div>
                  <div class="crawl-result-url">https://dev.example.com/compare-${kw.replace(/\s/g, '-')}</div>
                  <div class="crawl-result-actions">
                    <button class="btn btn-ghost btn-sm" onclick="window._resourceViewDetail && window._resourceViewDetail()">查看详情</button>
                    <button class="btn btn-primary btn-sm" onclick="window._resourceSaveToLib && window._resourceSaveToLib()">保存到资源库</button>
                  </div>
                </div>
              </div>`;
          }
          message.success(`搜索 "${kw}" 完成，找到 2 条结果`);
        }, 1200);
      });
    }
  }
}

/**
 * 绑定资源操作事件（卡片和列表中的按钮）
 */
function bindResourceActions() {
  const actionBtns = document.querySelectorAll('[data-action]');
  actionBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const action = btn.dataset.action;
      const id = btn.dataset.id;

      switch (action) {
        case 'preview':
          openPreviewModal(id);
          break;
        case 'download':
          message.success('开始下载...');
          break;
        case 'delete':
          const res = resources.find(r => r.id === id);
          message.warning(`"${res ? res.name : '文件'}" 已删除`);
          break;
        case 'addKb':
          message.success('已添加到知识库');
          break;
      }
    });
  });
}

/**
 * 初始化事件绑定
 */
export function init() {
  // 全局回调（给crawl面板用）
  window._resourceSaveToLib = () => message.success('已保存到资源库');
  window._resourceAddToKb = () => message.success('已添加到知识库');
  window._resourceViewDetail = () => message.info('正在跳转查看详情...');

  // 上传区域折叠
  const toggleBtn = document.getElementById('upload-toggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      uploadZoneVisible = !uploadZoneVisible;
      const zone = document.getElementById('upload-zone');
      const arrow = toggleBtn.querySelector('.toggle-arrow');
      if (zone) zone.classList.toggle('collapsed', !uploadZoneVisible);
      if (arrow) arrow.classList.toggle('collapsed', !uploadZoneVisible);
    });
  }

  // 上传区域拖拽 & 点击
  const uploadZone = document.getElementById('upload-zone');
  if (uploadZone) {
    uploadZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadZone.classList.add('drag-over');
    });
    uploadZone.addEventListener('dragleave', () => {
      uploadZone.classList.remove('drag-over');
    });
    uploadZone.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadZone.classList.remove('drag-over');
      // 模拟上传
      simulateUpload('拖拽上传的文件.pdf');
    });
    uploadZone.addEventListener('click', () => {
      // 模拟点击选择文件
      const fakeFiles = ['设计素材.png', '项目文档.docx', '会议记录.pdf'];
      const randomFile = fakeFiles[Math.floor(Math.random() * fakeFiles.length)];
      simulateUpload(randomFile);
    });
  }

  // 顶部上传按钮
  const uploadToggleBtn = document.querySelector('.btn-upload-toggle');
  if (uploadToggleBtn) {
    uploadToggleBtn.addEventListener('click', () => {
      uploadZoneVisible = true;
      const zone = document.getElementById('upload-zone');
      const arrow = document.querySelector('.toggle-arrow');
      if (zone) zone.classList.remove('collapsed');
      if (arrow) arrow.classList.remove('collapsed');
      zone && zone.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // 网络抓取按钮
  const crawlBtn = document.querySelector('.btn-crawl');
  if (crawlBtn) {
    crawlBtn.addEventListener('click', () => openCrawlPanel());
  }

  // 类型筛选
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      currentFilter = btn.dataset.filter;
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      refreshList();
    });
  });

  // 搜索
  const searchInput = document.getElementById('resource-search');
  if (searchInput) {
    const doSearch = debounce(() => {
      searchKeyword = searchInput.value.trim();
      refreshList();
    }, 300);
    searchInput.addEventListener('input', doSearch);
  }

  // 视图切换
  const viewBtns = document.querySelectorAll('.view-toggle-btn');
  viewBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      currentView = btn.dataset.view;
      viewBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      refreshList();
    });
  });

  // 绑定资源项操作
  bindResourceActions();
}
