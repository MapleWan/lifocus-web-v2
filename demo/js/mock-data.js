/**
 * 模拟数据模块
 */

export const users = [
  { id: 'u1', name: '张明', email: 'zhangming@example.com', avatar: 'ZM', role: 'admin' },
  { id: 'u2', name: '李华', email: 'lihua@example.com', avatar: 'LH', role: 'member' },
  { id: 'u3', name: '王芳', email: 'wangfang@example.com', avatar: 'WF', role: 'member' },
];

export const projects = [
  {
    id: 'p1',
    name: 'LiFocus 产品官网',
    description: '公司产品官方网站的设计与开发，包含首页、产品介绍、定价页面等',
    type: 'web',
    status: 'active',
    owner: 'u1',
    createdAt: '2026-03-15T08:00:00Z',
    updatedAt: '2026-05-10T14:30:00Z',
    articleCount: 12,
    memberCount: 3,
  },
  {
    id: 'p2',
    name: '移动端 App 重构',
    description: '对现有移动应用进行技术栈升级和UI重构，提升用户体验和性能',
    type: 'mobile',
    status: 'active',
    owner: 'u1',
    createdAt: '2026-02-20T10:00:00Z',
    updatedAt: '2026-05-12T09:15:00Z',
    articleCount: 8,
    memberCount: 4,
  },
  {
    id: 'p3',
    name: '内部知识管理系统',
    description: '搭建团队内部知识库，统一管理技术文档、设计规范和项目经验',
    type: 'docs',
    status: 'active',
    owner: 'u2',
    createdAt: '2026-01-10T09:00:00Z',
    updatedAt: '2026-05-08T16:45:00Z',
    articleCount: 25,
    memberCount: 6,
  },
  {
    id: 'p4',
    name: 'API 网关服务',
    description: '统一API网关服务搭建，实现请求路由、限流、认证等功能',
    type: 'backend',
    status: 'archived',
    owner: 'u1',
    createdAt: '2025-11-05T08:30:00Z',
    updatedAt: '2026-04-20T11:00:00Z',
    articleCount: 6,
    memberCount: 2,
  },
  {
    id: 'p5',
    name: '数据可视化平台',
    description: '基于图表库构建数据分析和可视化展示平台，支持多维度数据探索',
    type: 'data',
    status: 'active',
    owner: 'u3',
    createdAt: '2026-04-01T13:00:00Z',
    updatedAt: '2026-05-11T10:20:00Z',
    articleCount: 4,
    memberCount: 3,
  },
  {
    id: 'p6',
    name: '设计系统 v2.0',
    description: '团队统一设计系统的升级，包括色彩、排版、组件规范的全面更新',
    type: 'design',
    status: 'active',
    owner: 'u2',
    createdAt: '2026-03-28T11:00:00Z',
    updatedAt: '2026-05-09T15:30:00Z',
    articleCount: 9,
    memberCount: 5,
  },
];

export const categories = [
  // p1 - LiFocus 产品官网
  { id: 'c1', projectId: 'p1', name: '需求文档', parentId: null, order: 1 },
  { id: 'c1-1', projectId: 'p1', name: '功能需求', parentId: 'c1', order: 1 },
  { id: 'c1-2', projectId: 'p1', name: '非功能需求', parentId: 'c1', order: 2 },
  { id: 'c2', projectId: 'p1', name: '设计稿', parentId: null, order: 2 },
  { id: 'c2-1', projectId: 'p1', name: 'UI设计', parentId: 'c2', order: 1 },
  { id: 'c2-2', projectId: 'p1', name: '交互设计', parentId: 'c2', order: 2 },
  { id: 'c3', projectId: 'p1', name: '技术方案', parentId: null, order: 3 },
  // p2 - 移动端 App 重构
  { id: 'c4', projectId: 'p2', name: '架构设计', parentId: null, order: 1 },
  { id: 'c4-1', projectId: 'p2', name: '整体架构', parentId: 'c4', order: 1 },
  { id: 'c4-2', projectId: 'p2', name: '模块设计', parentId: 'c4', order: 2 },
  { id: 'c5', projectId: 'p2', name: '开发日志', parentId: null, order: 2 },
  { id: 'c6', projectId: 'p2', name: '测试用例', parentId: null, order: 3 },
  { id: 'c6-1', projectId: 'p2', name: '单元测试', parentId: 'c6', order: 1 },
  { id: 'c6-2', projectId: 'p2', name: '集成测试', parentId: 'c6', order: 2 },
  // p3 - 内部知识管理系统
  { id: 'c7', projectId: 'p3', name: '前端技术', parentId: null, order: 1 },
  { id: 'c7-1', projectId: 'p3', name: 'Vue 生态', parentId: 'c7', order: 1 },
  { id: 'c7-2', projectId: 'p3', name: 'React 生态', parentId: 'c7', order: 2 },
  { id: 'c7-3', projectId: 'p3', name: '工程化', parentId: 'c7', order: 3 },
  { id: 'c8', projectId: 'p3', name: '后端技术', parentId: null, order: 2 },
  { id: 'c9', projectId: 'p3', name: 'DevOps', parentId: null, order: 3 },
  { id: 'c10', projectId: 'p3', name: '产品设计', parentId: null, order: 4 },
];

export const articles = [
  { id: 'a1', projectId: 'p1', categoryId: 'c1-1', title: '首页功能需求说明', content: '首页需要展示产品核心特性、用户案例和定价信息...', status: 'published', author: 'u1', createdAt: '2026-03-16T09:00:00Z', updatedAt: '2026-05-01T10:00:00Z', wordCount: 2500 },
  { id: 'a2', projectId: 'p1', categoryId: 'c1-1', title: '用户注册登录流程', content: '用户通过邮箱或手机号进行注册，支持第三方OAuth登录...', status: 'published', author: 'u1', createdAt: '2026-03-18T14:00:00Z', updatedAt: '2026-04-20T08:30:00Z', wordCount: 1800 },
  { id: 'a3', projectId: 'p1', categoryId: 'c2-1', title: '首页视觉设计方案', content: '采用极简风格，大面积留白，突出核心产品价值...', status: 'draft', author: 'u2', createdAt: '2026-03-20T11:00:00Z', updatedAt: '2026-05-05T15:00:00Z', wordCount: 1200 },
  { id: 'a4', projectId: 'p1', categoryId: 'c3', title: '前端技术选型报告', content: '经过评估，建议采用 Next.js + TailwindCSS 技术栈...', status: 'published', author: 'u1', createdAt: '2026-03-22T10:00:00Z', updatedAt: '2026-04-15T09:00:00Z', wordCount: 3200 },
  { id: 'a5', projectId: 'p2', categoryId: 'c4-1', title: '新架构整体设计', content: '采用 Clean Architecture 分层设计，UI层使用Jetpack Compose...', status: 'published', author: 'u1', createdAt: '2026-02-22T09:00:00Z', updatedAt: '2026-04-28T14:00:00Z', wordCount: 4100 },
  { id: 'a6', projectId: 'p2', categoryId: 'c4-2', title: '网络模块设计', content: '网络层封装使用Retrofit + OkHttp，统一错误处理...', status: 'published', author: 'u3', createdAt: '2026-03-01T10:30:00Z', updatedAt: '2026-04-10T11:00:00Z', wordCount: 2800 },
  { id: 'a7', projectId: 'p2', categoryId: 'c5', title: '第一周开发进度', content: '完成基础框架搭建，配置CI/CD流水线...', status: 'published', author: 'u1', createdAt: '2026-03-05T17:00:00Z', updatedAt: '2026-03-05T17:00:00Z', wordCount: 800 },
  { id: 'a8', projectId: 'p2', categoryId: 'c6-1', title: 'ViewModel单元测试规范', content: '所有ViewModel必须有对应的单元测试覆盖...', status: 'draft', author: 'u3', createdAt: '2026-03-10T09:00:00Z', updatedAt: '2026-05-08T10:00:00Z', wordCount: 1500 },
  { id: 'a9', projectId: 'p3', categoryId: 'c7-1', title: 'Vue3 组合式API最佳实践', content: '使用 setup 语法糖和 composable 函数进行逻辑复用...', status: 'published', author: 'u2', createdAt: '2026-01-15T10:00:00Z', updatedAt: '2026-04-22T09:00:00Z', wordCount: 3500 },
  { id: 'a10', projectId: 'p3', categoryId: 'c7-2', title: 'React Server Components 实战', content: '深入理解RSC的工作原理和使用场景...', status: 'published', author: 'u1', createdAt: '2026-02-10T14:00:00Z', updatedAt: '2026-05-02T16:00:00Z', wordCount: 4200 },
  { id: 'a11', projectId: 'p3', categoryId: 'c7-3', title: 'Monorepo 工程实践', content: '使用 Turborepo 管理多包项目的配置和最佳实践...', status: 'published', author: 'u2', createdAt: '2026-02-28T11:00:00Z', updatedAt: '2026-04-18T13:00:00Z', wordCount: 2900 },
  { id: 'a12', projectId: 'p3', categoryId: 'c8', title: 'Go微服务开发指南', content: '基于Go标准库构建微服务的完整指南...', status: 'published', author: 'u3', createdAt: '2026-03-08T09:30:00Z', updatedAt: '2026-05-06T10:00:00Z', wordCount: 5000 },
  { id: 'a13', projectId: 'p3', categoryId: 'c9', title: 'Docker容器化部署手册', content: '从Dockerfile编写到Kubernetes部署的全流程...', status: 'published', author: 'u1', createdAt: '2026-03-12T10:00:00Z', updatedAt: '2026-04-30T14:00:00Z', wordCount: 3800 },
  { id: 'a14', projectId: 'p3', categoryId: 'c10', title: '用户研究方法论', content: '定性和定量研究方法的适用场景和执行步骤...', status: 'draft', author: 'u2', createdAt: '2026-04-05T13:00:00Z', updatedAt: '2026-05-10T09:00:00Z', wordCount: 2200 },
  { id: 'a15', projectId: 'p5', categoryId: null, title: '图表组件封装设计', content: '基于ECharts的二次封装方案，统一API调用方式...', status: 'published', author: 'u3', createdAt: '2026-04-08T10:00:00Z', updatedAt: '2026-05-07T11:00:00Z', wordCount: 2600 },
  { id: 'a16', projectId: 'p5', categoryId: null, title: '数据接入层设计', content: '支持多种数据源接入，包括REST API、WebSocket和GraphQL...', status: 'draft', author: 'u1', createdAt: '2026-04-12T09:00:00Z', updatedAt: '2026-05-11T10:20:00Z', wordCount: 1900 },
  { id: 'a17', projectId: 'p6', categoryId: null, title: '色彩系统升级方案', content: '从固定色值迁移到基于CSS变量的动态主题系统...', status: 'published', author: 'u2', createdAt: '2026-03-30T10:00:00Z', updatedAt: '2026-05-03T14:00:00Z', wordCount: 2100 },
  { id: 'a18', projectId: 'p6', categoryId: null, title: '组件规范文档', content: '按钮、输入框、卡片等基础组件的设计规范和使用指南...', status: 'published', author: 'u2', createdAt: '2026-04-02T11:00:00Z', updatedAt: '2026-05-09T15:30:00Z', wordCount: 4500 },
];

// 时间线类型: create/update/delete/publish/archive/share/comment/upload/deploy
// 时间线状态: success/warning/error
export const timelines = [
  { id: 't1', projectId: 'p1', type: 'create', status: 'success', title: '创建了项目', description: '创建了「LiFocus 产品官网」项目', user: 'u1', createdAt: '2026-03-15T08:00:00Z' },
  { id: 't2', projectId: 'p1', type: 'publish', status: 'success', title: '发布了文章', description: '发布了「首页功能需求说明」', user: 'u1', createdAt: '2026-03-16T09:30:00Z' },
  { id: 't3', projectId: 'p2', type: 'create', status: 'success', title: '创建了项目', description: '创建了「移动端 App 重构」项目', user: 'u1', createdAt: '2026-02-20T10:00:00Z' },
  { id: 't4', projectId: 'p2', type: 'upload', status: 'success', title: '上传了文件', description: '上传了架构设计图', user: 'u3', createdAt: '2026-03-02T14:00:00Z' },
  { id: 't5', projectId: 'p3', type: 'share', status: 'success', title: '分享了文章', description: '分享了「Vue3 组合式API最佳实践」到公共空间', user: 'u2', createdAt: '2026-04-22T10:00:00Z' },
  { id: 't6', projectId: 'p1', type: 'comment', status: 'success', title: '添加了评论', description: '在「前端技术选型报告」中添加了评论', user: 'u3', createdAt: '2026-04-16T11:00:00Z' },
  { id: 't7', projectId: 'p5', type: 'deploy', status: 'success', title: '部署成功', description: '数据可视化平台 v0.2.0 部署成功', user: 'u1', createdAt: '2026-05-01T15:00:00Z' },
  { id: 't8', projectId: 'p2', type: 'deploy', status: 'error', title: '部署失败', description: 'App v2.1.0 构建失败，缺少环境变量', user: 'u1', createdAt: '2026-05-05T09:00:00Z' },
  { id: 't9', projectId: 'p6', type: 'update', status: 'success', title: '更新了文章', description: '更新了「色彩系统升级方案」', user: 'u2', createdAt: '2026-05-03T14:00:00Z' },
  { id: 't10', projectId: 'p3', type: 'delete', status: 'warning', title: '删除了文章', description: '删除了过时的「Webpack配置指南」', user: 'u2', createdAt: '2026-05-06T16:00:00Z' },
  { id: 't11', projectId: 'p4', type: 'archive', status: 'warning', title: '归档了项目', description: '将「API 网关服务」项目归档', user: 'u1', createdAt: '2026-04-20T11:00:00Z' },
  { id: 't12', projectId: 'p1', type: 'deploy', status: 'success', title: '部署成功', description: '官网 v1.3.0 已成功部署到生产环境', user: 'u1', createdAt: '2026-05-10T14:30:00Z' },
];

export const resources = [
  { id: 'r1', name: '产品首页设计稿.fig', type: 'image', size: '24.5 MB', projectId: 'p1', uploadedBy: 'u2', createdAt: '2026-03-20T11:00:00Z', url: '#' },
  { id: 'r2', name: '技术架构图.png', type: 'image', size: '1.2 MB', projectId: 'p2', uploadedBy: 'u1', createdAt: '2026-02-25T10:00:00Z', url: '#' },
  { id: 'r3', name: '需求规格说明书.pdf', type: 'pdf', size: '3.8 MB', projectId: 'p1', uploadedBy: 'u1', createdAt: '2026-03-18T09:00:00Z', url: '#' },
  { id: 'r4', name: '接口文档v2.0.pdf', type: 'pdf', size: '2.1 MB', projectId: 'p4', uploadedBy: 'u1', createdAt: '2026-01-15T14:00:00Z', url: '#' },
  { id: 'r5', name: '项目周报模板.docx', type: 'doc', size: '156 KB', projectId: 'p3', uploadedBy: 'u2', createdAt: '2026-02-01T10:00:00Z', url: '#' },
  { id: 'r6', name: '代码规范手册.docx', type: 'doc', size: '890 KB', projectId: 'p3', uploadedBy: 'u1', createdAt: '2026-01-20T09:00:00Z', url: '#' },
  { id: 'r7', name: '产品路线图.pptx', type: 'ppt', size: '5.6 MB', projectId: 'p1', uploadedBy: 'u1', createdAt: '2026-04-01T13:00:00Z', url: '#' },
  { id: 'r8', name: '季度汇报.pptx', type: 'ppt', size: '12.3 MB', projectId: 'p3', uploadedBy: 'u2', createdAt: '2026-04-10T10:00:00Z', url: '#' },
  { id: 'r9', name: '产品演示录屏.mp4', type: 'video', size: '156 MB', projectId: 'p1', uploadedBy: 'u1', createdAt: '2026-04-15T14:00:00Z', url: '#' },
  { id: 'r10', name: '用户访谈录音.mp4', type: 'video', size: '89 MB', projectId: 'p3', uploadedBy: 'u3', createdAt: '2026-04-08T11:00:00Z', url: '#' },
  { id: 'r11', name: '竞品分析报告.pdf', type: 'pdf', size: '4.2 MB', projectId: 'p1', uploadedBy: 'u2', createdAt: '2026-03-25T09:00:00Z', url: '#' },
  { id: 'r12', name: 'App原型设计.fig', type: 'image', size: '18.7 MB', projectId: 'p2', uploadedBy: 'u2', createdAt: '2026-03-08T10:00:00Z', url: '#' },
  { id: 'r13', name: '数据库设计文档.pdf', type: 'pdf', size: '1.5 MB', projectId: 'p4', uploadedBy: 'u1', createdAt: '2025-12-10T09:00:00Z', url: '#' },
  { id: 'r14', name: '图标资源包.zip', type: 'file', size: '8.9 MB', projectId: 'p6', uploadedBy: 'u2', createdAt: '2026-04-05T10:00:00Z', url: '#' },
  { id: 'r15', name: '设计Token规范.docx', type: 'doc', size: '420 KB', projectId: 'p6', uploadedBy: 'u2', createdAt: '2026-04-12T11:00:00Z', url: '#' },
  { id: 'r16', name: 'ECharts主题配置.json', type: 'file', size: '12 KB', projectId: 'p5', uploadedBy: 'u3', createdAt: '2026-04-20T09:00:00Z', url: '#' },
];

export const knowledgeBases = [
  {
    id: 'kb1',
    name: '前端开发知识库',
    description: '前端技术栈相关的最佳实践、设计模式和常见问题解决方案',
    icon: 'globe',
    articleCount: 45,
    resourceIds: ['r6'],
    createdAt: '2026-01-10T09:00:00Z',
    updatedAt: '2026-05-12T10:00:00Z',
  },
  {
    id: 'kb2',
    name: '产品设计规范',
    description: '产品设计原则、交互规范、视觉标准和组件使用指南',
    icon: 'grid',
    articleCount: 28,
    resourceIds: ['r14', 'r15'],
    createdAt: '2026-02-05T10:00:00Z',
    updatedAt: '2026-05-09T15:30:00Z',
  },
  {
    id: 'kb3',
    name: '运维部署手册',
    description: 'CI/CD流程、容器化部署、监控告警和故障排查指南',
    icon: 'folder',
    articleCount: 18,
    resourceIds: ['r4', 'r13'],
    createdAt: '2026-03-01T11:00:00Z',
    updatedAt: '2026-05-06T16:00:00Z',
  },
  {
    id: 'kb4',
    name: '项目管理方法论',
    description: '敏捷开发实践、团队协作流程和项目管理工具使用指南',
    icon: 'calendar',
    articleCount: 12,
    resourceIds: ['r5', 'r8'],
    createdAt: '2026-03-20T09:00:00Z',
    updatedAt: '2026-04-30T14:00:00Z',
  },
];

export const chatHistories = [
  {
    id: 'ch1',
    title: '如何优化首页加载速度',
    createdAt: '2026-05-10T10:00:00Z',
    messages: [
      { role: 'user', content: '我们官网首页加载速度比较慢，有什么优化建议？', time: '2026-05-10T10:00:00Z' },
      { role: 'assistant', content: '针对首页加载优化，我建议从以下几个方面入手：\n\n1. **图片优化**：使用WebP格式，配合lazy loading\n2. **代码分割**：使用动态import实现路由级别的代码分割\n3. **CDN加速**：将静态资源部署到CDN节点\n4. **缓存策略**：合理设置HTTP缓存头\n5. **关键CSS内联**：将首屏关键CSS内联到HTML中\n\n您目前使用的是什么技术栈？', time: '2026-05-10T10:00:30Z' },
      { role: 'user', content: '我们用的Next.js，已经做了代码分割了', time: '2026-05-10T10:01:00Z' },
      { role: 'assistant', content: '使用Next.js的话，还可以考虑：\n\n1. 使用`next/image`组件自动优化图片\n2. 启用ISR（增量静态再生成）减少服务器渲染压力\n3. 配置`next/font`优化字体加载\n4. 使用`React.Suspense`配合streaming SSR\n5. 分析Bundle大小，移除未使用的依赖\n\n建议先用Lighthouse跑一下评分，看看具体瓶颈在哪里。', time: '2026-05-10T10:01:30Z' },
    ],
  },
  {
    id: 'ch2',
    title: '设计系统色彩变量命名',
    createdAt: '2026-05-08T14:00:00Z',
    messages: [
      { role: 'user', content: '我们在升级设计系统的色彩方案，CSS变量怎么命名比较好？', time: '2026-05-08T14:00:00Z' },
      { role: 'assistant', content: '设计系统的CSS变量命名推荐采用语义化命名，而非具体色值命名：\n\n```css\n/* ✅ 推荐：语义化命名 */\n--color-primary\n--color-text-primary\n--color-bg-surface\n--color-border-default\n\n/* ❌ 避免：色值命名 */\n--color-blue-500\n--color-gray-100\n```\n\n命名结构建议：`--{category}-{property}-{variant}`\n\n这样在切换主题时只需要修改变量值，不需要改变量名。', time: '2026-05-08T14:00:30Z' },
      { role: 'user', content: '如果需要支持深色模式呢？', time: '2026-05-08T14:01:00Z' },
      { role: 'assistant', content: '支持深色模式的最佳做法是使用CSS自定义属性 + `prefers-color-scheme` 媒体查询：\n\n```css\n:root {\n  --bg-primary: #ffffff;\n  --text-primary: #1f2937;\n}\n\n@media (prefers-color-scheme: dark) {\n  :root {\n    --bg-primary: #111827;\n    --text-primary: #f9fafb;\n  }\n}\n```\n\n或者通过data属性切换：\n```css\n[data-theme="dark"] {\n  --bg-primary: #111827;\n}\n```\n\n第二种方式更灵活，允许用户手动切换。', time: '2026-05-08T14:01:30Z' },
    ],
  },
  {
    id: 'ch3',
    title: 'Go微服务错误处理模式',
    createdAt: '2026-05-06T09:00:00Z',
    messages: [
      { role: 'user', content: 'Go微服务中如何统一处理错误？', time: '2026-05-06T09:00:00Z' },
      { role: 'assistant', content: '推荐使用自定义错误类型 + 中间件统一处理的模式：\n\n1. **定义业务错误类型**：包含错误码、消息和HTTP状态码\n2. **中间件拦截**：在HTTP handler层统一捕获并转换为响应\n3. **错误包装**：使用`fmt.Errorf`的`%w`动词包装底层错误\n4. **日志记录**：在中间件层统一记录错误日志\n\n关键是分层处理：底层返回详细错误，上层转换为用户友好的响应。', time: '2026-05-06T09:00:30Z' },
    ],
  },
  {
    id: 'ch4',
    title: '移动端性能监控方案',
    createdAt: '2026-05-03T16:00:00Z',
    messages: [
      { role: 'user', content: '移动端App怎么做性能监控？', time: '2026-05-03T16:00:00Z' },
      { role: 'assistant', content: '移动端性能监控可以从以下维度入手：\n\n**核心指标：**\n- 启动耗时（冷启动/热启动）\n- 页面渲染时间（FPS、掉帧率）\n- 网络请求耗时和成功率\n- 内存使用和泄漏检测\n- 崩溃率和ANR\n\n**实施方案：**\n1. 集成APM SDK（如Firebase Performance、听云）\n2. 自定义埋点上报关键路径耗时\n3. 配置告警阈值和看板\n\n**工具推荐：**\n- Android: Android Profiler + LeakCanary\n- iOS: Instruments + MetricKit\n- 跨平台: Sentry Performance', time: '2026-05-03T16:00:30Z' },
      { role: 'user', content: '有开源的自建方案吗？', time: '2026-05-03T16:01:00Z' },
      { role: 'assistant', content: '有几个不错的开源方案：\n\n1. **Sentry** - 支持Performance Monitoring，可自托管\n2. **SkyWalking** - Apache项目，支持移动端追踪\n3. **Grafana + Prometheus** - 搭配自定义上报SDK使用\n4. **matrix（微信开源）** - Android性能监控框架\n\n建议从Sentry自托管版开始，它的移动端SDK成熟度最高，文档完善，社区活跃。', time: '2026-05-03T16:01:30Z' },
    ],
  },
];

// 默认当前用户
export const currentUser = users[0];
