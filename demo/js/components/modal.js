/**
 * 弹窗组件
 */
import { icon } from '../utils.js';

let modalOverlay = null;

/**
 * 打开弹窗
 * @param {object} options
 * @param {string} options.title - 弹窗标题
 * @param {string} options.content - 弹窗内容HTML
 * @param {string} options.footer - 底部按钮HTML（可选）
 * @param {Function} options.onClose - 关闭回调
 * @param {string} options.width - 自定义宽度
 */
export function openModal({ title = '', content = '', footer = '', onClose = null, width = '' } = {}) {
  // 移除已有弹窗
  closeModal();

  const widthStyle = width ? `style="max-width:${width}"` : '';

  const html = `
    <div class="modal-overlay active" id="modal-overlay">
      <div class="modal" ${widthStyle}>
        <div class="modal-header">
          <span class="modal-title">${title}</span>
          <span class="modal-close" id="modal-close">${icon('close')}</span>
        </div>
        <div class="modal-body">${content}</div>
        ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', html);
  modalOverlay = document.getElementById('modal-overlay');

  // 绑定关闭事件
  const closeBtn = document.getElementById('modal-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => closeModal(onClose));
  }

  // 点击遮罩层关闭
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      closeModal(onClose);
    }
  });

  // ESC键关闭
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      closeModal(onClose);
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

/**
 * 关闭弹窗
 * @param {Function} callback - 关闭后回调
 */
export function closeModal(callback = null) {
  const overlay = document.getElementById('modal-overlay');
  if (overlay) {
    overlay.classList.remove('active');
    setTimeout(() => {
      overlay.remove();
      modalOverlay = null;
      if (callback) callback();
    }, 200);
  }
}

/**
 * 确认弹窗
 * @param {string} message - 确认消息
 * @param {object} options
 * @returns {Promise<boolean>}
 */
export function confirmModal(message, { title = '确认操作', confirmText = '确认', cancelText = '取消', type = 'danger' } = {}) {
  return new Promise((resolve) => {
    openModal({
      title,
      content: `<p style="font-size:14px;color:var(--text-secondary)">${message}</p>`,
      footer: `
        <button class="btn btn-ghost" id="modal-cancel">${cancelText}</button>
        <button class="btn btn-${type}" id="modal-confirm">${confirmText}</button>
      `,
      onClose: () => resolve(false),
    });

    setTimeout(() => {
      const cancelBtn = document.getElementById('modal-cancel');
      const confirmBtn = document.getElementById('modal-confirm');
      if (cancelBtn) cancelBtn.addEventListener('click', () => { closeModal(); resolve(false); });
      if (confirmBtn) confirmBtn.addEventListener('click', () => { closeModal(); resolve(true); });
    }, 0);
  });
}
