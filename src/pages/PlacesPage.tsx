import { useState, useCallback } from "react"
import { PageHeader } from "@/components/PageHeader"
import { PlaceForm } from "@/gadgets/places/PlaceForm"
import { PlacesList } from "@/gadgets/places/PlacesList"
import { readStorage, writeStorage } from "@/storage/localStore"
import type { Place } from "@/gadgets/places/placesTypes"
import { generateId, isoNow } from "@/types/common"

export function PlacesPage() {
  const [storage, setStorage] = useState(() => readStorage())

  const addPlace = useCallback((data: Omit<Place, "id" | "createdAt" | "updatedAt">) => {
    const now = isoNow()
    const place: Place = { ...data, id: generateId(), createdAt: now, updatedAt: now }
    const updated = { ...readStorage(), places: [...readStorage().places, place] }
    writeStorage(updated)
    setStorage(updated)
  }, [])

  const updatePlace = useCallback((id: string, data: Omit<Place, "id" | "createdAt" | "updatedAt">) => {
    const current = readStorage()
    const updated = {
      ...current,
      places: current.places.map((p) =>
        p.id === id ? { ...p, ...data, updatedAt: isoNow() } : p
      ),
    }
    writeStorage(updated)
    setStorage(updated)
  }, [])

  const deletePlace = useCallback((id: string) => {
    const current = readStorage()
    const updated = { ...current, places: current.places.filter((p) => p.id !== id) }
    writeStorage(updated)
    setStorage(updated)
  }, [])

  return (
    <div className="pb-24">
      <PageHeader title="Places by Distance" />
      <div className="px-4 py-4 space-y-4">
        <PlaceForm onSubmit={addPlace} />
        <PlacesList
          places={storage.places}
          onUpdate={updatePlace}
          onDelete={deletePlace}
        />
      </div>
    </div>
  )
}
