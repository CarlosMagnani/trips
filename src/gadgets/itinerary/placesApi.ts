import { setOptions, importLibrary } from "@googlemaps/js-api-loader"

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY as string

let initialized = false
let autocompleteService: google.maps.places.AutocompleteService | null = null
let placesService: google.maps.places.PlacesService | null = null

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

async function getAutocompleteService(): Promise<google.maps.places.AutocompleteService> {
  await loadMapsApi()
  if (!autocompleteService) {
    autocompleteService = new google.maps.places.AutocompleteService()
  }
  return autocompleteService
}

function getPlacesService(): google.maps.places.PlacesService {
  if (!placesService) {
    const container = document.createElement("div")
    placesService = new google.maps.places.PlacesService(container)
  }
  return placesService
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
  const service = await getAutocompleteService()

  return new Promise((resolve) => {
    service.getPlacePredictions(
      { input },
      (predictions, status) => {
        if (
          status !== google.maps.places.PlacesServiceStatus.OK ||
          !predictions
        ) {
          resolve([])
          return
        }
        resolve(
          predictions.map((p) => ({
            placeId: p.place_id,
            description: p.description,
            mainText: p.structured_formatting.main_text,
            secondaryText: p.structured_formatting.secondary_text,
          }))
        )
      }
    )
  })
}

export async function getPlaceDetails(placeId: string): Promise<PlaceDetailsResult> {
  await loadMapsApi()
  const service = getPlacesService()

  return new Promise((resolve, reject) => {
    service.getDetails(
      {
        placeId,
        fields: [
          "name",
          "formatted_address",
          "geometry",
          "rating",
          "user_ratings_total",
          "photos",
          "opening_hours",
          "current_opening_hours",
        ],
      },
      (place, status) => {
        if (
          status !== google.maps.places.PlacesServiceStatus.OK ||
          !place
        ) {
          reject(new Error(`Places service error: ${status}`))
          return
        }
        resolve({
          placeId: place.place_id ?? placeId,
          name: place.name ?? "",
          formattedAddress: place.formatted_address ?? "",
          lat: place.geometry?.location?.lat() ?? 0,
          lng: place.geometry?.location?.lng() ?? 0,
          rating: place.rating,
          ratingCount: place.user_ratings_total,
          photoUrl: place.photos?.[0]?.getUrl({ maxHeight: 400 }),
          openNow: place.opening_hours?.open_now,
          weekdayText: place.opening_hours?.weekday_text,
        })
      }
    )
  })
}
