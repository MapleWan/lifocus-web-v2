/**
 * 简易状态管理
 */
class Store {
  constructor(initialState = {}) {
    this._state = { ...initialState };
    this._listeners = new Map();
  }

  get(key) {
    return key ? this._state[key] : { ...this._state };
  }

  set(key, value) {
    const oldValue = this._state[key];
    this._state[key] = value;
    if (oldValue !== value) {
      this._notify(key, value, oldValue);
    }
  }

  subscribe(key, callback) {
    if (!this._listeners.has(key)) {
      this._listeners.set(key, []);
    }
    this._listeners.get(key).push(callback);
    // 返回取消订阅函数
    return () => {
      const callbacks = this._listeners.get(key);
      const index = callbacks.indexOf(callback);
      if (index > -1) callbacks.splice(index, 1);
    };
  }

  _notify(key, newValue, oldValue) {
    const callbacks = this._listeners.get(key) || [];
    callbacks.forEach(cb => cb(newValue, oldValue));
  }
}

// 创建全局 store 实例
export const store = new Store({
  currentUser: null,
  isAuthenticated: true, // 默认已登录，方便原型演示
  currentProject: null,
  sidebarCollapsed: false,
});

export default store;
