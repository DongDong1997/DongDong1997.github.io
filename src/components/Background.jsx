import { useEffect, useRef } from 'react'

/**
 * 动态背景组件 —— 赛博朋克三件套:
 * 1. 网格地平线 (perspective grid, 类似 Tron/合成波风格)
 * 2. 漂浮的霓虹粒子
 * 3. 扫描线动画 (CRT 显示器效果)
 */
export default function Background() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationId

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // 粒子配置
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 2 + 0.5,
      color: Math.random() > 0.5 ? '#00f0ff' : '#ff00aa',
    }))

    let frame = 0
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      frame++

      // ---- 网格地平线 ----
      const horizonY = canvas.height * 0.65
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.18)'
      ctx.lineWidth = 1

      // 水平线(透视)
      for (let i = 0; i < 20; i++) {
        const t = i / 20
        const y = horizonY + Math.pow(t, 2) * (canvas.height - horizonY)
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }
      // 垂直线(向远处汇聚)
      for (let i = -20; i <= 20; i++) {
        const x = (canvas.width / 2) + (i / 20) * canvas.width
        ctx.beginPath()
        ctx.moveTo(canvas.width / 2, horizonY)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }

      // 紫色辉光地平线
      const grd = ctx.createLinearGradient(0, horizonY - 40, 0, horizonY + 40)
      grd.addColorStop(0, 'rgba(180, 0, 255, 0)')
      grd.addColorStop(0.5, 'rgba(180, 0, 255, 0.25)')
      grd.addColorStop(1, 'rgba(180, 0, 255, 0)')
      ctx.fillStyle = grd
      ctx.fillRect(0, horizonY - 40, canvas.width, 80)

      // ---- 粒子 ----
      particles.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.shadowColor = p.color
        ctx.shadowBlur = 10
        ctx.fill()
        ctx.shadowBlur = 0
      })

      // ---- 粒子连线(赛博朋克网状) ----
      ctx.lineWidth = 0.5
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            ctx.strokeStyle = `rgba(0, 240, 255, ${0.15 * (1 - dist / 120)})`
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }

      animationId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <div className="background-wrapper" aria-hidden="true">
      <canvas ref={canvasRef} className="background-canvas" />
      {/* CRT 扫描线覆盖层 */}
      <div className="scanlines" />
      {/* 顶部暗角 */}
      <div className="vignette" />
    </div>
  )
}