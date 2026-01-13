import { defineConfig } from 'unocss'

export default defineConfig({
  // ...UnoCSS options
  shortcuts: [
    // ['border-circle', 'border rounded-full'],
    ['text-overflow', 'overflow-hidden text-ellipsis whitespace-nowrap'],
    ['div-flex-center', 'flex items-center justify-center'],
  ],
  theme: {
    colors: {
      primary: {
        // 100: '#0a0a0a',
        // 90: '#1a1a1a',
        // 80: '#2d2d2d',
        // 70: '#404040',
        // 60: '#525252',
        // 50: '#656565',
        // 40: '#787878',
        // 30: '#8a8a8a',
        // 20: '#9d9d9d',
        // 10: '#b0b0b0',
        0: '#f2f2f2',
        10: '#e0d8eb' /* 最浅色 */,
        20: '#c8bdd6',
        30: '#b0a2c1',
        40: '#9887ac',
        50: '#806c97',
        60: '#685182',
        70: '#50366d',
        80: '#3d2266' /* 主色，深黑紫 */,
        90: '#2d194c',
        100: '#1d1132' /* 最深色，接近纯黑 */,
      },
      background: {
        primary: '#f4f7fa',
        secondary: '#161c2d',
        light: '#fafafa',
        white: '#fff',
        hover: '#eeedf5',
      },
      // font: {
      //   primary: '#0a0a0a',
      //   revert: '#f2f2f2',
      //   hover: '#834ec2',
      // },
    },
  },
})
