import { FaHeart, FaGithub } from 'react-icons/fa'
import profile from '../config/profile'
import '../styles/footer.css'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-divider">
        <span className="line" />
        <span className="diamond">◆</span>
        <span className="line" />
      </div>

      {/* 访客计数(使用第三方公共计数器) */}
      <div className="visitor-badge">
        <img
          src="https://komarev.com/ghpvc/?username=your-github-username&label=VISITORS&color=00f0ff&style=flat-square&ab=0"
          alt="Visitor counter"
          loading="lazy"
        />
      </div>

      <p className="footer-text">
        Designed &amp; Built by <span className="footer-name">{profile.name}</span>
        <FaHeart className="heart" />
        powered by <FaGithub /> React + Vite
      </p>

      <p className="footer-meta">
        // build: {new Date().getFullYear()} // status: online
      </p>
    </footer>
  )
}