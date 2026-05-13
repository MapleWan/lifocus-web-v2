/**
 * 树形组件
 */
import { icon } from '../utils.js';

/**
 * 渲染树形结构
 * @param {Array} nodes - 树节点数据 [{id, name, children?, expanded?}]
 * @param {object} options
 * @param {string} options.activeId - 当前激活节点ID
 * @param {boolean} options.showActions - 是否显示操作按钮
 * @param {Function} options.onNodeClick - 节点点击回调
 * @param {Function} options.onAction - 操作回调
 * @returns {string}
 */
export function renderTree(nodes, { activeId = '', showActions = true } = {}) {
  if (!nodes || nodes.length === 0) return '';

  const renderNode = (node) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = node.expanded !== false; // 默认展开
    const isActive = node.id === activeId;

    const toggleHtml = hasChildren
      ? `<span class="tree-toggle ${isExpanded ? 'expanded' : ''}" data-id="${node.id}">${icon('arrow-right')}</span>`
      : `<span class="tree-toggle" style="visibility:hidden">${icon('arrow-right')}</span>`;

    const actionsHtml = showActions ? `
      <span class="tree-node-actions">
        <span class="btn-icon" data-action="add" data-id="${node.id}" title="添加子节点">${icon('add')}</span>
        <span class="btn-icon" data-action="edit" data-id="${node.id}" title="编辑">${icon('edit')}</span>
        <span class="btn-icon" data-action="delete" data-id="${node.id}" title="删除">${icon('delete')}</span>
      </span>
    ` : '';

    const childrenHtml = hasChildren && isExpanded
      ? `<div class="tree-children">${node.children.map(renderNode).join('')}</div>`
      : '';

    return `
      <div class="tree-node" data-id="${node.id}">
        <div class="tree-node-content ${isActive ? 'active' : ''}" data-id="${node.id}">
          ${toggleHtml}
          <span class="tree-node-label">${icon('folder')} ${node.name}</span>
          ${actionsHtml}
        </div>
        ${childrenHtml}
      </div>
    `;
  };

  return `<div class="tree">${nodes.map(renderNode).join('')}</div>`;
}

/**
 * 初始化树形组件事件
 * @param {HTMLElement} container - 树容器元素
 * @param {object} callbacks
 * @param {Function} callbacks.onToggle - 展开/折叠回调(nodeId)
 * @param {Function} callbacks.onClick - 节点点击回调(nodeId)
 * @param {Function} callbacks.onAction - 操作回调(action, nodeId)
 */
export function initTreeEvents(container, { onToggle, onClick, onAction } = {}) {
  if (!container) return;

  container.addEventListener('click', (e) => {
    // 处理展开/折叠
    const toggle = e.target.closest('.tree-toggle');
    if (toggle && toggle.dataset.id) {
      toggle.classList.toggle('expanded');
      const node = toggle.closest('.tree-node');
      const children = node.querySelector('.tree-children');
      if (children) {
        children.style.display = children.style.display === 'none' ? '' : 'none';
      }
      if (onToggle) onToggle(toggle.dataset.id);
      return;
    }

    // 处理操作按钮
    const actionBtn = e.target.closest('[data-action]');
    if (actionBtn) {
      const action = actionBtn.dataset.action;
      const id = actionBtn.dataset.id;
      if (onAction) onAction(action, id);
      return;
    }

    // 处理节点点击
    const nodeContent = e.target.closest('.tree-node-content');
    if (nodeContent) {
      // 移除所有active
      container.querySelectorAll('.tree-node-content').forEach(el => el.classList.remove('active'));
      nodeContent.classList.add('active');
      if (onClick) onClick(nodeContent.dataset.id);
    }
  });
}
