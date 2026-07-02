import { useState, useEffect } from 'react'

export default function CoinDisplay({ amount, size = 'lg' }) {
  const [animating, setAnimating] = useState(false)
  const [prev, setPrev] = useState(amount)

  useEffect(() => {
    if (amount !== prev) {
      setAnimating(true)
      setPrev(amount)
      const t = setTimeout(() => setAnimating(false), 400)
      return () => clearTimeout(t)
    }
  }, [amount, prev])

  const isLg = size === 'lg'

  return (
    <div className="flex items-center justify-center gap-2">
      <span className={isLg ? 'text-3xl' : 'text-xl'}>🪙</span>
      <span className={`font-bold ${isLg ? 'text-3xl' : 'text-xl'} text-gold-600 ${animating ? 'coin-bounce' : ''}`}>
        {amount}
      </span>
    </div>
  )
}
