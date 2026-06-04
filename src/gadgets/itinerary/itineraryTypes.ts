export type TravelMode = "walking" | "driving"

export const TRAVEL_MODES: TravelMode[] = ["walking", "driving"]

export interface OpeningHours {
  weekdayText: string[]
}

export interface ItineraryStop {
  id: string
  placeId?: string
  name: string
  address?: string
  lat: number
  lng: number
  photoUrl?: string
  rating?: number
  ratingCount?: number
  openingHours?: OpeningHours
  openNow?: boolean
  userNote?: string
  arrivalTime?: string
  durationMinutes?: number
  order: number
  createdAt: string
  updatedAt: string
}

export interface TripDay {
  id: string
  date: string
  travelMode: TravelMode
  startingPoint?: string
  stops: ItineraryStop[]
}

export interface Trip {
  id: string
  name?: string
  startDate: string
  endDate: string
  days: TripDay[]
  createdAt: string
  updatedAt: string
}
