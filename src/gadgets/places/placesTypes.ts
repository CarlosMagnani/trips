export type DistanceUnit = "km" | "m"

export const DISTANCE_UNITS: DistanceUnit[] = ["km", "m"]

export interface Place {
  id: string
  name: string
  note?: string
  distance: number
  distanceUnit: DistanceUnit
  createdAt: string
  updatedAt: string
}
