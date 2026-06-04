const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY as string

export interface AutocompleteSuggestion {
  placePrediction: {
    place: string
    placeId: string
    text: {
      text: string
    }
    structuredFormat: {
      mainText: { text: string }
      secondaryText: { text: string }
    }
  }
}

export interface PlaceDetailsResponse {
  id: string
  displayName: { text: string }
  formattedAddress: string
  location: { latitude: number; longitude: number }
  rating?: number
  userRatingCount?: number
  photos?: { name: string; widthPx: number; heightPx: number }[]
  currentOpeningHours?: { openNow: boolean }
  regularOpeningHours?: {
    weekdayDescriptions: string[]
  }
}

export async function autocompletePlaces(input: string): Promise<AutocompleteSuggestion[]> {
  const response = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": API_KEY,
    },
    body: JSON.stringify({ input }),
  })
  const data = await response.json()
  return (data.suggestions as AutocompleteSuggestion[]) ?? []
}

export async function getPlaceDetails(placeId: string): Promise<PlaceDetailsResponse> {
  const fields = "id,displayName,formattedAddress,location,rating,userRatingCount,photos,regularOpeningHours,currentOpeningHours"
  const response = await fetch(
    `https://places.googleapis.com/v1/places/${placeId}?fields=${fields}`,
    {
      headers: {
        "X-Goog-Api-Key": API_KEY,
      },
    }
  )
  return response.json() as Promise<PlaceDetailsResponse>
}

export function getPhotoUrl(photoName: string, maxHeightPx = 400): string {
  return `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=${maxHeightPx}&key=${API_KEY}`
}
