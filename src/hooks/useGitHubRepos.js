import { useEffect, useRef, useState } from 'react'

/**
 * 内存缓存兜底(用于隐私模式 / 浏览器禁用 storage 的场景)
 */
const memoryCache = new Map()

/**
 * 安全地访问 Web Storage。
 * 某些隐私模式下访问 localStorage/sessionStorage 会抛 SecurityError,
 * 这里统一捕获并 fallback 到内存 Map。
 */
function getStorage(type) {
  if (type === 'memory') return memoryCache
  try {
    const win = typeof window !== 'undefined' ? window : null
    if (!win) return memoryCache
    const storage = type === 'local' ? win.localStorage : win.sessionStorage
    // 探测性访问,失败则降级
    const probe = '__cache_probe__'
    storage.setItem(probe, '1')
    storage.removeItem(probe)
    return storage
  } catch {
    return memoryCache
  }
}

/**
 * 生成缓存键 —— 把所有影响结果的参数都序列化进去,
 * 避免不同用户名/不同筛选规则意外复用同一份缓存。
 */
function buildCacheKey(prefix, opts) {
  const relevant = {
    u: opts.username,
    s: opts.sort,
    d: opts.direction,
    p: opts.perPage,
    er: opts.excludeRepos?.slice().sort(),
    et: opts.excludeTopics?.slice().sort(),
    hf: opts.hideForks,
    ha: opts.hideArchived,
    ms: opts.minStars,
  }
  return `${prefix}:${JSON.stringify(relevant)}`
}

/**
 * 读取缓存,返回 { data, timestamp } 或 null
 */
function readCache(storage, key) {
  try {
    const raw = storage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (typeof parsed.timestamp !== 'number' || !Array.isArray(parsed.data)) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

/**
 * 写入缓存
 */
function writeCache(storage, key, data) {
  try {
    storage.setItem(key, JSON.stringify({
      data,
      timestamp: Date.now(),
    }))
  } catch {
    /* 配额超限等情况静默忽略 */
  }
}

/**
 * 调用 GitHub REST API 拉取某个用户的公开仓库列表
 *
 * 文档:https://docs.github.com/en/rest/repos/repos#list-repositories-for-a-user
 *
 * @param {object} options
 * @param {string} options.username
 * @param {string} [options.sort='updated']
 * @param {string} [options.direction='desc']
 * @param {number} [options.perPage=30]
 * @param {string[]} [options.excludeRepos=[]]
 * @param {string[]} [options.excludeTopics=[]]
 * @param {boolean} [options.hideForks=true]
 * @param {boolean} [options.hideArchived=true]
 * @param {number} [options.minStars=0]
 *
 * 缓存相关:
 * @param {object} [options.cache]
 * @param {boolean} [options.cache.enabled=true]    是否启用缓存
 * @param {number}  [options.cache.ttl=300000]     缓存有效期(毫秒),默认 5 分钟
 * @param {string}  [options.cache.storage='session'] 'session' / 'local' / 'memory'
 * @param {string}  [options.cache.keyPrefix='gh-repos'] 缓存键前缀
 *
 * @returns {{
 *   repos: Array,
 *   loading: boolean,
 *   error: string | null,
 *   fromCache: boolean,
 *   cachedAt: number | null,
 *   cacheAge: number | null,
 *   refetch: (force?: boolean) => Promise<void>,
 *   clearCache: () => void,
 * }}
 */
export default function useGitHubRepos({
  username,
  sort = 'updated',
  direction = 'desc',
  perPage = 30,
  excludeRepos = [],
  excludeTopics = [],
  hideForks = true,
  hideArchived = true,
  minStars = 0,
  cache = {},
} = {}) {
  const {
    enabled: cacheEnabled = true,
    ttl = 5 * 60 * 1000, // 5 分钟
    storage: storageType = 'session',
    keyPrefix = 'gh-repos',
  } = cache

  const storage = getStorage(storageType)
  const cacheKey = buildCacheKey(keyPrefix, {
    username, sort, direction, perPage, excludeRepos,
    excludeTopics, hideForks, hideArchived, minStars,
  })

  const [repos, setRepos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [fromCache, setFromCache] = useState(false)
  const [cachedAt, setCachedAt] = useState(null)
  const [, forceRerender] = useState(0) // 用于驱动 cacheAge 重新计算

  const inFlightRef = useRef(false) // 防止并发请求

  // ============================================================
  // 拉取主流程
  // ============================================================
  const fetchRepos = async (force = false) => {
    if (!username) {
      setError('未配置 GitHub 用户名')
      return
    }

    // ---- 1. 先尝试读缓存(未传 force 时)----
    if (cacheEnabled && !force) {
      const hit = readCache(storage, cacheKey)
      if (hit && Date.now() - hit.timestamp < ttl) {
        setRepos(hit.data)
        setFromCache(true)
        setCachedAt(hit.timestamp)
        setError(null)
        setLoading(false)
        return
      }
    }

    // ---- 2. 真去请求 GitHub API ----
    if (inFlightRef.current) return
    inFlightRef.current = true
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(
        `https://api.github.com/users/${username}/repos?per_page=${perPage}&sort=${sort}&direction=${direction}&type=owner`,
        { headers: { Accept: 'application/vnd.github+json' } }
      )

      if (!res.ok) {
        if (res.status === 403) {
          throw new Error('GitHub API 限流(未认证 60 次/小时),请稍后再试')
        }
        if (res.status === 404) {
          throw new Error(`找不到用户 "${username}"`)
        }
        throw new Error(`GitHub API 请求失败: ${res.status}`)
      }

      const data = await res.json()

      // 数据清洗与筛选
      const cleaned = data
        .filter(repo => {
          if (hideForks && repo.fork) return false
          if (hideArchived && repo.archived) return false
          if (excludeRepos.includes(repo.name)) return false
          if (repo.stargazers_count < minStars) return false
          if (excludeTopics.length && repo.topics?.some(t => excludeTopics.includes(t))) return false
          return true
        })
        .map(repo => ({
          title: repo.name,
          description: repo.description || '// no description',
          tech: repo.topics?.length ? repo.topics : (repo.language ? [repo.language] : []),
          url: repo.html_url,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          language: repo.language,
          updatedAt: repo.updated_at,
        }))

      // ---- 3. 写入缓存 ----
      const now = Date.now()
      if (cacheEnabled) {
        writeCache(storage, cacheKey, cleaned)
      }

      setRepos(cleaned)
      setFromCache(false)
      setCachedAt(now)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      inFlightRef.current = false
    }
  }

  // ============================================================
  // 清空缓存(供外部调用)
  // ============================================================
  const clearCache = () => {
    try {
      storage.removeItem(cacheKey)
    } catch {
      memoryCache.delete(cacheKey)
    }
    setFromCache(false)
    setCachedAt(null)
  }

  // ============================================================
  // 副作用:参数变化时重新拉取(会走缓存)
  // ============================================================
  useEffect(() => {
    fetchRepos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, sort, direction, perPage])

  // ============================================================
  // 缓存年龄实时刷新(让"缓存于 12s 前"这种文字会动态变化)
  // ============================================================
  useEffect(() => {
    if (!cachedAt) return
    const id = setInterval(() => forceRerender(n => n + 1), 1000)
    return () => clearInterval(id)
  }, [cachedAt])

  const cacheAge = cachedAt ? Date.now() - cachedAt : null

  return {
    repos,
    loading,
    error,
    fromCache,
    cachedAt,
    cacheAge,
    // refetch() → 强制刷新,跳过缓存
    refetch: () => fetchRepos(true),
    clearCache,
  }
}