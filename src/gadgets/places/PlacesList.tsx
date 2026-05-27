import { useState } from "react"
import { Trash2, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/EmptyState"
import { PlaceForm } from "./PlaceForm"
import { sortPlacesByDistance } from "./placesUtils"
import type { Place } from "./placesTypes"

interface PlacesListProps {
  places: Place[]
  onUpdate: (id: string, data: Omit<Place, "id" | "createdAt" | "updatedAt">) => void
  onDelete: (id: string) => void
}

export function PlacesList({ places, onUpdate, onDelete }: PlacesListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)

  if (places.length === 0) {
    return (
      <EmptyState
        title="No places yet"
        description="Add a place above to start tracking locations by distance."
      />
    )
  }

  const sorted = sortPlacesByDistance(places)

  return (
    <div className="space-y-2">
      {sorted.map((place) => (
        <div key={place.id}>
          {editingId === place.id ? (
            <Card>
              <CardContent className="p-4">
                <PlaceForm
                  initial={place}
                  onSubmit={(data) => {
                    onUpdate(place.id, data)
                    setEditingId(null)
                  }}
                  onCancel={() => setEditingId(null)}
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{place.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {place.distance} {place.distanceUnit}
                  </p>
                  {place.note && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {place.note}
                    </p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingId(place.id)}
                    aria-label="Edit place"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(place.id)}
                    aria-label="Delete place"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ))}
    </div>
  )
}
