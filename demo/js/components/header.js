/**
 * 头部组件
 */
import { icon } from '../utils.js';
import { renderSearchBox } from '../components.js';

/**
 * 渲染页面头部
 * @param {object} options
 * @param {string} options.title - 页面标题
 * @param {string} options.actions - 右侧操作按钮HTML
 * @param {boolean} options.showSearch - 是否显示搜索框
 * @param {string} options.searchPlaceholder - 搜索框占位文字
 * @returns {string}
 */
export function renderHeader({ title = '', actions = '', showSearch = false, searchPlaceholder = '搜索...' } = {}) {
  return `
    <header class="page-header">
      <div class="page-header-left">
        <h2>${title}</h2>
      </div>
      <div class="page-header-right">
        ${showSearch ? renderSearchBox(searchPlaceholder, 'page-search') : ''}
        ${actions}
      </div>
    </header>
  `;
}
