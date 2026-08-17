import { useEffect, useState } from 'react'
import {
  FaGithub, FaTwitter, FaLinkedin, FaEnvelope, FaMapMarkerAlt,
} from 'react-icons/fa'
import { motion } from 'framer-motion'
import profile from '../config/profile'
import '../styles/hero.css'

const iconMap = {
  github: FaGithub,
  twitter: FaTwitter,
  linkedin: FaLinkedin,
  email: FaEnvelope,
}

// 打字机效果 hook
function useTypewriter(text, speed = 80) {
  const [out, setOut] = useState('')
  useEffect(() => {
    let i = 0
    setOut('')
    const id = setInterval(() => {
      i++
      setOut(text.slice(0, i))
      if (i >= text.length) clearInterval(id)
    }, speed)
    return () => clearInterval(id)
  }, [text, speed])
  return out
}

export default function Hero() {
  const typedTitle = useTypewriter(profile.title, 90)

  return (
    <motion.section
      className="hero section"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="hero-content">
        {/* 终端窗口风格的标题区 */}
        <div className="terminal-window">
          <div className="terminal-bar">
            <span className="dot dot-red" />
            <span className="dot dot-yellow" />
            <span className="dot dot-green" />
            <span className="terminal-title">~/welcome.sh</span>
          </div>
          <div className="terminal-body">
            <div className="line">
              <span className="prompt">$</span>
              <span className="cmd">whoami</span>
            </div>
            <h1 className="hero-name">
              <span className="bracket">{'<'}</span>
              {profile.name}
              <span className="bracket">{'/>'}</span>
            </h1>

            <div className="line">
              <span className="prompt">$</span>
              <span className="cmd">cat ./title.txt</span>
            </div>
            <h2 className="hero-title">
              {typedTitle}
              <span className="cursor">▌</span>
            </h2>

            <div className="line">
              <span className="prompt">$</span>
              <span className="cmd">echo $BIO</span>
            </div>
            <p className="hero-bio">{profile.bio}</p>

            <div className="hero-meta">
              <span><FaMapMarkerAlt /> {profile.location}</span>
              <span className="status-dot">
                <span className="blinking-dot" /> {profile.status}
              </span>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="hero-actions">
          <a
            className="cyber-btn"
            href={`https://github.com/${profile.handle}`}
            target="_blank"
            rel="noreferrer"
          >
            <FaGithub /> /github
          </a>
          <a className="cyber-btn pink" href="#projects">
            // view_projects
          </a>
        </div>

        {/* 社交图标 */}
        <div className="hero-socials">
          {profile.socials.map(s => {
            const Icon = iconMap[s.type]
            if (!Icon) return null
            return (
              <a
                key={s.type}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="social-link"
                aria-label={s.label}
                title={s.label}
              >
                <Icon />
              </a>
            )
          })}
        </div>
      </div>
    </motion.section>
  )
}