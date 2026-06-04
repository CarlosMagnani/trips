import { useRef, useState } from "react"
import type { TripDay } from "./itineraryTypes"
import { formatDayLabel } from "./itineraryUtils"

interface DayTabsProps {
  days: TripDay[]
  activeDayIndex: number
  onDayChange: (index: number) => void
}

export function DayTabs({ days, activeDayIndex, onDayChange }: DayTabsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [touchStart, setTouchStart] = useState<number | null>(null)

  function handleTouchStart(e: React.TouchEvent) {
    setTouchStart(e.touches[0].clientX)
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStart === null) return

    const touchEnd = e.changedTouches[0].clientX
    const diff = touchStart - touchEnd

    if (Math.abs(diff) > 50) {
      if (diff > 0 && activeDayIndex < days.length - 1) {
        onDayChange(activeDayIndex + 1)
      } else if (diff < 0 && activeDayIndex > 0) {
        onDayChange(activeDayIndex - 1)
      }
    }

    setTouchStart(null)
  }

  return (
    <div
      ref={containerRef}
      className="border-b bg-background sticky top-0 z-10"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex overflow-x-auto scrollbar-hide">
        {days.map((day, index) => (
          <button
            key={day.id}
            onClick={() => onDayChange(index)}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              index === activeDayIndex
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {formatDayLabel(day.date, index)}
          </button>
        ))}
      </div>
    </div>
  )
}
