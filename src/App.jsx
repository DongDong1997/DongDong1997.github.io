import './styles/background.css'
import './styles/navbar.css'

import Background from './components/Background'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Stats from './components/Stats'
import Projects from './components/Projects'
import Footer from './components/Footer'

export default function App() {
  return (
    <>
      <Background />
      <Navbar />
      <main>
        <div id="home" />
        <Hero />
        <div id="about" />
        <About />
        <div id="metrics" />
        <Stats />
        <Projects />
      </main>
      <Footer />
    </>
  )
}