/**
 * AI 对话页面
 */
import { icon, formatDate, generateId } from '../utils.js';
import { chatHistories, knowledgeBases, articles } from '../mock-data.js';
import { store } from '../store.js';

// ── State ────────────────────────────────────────
let conversations = JSON.parse(JSON.stringify(chatHistories));
let activeConversationId = conversations[0]?.id || null;
let currentMode = 'basic'; // basic | knowledge | web
let selectedKBs = new Set();
let isThinking = false;
let typingTimer = null;
let searchKeyword = '';

// ── Mock AI Responses ────────────────────────────
const mockResponses = {
  basic: [
    '这是一个很好的问题。让我来为您分析一下：\n\n首先，我们需要从整体角度来看这个问题。在实际开发中，通常有以下几种解决方案：\n\n1. **方案一**：从架构层面进行优化，采用分层设计\n2. **方案二**：引入缓存机制，减少重复计算\n3. **方案三**：使用异步处理，提升响应速度\n\n建议根据您的具体场景选择最合适的方案。需要我对某个方案进行更详细的说明吗？',
    '我理解您的需求。以下是我的一些建议：\n\n**核心思路：**\n- 明确目标和约束条件\n- 分阶段实施，控制风险\n- 持续迭代优化\n\n**实施步骤：**\n1. 进行现状评估和差距分析\n2. 制定详细的实施计划\n3. 搭建基础框架并验证\n4. 逐步推进功能开发\n5. 上线前进行全面测试\n\n希望这些建议对您有帮助！',
    '让我来回答这个问题：\n\n从技术角度来看，这涉及到几个关键要素：\n\n- **性能优化**：注意避免不必要的重渲染\n- **代码组织**：保持模块化和单一职责\n- **错误处理**：建立完善的异常捕获机制\n- **测试覆盖**：确保核心逻辑有充分的测试\n\n如果您需要更具体的代码示例或进一步的讨论，请随时告诉我。',
  ],
  knowledge: [
    '根据您的知识库内容，我找到了以下相关信息：\n\n知识库中有多篇相关文档可以参考。综合这些内容，我的建议是：\n\n1. **参考现有规范**：团队已有的技术方案和设计规范可以作为基础\n2. **复用已有组件**：知识库中记录的组件封装方案可以直接使用\n3. **遵循最佳实践**：结合文档中总结的经验教训\n\n以上分析基于知识库中的相关文档，建议您查看引用来源获取更多细节。',
    '通过分析您选择的知识库，我找到了以下高度相关的内容：\n\n**关键发现：**\n- 知识库中已有类似场景的解决方案\n- 团队此前已经做过相关的技术调研\n- 有现成的模板和工具可以复用\n\n**推荐行动：**\n1. 阅读相关文档了解背景\n2. 基于已有方案进行改进\n3. 与文档作者沟通确认细节\n\n引用的文档可以帮助您快速上手。',
  ],
  web: [
    '通过网络搜索，我找到了以下相关内容：\n\n**最新动态：**\n当前业界的主流做法正在向更现代化的方向演进。根据多个权威来源的信息：\n\n1. **趋势一**：越来越多的团队采用云原生架构\n2. **趋势二**：AI辅助开发工具的应用越来越广泛\n3. **趋势三**：低代码平台在特定场景下展现出优势\n\n**建议：**\n建议关注引用来源中的文章，了解最新的行业实践和技术动态。',
    '根据网络搜索结果，这个话题近期有不少讨论：\n\n**行业观点汇总：**\n- 多位技术专家推荐了渐进式的迁移策略\n- 社区反馈表明新方案的稳定性已经得到验证\n- 有多个成功的案例可以参考\n\n**资源推荐：**\n1. 官方文档中的迁移指南\n2. 社区贡献的最佳实践\n3. 实际项目的经验分享\n\n详情请参考引用的来源链接。',
  ],
};

const knowledgeCitations = [
  { title: 'Vue3 组合式API最佳实践', type: 'kb', source: '前端开发知识库', score: 95 },
  { title: '前端技术选型报告', type: 'kb', source: '产品设计规范', score: 88 },
  { title: 'Monorepo 工程实践', type: 'kb', source: '前端开发知识库', score: 82 },
  { title: '组件规范文档', type: 'kb', source: '产品设计规范', score: 76 },
];

const webCitations = [
  { title: '2026 前端技术趋势解读', type: 'web', source: 'InfoQ', score: 92 },
  { title: '现代Web应用架构设计', type: 'web', source: 'Medium', score: 87 },
  { title: '大规模前端工程化实践', type: 'web', source: '掘金', score: 81 },
  { title: 'Next.js 最佳实践指南', type: 'web', source: 'Dev.to', score: 75 },
];

// ── Helpers ──────────────────────────────────────
function getActiveConversation() {
  return conversations.find(c => c.id === activeConversationId);
}

function formatMsgTime(date) {
  const d = new Date(date);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function formatConversationTime(date) {
  const d = new Date(date);
  const now = new Date();
  const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return '今天';
  if (diffDays === 1) return '昨天';
  if (diffDays < 7) return `${diffDays}天前`;
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomCitations(type, count = 2) {
  const pool = type === 'kb' ? knowledgeCitations : webCitations;
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function getFilteredConversations() {
  if (!searchKeyword) return conversations;
  const kw = searchKeyword.toLowerCase();
  return conversations.filter(c => c.title.toLowerCase().includes(kw));
}

// ── Render Functions ─────────────────────────────
function renderHistoryList() {
  const filtered = getFilteredConversations();
  if (filtered.length === 0) {
    return `<div class="empty-state" style="padding:30px 10px"><div class="empty-state-title">暂无对话</div></div>`;
  }
  return filtered.map(conv => {
    const isActive = conv.id === activeConversationId;
    const lastMsg = conv.messages[conv.messages.length - 1];
    const time = formatConversationTime(lastMsg?.time || conv.createdAt);
    return `
      <div class="chat-history-item ${isActive ? 'active' : ''}" data-id="${conv.id}">
        <div class="chat-history-title">${conv.title}</div>
        <div class="chat-history-meta">
          <span>${time}</span>
          <span class="msg-count">${conv.messages.length} 条</span>
        </div>
        <span class="chat-history-delete" data-delete-id="${conv.id}" title="删除对话">${icon('close')}</span>
      </div>
    `;
  }).join('');
}

function renderModeBar() {
  const modes = [
    { id: 'basic', icon: 'chat', label: '基础对话', tip: '通用AI对话，适用于日常问答' },
    { id: 'knowledge', icon: 'book', label: '知识库问答', tip: '基于知识库内容进行精准回答' },
    { id: 'web', icon: 'globe', label: '联网搜索', tip: '搜索互联网获取最新信息' },
  ];
  return modes.map(m => `
    <button class="chat-mode-btn ${currentMode === m.id ? 'active' : ''}" data-mode="${m.id}">
      ${icon(m.icon)}
      <span>${m.label}</span>
      <span class="mode-tooltip">${m.tip}</span>
    </button>
  `).join('');
}

function renderKBSelector() {
  if (currentMode !== 'knowledge') return '';
  const tags = knowledgeBases.map(kb => {
    const isSelected = selectedKBs.has(kb.id);
    return `
      <span class="chat-kb-tag ${isSelected ? 'selected' : ''}" data-kb-id="${kb.id}">
        ${icon(kb.icon)}
        ${kb.name}
      </span>
    `;
  }).join('');
  const countHtml = selectedKBs.size > 0
    ? `<span class="chat-kb-count">已选 ${selectedKBs.size} 个</span>`
    : '';
  return `
    <div class="chat-kb-selector">
      <span class="chat-kb-label">选择知识库：</span>
      <div class="chat-kb-tags">${tags}</div>
      ${countHtml}
    </div>
  `;
}

function renderCitations(citations) {
  if (!citations || citations.length === 0) return '';
  return `
    <div class="chat-citations">
      ${citations.map(c => `
        <div class="chat-citation-card">
          <div class="chat-citation-icon ${c.type}">
            ${icon(c.type === 'kb' ? 'file' : 'globe')}
          </div>
          <div class="chat-citation-info">
            <div class="chat-citation-title">${c.title}</div>
            <div class="chat-citation-meta">
              <span class="chat-citation-type ${c.type}">${c.type === 'kb' ? '知识库' : '网络'}</span>
              <span class="chat-citation-score">相关度 ${c.score}%</span>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderMessages() {
  const conv = getActiveConversation();
  if (!conv || conv.messages.length === 0) {
    return `
      <div class="chat-welcome">
        <div class="chat-welcome-icon">${icon('sparkles')}</div>
        <h3>开始新的对话</h3>
        <p>我是 LiFocus AI 助手，可以回答问题、查询知识库、搜索网络信息。请在下方输入您的问题。</p>
      </div>
    `;
  }
  const user = store.get('currentUser');
  return conv.messages.map(msg => {
    const avatar = msg.role === 'user'
      ? (user?.avatar || 'U')
      : `${icon('sparkles')}`;
    const timeStr = formatMsgTime(msg.time);
    const citationsHtml = msg.citations ? renderCitations(msg.citations) : '';
    return `
      <div class="chat-msg ${msg.role}">
        <div class="chat-msg-avatar">${avatar}</div>
        <div class="chat-msg-body">
          <div class="chat-msg-bubble${msg.typing ? ' typing-cursor' : ''}">${msg.content}</div>
          ${citationsHtml}
          <div class="chat-msg-time">${timeStr}</div>
        </div>
      </div>
    `;
  }).join('');
}

function renderThinking() {
  if (!isThinking) return '';
  return `
    <div class="chat-thinking">
      <div class="chat-msg-avatar" style="background:var(--bg-tertiary);color:var(--primary)">${icon('sparkles')}</div>
      <div class="chat-thinking-dots">
        <span></span><span></span><span></span>
      </div>
    </div>
  `;
}

// ── Main Render ──────────────────────────────────
export function render() {
  return `
    <div class="chat-layout">
      <!-- Left: History -->
      <div class="chat-sidebar">
        <div class="chat-sidebar-header">
          <h3>${icon('robot')} AI 助手</h3>
          <span class="chat-new-btn" id="chat-new-btn" title="新建对话">${icon('add')}</span>
        </div>
        <div class="chat-history-list" id="chat-history-list">
          ${renderHistoryList()}
        </div>
        <div class="chat-sidebar-search">
          <div class="search-box">
            <span class="search-box-icon">${icon('search')}</span>
            <input class="input" type="text" placeholder="搜索对话..." id="chat-search-input" value="${searchKeyword}">
          </div>
        </div>
      </div>

      <!-- Right: Chat Area -->
      <div class="chat-main">
        <div class="chat-mode-bar" id="chat-mode-bar">
          ${renderModeBar()}
        </div>
        <div id="chat-kb-area">${renderKBSelector()}</div>
        <div class="chat-messages" id="chat-messages">
          ${renderMessages()}
          ${renderThinking()}
        </div>
        <div class="chat-input-area">
          <div class="chat-input-wrapper">
            <textarea id="chat-input" rows="1" placeholder="输入您的问题..."></textarea>
            <button class="chat-send-btn" id="chat-send-btn">${icon('send')}</button>
          </div>
          <div class="chat-input-hint">按 Enter 发送，Shift+Enter 换行</div>
        </div>
      </div>
    </div>
  `;
}

// ── Partial Updates ──────────────────────────────
function refreshHistoryList() {
  const el = document.getElementById('chat-history-list');
  if (el) el.innerHTML = renderHistoryList();
  bindHistoryEvents();
}

function refreshMessages() {
  const el = document.getElementById('chat-messages');
  if (el) {
    el.innerHTML = renderMessages() + renderThinking();
    scrollToBottom();
  }
}

function refreshKBSelector() {
  const el = document.getElementById('chat-kb-area');
  if (el) {
    el.innerHTML = renderKBSelector();
    bindKBEvents();
  }
}

function refreshModeBar() {
  const el = document.getElementById('chat-mode-bar');
  if (el) {
    el.innerHTML = renderModeBar();
    bindModeEvents();
  }
}

function scrollToBottom() {
  const el = document.getElementById('chat-messages');
  if (el) {
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }
}

function updateSendBtnState() {
  const input = document.getElementById('chat-input');
  const btn = document.getElementById('chat-send-btn');
  if (input && btn) {
    btn.classList.toggle('active', input.value.trim().length > 0);
  }
}

// ── Auto-resize textarea ─────────────────────────
function autoResizeTextarea(textarea) {
  textarea.style.height = 'auto';
  const maxH = 88; // ~4 lines
  textarea.style.height = Math.min(textarea.scrollHeight, maxH) + 'px';
}

// ── Send Message ─────────────────────────────────
function sendMessage() {
  const input = document.getElementById('chat-input');
  if (!input) return;
  const text = input.value.trim();
  if (!text || isThinking) return;

  let conv = getActiveConversation();
  // If no conversation, create one
  if (!conv) {
    const newConv = {
      id: generateId(),
      title: text.length > 20 ? text.slice(0, 20) + '...' : text,
      createdAt: new Date().toISOString(),
      messages: [],
    };
    conversations.unshift(newConv);
    activeConversationId = newConv.id;
    conv = newConv;
  }

  // Add user message
  const userMsg = {
    role: 'user',
    content: text,
    time: new Date().toISOString(),
  };
  conv.messages.push(userMsg);

  // Update title if first message
  if (conv.messages.filter(m => m.role === 'user').length === 1) {
    conv.title = text.length > 20 ? text.slice(0, 20) + '...' : text;
  }

  // Clear input
  input.value = '';
  autoResizeTextarea(input);
  updateSendBtnState();

  refreshHistoryList();
  refreshMessages();

  // Start AI thinking
  isThinking = true;
  refreshMessages();

  const thinkDelay = 1000 + Math.random() * 1000;
  setTimeout(() => {
    isThinking = false;
    simulateAIReply(conv);
  }, thinkDelay);
}

function simulateAIReply(conv) {
  const modeKey = currentMode === 'knowledge' ? 'knowledge' : currentMode === 'web' ? 'web' : 'basic';
  const responseText = getRandomItem(mockResponses[modeKey]);

  // Build citations
  let citations = null;
  if (currentMode === 'knowledge') {
    citations = getRandomCitations('kb', 2);
  } else if (currentMode === 'web') {
    citations = getRandomCitations('web', 2);
  }

  const aiMsg = {
    role: 'assistant',
    content: '',
    time: new Date().toISOString(),
    typing: true,
    citations: citations,
  };
  conv.messages.push(aiMsg);
  refreshMessages();

  // Typewriter effect
  let charIndex = 0;
  typingTimer = setInterval(() => {
    if (charIndex < responseText.length) {
      // Add 1-3 chars at a time for speed
      const step = Math.random() > 0.7 ? 3 : (Math.random() > 0.4 ? 2 : 1);
      aiMsg.content += responseText.slice(charIndex, charIndex + step);
      charIndex += step;

      // Update bubble content directly for performance
      const msgs = document.querySelectorAll('.chat-msg.assistant');
      const lastMsg = msgs[msgs.length - 1];
      if (lastMsg) {
        const bubble = lastMsg.querySelector('.chat-msg-bubble');
        if (bubble) bubble.textContent = aiMsg.content;
      }
      scrollToBottom();
    } else {
      clearInterval(typingTimer);
      typingTimer = null;
      aiMsg.typing = false;
      refreshMessages();
    }
  }, 30);
}

// ── Event Binding ────────────────────────────────
function bindHistoryEvents() {
  const list = document.getElementById('chat-history-list');
  if (!list) return;

  // Click to switch conversation
  list.querySelectorAll('.chat-history-item').forEach(item => {
    item.addEventListener('click', (e) => {
      if (e.target.closest('.chat-history-delete')) return;
      const id = item.dataset.id;
      if (id !== activeConversationId) {
        activeConversationId = id;
        clearTyping();
        refreshHistoryList();
        refreshMessages();
      }
    });
  });

  // Delete button
  list.querySelectorAll('.chat-history-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.deleteId;
      conversations = conversations.filter(c => c.id !== id);
      if (activeConversationId === id) {
        activeConversationId = conversations[0]?.id || null;
        clearTyping();
      }
      refreshHistoryList();
      refreshMessages();
    });
  });
}

function bindModeEvents() {
  document.querySelectorAll('.chat-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode;
      if (mode !== currentMode) {
        currentMode = mode;
        refreshModeBar();
        refreshKBSelector();
      }
    });
  });
}

function bindKBEvents() {
  document.querySelectorAll('.chat-kb-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      const id = tag.dataset.kbId;
      if (selectedKBs.has(id)) {
        selectedKBs.delete(id);
      } else {
        selectedKBs.add(id);
      }
      refreshKBSelector();
    });
  });
}

function clearTyping() {
  if (typingTimer) {
    clearInterval(typingTimer);
    typingTimer = null;
  }
  isThinking = false;
}

// ── Init ─────────────────────────────────────────
export function init() {
  // History list events
  bindHistoryEvents();

  // New conversation button
  const newBtn = document.getElementById('chat-new-btn');
  if (newBtn) {
    newBtn.addEventListener('click', () => {
      clearTyping();
      const newConv = {
        id: generateId(),
        title: '新的对话',
        createdAt: new Date().toISOString(),
        messages: [],
      };
      conversations.unshift(newConv);
      activeConversationId = newConv.id;
      refreshHistoryList();
      refreshMessages();
    });
  }

  // Search
  const searchInput = document.getElementById('chat-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      searchKeyword = searchInput.value;
      refreshHistoryList();
    });
  }

  // Mode buttons
  bindModeEvents();

  // KB tags
  bindKBEvents();

  // Input textarea
  const chatInput = document.getElementById('chat-input');
  if (chatInput) {
    chatInput.addEventListener('input', () => {
      autoResizeTextarea(chatInput);
      updateSendBtnState();
    });

    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  // Send button
  const sendBtn = document.getElementById('chat-send-btn');
  if (sendBtn) {
    sendBtn.addEventListener('click', () => {
      sendMessage();
    });
  }

  // Initial state
  updateSendBtnState();
  scrollToBottom();
}
