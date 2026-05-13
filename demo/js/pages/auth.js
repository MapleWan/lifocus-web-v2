/**
 * 认证页面模块
 */
import { store } from '../store.js';
import { router } from '../router.js';
import { users } from '../mock-data.js';
import { messageSuccess, messageError } from '../components/message.js';

let mode = 'login'; // 'login' | 'register'

/**
 * 渲染认证页面
 * @returns {string} HTML字符串
 */
export function render() {
  const isLogin = mode === 'login';

  const featuresHtml = `
    <div class="auth-features">
      <div class="auth-feature-card">
        <div class="auth-feature-icon">🎯</div>
        <div class="auth-feature-title">深度工作</div>
        <div class="auth-feature-desc">专注模式帮你进入心流状态，高效完成关键任务</div>
      </div>
      <div class="auth-feature-card">
        <div class="auth-feature-icon">📋</div>
        <div class="auth-feature-title">项目笔记</div>
        <div class="auth-feature-desc">结构化管理项目文档，让知识有序沉淀</div>
      </div>
      <div class="auth-feature-card">
        <div class="auth-feature-icon">⏳</div>
        <div class="auth-feature-title">想法时间线</div>
        <div class="auth-feature-desc">记录灵感与思考轨迹，回顾成长路径</div>
      </div>
    </div>
  `;

  const loginFormHtml = `
    <div class="auth-form" id="auth-form">
      <div class="form-group">
        <label class="form-label">用户名</label>
        <input class="input" type="text" id="input-username" placeholder="请输入用户名" autocomplete="username">
        <div class="form-error" id="error-username">请输入用户名</div>
      </div>
      <div class="form-group">
        <label class="form-label">密码</label>
        <input class="input" type="password" id="input-password" placeholder="请输入密码" autocomplete="current-password">
        <div class="form-error" id="error-password">请输入密码</div>
      </div>
      <button class="auth-submit-btn" id="btn-submit">登 录</button>
      <div class="auth-switch">
        没有账号？<span class="auth-switch-link" id="auth-switch">立即注册</span>
      </div>
    </div>
  `;

  const registerFormHtml = `
    <div class="auth-form" id="auth-form">
      <div class="form-group">
        <label class="form-label">用户名</label>
        <input class="input" type="text" id="input-username" placeholder="请输入用户名" autocomplete="username">
        <div class="form-error" id="error-username">请输入用户名</div>
      </div>
      <div class="form-group">
        <label class="form-label">昵称</label>
        <input class="input" type="text" id="input-nickname" placeholder="请输入昵称">
        <div class="form-error" id="error-nickname">请输入昵称</div>
      </div>
      <div class="form-group">
        <label class="form-label">邮箱</label>
        <input class="input" type="email" id="input-email" placeholder="请输入邮箱">
        <div class="form-error" id="error-email">请输入邮箱</div>
      </div>
      <div class="form-group">
        <label class="form-label">密码</label>
        <input class="input" type="password" id="input-password" placeholder="请输入密码" autocomplete="new-password">
        <div class="form-error" id="error-password">请输入密码</div>
      </div>
      <div class="form-group">
        <label class="form-label">确认密码</label>
        <input class="input" type="password" id="input-confirm" placeholder="请再次输入密码" autocomplete="new-password">
        <div class="form-error" id="error-confirm">请确认密码</div>
      </div>
      <button class="auth-submit-btn" id="btn-submit">注 册</button>
      <div class="auth-switch">
        已有账号？<span class="auth-switch-link" id="auth-switch">立即登录</span>
      </div>
    </div>
  `;

  return `
    <div class="auth-container">
      <div class="auth-brand">
        <div class="auth-brand-content">
          <div class="auth-brand-logo">LiFocus</div>
          <div class="auth-brand-subtitle">专注知识管理与深度工作</div>
          ${featuresHtml}
        </div>
      </div>
      <div class="auth-form-area">
        <div class="auth-form-wrapper" id="auth-form-wrapper">
          <div class="auth-form-header">
            <div class="auth-form-title">${isLogin ? '欢迎回来' : '创建账号'}</div>
            <div class="auth-form-desc">${isLogin ? '登录 LiFocus 工作台' : '注册 LiFocus 账号开始使用'}</div>
          </div>
          ${isLogin ? loginFormHtml : registerFormHtml}
        </div>
      </div>
    </div>
  `;
}

/**
 * 初始化认证页面事件
 */
export function init() {
  // 切换登录/注册
  const switchLink = document.getElementById('auth-switch');
  if (switchLink) {
    switchLink.addEventListener('click', () => {
      mode = mode === 'login' ? 'register' : 'login';
      // 重新渲染
      const pageContent = document.getElementById('page-content');
      if (pageContent) {
        pageContent.innerHTML = render();
        init();
      }
    });
  }

  // 提交表单
  const submitBtn = document.getElementById('btn-submit');
  if (submitBtn) {
    submitBtn.addEventListener('click', handleSubmit);
  }

  // 回车提交
  const form = document.getElementById('auth-form');
  if (form) {
    form.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        handleSubmit();
      }
    });
  }
}

/**
 * 处理表单提交
 */
function handleSubmit() {
  if (mode === 'login') {
    handleLogin();
  } else {
    handleRegister();
  }
}

/**
 * 处理登录
 */
function handleLogin() {
  const username = document.getElementById('input-username');
  const password = document.getElementById('input-password');

  // 清除之前的错误
  clearErrors();

  let hasError = false;

  if (!username.value.trim()) {
    showFieldError('username', '请输入用户名');
    hasError = true;
  }
  if (!password.value.trim()) {
    showFieldError('password', '请输入密码');
    hasError = true;
  }

  if (hasError) return;

  // 模拟登录 - 使用mock数据中的第一个用户
  const user = users[0];
  store.set('isAuthenticated', true);
  store.set('currentUser', user);
  messageSuccess('登录成功，欢迎回来！');
  router.navigate('/dashboard');
}

/**
 * 处理注册
 */
function handleRegister() {
  const username = document.getElementById('input-username');
  const nickname = document.getElementById('input-nickname');
  const email = document.getElementById('input-email');
  const password = document.getElementById('input-password');
  const confirm = document.getElementById('input-confirm');

  clearErrors();

  let hasError = false;

  if (!username.value.trim()) {
    showFieldError('username', '请输入用户名');
    hasError = true;
  }
  if (!nickname.value.trim()) {
    showFieldError('nickname', '请输入昵称');
    hasError = true;
  }
  if (!email.value.trim()) {
    showFieldError('email', '请输入邮箱');
    hasError = true;
  }
  if (!password.value.trim()) {
    showFieldError('password', '请输入密码');
    hasError = true;
  }
  if (!confirm.value.trim()) {
    showFieldError('confirm', '请确认密码');
    hasError = true;
  } else if (password.value !== confirm.value) {
    showFieldError('confirm', '两次密码输入不一致');
    hasError = true;
  }

  if (hasError) return;

  // 模拟注册成功
  messageSuccess('注册成功，请登录');
  mode = 'login';
  const pageContent = document.getElementById('page-content');
  if (pageContent) {
    pageContent.innerHTML = render();
    init();
  }
}

/**
 * 显示字段错误
 */
function showFieldError(field, message) {
  const input = document.getElementById(`input-${field}`);
  const error = document.getElementById(`error-${field}`);
  if (input) input.classList.add('error');
  if (error) {
    error.textContent = message;
    error.classList.add('visible');
  }
}

/**
 * 清除所有错误
 */
function clearErrors() {
  document.querySelectorAll('.auth-form .input.error').forEach(el => el.classList.remove('error'));
  document.querySelectorAll('.auth-form .form-error.visible').forEach(el => el.classList.remove('visible'));
}
