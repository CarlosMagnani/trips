import { useState, useCallback } from "react"
import { PageHeader } from "@/components/PageHeader"
import { TripSetupForm } from "@/gadgets/itinerary/TripSetupForm"
import { DayTabs } from "@/gadgets/itinerary/DayTabs"
import { Flashcard } from "@/gadgets/itinerary/Flashcard"
import { PlaceSearch } from "@/gadgets/itinerary/PlaceSearch"
import { generateDays } from "@/gadgets/itinerary/itineraryUtils"
import { readStorage, writeStorage } from "@/storage/localStore"
import type { Trip, ItineraryStop } from "@/gadgets/itinerary/itineraryTypes"
import { generateId, isoNow } from "@/types/common"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ItineraryPage() {
  const [storage, setStorage] = useState(() => readStorage())
  const [activeDayIndex, setActiveDayIndex] = useState(0)
  const [isSearching, setIsSearching] = useState(false)

  const activeTrip = storage.trips.find((t) => t.id === storage.activeTripId)

  const createTrip = useCallback((startDate: string, endDate: string) => {
    const now = isoNow()
    const trip: Trip = {
      id: generateId(),
      startDate,
      endDate,
      days: generateDays(startDate, endDate),
      createdAt: now,
      updatedAt: now,
    }

    const updated = {
      ...readStorage(),
      trips: [...readStorage().trips, trip],
      activeTripId: trip.id,
    }
    writeStorage(updated)
    setStorage(updated)
    setActiveDayIndex(0)
  }, [])

  const addStop = useCallback(
    (stopData: Omit<ItineraryStop, "id" | "order" | "createdAt" | "updatedAt">) => {
      if (!activeTrip) return

      const now = isoNow()
      const activeDay = activeTrip.days[activeDayIndex]
      if (!activeDay) return

      const newStop: ItineraryStop = {
        ...stopData,
        id: generateId(),
        order: activeDay.stops.length,
        createdAt: now,
        updatedAt: now,
      }

      const updatedDays = activeTrip.days.map((day, i) =>
        i === activeDayIndex
          ? { ...day, stops: [...day.stops, newStop] }
          : day
      )

      const updatedTrip: Trip = {
        ...activeTrip,
        days: updatedDays,
        updatedAt: now,
      }

      const updated = {
        ...readStorage(),
        trips: readStorage().trips.map((t) =>
          t.id === updatedTrip.id ? updatedTrip : t
        ),
      }
      writeStorage(updated)
      setStorage(updated)
      setIsSearching(false)
    },
    [activeTrip, activeDayIndex]
  )

  if (!activeTrip) {
    return (
      <div className="pb-24">
        <PageHeader title="Plan Your Trip" />
        <div className="px-4 py-4">
          <TripSetupForm onSubmit={createTrip} />
        </div>
      </div>
    )
  }

  const activeDay = activeTrip.days[activeDayIndex]

  return (
    <div className="pb-24">
      <PageHeader title="Itinerary" />
      <DayTabs
        days={activeTrip.days}
        activeDayIndex={activeDayIndex}
        onDayChange={setActiveDayIndex}
      />
      <div className="px-4 py-4 space-y-3">
        {activeDay && activeDay.stops.length > 0 && (
          <div className="space-y-3">
            {activeDay.stops.map((stop) => (
              <Flashcard key={stop.id} stop={stop} />
            ))}
          </div>
        )}

        {isSearching ? (
          <PlaceSearch onSelect={addStop} onClose={() => setIsSearching(false)} />
        ) : (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setIsSearching(true)}
          >
            <Plus className="h-4 w-4" />
            Add stop
          </Button>
        )}

        {!isSearching && activeDay && activeDay.stops.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            {activeDay.date} — No stops yet
          </p>
        )}
      </div>
    </div>
  )
}
