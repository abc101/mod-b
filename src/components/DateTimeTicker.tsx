'use client'

import { useEffect, useMemo, useState } from 'react'

type Location = {
  label: string
  icon?: string
  timeZone: string
  latitude: number
  longitude: number
}

type Props = {
  settings?: {
    enabled?: boolean
    displayMode?: 'rolling' | 'inline'
    showWeather?: boolean
    showDateTime?: boolean
    locations?: Location[]
  }
}

function weatherIcon(code?: number) {
  if (code == null) return '☀️'

  // Thunderstorm
  if (code >= 95) return '⛈️'

  // Snow
  if (code >= 71 && code <= 77) return '❄️'
  if (code >= 85 && code <= 86) return '🌨️'

  // Rain / showers
  if (code >= 51 && code <= 67) return '🌧️'
  if (code >= 80 && code <= 82) return '🌦️'

  // Fog
  if (code >= 45 && code <= 48) return '🌫️'

  // Cloudy
  if (code >= 1 && code <= 3) return '🌤️'

  return '☀️'
}

function formatTime(timeZone: string) {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone,
      month: 'short',
      day: 'numeric',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date())
  } catch {
    return ''
  }
}

export default function DateTimeTicker({ settings }: Props) {
  const enabled = settings?.enabled === true
  const locations = settings?.locations || []
  const displayMode = settings?.displayMode || 'rolling'
  const showWeather = settings?.showWeather !== false
  const showDateTime = settings?.showDateTime !== false

  const [activeIndex, setActiveIndex] = useState(0)
  const [, setTick] = useState(0)
  const [weather, setWeather] = useState<Record<string, string>>({})

  const validLocations = useMemo(
    () =>
      locations.filter(
        (loc) =>
          loc.label &&
          loc.timeZone &&
          typeof loc.latitude === 'number' &&
          typeof loc.longitude === 'number',
      ),
    [locations],
  )

  useEffect(() => {
    const timer = setInterval(() => setTick((v) => v + 1), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!enabled || validLocations.length <= 1) return

    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % validLocations.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [enabled, validLocations.length])

  useEffect(() => {
    if (activeIndex >= validLocations.length) {
      setActiveIndex(0)
    }
  }, [activeIndex, validLocations.length])

  useEffect(() => {
    if (!enabled || !showWeather || validLocations.length === 0) return

    async function fetchWeather() {
      const results: Record<string, string> = {}

      await Promise.all(
        validLocations.map(async (loc) => {
          try {
            const res = await fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current_weather=true`,
            )

            const data = await res.json()
            const current = data?.current_weather

            if (current) {
              results[loc.label] = `${weatherIcon(current.weathercode)} ${Math.round(
                current.temperature,
              )}°C`
            }
          } catch {
            results[loc.label] = '-'
          }
        }),
      )

      setWeather(results)
    }

    fetchWeather()
    const timer = setInterval(fetchWeather, 600000)

    return () => clearInterval(timer)
  }, [enabled, showWeather, validLocations])

  if (!enabled || validLocations.length === 0) return null

  function TickerItem({ loc }: { loc: Location }) {
    return (
      <div
        className="flex h-6 items-center gap-2 whitespace-nowrap notranslate"
        translate="no"
      >
        <strong>
          {loc.icon || '📍'} {loc.label}
        </strong>

        {showWeather && <span>{weather[loc.label] || '..'}</span>}

        {showDateTime && <span>{formatTime(loc.timeZone)}</span>}
      </div>
    )
  }

  if (displayMode === 'inline') {
    return (
      <div className="text-xs text-gray-500">
        <div className="flex flex-wrap items-center gap-4">
          {validLocations.map((loc) => (
            <TickerItem key={loc.label} loc={loc} />
          ))}
        </div>
      </div>
    )
  }

  if (validLocations.length === 1) {
    return (
      <div className="text-xs text-gray-500 whitespace-nowrap">
        <TickerItem loc={validLocations[0]} />
      </div>
    )
  }

  const activeLocation =
    validLocations[activeIndex] || validLocations[0]

  return (
    <div className="h-6 overflow-hidden text-xs text-gray-500 whitespace-nowrap">
      <div key={activeLocation.label} className="animate-date-time-fade">
        <TickerItem loc={activeLocation} />
      </div>
    </div>
  )
}