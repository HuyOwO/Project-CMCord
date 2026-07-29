/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Discord-inspired dark theme
        'cm-bg':        '#1e1f22',  // Màn hình nền chính
        'cm-sidebar':   '#2b2d31',  // Sidebar
        'cm-surface':   '#313338',  // Vùng chat
        'cm-input':     '#383a40',  // Ô nhập liệu
        'cm-border':    '#3f4147',  // Viền
        'cm-accent':    '#5865f2',  // Màu chủ đạo (xanh indigo)
        'cm-green':     '#23a55a',  // Online
        'cm-text':      '#dbdee1',  // Text chính
        'cm-muted':     '#80848e',  // Text phụ
      },
    },
  },
  plugins: [],
};
