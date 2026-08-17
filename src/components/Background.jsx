import { useEffect, useRef } from 'react'

/**
 * 动态背景组件 —— 赛博朋克 / Synthwave 四件套:
 * 1. 透视网格地平线,持续向前"扑面而来" ⭐ 核心动画
 * 2. 漂浮的霓虹粒子 + 粒子连线
 * 3. 合成波风格渐变太阳(经典 synthwave 元素)
 * 4. CRT 扫描线 / 暗角(由 CSS 覆盖层负责)
 *
 * 网格动画原理:
 *   - 水平线基于时间累加的 offset,用余弦插值(t²)模拟"远处稀疏、近处密集"的透视效果
 *   - 垂直线锚定在 horizon 点上,以同样方式向两侧"展开"
 *   - 当 offset 超过一个"网格周期",通过取模让它无限循环,看起来永无止境
 */
export default function Background() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationId

    // ============================================================
    // 画布尺寸 / DPR 处理
    // ============================================================
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    // ============================================================
    // 粒子配置
    // ============================================================
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 2 + 0.5,
      color: Math.random() > 0.5 ? '#00f0ff' : '#ff00aa',
    }))

    // ============================================================
    // 网格状态 ⭐ 这是关键改造
    //
    // 之前:用 (i/N + scroll) % 1 公式 —— 每条线的 phase 是循环的,
    //       当 phase 从 0.99 跳回 0 时,映射到屏幕坐标会产生视觉跳变
    //
    // 现在:每条线维护自己的"屏幕坐标状态",每帧 += 速度 * dt,
    //       到达边界时做一次减法重置(因为已经飞出屏幕外,所以看不见)
    //
    // 水平线状态:progress ∈ [0, 1]
    //   - 0 = 在地平线(最远)
    //   - 1 = 在屏幕底部(最近)
    //   - 跨过 1 时重置为 0
    //
    // 垂直线状态:xScreen (像素)
    //   - 持续增加,跨过右侧边界时减去 span,回到左侧
    // ============================================================

    const HLINES = 30  // 同时存在的水平线数量
    const hLines = Array.from({ length: HLINES }, (_, i) => ({
      // 初始 progress 均匀分布,这样首次绘制就有"已经存在一些线"的视觉效果
      progress: i / HLINES,
    }))

    const VLINES = 28  // 同时存在的垂直线数量
    let colSpacing = window.innerWidth / 18 // 屏幕底部相邻线之间的像素间距
    const buffer = window.innerWidth * 0.5   // 屏幕外缓冲区宽度
    const span = window.innerWidth + buffer * 2 // 一条线从左侧到右侧的总跨距
    // 初始 xScreen 均匀分布在屏幕外 + 屏幕内,确保一启动就有"很多线在空中"的视觉
    const vLines = Array.from({ length: VLINES }, (_, i) => ({
      xScreen: -buffer + i * colSpacing,
    }))

    // 速度配置(可调)
    // 水平线:每帧 progress 增加多少,0.3 = 慢, 1.0 = 中, 2.0 = 快
    const H_SPEED = 0.45
    // 垂直线:每帧像素位移
    const V_SPEED = 120 // px/sec

    let lastTime = performance.now()

    const draw = (now) => {
      const w = window.innerWidth
      const h = window.innerHeight
      const dt = Math.min((now - lastTime) / 1000, 0.1)
      lastTime = now

      // 缩放 colSpacing 以适配当前屏幕宽度
      colSpacing = w / 18

      // ============================================================
      // 更新网格状态
      // ============================================================
      hLines.forEach(line => {
        line.progress += H_SPEED * dt
        if (line.progress >= 1) {
          line.progress -= 1 // 重置(此时线已经飞出屏幕底部)
        }
      })

      vLines.forEach(line => {
        line.xScreen += V_SPEED * dt
        // 飞出右侧屏幕(包含缓冲区)时,从左侧回到缓冲区
        if (line.xScreen > w + buffer) {
          line.xScreen -= span
        }
      })

      ctx.clearRect(0, 0, w, h)

      // ============================================================
      // 1. 合成波太阳
      // ============================================================
      const horizonY = h * 0.65
      drawSynthwaveSun(ctx, w, horizonY)

      // ============================================================
      // 2. 向前滚动的透视网格 ⭐ 用真实状态绘制
      // ============================================================
      drawForwardGrid(ctx, w, h, horizonY, hLines, vLines)

      // ============================================================
      // 3. 紫色辉光地平线
      // ============================================================
      const grd = ctx.createLinearGradient(0, horizonY - 40, 0, horizonY + 40)
      grd.addColorStop(0, 'rgba(180, 0, 255, 0)')
      grd.addColorStop(0.5, 'rgba(180, 0, 255, 0.25)')
      grd.addColorStop(1, 'rgba(180, 0, 255, 0)')
      ctx.fillStyle = grd
      ctx.fillRect(0, horizonY - 40, w, 80)

      // ============================================================
      // 4. 粒子 + 粒子连线
      // ============================================================
      particles.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > w) p.vx *= -1
        if (p.y < 0 || p.y > h) p.vy *= -1

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.shadowColor = p.color
        ctx.shadowBlur = 10
        ctx.fill()
        ctx.shadowBlur = 0
      })

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

    animationId = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <div className="background-wrapper" aria-hidden="true">
      <canvas ref={canvasRef} className="background-canvas" />
      <div className="scanlines" />
      <div className="vignette" />
    </div>
  )
}

/**
 * 在 horizon 上方画一个 synthwave 风格的霓虹渐变太阳
 * 由 6 条水平条纹组成,经典 Outrun 风格
 */
function drawSynthwaveSun(ctx, w, horizonY) {
  const cx = w / 2
  const sunTop = horizonY - 180      // 太阳顶部
  const sunBottom = horizonY         // 太阳底部(贴在地平线上)
  const sunHeight = sunBottom - sunTop
  const sunWidth = Math.min(280, w * 0.4)

  // 圆盘的渐变填充(顶部亮红 → 中间亮粉 → 底部紫)
  const sunGrd = ctx.createLinearGradient(0, sunTop, 0, sunBottom)
  sunGrd.addColorStop(0,   '#ffeb3b')   // 黄
  sunGrd.addColorStop(0.4, '#ff007a')   // 粉红
  sunGrd.addColorStop(1,   '#b400ff')   // 紫

  ctx.save()
  // 裁切到圆形区域
  ctx.beginPath()
  ctx.arc(cx, sunTop + sunWidth / 2, sunWidth / 2, 0, Math.PI * 2)
  ctx.fillStyle = sunGrd
  ctx.shadowColor = '#ff007a'
  ctx.shadowBlur = 30
  ctx.fill()
  ctx.shadowBlur = 0

  // 在太阳下半部分画水平条纹(经典 Outrun 风格),让太阳像"从地平线落下"
  ctx.globalCompositeOperation = 'destination-out'
  for (let i = 0; i < 6; i++) {
    const stripeY = sunTop + sunHeight * (0.5 + i * 0.08)
    const stripeHeight = (sunHeight * 0.05) * (1 + i * 0.15) // 越往下条纹越宽
    ctx.fillStyle = 'rgba(0, 0, 0, 1)'
    ctx.fillRect(cx - sunWidth, stripeY, sunWidth * 2, stripeHeight)
  }
  ctx.restore()

  // 在太阳上方再加一层柔光
  const halo = ctx.createRadialGradient(
    cx, sunTop + sunHeight / 2, 0,
    cx, sunTop + sunHeight / 2, sunWidth
  )
  halo.addColorStop(0, 'rgba(255, 0, 122, 0.15)')
  halo.addColorStop(1, 'rgba(255, 0, 122, 0)')
  ctx.fillStyle = halo
  ctx.fillRect(cx - sunWidth, sunTop - 40, sunWidth * 2, sunHeight + 80)
}

/**
 * 绘制向前滚动的透视网格 ⭐ v3 - 使用状态数组
 *
 * 数据来自调用方传入的 hLines / vLines(每条线有自己独立的进度/坐标状态)
 * 这里只负责根据状态绘制,不再做任何相位计算
 *
 * 水平线:line.progress ∈ [0, 1)
 *   t = progress^2.2 → 屏幕 y 坐标 = horizonY + t * gridHeight
 *   跨过 1 时已经飞出屏幕底部,调用方负责把 progress 重置为 0
 *
 * 垂直线:line.xScreen ∈ [-buffer, w + buffer)
 *   屏幕底部 x 坐标 = line.xScreen
 *   跨过右侧时已经飞出屏幕,调用方负责把 xScreen 减回左侧
 */
function drawForwardGrid(ctx, w, h, horizonY, hLines, vLines) {
  const cx = w / 2
  const gridHeight = h - horizonY

  ctx.lineWidth = 1
  ctx.shadowColor = '#00f0ff'
  ctx.shadowBlur = 4

  // ============================================================
  // ---- 水平线 ----
  // p = 0 → 地平线(最远)
  // p = 1 → 屏幕底部(最近)
  // t = p^2.2 让"远处稀疏、近处密集"(透视效果)
  // ============================================================
  for (const line of hLines) {
    const p = line.progress
    const t = Math.pow(p, 2.2)
    const y = horizonY + t * gridHeight

    // 颜色:远处紫色 → 近处青色
    const alpha = 0.15 + 0.6 * t
    const r = Math.round(180 * (1 - t) + 0   * t)
    const g = Math.round(0   * (1 - t) + 240 * t)
    const b = Math.round(255 * (1 - t) + 255 * t)
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`

    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(w, y)
    ctx.stroke()
  }

  ctx.shadowBlur = 0

  // ============================================================
  // ---- 垂直线 ----
  // 直接画每条线当前的 xScreen 位置
  // 调用方负责维护 xScreen 的累加和重置
  // ============================================================
  for (const line of vLines) {
    const x = line.xScreen

    // 距离屏幕中心的比例(0..1)
    const distRatio = Math.min(1, Math.abs(x - cx) / (w / 2))

    // 越靠近屏幕边缘(线扇形张得开)的越亮
    const alpha = 0.1 + 0.45 * distRatio
    ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`

    ctx.beginPath()
    ctx.moveTo(cx, horizonY)
    ctx.lineTo(x, h)
    ctx.stroke()
  }
}