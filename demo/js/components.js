/**
 * 通用组件渲染函数
 * 返回 HTML 字符串
 */
import { icon, truncate, formatRelativeTime } from './utils.js';

/**
 * 渲染按钮
 */
export function renderButton(text, { type = 'primary', size = '', iconName = '', className = '', attrs = '' } = {}) {
  const sizeClass = size ? `btn-${size}` : '';
  const iconHtml = iconName ? icon(iconName) : '';
  return `<button class="btn btn-${type} ${sizeClass} ${className}" ${attrs}>${iconHtml}${text}</button>`;
}

/**
 * 渲染卡片
 */
export function renderCard(title, content, { actions = '', className = '' } = {}) {
  return `
    <div class="card ${className}">
      ${title ? `<div class="card-header">
        <span class="card-title">${title}</span>
        ${actions}
      </div>` : ''}
      <div class="card-body">${content}</div>
    </div>
  `;
}

/**
 * 渲染标签
 */
export function renderTag(text, type = 'primary') {
  return `<span class="tag tag-${type}">${text}</span>`;
}

/**
 * 渲染空状态
 */
export function renderEmptyState(title = '暂无数据', desc = '', iconName = 'file') {
  return `
    <div class="empty-state">
      <div class="empty-state-icon">${icon(iconName)}</div>
      <div class="empty-state-title">${title}</div>
      ${desc ? `<div class="empty-state-desc">${desc}</div>` : ''}
    </div>
  `;
}

/**
 * 渲染加载状态
 */
export function renderLoading() {
  return `
    <div class="loading">
      <div class="loading-spinner"></div>
    </div>
  `;
}

/**
 * 渲染搜索框
 */
export function renderSearchBox(placeholder = '搜索...', id = '') {
  return `
    <div class="search-box">
      <span class="search-box-icon">${icon('search')}</span>
      <input class="input" type="text" placeholder="${placeholder}" ${id ? `id="${id}"` : ''}>
    </div>
  `;
}

/**
 * 渲染表单组
 */
export function renderFormGroup(label, inputHtml) {
  return `
    <div class="form-group">
      <label class="form-label">${label}</label>
      ${inputHtml}
    </div>
  `;
}

/**
 * 渲染选项卡
 */
export function renderTabs(tabs, activeId) {
  const items = tabs.map(tab =>
    `<div class="tab-item ${tab.id === activeId ? 'active' : ''}" data-tab="${tab.id}">${tab.label}</div>`
  ).join('');
  return `<div class="tabs">${items}</div>`;
}
