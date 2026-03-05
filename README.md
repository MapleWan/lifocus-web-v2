# LiFocus Web V2

LiFocus 是一个专注于知识管理和内容创作的平台，帮助用户高效地组织、管理和分享知识内容。

## 功能特性

- **项目管理** - 创建和管理多个知识项目，按分类组织内容
- **文章管理** - 支持 Markdown 编辑的文章创作，支持笔记和文档两种类型
- **分类管理** - 树形结构的分类系统，灵活组织知识内容
- **文章分享** - 支持密码保护的文章分享功能，可生成分享链接
- **时间线** - 查看项目内容的更新历史和时间线
- **用户认证** - 安全的登录注册系统，支持 Token 认证

## 技术栈

- **前端框架** - [Vue 3.5.26](https://vuejs.org/) (Composition API)
- **构建工具** - [Vite 7.3.1](https://vitejs.dev/)
- **UI 组件库** - [TDesign Vue Next](https://tdesign.tencent.com/vue-next/)
- **状态管理** - [Pinia](https://pinia.vuejs.org/) + pinia-plugin-persistedstate
- **样式方案** - [UnoCSS](https://unocss.dev/) (原子化 CSS)
- **Markdown 编辑器** - [md-editor-v3](https://github.com/imzbf/md-editor-v3)
- **工具库**
  - [VueUse](https://vueuse.org/) - Vue 组合式工具集
  - [Day.js](https://day.js.org/) - 日期处理
  - [Axios](https://axios-http.com/) - HTTP 客户端
  - [Lodash](https://lodash.com/) - 实用工具函数
- **代码规范** - ESLint + Prettier + TypeScript

## 项目结构

```
src/
├── api/                    # API 接口封装
│   ├── article.ts         # 文章相关接口
│   ├── auth.ts            # 认证相关接口
│   ├── category.ts        # 分类相关接口
│   ├── project.ts         # 项目相关接口
│   └── timeline.ts        # 时间线相关接口
├── assets/                 # 静态资源
│   ├── images/            # 图片资源
│   └── svg/               # SVG 图标
├── components/             # 公共组件
│   ├── CustomCard/        # 自定义卡片组件
│   ├── Editor/            # Markdown 编辑器组件
│   └── ProjectCard/       # 项目卡片组件
├── constants/              # 常量定义
├── hooks/                  # 自定义组合式函数
│   ├── useCustomMessage.ts
│   └── useTdMessage.ts
├── layout/                 # 布局组件
│   └── ProjectLayout/     # 项目页面布局
├── router/                 # 路由配置
│   └── index.ts
├── stores/                 # Pinia 状态管理
│   ├── counter.ts
│   ├── main.ts
│   └── user.ts
├── style/                  # 全局样式
│   ├── color.css
│   ├── common.css
│   └── index.css
├── types/                  # TypeScript 类型定义
│   ├── apiTypes.d.ts
│   ├── articleTypes.d.ts
│   ├── categoryTypes.d.ts
│   ├── loginTypes.ts
│   ├── projectTypes.d.ts
│   └── timelineTypes.d.ts
├── utils/                  # 工具函数
│   ├── enums/             # 枚举定义
│   ├── request/           # HTTP 请求封装
│   ├── auth.ts
│   └── project.ts
├── views/                  # 页面视图
│   ├── auth/              # 认证页面（登录/注册）
│   ├── dashboard/         # 首页仪表板
│   ├── project/           # 项目相关页面
│   ├── share/             # 文章分享页面
│   └── test/              # 测试页面
├── App.vue
└── main.ts
```

## 开发规范

### 代码规范

- 使用 **Composition API** 和 `<script setup>` 语法
- 组件名使用 **PascalCase**（如 `ArticleList.vue`）
- 组合式函数以 `use` 开头（如 `useTdMessage`）
- 类型定义文件使用 `.d.ts` 后缀
- 常量使用 **UPPER_SNAKE_CASE**

### 命名规范

```typescript
// 组件名
ArticleList.vue
CustomCard.vue

// 组合式函数
useClipboard()
useInfiniteScroll()

// 类型定义
interface IArticle {}
type TArticleType = 'NOTE' | 'DOC'

// 枚举
enum EArticleStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED'
}
```

### 提交规范

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 代码检查与修复
pnpm lint

# 代码格式化
pnpm format

# 类型检查
pnpm type-check

# 生产构建
pnpm build
```

## 开发环境配置

### 环境变量

```bash
# .env.development
VITE_BASE_API=http://localhost:8080/api

# .env.production
VITE_BASE_API=https://api.example.com/api
```

## 项目启动

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览生产构建
pnpm preview
```

## 浏览器支持

- Chrome >= 88
- Firefox >= 78
- Safari >= 14
- Edge >= 88
