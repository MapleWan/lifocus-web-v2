import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true, // 启用 TypeScript 支持
  // 你可以在这里添加或覆盖规则
  rules: {
    'vue/no-unused-vars': 'off',
    'no-console': 'off',
  },
  ignores: [
    '.github',
    '.vitepress/dist',
    '.vitepress/cache',
    'node_modules',
    'public',
    '**/*.d.ts',
    '.eslint-config-inspector',
    '.vscode',
    '.husky',
    '**/*.md',
  ],
})
