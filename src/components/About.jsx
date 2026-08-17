import { motion } from 'framer-motion'
import profile from '../config/profile'
import '../styles/about.css'

export default function About() {
  return (
    <section className="section about-section">
      <h2 className="section-title">about.sys</h2>

      <div className="about-grid">
        {/* 关于我文本 */}
        <motion.div
          className="cyber-card about-text-card"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="corner-br" />
          <pre className="about-log">
            {profile.about.map((line, i) => (
              <motion.span
                key={i}
                className="log-line"
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                {line}
              </motion.span>
            ))}
          </pre>
        </motion.div>

        {/* 技能栈 */}
        <motion.div
          className="cyber-card skills-card"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="corner-br" />
          <h3 className="card-title">// TECH_STACK</h3>
          <div className="skills-grid">
            {profile.skills.map((skill, i) => (
              <motion.div
                key={skill.name}
                className="skill-chip"
                style={{ '--chip-color': skill.color }}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.08 }}
              >
                <span className="skill-dot" />
                {skill.name}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}