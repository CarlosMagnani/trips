import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"
import {
  autocompletePlaces,
  getPlaceDetails,
  type AutocompletePrediction,
} from "./placesApi"
import type { ItineraryStop } from "./itineraryTypes"

interface PlaceSearchProps {
  onSelect: (stop: Omit<ItineraryStop, "id" | "order" | "createdAt" | "updatedAt">) => void
  onClose: () => void
}

export function PlaceSearch({ onSelect, onClose }: PlaceSearchProps) {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<AutocompletePrediction[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [isSelecting, setIsSelecting] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const requestIdRef = useRef(0)

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (query.length < 2) {
      return
    }

    const currentRequestId = ++requestIdRef.current

    debounceRef.current = setTimeout(async () => {
      const results = await autocompletePlaces(query)
      if (currentRequestId === requestIdRef.current) {
        setSuggestions(results)
        setHasSearched(true)
      }
    }, 300)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query])

  function handleQueryChange(value: string) {
    setQuery(value)
    if (value.length < 2) {
      setSuggestions([])
      setHasSearched(false)
    }
  }

  async function handleSelect(prediction: AutocompletePrediction) {
    setIsSelecting(true)
    try {
      const details = await getPlaceDetails(prediction.placeId)

      onSelect({
        placeId: details.placeId,
        name: details.name,
        address: details.formattedAddress,
        lat: details.lat,
        lng: details.lng,
        photoUrl: details.photoUrl,
        rating: details.rating,
        ratingCount: details.ratingCount,
        openNow: details.openNow,
        openingHours: details.weekdayText
          ? { weekdayText: details.weekdayText }
          : undefined,
      })
    } finally {
      setIsSelecting(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search places..."
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          autoFocus
          disabled={isSelecting}
        />
        <button
          onClick={onClose}
          className="p-2 text-muted-foreground hover:text-foreground shrink-0"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {isSelecting && (
        <p className="text-xs text-muted-foreground px-1">Loading place details...</p>
      )}

      {!isSelecting && hasSearched && query.length >= 2 && suggestions.length === 0 && (
        <p className="text-xs text-muted-foreground px-1">No results found</p>
      )}

      {!isSelecting && suggestions.length > 0 && query.length >= 2 && (
        <ul className="border rounded-md bg-background divide-y max-h-60 overflow-y-auto">
          {suggestions.map((prediction) => (
            <li key={prediction.placeId}>
              <button
                className="w-full text-left px-3 py-2 hover:bg-accent transition-colors"
                onClick={() => handleSelect(prediction)}
              >
                <span className="text-sm font-medium block">
                  {prediction.mainText}
                </span>
                <span className="text-xs text-muted-foreground block">
                  {prediction.secondaryText}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
