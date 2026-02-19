// Simple confetti utility
// Based on a lightweight implementation pattern

export function triggerConfetti() {
  const duration = 3000
  const animationEnd = Date.now() + duration
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 }

  const randomInRange = (min: number, max: number) =>
    Math.random() * (max - min) + min

  const interval: any = setInterval(function () {
    const timeLeft = animationEnd - Date.now()

    if (timeLeft <= 0) {
      return clearInterval(interval)
    }

    const particleCount = 50 * (timeLeft / duration)

    // Since we don't have a confetti library, we'll simulate it by creating elements
    // In a real scenario with canvas-confetti, we would call confetti()
    // For this environment where I cannot install new packages, I will create a DOM-based fallback
    createConfettiParticles(particleCount)
  }, 250)
}

function createConfettiParticles(count: number) {
  const colors = ['#6366F1', '#10B981', '#F43F5E', '#F59E0B', '#3B82F6']

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div')
    el.classList.add('confetti-particle')
    el.style.position = 'fixed'
    el.style.width = Math.random() * 10 + 5 + 'px'
    el.style.height = Math.random() * 5 + 5 + 'px'
    el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
    el.style.left = Math.random() * 100 + 'vw'
    el.style.top = '-10px'
    el.style.zIndex = '9999'
    el.style.pointerEvents = 'none'
    el.style.borderRadius = '2px'

    // Animation
    const duration = Math.random() * 2 + 1
    el.style.transition = `top ${duration}s ease-in, transform ${duration}s linear, opacity ${duration}s ease-in`

    document.body.appendChild(el)

    requestAnimationFrame(() => {
      el.style.top = '110vh'
      el.style.transform = `rotate(${Math.random() * 360}deg) translateX(${Math.random() * 40 - 20}px)`
      el.style.opacity = '0'
    })

    setTimeout(() => {
      el.remove()
    }, duration * 1000)
  }
}
