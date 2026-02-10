# CustomCard 自定义卡片组件

基于 TDesign Vue Next 的 Card 组件封装的自定义卡片组件，提供了更丰富的功能和更好的用户体验。

## 功能特性

- ✅ 基于 TDesign Card 组件
- ✅ 支持多种尺寸（small、medium、large）
- ✅ 可配置的阴影效果
- ✅ 支持封面图片
- ✅ 可点击交互
- ✅ 加载状态
- ✅ 自定义样式
- ✅ 响应式设计

## Props 参数

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| title | string | - | 卡片标题 |
| subtitle | string | - | 卡片副标题 |
| shadow | boolean | false | 是否显示阴影 |
| hoverShadow | boolean | true | 悬停时是否显示阴影 |
| size | 'small' \| 'medium' \| 'large' | 'medium' | 卡片尺寸 |
| bordered | boolean | true | 是否显示边框 |
| clickable | boolean | false | 是否可点击 |
| customClass | string | - | 自定义类名 |
| cover | string | - | 封面图片 URL |
| loading | boolean | false | 加载状态 |

## Events 事件

| 事件名 | 参数 | 说明 |
|--------|------|------|
| click | - | 卡片点击事件（仅在 clickable 为 true 时触发）|

## Slots 插槽

| 插槽名 | 说明 |
|--------|------|
| default | 卡片内容区域 |
| actions | 操作区域 |

## 使用示例

### 基础用法

```vue
<template>
  <CustomCard 
    title="文章标题" 
    subtitle="作者: 张三 | 2024-01-15"
    clickable
    @click="handleClick"
  >
    <p>这里是卡片内容...</p>
    
    <template #actions>
      <button @click.stop="handleEdit">编辑</button>
      <button @click.stop="handleDelete">删除</button>
    </template>
  </CustomCard>
</template>

<script setup>
import CustomCard from '@/components/CustomCard/index.vue'

function handleClick() {
  console.log('卡片被点击')
}

function handleEdit() {
  console.log('编辑操作')
}

function handleDelete() {
  console.log('删除操作')
}
</script>
```

### 带封面的卡片

```vue
<CustomCard 
  title="Vue 3 教程" 
  :cover="'https://example.com/cover.jpg'"
  size="large"
>
  <p>这是一篇关于 Vue 3 的详细教程...</p>
</CustomCard>
```

### 不同尺寸

```vue
<!-- 小尺寸 -->
<CustomCard title="小卡片" size="small">
  简短内容
</CustomCard>

<!-- 中等尺寸（默认） -->
<CustomCard title="中等卡片" size="medium">
  中等内容
</CustomCard>

<!-- 大尺寸 -->
<CustomCard title="大卡片" size="large">
  详细内容
</CustomCard>
```

### 特殊样式

```vue
<!-- 无边框 -->
<CustomCard 
  title="无边框卡片" 
  :bordered="false"
  custom-class="bg-blue-50"
>
  自定义背景色
</CustomCard>

<!-- 固定阴影 -->
<CustomCard 
  title="固定阴影" 
  :shadow="true"
>
  始终显示阴影效果
</CustomCard>
```

### 加载状态

```vue
<CustomCard 
  title="加载中..." 
  :loading="true"
  custom-class="h-32"
>
  正在加载内容...
</CustomCard>
```

## 注意事项

1. 当 `clickable` 为 `true` 时，整个卡片区域都可以点击
2. 在操作按钮上使用 `@click.stop` 来阻止事件冒泡
3. `custom-class` 可以用来添加自定义样式
4. 封面图片会自动适应容器大小
5. 组件已内置响应式设计，在移动端会有适当的调整

## 查看演示

运行项目后访问 `/components/custom-card/demo` 查看完整的使用示例。