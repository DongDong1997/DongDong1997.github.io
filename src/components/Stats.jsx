import { motion } from 'framer-motion'
import { FaStar, FaCodeBranch, FaTrophy } from 'react-icons/fa'
import profile from '../config/profile'
import '../styles/stats.css'

/**
 * GitHub 统计卡片
 * 使用 https://github.com/anuraghazra/github-readme-stats 提供的 SVG 图片服务
 * 无需 API Key,直接通过 URL 嵌入即可
 */
export default function Stats() {
  const {
    handle, theme, countPrivate, showAllLanguages,
  } = { ...profile, ...profile.stats }

  const commonParams = `theme=${theme}&hide_border=true&bg_color=0a0a14&title_color=00f0ff&text_color=e8e8ff&icon_color=ff00aa`
  const privateParam = countPrivate ? '&count_private=true' : ''
  const langParam = showAllLanguages ? '&layout=compact&langs_count=8' : ''

  return (
    <section className="section stats-section">
      <h2 className="section-title">github.metrics</h2>

      <div className="stats-grid">
        {/* 总览卡片 */}
        <motion.div
          className="cyber-card stat-img-card"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="corner-br" />
          <div className="card-header">
            <FaStar className="card-icon" />
            <span>// OVERVIEW</span>
          </div>
          <img
            src={`https://github-readme-stats.vercel.app/api?username=${handle}&${commonParams}${privateParam}`}
            alt="GitHub Stats"
            className="stats-img"
            loading="lazy"
          />
        </motion.div>

        {/* 语言分布卡片 */}
        <motion.div
          className="cyber-card stat-img-card"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <span className="corner-br" />
          <div className="card-header">
            <FaCodeBranch className="card-icon" />
            <span>// LANGUAGES</span>
          </div>
          <img
            src={`https://github-readme-stats.vercel.app/api/top-langs/?username=${handle}&${commonParams}${langParam}`}
            alt="Top Languages"
            className="stats-img"
            loading="lazy"
          />
        </motion.div>

        {/* 连续打卡 streak */}
        <motion.div
          className="cyber-card stat-img-card full-width"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <span className="corner-br" />
          <div className="card-header">
            <FaTrophy className="card-icon" />
            <span>// STREAK_STATS</span>
          </div>
          <img
            src={`https://github-readme-streak-stats.herokuapp.com/?user=${handle}&theme=${theme}&hide_border=true&background=0a0a14&ring=00f0ff&fire=ff00aa&currStreakLabel=00f0ff`}
            alt="GitHub Streak"
            className="stats-img"
            loading="lazy"
          />
        </motion.div>

        {/* GitHub Activity Graph(贡献热力图) */}
        <motion.div
          className="cyber-card stat-img-card full-width"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <span className="corner-br" />
          <div className="card-header">
            <span>// ACTIVITY_GRAPH</span>
          </div>
          <img
            src={`https://github-readme-activity-graph.vercel.app/graph?username=${handle}&theme=react-dark&hide_border=true&area=true&area_color=00f0ff&color=ff00aa&line=00f0ff&point=ff00aa`}
            alt="GitHub Activity Graph"
            className="stats-img"
            loading="lazy"
          />
        </motion.div>

        {/* 奖杯/统计小条 */}
        <motion.div
          className="cyber-card trophy-card"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <span className="corner-br" />
          <div className="card-header">
            <FaTrophy className="card-icon" />
            <span>// TROPHIES</span>
          </div>
          <img
            src={`https://github-profile-trophy.vercel.app/?username=${handle}&theme=${theme}&no-frame=true&column=4&margin-w=4&margin-h=4`}
            alt="GitHub Trophies"
            className="stats-img"
            loading="lazy"
          />
        </motion.div>
      </div>
    </section>
  )
}