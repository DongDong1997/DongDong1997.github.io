# 🌃 Cyberpunk GitHub Profile Page

一个赛博朋克风格的自定义 GitHub 个人主页,基于 **React + Vite** 构建。

> 🔥 动态背景 / 终端风格介绍 / GitHub 实时统计 / 项目展示区 / 访客计数

---

## ✨ 效果预览

启动开发服务器:
```bash
npm install
npm run dev
```

打开 http://localhost:5173 查看效果。

---

## 🚀 部署到 GitHub Pages

### 方式一:个人主页(推荐 ⭐)

> 适合作为 `username.github.io` 主站,效果最酷,地址最简短。

1. 在 GitHub 上新建一个**与用户名同名**的仓库:
   ```
   仓库名: 你的用户名.github.io
   说明:   Public 公共仓库
   不要勾选 "Add a README file"
   ```

2. 修改项目里两处用户名:
   - `src/config/profile.js` → 把所有 `your-github-username` 改成你的真实用户名
   - `deploy.js` → 把 `GITHUB_USER` 改成你的真实用户名

3. 把本地代码推送到该仓库(初次推送):
   ```bash
   git init
   git add .
   git commit -m "init: cyberpunk profile page"
   git branch -M main
   git remote add origin https://github.com/你的用户名/你的用户名.github.io.git
   git push -u origin main
   ```

4. 一键部署:
   ```bash
   npm install
   npm run deploy
   ```

5. 等 1-2 分钟,访问 `https://你的用户名.github.io` 即可看到效果 ✨

### 方式二:项目仓库

如果你希望保留 `username.github.io` 给博客或简历使用,可以把这个项目放到独立仓库:

1. 仓库名随意,例如 `cyber-profile`
2. 同样修改 `src/config/profile.js` 和 `deploy.js` 的用户名
3. 修改 GitHub 仓库的 Pages 设置:
   - Settings → Pages → Build and deployment → Branch: 选 `gh-pages`,目录 `/ (root)`
4. 运行 `npm run deploy`

访问地址会是:`https://你的用户名.github.io/cyber-profile/`

> ✅ 本项目已经把 `vite.config.js` 中的 `base` 设置为 `./`,所以两种部署方式都不需要再改配置。

---

## 📝 自定义内容

所有可定制的信息都在 **`src/config/profile.js`** 这一个文件中,集中管理:

| 字段 | 用途 |
|------|------|
| `name` / `handle` / `title` / `bio` | Hero 区的展示信息 |
| `socials` | 社交链接(图标自动匹配) |
| `skills` | 技术栈标签(含自定义颜色) |
| `about` | 关于我的终端风格多行文本 |
| `projects.source` | `'api'` 自动拉取 GitHub 仓库 / `'static'` 手动配置 |
| `projects.apiOptions` | API 模式下的排序、过滤、限制参数 |
| `projects.list` | static 模式下的手写项目列表 |
| `stats.theme` | GitHub 卡片的主题色 |

修改后保存,Vite 会自动热更新。

### 两种项目数据源

项目区支持两种模式,在 `profile.js` 中切换:

#### ① API 模式(默认,推荐) — `source: 'api'`

自动调用 [GitHub REST API](https://docs.github.com/en/rest/repos/repos#list-repositories-for-a-user) 拉取你名下的公开仓库,实时展示真实 star / fork / 描述 / 语言 / topic。

```js
projects: {
  source: 'api',
  apiOptions: {
    sort: 'stars',                  // 排序:stars / updated / created / pushed / full_name
    direction: 'desc',              // asc / desc
    perPage: 30,                    // 一次拉取的最大数量(最大 100)
    excludeRepos: ['my-homepage'],  // 黑名单仓库(比如个人主页仓库本身)
    excludeTopics: ['archive'],     // 包含这些 topic 的仓库会被隐藏
    hideForks: true,                // 隐藏 fork 来的项目
    hideArchived: true,             // 隐藏已归档项目
    minStars: 0,                    // 最少 star 数门槛
    maxDisplay: 6,                  // 最多展示几个
  },
}
```

页面运行时还会额外提供一个**前端二次排序**下拉框:most starred / most forked / recently updated / name (A-Z),访客可即时切换。

> ⚠️ **GitHub API 限流**:未认证请求每小时 60 次。本项目是纯前端、静态部署,所以无法使用 token。访客数量大的页面偶尔会触发限流,卡片会显示错误提示与重试按钮。

#### 前端缓存(API 模式自带)

为缓解限流,`apiOptions.cache` 默认开启 5 分钟前端缓存。配置项:

```js
apiOptions: {
  // ... 其他筛选配置
  cache: {
    enabled: true,                       // 是否启用
    ttl: 5 * 60 * 1000,                  // 5 分钟内复用缓存
    storage: 'session',                  // 'session' / 'local' / 'memory'
    keyPrefix: 'gh-repos',               // 改这个值能一次性作废所有旧缓存
  },
}
```

| 存储类型 | 行为 |
|----------|------|
| `'session'`(默认) | sessionStorage。**关闭标签页就失效**,刷新或同标签页跳转仍有效 —— 推荐 |
| `'local'` | localStorage。**跨标签页持久化**,刷新浏览器、甚至关闭后重开,仍能复用 |
| `'memory'` | 仅当前页面内存。刷新即失效。**适合隐私模式兜底**,本项目已自动降级到这里 |

**缓存命中时**:页面右上角会出现一个青色徽章 ⚡ `cached · 12s ago`,鼠标悬停会显示"将在 X 后过期"。

**强制刷新**:点击工具栏里的圆形 ⟳ 按钮会**跳过缓存**,直接请求 GitHub。

**清空缓存**:旁边的 🗑 粉红按钮会清掉本地缓存并立即重新拉取。

**自动作废规则**:缓存键里包含 `username + sort + direction + perPage + 所有过滤条件`,所以你换用户名、改筛选规则都会自动重新请求,不会出现"用错的数据"。

#### ② Static 模式 — `source: 'static'`

完全手写项目列表,可以包含 API 拿不到的字段(例如自定义描述、未来项目等):

```js
projects: {
  source: 'static',
  list: [
    { title: '...', description: '...', tech: [...], url: '...', stars: 100, forks: 10 },
  ],
}
```

### GitHub 统计卡片服务说明

本项目使用了以下第三方开源服务,它们都会通过你的用户名渲染图片:

- **[github-readme-stats](https://github.com/anuranhazra/github-readme-stats)** — 总览卡片 + 语言卡片
- **[github-readme-streak-stats](https://github.com/DenverCoder1/github-readme-streak-stats)** — 连续打卡
- **[github-readme-activity-graph](https://github.com/Ashutosh00710/github-readme-activity-graph)** — 贡献图
- **[github-profile-trophy](https://github.com/ryo-ma/github-profile-trophy)** — 奖杯墙
- **[komarev visitor counter](https://github.com/antonkomarev/github-profile-views-counter)** — 访客计数

> 💡 如果某些卡片加载慢,可以编辑 `src/components/Stats.jsx` 把对应 `<img>` 删除。

---

## 🎨 主题定制

赛博朋克配色定义在 `src/styles/global.css` 的 `:root` 变量里:

```css
--neon-cyan:   #00f0ff   /* 主青色 */
--neon-pink:   #ff00aa   /* 霓虹粉 */
--neon-purple: #b400ff   /* 紫色辉光 */
--neon-yellow: #f0ff00   /* 终端黄 */
--bg-base:     #0a0a14   /* 深空底色 */
```

想换成其他风格?直接覆盖这些变量即可。

---

## 🛠️ 技术栈

- **React 18** + **Vite 5** — 快速构建与开发体验
- **Framer Motion** — 滚动入场动画
- **react-icons** — 图标库
- **Canvas 2D** — 动态背景(网格 + 粒子 + 连线)

---

## 📂 目录结构

```
github-page/
├── public/                  # 静态资源
├── src/
│   ├── components/
│   │   ├── Background.jsx   # 动态背景(canvas)
│   │   ├── Navbar.jsx       # 顶部导航
│   │   ├── Hero.jsx         # 个人介绍
│   │   ├── About.jsx        # 关于我 + 技能
│   │   ├── Stats.jsx        # GitHub 统计卡片
│   │   ├── Projects.jsx     # 精选项目
│   │   └── Footer.jsx       # 底部 + 访客计数
│   ├── config/
│   │   └── profile.js       # ⭐ 所有个人信息都在这里
│   ├── styles/
│   │   ├── global.css       # 全局样式与 CSS 变量
│   │   ├── background.css   # 背景样式
│   │   ├── navbar.css
│   │   ├── hero.css
│   │   ├── about.css
│   │   ├── stats.css
│   │   ├── projects.css
│   │   └── footer.css
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
└── deploy.js                # 一键部署脚本
```

---

## 📄 License

MIT — 随意使用,尽情折腾。