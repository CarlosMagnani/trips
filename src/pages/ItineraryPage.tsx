import { useState, useCallback } from "react"
import { PageHeader } from "@/components/PageHeader"
import { TripSetupForm } from "@/gadgets/itinerary/TripSetupForm"
import { DayTabs } from "@/gadgets/itinerary/DayTabs"
import { generateDays } from "@/gadgets/itinerary/itineraryUtils"
import { readStorage, writeStorage } from "@/storage/localStore"
import type { Trip } from "@/gadgets/itinerary/itineraryTypes"
import { generateId, isoNow } from "@/types/common"

export function ItineraryPage() {
  const [storage, setStorage] = useState(() => readStorage())
  const [activeDayIndex, setActiveDayIndex] = useState(0)

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

  return (
    <div className="pb-24">
      <PageHeader title="Itinerary" />
      <DayTabs
        days={activeTrip.days}
        activeDayIndex={activeDayIndex}
        onDayChange={setActiveDayIndex}
      />
      <div className="px-4 py-4">
        <p className="text-sm text-muted-foreground">
          {activeTrip.days[activeDayIndex]?.date} — No stops yet
        </p>
      </div>
    </div>
  )
}
