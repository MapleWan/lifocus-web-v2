/**
 * 仪表盘页面模块
 */
import { store } from '../store.js';
import { router } from '../router.js';
import { projects, timelines, users } from '../mock-data.js';
import { formatDate } from '../utils.js';
import { renderButton, renderTag } from '../components.js';
import { openModal, closeModal } from '../components/modal.js';
import { messageSuccess } from '../components/message.js';

let activeTab = 'timeline';
let currentDate = new Date();

// 时间线类型映射
const typeLabels = {
  create: '创建',
  update: '更新',
  delete: '删除',
  publish: '发布',
  archive: '归档',
  share: '分享',
  comment: '评论',
  upload: '上传',
  deploy: '部署',
};

// 状态映射
const statusLabels = {
  success: '成功',
  warning: '警告',
  error: '失败',
};

/**
 * 获取当前日期字符串
 */
function getDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * 格式化显示日期
 */
function formatDisplayDate(date) {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  const w = weekDays[date.getDay()];
  return `${y}年${m}月${d}日 周${w}`;
}

/**
 * 获取今日时间线数据
 */
function getTodayTimelines() {
  // 由于是mock数据，直接返回所有时间线作为演示
  return timelines;
}

/**
 * 计算统计数据
 */
function getStats() {
  const all = getTodayTimelines();
  return {
    success: all.filter(t => t.status === 'success').length,
    warning: all.filter(t => t.status === 'warning').length,
    error: all.filter(t => t.status === 'error').length,
  };
}

/**
 * 渲染仪表盘页面
 * @returns {string} HTML字符串
 */
export function render() {
  const user = store.get('currentUser');
  const userName = user ? user.name : '用户';
  const today = formatDisplayDate(new Date());

  return `
    <header class="page-header">
      <div class="page-header-left">
        <h2>仪表盘</h2>
      </div>
      <div class="page-header-right"></div>
    </header>
    <div class="page-body" id="page-body">
      <div class="dashboard-header">
        <div class="dashboard-welcome">欢迎回来，${userName}</div>
        <div class="dashboard-date">${today}</div>
      </div>

      <div class="dashboard-tabs">
        <div class="dashboard-tab ${activeTab === 'timeline' ? 'active' : ''}" data-tab="timeline">Timeline</div>
        <div class="dashboard-tab ${activeTab === 'projects' ? 'active' : ''}" data-tab="projects">Projects</div>
      </div>

      <div id="dashboard-tab-content">
        ${activeTab === 'timeline' ? renderTimeline() : renderProjects()}
      </div>
    </div>
  `;
}

/**
 * 渲染时间线标签页
 */
function renderTimeline() {
  const stats = getStats();
  const items = getTodayTimelines();

  const statsHtml = `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-card-value success">${stats.success}</div>
        <div class="stat-card-label">已完成</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-value primary">${stats.warning}</div>
        <div class="stat-card-label">进行中</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-value warning">${stats.error}</div>
        <div class="stat-card-label">已暂停</div>
      </div>
    </div>
  `;

  const datePickerHtml = `
    <div class="date-picker">
      <button class="date-picker-btn" id="date-prev">←</button>
      <div class="date-picker-display" id="date-display">${formatDisplayDate(currentDate)}</div>
      <button class="date-picker-btn" id="date-next">→</button>
    </div>
  `;

  const timelineHtml = items.map(item => {
    const time = new Date(item.createdAt);
    const timeStr = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;
    return `
      <div class="timeline-item" data-id="${item.id}">
        <div class="timeline-item-time">${timeStr}</div>
        <div class="timeline-item-body">
          <div class="timeline-item-header">
            <span class="timeline-item-title">${item.title}</span>
            <span class="type-tag ${item.type}">${typeLabels[item.type] || item.type}</span>
            <span class="status-tag ${item.status}">${statusLabels[item.status] || item.status}</span>
          </div>
          <div class="timeline-item-desc">${item.description}</div>
        </div>
      </div>
    `;
  }).join('');

  return `
    ${datePickerHtml}
    ${statsHtml}
    <div class="timeline-section-header">
      <span class="timeline-section-title">时间线记录</span>
      <button class="add-btn" id="btn-add-timeline">+ 添加时间线</button>
    </div>
    <div class="timeline-list">
      ${timelineHtml}
    </div>
  `;
}

/**
 * 渲染项目标签页
 */
function renderProjects() {
  const cardsHtml = projects.map(project => {
    const updatedAt = formatDate(project.updatedAt);
    return `
      <div class="project-card" data-id="${project.id}">
        <div class="project-card-name">${project.name}</div>
        <div class="project-card-desc">${project.description}</div>
        <div class="project-card-meta">
          <div class="project-card-stats">
            <span class="project-card-stat">📄 ${project.articleCount} 篇文章</span>
            <span class="project-card-stat">👥 ${project.memberCount} 人</span>
          </div>
          <span>${updatedAt}</span>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="timeline-section-header">
      <span class="timeline-section-title">我的项目</span>
      <button class="add-btn" id="btn-add-project">+ 创建项目</button>
    </div>
    <div class="projects-grid">
      ${cardsHtml}
    </div>
  `;
}

/**
 * 初始化仪表盘事件
 */
export function init() {
  // Tab 切换
  document.querySelectorAll('.dashboard-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      activeTab = tab.dataset.tab;
      // 重新渲染Tab内容
      const content = document.getElementById('dashboard-tab-content');
      if (content) {
        content.innerHTML = activeTab === 'timeline' ? renderTimeline() : renderProjects();
        bindTabEvents();
      }
      // 更新Tab样式
      document.querySelectorAll('.dashboard-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });

  bindTabEvents();
}

/**
 * 绑定标签页内的事件
 */
function bindTabEvents() {
  if (activeTab === 'timeline') {
    bindTimelineEvents();
  } else {
    bindProjectEvents();
  }
}

/**
 * 绑定时间线事件
 */
function bindTimelineEvents() {
  // 日期导航
  const prevBtn = document.getElementById('date-prev');
  const nextBtn = document.getElementById('date-next');
  const dateDisplay = document.getElementById('date-display');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      currentDate.setDate(currentDate.getDate() - 1);
      if (dateDisplay) dateDisplay.textContent = formatDisplayDate(currentDate);
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      currentDate.setDate(currentDate.getDate() + 1);
      if (dateDisplay) dateDisplay.textContent = formatDisplayDate(currentDate);
    });
  }

  // 添加时间线
  const addBtn = document.getElementById('btn-add-timeline');
  if (addBtn) {
    addBtn.addEventListener('click', openAddTimelineModal);
  }

  // 点击时间线项目 - 编辑状态
  document.querySelectorAll('.timeline-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = item.dataset.id;
      openEditTimelineModal(id);
    });
  });
}

/**
 * 绑定项目事件
 */
function bindProjectEvents() {
  // 创建项目
  const addBtn = document.getElementById('btn-add-project');
  if (addBtn) {
    addBtn.addEventListener('click', openAddProjectModal);
  }

  // 点击项目卡片
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', () => {
      router.navigate('/project');
    });
  });
}

/**
 * 打开添加时间线弹窗
 */
function openAddTimelineModal() {
  const typeOptions = Object.entries(typeLabels).map(([k, v]) =>
    `<option value="${k}">${v}</option>`
  ).join('');

  openModal({
    title: '添加时间线',
    content: `
      <div class="form-group">
        <label class="form-label">标题</label>
        <input class="input" type="text" id="tl-title" placeholder="请输入标题">
      </div>
      <div class="form-group">
        <label class="form-label">描述</label>
        <input class="input" type="text" id="tl-desc" placeholder="请输入描述">
      </div>
      <div class="form-group">
        <label class="form-label">类型</label>
        <select class="input" id="tl-type">${typeOptions}</select>
      </div>
    `,
    footer: `
      <button class="btn btn-ghost" id="modal-cancel-tl">取消</button>
      <button class="btn btn-primary" id="modal-confirm-tl">添加</button>
    `,
  });

  setTimeout(() => {
    const cancelBtn = document.getElementById('modal-cancel-tl');
    const confirmBtn = document.getElementById('modal-confirm-tl');
    if (cancelBtn) cancelBtn.addEventListener('click', () => closeModal());
    if (confirmBtn) confirmBtn.addEventListener('click', () => {
      const title = document.getElementById('tl-title')?.value;
      if (title) {
        messageSuccess('时间线已添加');
        closeModal();
      }
    });
  }, 0);
}

/**
 * 打开编辑时间线弹窗
 */
function openEditTimelineModal(id) {
  const item = timelines.find(t => t.id === id);
  if (!item) return;

  const statusOptions = Object.entries(statusLabels).map(([k, v]) =>
    `<option value="${k}" ${item.status === k ? 'selected' : ''}>${v}</option>`
  ).join('');

  openModal({
    title: '编辑时间线状态',
    content: `
      <div class="form-group">
        <label class="form-label">标题</label>
        <input class="input" type="text" value="${item.title}" disabled>
      </div>
      <div class="form-group">
        <label class="form-label">状态</label>
        <select class="input" id="tl-edit-status">${statusOptions}</select>
      </div>
    `,
    footer: `
      <button class="btn btn-ghost" id="modal-cancel-edit">取消</button>
      <button class="btn btn-primary" id="modal-confirm-edit">保存</button>
    `,
  });

  setTimeout(() => {
    const cancelBtn = document.getElementById('modal-cancel-edit');
    const confirmBtn = document.getElementById('modal-confirm-edit');
    if (cancelBtn) cancelBtn.addEventListener('click', () => closeModal());
    if (confirmBtn) confirmBtn.addEventListener('click', () => {
      messageSuccess('状态已更新');
      closeModal();
    });
  }, 0);
}

/**
 * 打开创建项目弹窗
 */
function openAddProjectModal() {
  openModal({
    title: '创建项目',
    content: `
      <div class="form-group">
        <label class="form-label">项目名称</label>
        <input class="input" type="text" id="proj-name" placeholder="请输入项目名称">
      </div>
      <div class="form-group">
        <label class="form-label">项目描述</label>
        <input class="input" type="text" id="proj-desc" placeholder="请输入项目描述">
      </div>
    `,
    footer: `
      <button class="btn btn-ghost" id="modal-cancel-proj">取消</button>
      <button class="btn btn-primary" id="modal-confirm-proj">创建</button>
    `,
  });

  setTimeout(() => {
    const cancelBtn = document.getElementById('modal-cancel-proj');
    const confirmBtn = document.getElementById('modal-confirm-proj');
    if (cancelBtn) cancelBtn.addEventListener('click', () => closeModal());
    if (confirmBtn) confirmBtn.addEventListener('click', () => {
      const name = document.getElementById('proj-name')?.value;
      if (name) {
        messageSuccess('项目已创建');
        closeModal();
      }
    });
  }, 0);
}
