/**
 * 自动部署脚本
 *
 * 用法:
 *   1. 把下面 `homepage` 的 your-username 替换成你的 GitHub 用户名
 *   2. node deploy.js  (会构建并自动 push 到 gh-pages 分支)
 *
 * 如果不想用这个脚本,也可以直接:
 *   npm run build
 *   npx gh-pages -d dist
 */

import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'

const GITHUB_USER = 'your-github-username' // ⬅️⬅️⬅️ 改成你的 GitHub 用户名
const REPO_NAME   = 'github-page'           // 如果仓库名不同也改这里

const homepage = `https://${GITHUB_USER}.github.io/${REPO_NAME}/`

console.log(`🏠 目标地址: ${homepage}`)

// 备份并临时改写 package.json 的 homepage 字段
const pkgPath = 'package.json'
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
const originalHomepage = pkg.homepage
pkg.homepage = homepage
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')

try {
  console.log('📦 开始构建...')
  execSync('npm run build', { stdio: 'inherit' })

  console.log('🚀 推送到 gh-pages 分支...')
  execSync('npx gh-pages -d dist', { stdio: 'inherit' })

  console.log('✅ 部署完成!')
  console.log(`👉 访问: ${homepage}`)
} catch (err) {
  console.error('❌ 部署失败:', err.message)
  process.exitCode = 1
} finally {
  // 还原 package.json
  pkg.homepage = originalHomepage
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
}