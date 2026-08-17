/**
 * ⬇️⬇️⬇️ 在这里修改你的个人信息,所有区块都会自动更新 ⬇️⬇️⬇️
 */
const profile = {
  // ===== 基本信息 =====
  name: 'Panda',
  handle: 'DongDong1997', // 改成你的 GitHub 用户名
  title: 'AI-Stack Developer',
  bio: '构建优雅的数字体验 / Building elegant digital experiences.',
  location: 'Neo Tokyo // 2077',
  status: '离线',
  pronouns: 'they/them',

  // ===== 社交链接(图标来自 react-icons) =====
  socials: [
    { type: 'github',   url: 'https://github.com/your-github-username', label: 'GitHub' },
    { type: 'twitter',  url: 'https://twitter.com/your-twitter',         label: 'Twitter / X' },
    { type: 'linkedin', url: 'https://linkedin.com/in/your-linkedin',    label: 'LinkedIn' },
    { type: 'email',    url: 'mailto:you@example.com',                  label: 'Email' },
  ],

  // ===== 技术栈(图标标签) =====
  skills: [
    { name: 'JavaScript', color: '#f7df1e' },
    { name: 'TypeScript', color: '#3178c6' },
    { name: 'React',      color: '#61dafb' },
    { name: 'Vue',        color: '#42b883' },
    { name: 'Node.js',    color: '#83cd29' },
    { name: 'Python',     color: '#3776ab' },
    { name: 'Go',         color: '#00add8' },
    { name: 'Rust',       color: '#dea584' },
    { name: 'Docker',     color: '#2496ed' },
    { name: 'PostgreSQL', color: '#336791' },
  ],

  // ===== 关于我(终端风格的自我介绍) =====
  about: [
    '> 初始化神经链路... [完成]',
    '> 加载核心模块: React, Node.js, PostgreSQL',
    '> 当前任务: 打造下一代 Web 体验',
    '> 兴趣: 开源贡献 / 系统设计 / 复古游戏',
  ],

  // ===== 精选项目配置 =====
  projects: {
    // 数据源:
    //   'api'      → 自动从 GitHub API 拉取你 handle 名下所有公开仓库(实时)
    //   'static'   → 使用下面手写的 projects 数组(完全可控)
    source: 'api',

    // 当 source = 'api' 时生效:
    apiOptions: {
      // 排序字段: 'updated' | 'created' | 'pushed' | 'full_name' | 'stars'
      sort: 'stars',
      // 排序方向: 'asc' | 'desc'
      direction: 'desc',
      // 一次最多拉取多少仓库(最大 100)
      perPage: 30,
      // 排除指定的仓库名(比如个人主页仓库本身)
      excludeRepos: ['DongDong1997.github.io'],
      // 排除包含某些 topic 的仓库(给仓库打 topic 即可一键隐藏)
      excludeTopics: ['archive', 'archived', 'deprecated'],
      // 是否隐藏 fork 来的仓库
      hideForks: true,
      // 是否隐藏已归档的仓库
      hideArchived: true,
      // 最少 star 数,小于这个数的不显示
      minStars: 0,
      // 最多显示几个
      maxDisplay: 6,

      // 前端缓存配置(用于避开 GitHub 未认证 60 次/小时的限流)
      cache: {
        // 是否启用缓存
        enabled: true,
        // 缓存有效期(毫秒)。5 分钟 = 300000,10 分钟 = 600000,1 小时 = 3600000
        ttl: 5 * 60 * 1000,
        // 存储位置:
        //   'session' - sessionStorage,关闭标签页即失效(推荐,默认)
        //   'local'   - localStorage, 跨标签页持久化,刷新浏览器仍在
        //   'memory'  - 仅当前页面内存,刷新即失效(隐私模式兜底)
        storage: 'session',
        // 缓存键前缀,改这里可以一次性清掉所有旧缓存
        keyPrefix: 'gh-repos',
      },
    },

    // 当 source = 'static' 时生效:手写项目列表(完全自定义展示内容)
    list: [
      {
        title: 'NeuralChat',
        description: '基于 LLM 的智能对话平台,支持多模态输入与流式响应。',
        tech: ['React', 'TypeScript', 'OpenAI'],
        url: 'https://github.com/your-github-username/neural-chat',
        stars: 1280,
        forks: 142,
      },
      {
        title: 'PixelForge',
        description: '程序化纹理生成器,使用 WebGPU 在浏览器中实时渲染。',
        tech: ['Rust', 'WASM', 'WebGPU'],
        url: 'https://github.com/your-github-username/pixel-forge',
        stars: 856,
        forks: 67,
      },
      {
        title: 'DevSync',
        description: '团队协作工具,集成 Git 工作流与实时文档协作。',
        tech: ['Vue', 'Node.js', 'WebSocket'],
        url: 'https://github.com/your-github-username/dev-sync',
        stars: 432,
        forks: 38,
      },
      {
        title: 'RetroOS',
        description: '用现代 Web 技术复刻经典操作系统界面的桌面环境。',
        tech: ['Svelte', 'CSS', 'Canvas'],
        url: 'https://github.com/your-github-username/retro-os',
        stars: 256,
        forks: 21,
      },
    ],
  },

  // ===== GitHub Stats 卡片配置 =====
  // 这些图片由第三方服务渲染,无需 API key
  stats: {
    // 主题: tokyonight(其他可选: radical, dark, dracula, monokai, github_dark ...)
    theme: 'tokyonight',
    // 是否显示私有贡献计数
    countPrivate: true,
    // 是否显示所有语言
    showAllLanguages: true,
    // 布局: 卡片内嵌,可填入任意支持的查询参数
    // 文档: https://github.com/anuraghazra/github-readme-stats
  },
}

export default profile