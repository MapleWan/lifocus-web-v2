/**
 * 工具函数模块
 */

/**
 * 格式化日期
 * @param {Date|string} date
 * @returns {string}
 */
export function formatDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/**
 * 格式化相对时间
 * @param {Date|string} date
 * @returns {string}
 */
export function formatRelativeTime(date) {
  const now = new Date();
  const d = new Date(date);
  const diff = now - d;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  if (days < 30) return `${Math.floor(days / 7)}周前`;
  if (days < 365) return `${Math.floor(days / 30)}个月前`;
  return `${Math.floor(days / 365)}年前`;
}

/**
 * 生成唯一ID
 * @returns {string}
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

/**
 * 防抖
 * @param {Function} fn
 * @param {number} delay
 * @returns {Function}
 */
export function debounce(fn, delay = 300) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * 截断文本
 * @param {string} str
 * @param {number} len
 * @returns {string}
 */
export function truncate(str, len = 50) {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '...' : str;
}

/**
 * 根据文件类型返回图标名称
 * @param {string} type
 * @returns {string}
 */
export function getFileIcon(type) {
  const iconMap = {
    image: 'image',
    pdf: 'pdf',
    doc: 'doc',
    word: 'doc',
    ppt: 'ppt',
    video: 'video',
    folder: 'folder',
    link: 'link',
  };
  return iconMap[type] || 'file';
}

/**
 * 渲染SVG图标
 * @param {string} name 图标名称
 * @param {string} className 额外class
 * @returns {string}
 */
export function icon(name, className = '') {
  return `<svg class="icon ${className}" width="20" height="20"><use href="assets/icons.svg#icon-${name}"/></svg>`;
}
