/**
 * 消息提示组件
 */

let messageContainer = null;

/**
 * 确保消息容器存在
 */
function ensureContainer() {
  if (!messageContainer) {
    messageContainer = document.createElement('div');
    messageContainer.className = 'message-container';
    messageContainer.id = 'message-container';
    document.body.appendChild(messageContainer);
  }
  return messageContainer;
}

/**
 * 显示消息
 * @param {string} text - 消息内容
 * @param {string} type - 类型: success/error/warning/info
 * @param {number} duration - 显示时长(ms)
 */
function showMessage(text, type = 'info', duration = 3000) {
  const container = ensureContainer();

  const iconMap = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  const msgEl = document.createElement('div');
  msgEl.className = `message message-${type}`;
  msgEl.innerHTML = `<span>${iconMap[type]}</span><span>${text}</span>`;

  container.appendChild(msgEl);

  // 自动消失
  setTimeout(() => {
    msgEl.style.opacity = '0';
    msgEl.style.transform = 'translateY(-10px)';
    setTimeout(() => msgEl.remove(), 300);
  }, duration);
}

/**
 * 成功消息
 */
export function messageSuccess(text, duration) {
  showMessage(text, 'success', duration);
}

/**
 * 错误消息
 */
export function messageError(text, duration) {
  showMessage(text, 'error', duration);
}

/**
 * 警告消息
 */
export function messageWarning(text, duration) {
  showMessage(text, 'warning', duration);
}

/**
 * 信息消息
 */
export function messageInfo(text, duration) {
  showMessage(text, 'info', duration);
}

// 导出统一接口
export const message = {
  success: messageSuccess,
  error: messageError,
  warning: messageWarning,
  info: messageInfo,
};

export default message;
