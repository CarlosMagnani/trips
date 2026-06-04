import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"
import {
  autocompletePlaces,
  getPlaceDetails,
  getPhotoUrl,
  type AutocompleteSuggestion,
} from "./placesApi"
import type { ItineraryStop } from "./itineraryTypes"

interface PlaceSearchProps {
  onSelect: (stop: Omit<ItineraryStop, "id" | "order" | "createdAt" | "updatedAt">) => void
  onClose: () => void
}

export function PlaceSearch({ onSelect, onClose }: PlaceSearchProps) {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [isSelecting, setIsSelecting] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (query.length < 2) {
      return
    }

    debounceRef.current = setTimeout(async () => {
      const results = await autocompletePlaces(query)
      setSuggestions(results)
      setHasSearched(true)
    }, 300)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query])

  async function handleSelect(suggestion: AutocompleteSuggestion) {
    setIsSelecting(true)
    try {
      const { placeId } = suggestion.placePrediction
      const details = await getPlaceDetails(placeId)

      const photoUrl =
        details.photos && details.photos.length > 0
          ? getPhotoUrl(details.photos[0].name)
          : undefined

      onSelect({
        placeId: details.id,
        name: details.displayName.text,
        address: details.formattedAddress,
        lat: details.location.latitude,
        lng: details.location.longitude,
        photoUrl,
        rating: details.rating,
        ratingCount: details.userRatingCount,
        openNow: details.currentOpeningHours?.openNow,
        openingHours: details.regularOpeningHours
          ? { weekdayText: details.regularOpeningHours.weekdayDescriptions }
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
          onChange={(e) => setQuery(e.target.value)}
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
          {suggestions.map((suggestion) => (
            <li key={suggestion.placePrediction.placeId}>
              <button
                className="w-full text-left px-3 py-2 hover:bg-accent transition-colors"
                onClick={() => handleSelect(suggestion)}
              >
                <span className="text-sm font-medium block">
                  {suggestion.placePrediction.structuredFormat.mainText.text}
                </span>
                <span className="text-xs text-muted-foreground block">
                  {suggestion.placePrediction.structuredFormat.secondaryText.text}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
