import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { FieldError } from "@/components/FieldError"
import { isValidDistance, isValidPlaceName } from "./placesUtils"
import type { Place, DistanceUnit } from "./placesTypes"
import { DISTANCE_UNITS } from "./placesTypes"

interface PlaceFormProps {
  onSubmit: (data: Omit<Place, "id" | "createdAt" | "updatedAt">) => void
  initial?: Place
  onCancel?: () => void
}

export function PlaceForm({ onSubmit, initial, onCancel }: PlaceFormProps) {
  const [name, setName] = useState(initial?.name ?? "")
  const [note, setNote] = useState(initial?.note ?? "")
  const [distance, setDistance] = useState(initial?.distance.toString() ?? "")
  const [distanceUnit, setDistanceUnit] = useState<DistanceUnit>(initial?.distanceUnit ?? "km")
  const [nameError, setNameError] = useState("")
  const [distanceError, setDistanceError] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    let hasError = false

    if (!isValidPlaceName(name)) {
      setNameError("Name is required")
      hasError = true
    } else {
      setNameError("")
    }

    const parsedDistance = parseFloat(distance)
    if (!isValidDistance(parsedDistance)) {
      setDistanceError("Enter a valid distance greater than 0")
      hasError = true
    } else {
      setDistanceError("")
    }

    if (!hasError) {
      onSubmit({
        name: name.trim(),
        note: note.trim() || undefined,
        distance: parsedDistance,
        distanceUnit,
      })
      if (!initial) {
        setName("")
        setNote("")
        setDistance("")
        setDistanceUnit("km")
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="place-name">Name</Label>
        <Input
          id="place-name"
          placeholder="Place name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <FieldError message={nameError} />
      </div>

      <div className="flex gap-2">
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="place-distance">Distance</Label>
          <Input
            id="place-distance"
            type="number"
            inputMode="decimal"
            placeholder="0"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            min="0"
            step="0.1"
          />
          <FieldError message={distanceError} />
        </div>
        <div className="w-24 space-y-1.5">
          <Label htmlFor="place-unit">Unit</Label>
          <Select
            id="place-unit"
            value={distanceUnit}
            onChange={(e) => setDistanceUnit(e.target.value as DistanceUnit)}
          >
            {DISTANCE_UNITS.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="place-note">Note (optional)</Label>
        <Textarea
          id="place-note"
          placeholder="Optional note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="flex-1">
          {initial ? "Update" : "Add Place"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
