import { useEffect, useRef, useState } from 'react'

const COLS = 20
const ROWS = 20
const CANVAS_SIZE = 400
const CELL = CANVAS_SIZE / COLS

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

export default function App() {
  const canvasRef = useRef(null)
  const apiRef = useRef({
    start: () => {},
    pause: () => {},
    restart: () => {},
    turn: () => {},
  })

  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [highScore, setHighScore] = useState(() =>
    parseInt(localStorage.getItem('snakeHighScore') || '0', 10),
  )
  const [phase, setPhase] = useState('idle') // idle | running | paused | over
  const [pauseLabel, setPauseLabel] = useState('Pause')
  const [startLabel, setStartLabel] = useState('Start Game')
  const [overlayVisible, setOverlayVisible] = useState(true)
  const [overlayTitle, setOverlayTitle] = useState('Ready to Play?')
  const [overlayMessage, setOverlayMessage] = useState(
    'Use arrow keys or swipe to move. Eat food to grow.',
  )

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    let snake = []
    let direction = { x: 1, y: 0 }
    let nextDirection = { x: 1, y: 0 }
    let food = { x: 0, y: 0 }
    let gameLoop = null
    let phaseLocal = 'idle'
    let scoreLocal = 0
    let levelLocal = 1
    let highScoreLocal = parseInt(
      localStorage.getItem('snakeHighScore') || '0',
      10,
    )

    function initGame() {
      const startX = Math.floor(COLS / 2)
      const startY = Math.floor(ROWS / 2)
      snake = [
        { x: startX, y: startY },
        { x: startX - 1, y: startY },
        { x: startX - 2, y: startY },
      ]
      direction = { x: 1, y: 0 }
      nextDirection = { x: 1, y: 0 }
      scoreLocal = 0
      levelLocal = 1
      setScore(0)
      setLevel(1)
      spawnFood()
    }

    function getSpeed() {
      return Math.max(60, 150 - (levelLocal - 1) * 10)
    }

    function spawnFood() {
      let pos
      do {
        pos = {
          x: Math.floor(Math.random() * COLS),
          y: Math.floor(Math.random() * ROWS),
        }
      } while (snake.some((s) => s.x === pos.x && s.y === pos.y))
      food = pos
    }

    function startLoop() {
      if (gameLoop) clearInterval(gameLoop)
      gameLoop = setInterval(tick, getSpeed())
    }

    function tick() {
      direction = { ...nextDirection }

      const head = {
        x: snake[0].x + direction.x,
        y: snake[0].y + direction.y,
      }

      if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
        endGame()
        return
      }

      if (snake.slice(0, -1).some((s) => s.x === head.x && s.y === head.y)) {
        endGame()
        return
      }

      snake.unshift(head)

      if (head.x === food.x && head.y === food.y) {
        scoreLocal += 10
        setScore(scoreLocal)

        const newLevel = Math.floor(scoreLocal / 50) + 1
        if (newLevel !== levelLocal) {
          levelLocal = newLevel
          setLevel(newLevel)
          startLoop()
        }

        if (scoreLocal > highScoreLocal) {
          highScoreLocal = scoreLocal
          setHighScore(scoreLocal)
          localStorage.setItem('snakeHighScore', String(scoreLocal))
        }

        spawnFood()
      } else {
        snake.pop()
      }

      draw()
    }

    function draw() {
      ctx.fillStyle = '#111122'
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
      drawGrid()
      drawFood()
      drawSnake()
    }

    function drawGrid() {
      ctx.strokeStyle = 'rgba(255,255,255,0.03)'
      ctx.lineWidth = 0.5
      for (let x = 0; x <= CANVAS_SIZE; x += CELL) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, CANVAS_SIZE)
        ctx.stroke()
      }
      for (let y = 0; y <= CANVAS_SIZE; y += CELL) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(CANVAS_SIZE, y)
        ctx.stroke()
      }
    }

    function drawSnake() {
      snake.forEach((seg, i) => {
        const x = seg.x * CELL
        const y = seg.y * CELL
        const pad = 1
        const size = CELL - pad * 2
        const radius = i === 0 ? 6 : 4
        const alpha = i === 0 ? 1 : Math.max(0.4, 1 - i * 0.03)
        ctx.fillStyle = i === 0 ? '#00e676' : `rgba(0, 200, 100, ${alpha})`
        roundRect(ctx, x + pad, y + pad, size, size, radius)
        ctx.fill()

        if (i === 0) {
          ctx.fillStyle = '#0f0f1a'
          const eyeSize = 3
          const ex = x + CELL / 2 + direction.x * 4
          const ey = y + CELL / 2 + direction.y * 4
          ctx.beginPath()
          ctx.arc(ex, ey, eyeSize, 0, Math.PI * 2)
          ctx.fill()
        }
      })
    }

    function drawFood() {
      const x = food.x * CELL + CELL / 2
      const y = food.y * CELL + CELL / 2
      const r = CELL / 2 - 2

      const glow = ctx.createRadialGradient(x, y, 0, x, y, r * 2)
      glow.addColorStop(0, 'rgba(255, 80, 80, 0.5)')
      glow.addColorStop(1, 'rgba(255, 80, 80, 0)')
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(x, y, r * 2, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#ff5252'
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = 'rgba(255,255,255,0.35)'
      ctx.beginPath()
      ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.3, 0, Math.PI * 2)
      ctx.fill()
    }

    function showOverlay(title, message) {
      setOverlayTitle(title)
      setOverlayMessage(message)
      setOverlayVisible(true)
    }

    function startGame() {
      initGame()
      phaseLocal = 'running'
      setPhase('running')
      setOverlayVisible(false)
      setPauseLabel('Pause')
      draw()
      startLoop()
    }

    function pauseGame() {
      if (phaseLocal !== 'running' && phaseLocal !== 'paused') return

      if (phaseLocal === 'running') {
        clearInterval(gameLoop)
        gameLoop = null
        phaseLocal = 'paused'
        setPhase('paused')
        setPauseLabel('Resume')
        showOverlay('Paused', 'Press Resume or P to continue…')
      } else {
        phaseLocal = 'running'
        setPhase('running')
        setPauseLabel('Pause')
        setOverlayVisible(false)
        startLoop()
      }
    }

    function endGame() {
      clearInterval(gameLoop)
      gameLoop = null
      phaseLocal = 'over'
      setPhase('over')
      const isBest = scoreLocal > 0 && scoreLocal === highScoreLocal
      const tail = isBest ? ' — new best!' : ''
      showOverlay(
        'Game Over',
        `Final score: ${scoreLocal}${tail}. Press Restart to play again.`,
      )
      setStartLabel('Play Again')
    }

    function restartGame() {
      clearInterval(gameLoop)
      gameLoop = null
      startGame()
    }

    function turn(dx, dy) {
      if (dx === 1 && direction.x !== -1) nextDirection = { x: 1, y: 0 }
      else if (dx === -1 && direction.x !== 1) nextDirection = { x: -1, y: 0 }
      else if (dy === 1 && direction.y !== -1) nextDirection = { x: 0, y: 1 }
      else if (dy === -1 && direction.y !== 1) nextDirection = { x: 0, y: -1 }
    }

    function onKeyDown(e) {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault()
          turn(0, -1)
          break
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault()
          turn(0, 1)
          break
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault()
          turn(-1, 0)
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault()
          turn(1, 0)
          break
        case 'p':
        case 'P':
          pauseGame()
          break
        case ' ':
          e.preventDefault()
          if (phaseLocal === 'idle' || phaseLocal === 'over') startGame()
          else pauseGame()
          break
        default:
          break
      }
    }

    let touchStartX = 0
    let touchStartY = 0

    function onTouchStart(e) {
      touchStartX = e.touches[0].clientX
      touchStartY = e.touches[0].clientY
      e.preventDefault()
    }

    function onTouchEnd(e) {
      const dx = e.changedTouches[0].clientX - touchStartX
      const dy = e.changedTouches[0].clientY - touchStartY
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) turn(1, 0)
        else turn(-1, 0)
      } else {
        if (dy > 0) turn(0, 1)
        else turn(0, -1)
      }
      e.preventDefault()
    }

    apiRef.current = {
      start: startGame,
      pause: pauseGame,
      restart: restartGame,
      turn,
    }

    document.addEventListener('keydown', onKeyDown)
    canvas.addEventListener('touchstart', onTouchStart, { passive: false })
    canvas.addEventListener('touchend', onTouchEnd, { passive: false })

    // Initial blank board
    ctx.fillStyle = '#111122'
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
    drawGrid()

    return () => {
      clearInterval(gameLoop)
      document.removeEventListener('keydown', onKeyDown)
      canvas.removeEventListener('touchstart', onTouchStart)
      canvas.removeEventListener('touchend', onTouchEnd)
    }
  }, [])

  const pauseDisabled = phase !== 'running' && phase !== 'paused'
  const restartDisabled = phase === 'idle'

  return (
    <main className="container" aria-labelledby="page-title">
      <header className="hero">
        <h1 className="title" id="page-title">Snake Game</h1>
        <p className="subtitle">Eat the glow. Grow the streak. Don&rsquo;t bite yourself.</p>
      </header>

      <section className="scoreboard" aria-label="Game stats" aria-live="polite">
        <div className="score-box">
          <span className="score-label">Score</span>
          <span className="score-value">{score}</span>
        </div>
        <div className="score-box">
          <span className="score-label">Best</span>
          <span className="score-value">{highScore}</span>
        </div>
        <div className="score-box">
          <span className="score-label">Level</span>
          <span className="score-value">{level}</span>
        </div>
      </section>

      <div className="canvas-wrapper">
        <canvas
          ref={canvasRef}
          id="gameCanvas"
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          role="img"
          aria-label="Snake game board, 20 by 20 grid"
        />

        <div
          className={`overlay${overlayVisible ? '' : ' hidden'}`}
          role="dialog"
          aria-modal="false"
          aria-labelledby="overlay-title"
        >
          <div className="overlay-content">
            <h2 id="overlay-title">{overlayTitle}</h2>
            <p>{overlayMessage}</p>
            <button
              className="btn"
              type="button"
              onClick={() => apiRef.current.start()}
            >
              {startLabel}
            </button>
          </div>
        </div>
      </div>

      <div className="controls">
        <button
          className="btn btn-secondary"
          type="button"
          disabled={pauseDisabled}
          onClick={() => apiRef.current.pause()}
        >
          {pauseLabel}
        </button>
        <button
          className="btn btn-secondary"
          type="button"
          disabled={restartDisabled}
          onClick={() => apiRef.current.restart()}
        >
          Restart
        </button>
      </div>

      <section className="hints" aria-label="Keyboard shortcuts">
        <div className="hint">
          <kbd>&uarr;</kbd><kbd>&darr;</kbd><kbd>&larr;</kbd><kbd>&rarr;</kbd>
          <span>Move</span>
        </div>
        <div className="hint">
          <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd>
          <span>Move</span>
        </div>
        <div className="hint">
          <kbd>P</kbd>
          <span>Pause</span>
        </div>
        <div className="hint">
          <kbd>Space</kbd>
          <span>Start / Pause</span>
        </div>
      </section>

      <nav className="touch-controls" aria-label="On-screen movement controls">
        <div className="touch-row">
          <button
            className="touch-btn"
            type="button"
            aria-label="Move up"
            onClick={() => apiRef.current.turn(0, -1)}
          >
            &#9650;
          </button>
        </div>
        <div className="touch-row">
          <button
            className="touch-btn"
            type="button"
            aria-label="Move left"
            onClick={() => apiRef.current.turn(-1, 0)}
          >
            &#9664;
          </button>
          <button
            className="touch-btn"
            type="button"
            aria-label="Move down"
            onClick={() => apiRef.current.turn(0, 1)}
          >
            &#9660;
          </button>
          <button
            className="touch-btn"
            type="button"
            aria-label="Move right"
            onClick={() => apiRef.current.turn(1, 0)}
          >
            &#9654;
          </button>
        </div>
      </nav>
    </main>
  )
}
