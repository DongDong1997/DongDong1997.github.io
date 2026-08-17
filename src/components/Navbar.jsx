import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import '../styles/navbar.css'

const navItems = [
  { label: 'home',     href: '#home' },
  { label: 'about',    href: '#about' },
  { label: 'metrics',  href: '#metrics' },
  { label: 'projects', href: '#projects' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [time, setTime] = useState('')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)

    // 实时时间显示
    const tick = () => {
      const d = new Date()
      const pad = n => String(n).padStart(2, '0')
      setTime(`${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`)
    }
    tick()
    const id = setInterval(tick, 1000)

    return () => {
      window.removeEventListener('scroll', onScroll)
      clearInterval(id)
    }
  }, [])

  return (
    <motion.nav
      className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <a className="navbar-brand" href="#home">
        <span className="brand-bracket">{'<'}</span>
        NEO.DEV
        <span className="brand-bracket">{'/>'}</span>
      </a>

      <ul className="navbar-menu">
        {navItems.map(item => (
          <li key={item.label}>
            <a href={item.href}>{item.label}</a>
          </li>
        ))}
      </ul>

      <div className="navbar-time">
        <span className="time-dot" />
        {time}
      </div>
    </motion.nav>
  )
}