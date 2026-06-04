import { setOptions, importLibrary } from "@googlemaps/js-api-loader"

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY as string

let initialized = false

async function loadMapsApi(): Promise<void> {
  if (!initialized) {
    setOptions({
      key: API_KEY,
      v: "weekly",
    })
    initialized = true
  }
  await importLibrary("places")
}

export interface AutocompletePrediction {
  placeId: string
  description: string
  mainText: string
  secondaryText: string
}

export interface PlaceDetailsResult {
  placeId: string
  name: string
  formattedAddress: string
  lat: number
  lng: number
  rating?: number
  ratingCount?: number
  photoUrl?: string
  openNow?: boolean
  weekdayText?: string[]
}

export async function autocompletePlaces(input: string): Promise<AutocompletePrediction[]> {
  await loadMapsApi()

  const { suggestions } =
    await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions({ input })

  return (suggestions ?? [])
    .filter((s) => s.placePrediction)
    .map((s) => {
      const p = s.placePrediction!
      return {
        placeId: p.placeId,
        description: p.text.toString(),
        mainText: p.mainText?.toString() ?? "",
        secondaryText: p.secondaryText?.toString() ?? "",
      }
    })
}

export async function getPlaceDetails(placeId: string): Promise<PlaceDetailsResult> {
  await loadMapsApi()

  const place = new google.maps.places.Place({ id: placeId })

  await place.fetchFields({
    fields: [
      "displayName",
      "formattedAddress",
      "location",
      "rating",
      "userRatingCount",
      "photos",
      "regularOpeningHours",
      "currentOpeningHours",
    ],
  })

  let openNow: boolean | undefined
  try {
    openNow = await place.isOpen()
  } catch {
    // isOpen() throws if opening hours aren't available
  }

  return {
    placeId: place.id,
    name: place.displayName ?? "",
    formattedAddress: place.formattedAddress ?? "",
    lat: place.location?.lat() ?? 0,
    lng: place.location?.lng() ?? 0,
    rating: place.rating ?? undefined,
    ratingCount: place.userRatingCount ?? undefined,
    photoUrl: place.photos?.[0]?.getURI(),
    openNow,
    weekdayText: place.regularOpeningHours?.weekdayDescriptions,
  }
}
