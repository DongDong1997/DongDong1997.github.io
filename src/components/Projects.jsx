import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  FaStar, FaCodeBranch, FaExternalLinkAlt, FaFolderOpen,
  FaSpinner, FaExclamationTriangle, FaSyncAlt, FaSort,
  FaBolt, FaTrash,
} from 'react-icons/fa'
import profile from '../config/profile'
import useGitHubRepos from '../hooks/useGitHubRepos'
import '../styles/projects.css'

/**
 * 把"多少毫秒前"格式化成易读的相对时间
 */
function formatAge(ms) {
  if (ms == null) return ''
  const sec = Math.floor(ms / 1000)
  if (sec < 60) return `${sec}s ago`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ${sec % 60}s ago`
  const hr = Math.floor(min / 60)
  return `${hr}h ${min % 60}m ago`
}

/**
 * 把"还有多久过期"格式化成倒计时
 */
function formatTTL(ms) {
  const sec = Math.max(0, Math.floor(ms / 1000))
  if (sec < 60) return `${sec}s`
  const min = Math.floor(sec / 60)
  const s = sec % 60
  if (min < 60) return `${min}m ${s}s`
  return `${Math.floor(min / 60)}h ${min % 60}m`
}

/**
 * 项目展示区
 * 根据 profile.projects.source 自动选择:
 *   - 'api'    → 调用 GitHub REST API 实时拉取(带前端缓存)
 *   - 'static' → 使用 profile.projects.list 中手写的项目
 */
export default function Projects() {
  const { source, apiOptions, list } = profile.projects
  const [sortBy, setSortBy] = useState(apiOptions.sort || 'stars')

  // 拉取 GitHub 仓库(自动带缓存)
  const {
    repos, loading, error,
    fromCache, cacheAge,
    refetch, clearCache,
  } = useGitHubRepos({
    username: profile.handle,
    sort: apiOptions.sort,
    direction: apiOptions.direction,
    perPage: apiOptions.perPage,
    excludeRepos: apiOptions.excludeRepos,
    excludeTopics: apiOptions.excludeTopics,
    hideForks: apiOptions.hideForks,
    hideArchived: apiOptions.hideArchived,
    minStars: apiOptions.minStars,
    cache: apiOptions.cache, // ⭐ 传入缓存配置
  })

  // 最终展示的数据
  const projects = useMemo(() => {
    let data = source === 'api' ? repos : list

    if (source === 'api') {
      const sorted = [...data]
      if (sortBy === 'stars') sorted.sort((a, b) => b.stars - a.stars)
      else if (sortBy === 'forks') sorted.sort((a, b) => b.forks - a.forks)
      else if (sortBy === 'updated') {
        sorted.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      } else if (sortBy === 'name') sorted.sort((a, b) => a.title.localeCompare(b.title))
      data = sorted
    }

    return data.slice(0, apiOptions.maxDisplay || 6)
  }, [source, repos, list, sortBy, apiOptions.maxDisplay])

  // 缓存是否启用
  const cacheOn = apiOptions.cache?.enabled !== false
  // 距离过期还剩多久
  const remainingTTL = cacheOn && cacheAge != null
    ? apiOptions.cache.ttl - cacheAge
    : null

  return (
    <section className="section projects-section" id="projects">
      <div className="projects-header">
        <h2 className="section-title">
          {source === 'api' ? 'live.repos' : 'featured.projects'}
        </h2>

        {/* 仅在 API 模式下显示工具栏 */}
        {source === 'api' && (
          <div className="projects-toolbar">
            {/* 缓存命中徽章 —— 访客能直观看到数据来自缓存 */}
            {cacheOn && fromCache && cacheAge != null && !loading && !error && (
              <span
                className="cache-badge"
                title={`数据来自本地缓存,将在 ${formatTTL(remainingTTL)} 后重新拉取`}
              >
                <FaBolt /> cached · {formatAge(cacheAge)}
              </span>
            )}

            <div className="sort-control">
              <FaSort />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                aria-label="排序方式"
              >
                <option value="stars">most starred</option>
                <option value="forks">most forked</option>
                <option value="updated">recently updated</option>
                <option value="name">name (A-Z)</option>
              </select>
            </div>

            <button
              className="refresh-btn"
              onClick={refetch}
              disabled={loading}
              title="强制从 GitHub 重新拉取(跳过缓存)"
            >
              <FaSyncAlt className={loading ? 'spin' : ''} />
            </button>

            {cacheOn && (
              <button
                className="refresh-btn pink"
                onClick={() => { clearCache(); refetch() }}
                disabled={loading}
                title="清空本地缓存并重新拉取"
              >
                <FaTrash />
              </button>
            )}
          </div>
        )}
      </div>

      {/* 加载状态 */}
      {source === 'api' && loading && (
        <div className="projects-status">
          <FaSpinner className="spin" /> // fetching repos from github...
        </div>
      )}

      {/* 错误状态 */}
      {source === 'api' && error && (
        <div className="projects-status error">
          <FaExclamationTriangle /> {error}
          <button onClick={refetch}>retry</button>
        </div>
      )}

      {/* 卡片列表 */}
      {(!loading && !error) && (
        <div className="projects-grid">
          {projects.map((p, i) => (
            <motion.a
              key={p.title}
              href={p.url}
              target="_blank"
              rel="noreferrer"
              className="cyber-card project-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <span className="corner-br" />

              <div className="project-header">
                <FaFolderOpen className="folder-icon" />
                <FaExternalLinkAlt className="external-icon" />
              </div>

              <h3 className="project-title">{p.title}</h3>
              <p className="project-desc">{p.description}</p>

              <div className="project-tech">
                {p.tech.map(t => (
                  <span key={t} className="tech-tag">{t}</span>
                ))}
              </div>

              <div className="project-stats">
                <span><FaStar /> {p.stars.toLocaleString()}</span>
                <span><FaCodeBranch /> {p.forks.toLocaleString()}</span>
              </div>
            </motion.a>
          ))}

          {projects.length === 0 && (
            <p className="projects-empty">// 没有找到符合条件的仓库</p>
          )}
        </div>
      )}

      <div className="projects-footer">
        <a
          className="cyber-btn pink"
          href={`https://github.com/${profile.handle}?tab=repositories`}
          target="_blank"
          rel="noreferrer"
        >
          // view_all_on_github
        </a>
      </div>
    </section>
  )
}