/**
 * 一键推送本地代码到 GitHub 的脚本
 *
 * 用法:
 *   1. 打开 scripts/push-to-github.js,把 USERNAME 和 REPO 改成你的
 *   2. node scripts/push-to-github.js
 *
 * 行为:
 *   - 如果 .git 不存在 → git init
 *   - 如果 origin 未配置 → 询问你后 git remote add
 *   - 添加所有文件并提交
 *   - 推送到 main 分支
 */

import { execSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { createInterface } from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'

// ⬇️⬇️⬇️ 在这里改成你的 ⬇️⬇️⬇️
const USERNAME = 'your-github-username'
const REPO = 'your-github-username.github.io'   // 个人主页模式;普通项目随便起名
// ⬆️⬆️⬆️ 在这里改成你的 ⬆️⬆️⬆️

const REMOTE_URL = `https://github.com/${USERNAME}/${REPO}.git`
const COMMIT_MSG = 'feat: initial cyberpunk profile page'

const run = (cmd, opts = {}) => {
  console.log(`\n$ ${cmd}`)
  try {
    return execSync(cmd, { stdio: 'inherit', ...opts })
  } catch (e) {
    console.error(`❌ 命令失败: ${cmd}`)
    throw e
  }
}

const main = async () => {
  const rl = createInterface({ input, output })

  console.log('========================================')
  console.log('🚀 GitHub 一键推送脚本')
  console.log(`   目标仓库: ${REMOTE_URL}`)
  console.log('========================================\n')

  // 1. 初始化 git(如果需要)
  if (!existsSync('.git')) {
    run('git init')
    run('git branch -M main')
  } else {
    console.log('✅ 已存在 .git,跳过初始化')
  }

  // 2. 配置远程仓库
  try {
    run('git remote get-url origin', { stdio: 'pipe' })
    console.log('✅ 已存在 origin 远程仓库')
  } catch {
    console.log(`即将添加远程仓库: ${REMOTE_URL}`)
    const ans = await rl.question('是否继续?(y/n): ')
    if (ans.trim().toLowerCase() !== 'y') {
      console.log('已取消')
      process.exit(0)
    }
    run(`git remote add origin ${REMOTE_URL}`)
  }

  // 3. 检查身份
  try {
    const name = execSync('git config user.name', { stdio: 'pipe' }).toString().trim()
    const email = execSync('git config user.email', { stdio: 'pipe' }).toString().trim()
    console.log(`✅ git 身份: ${name} <${email}>`)
  } catch {
    console.log('⚠️  未检测到 user.name / user.email')
    const name = await rl.question('请输入你的 git 用户名: ')
    const email = await rl.question('请输入你的 git 邮箱: ')
    run(`git config user.name "${name}"`)
    run(`git config user.email "${email}"`)
  }

  // 4. 预览将被提交的文件
  console.log('\n即将添加的文件(节选):')
  try {
    execSync('git status --short', { stdio: 'inherit' })
  } catch {
    /* 第一次 add 前可能没文件,无所谓 */
  }

  // 5. 添加并提交
  run('git add .')
  run(`git commit -m "${COMMIT_MSG}"`)

  // 6. 推送
  console.log('\n📤 开始推送到 GitHub...')
  try {
    run('git push -u origin main')
  } catch {
    console.log('\n⚠️  push 失败,可能原因:')
    console.log('  1) 远程仓库非空 → 请先在 GitHub 上确认仓库是空的,或执行 git pull --rebase')
    console.log('  2) 权限问题 → HTTPS 仓库需要 Personal Access Token,SSH 仓库需要配置公钥')
    console.log('  3) 远程仓库不存在 → 请检查用户名/仓库名拼写')
    process.exit(1)
  }

  rl.close()
  console.log('\n========================================')
  console.log('🎉 推送成功!')
  console.log(`👉 仓库地址: https://github.com/${USERNAME}/${REPO}`)
  if (REPO === `${USERNAME}.github.io`) {
    console.log(`👉 稍后 1-2 分钟访问: https://${USERNAME}.github.io`)
  }
  console.log('========================================')
}

main().catch(err => {
  console.error('❌ 出错:', err.message)
  process.exit(1)
})