import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest"
import { autocompletePlaces, getPlaceDetails } from "./placesApi"

vi.mock("@googlemaps/js-api-loader", () => ({
  setOptions: vi.fn(),
  importLibrary: vi.fn().mockResolvedValue(undefined),
}))

const mockGetPlacePredictions = vi.fn()
const mockGetDetails = vi.fn()

const mockAutocompleteService = {
  getPlacePredictions: mockGetPlacePredictions,
}

const mockPlacesService = {
  getDetails: mockGetDetails,
}

beforeAll(() => {
  const g = globalThis as Record<string, unknown>
  g.google = {
    maps: {
      places: {
        AutocompleteService: vi.fn(function () {
          return mockAutocompleteService
        }),
        PlacesService: vi.fn(function () {
          return mockPlacesService
        }),
        PlacesServiceStatus: {
          OK: "OK",
          NOT_FOUND: "NOT_FOUND",
          ZERO_RESULTS: "ZERO_RESULTS",
        },
      },
    },
  }
})

describe("autocompletePlaces", () => {
  beforeEach(() => {
    mockGetPlacePredictions.mockReset()
  })

  it("returns predictions from the Maps JS API", async () => {
    mockGetPlacePredictions.mockImplementation(
      (_request: unknown, callback: (predictions: unknown[], status: string) => void) => {
        callback(
          [
            {
              place_id: "ChIJ123",
              description: "Colosseum, Rome, Italy",
              structured_formatting: {
                main_text: "Colosseum",
                secondary_text: "Rome, Italy",
              },
            },
          ],
          "OK"
        )
      }
    )

    const results = await autocompletePlaces("Colos")

    expect(results).toHaveLength(1)
    expect(results[0]).toEqual({
      placeId: "ChIJ123",
      description: "Colosseum, Rome, Italy",
      mainText: "Colosseum",
      secondaryText: "Rome, Italy",
    })
    expect(mockGetPlacePredictions).toHaveBeenCalledWith(
      { input: "Colos" },
      expect.any(Function)
    )
  })

  it("returns empty array when status is not OK", async () => {
    mockGetPlacePredictions.mockImplementation(
      (_request: unknown, callback: (predictions: null, status: string) => void) => {
        callback(null, "ZERO_RESULTS")
      }
    )

    const results = await autocompletePlaces("xyznonexistent")
    expect(results).toEqual([])
  })

  it("returns empty array when predictions is null", async () => {
    mockGetPlacePredictions.mockImplementation(
      (_request: unknown, callback: (predictions: null, status: string) => void) => {
        callback(null, "OK")
      }
    )

    const results = await autocompletePlaces("test")
    expect(results).toEqual([])
  })
})

describe("getPlaceDetails", () => {
  beforeEach(() => {
    mockGetDetails.mockReset()
  })

  it("returns flattened place details from the Maps JS API", async () => {
    mockGetDetails.mockImplementation(
      (_request: unknown, callback: (place: unknown, status: string) => void) => {
        callback(
          {
            place_id: "ChIJ123",
            name: "Colosseum",
            formatted_address: "Piazza del Colosseo, 1, 00184 Roma RM, Italy",
            geometry: {
              location: { lat: () => 41.8902, lng: () => 12.4922 },
            },
            rating: 4.7,
            user_ratings_total: 350000,
            photos: [{ getUrl: (opts: { maxHeight: number }) => `https://maps.googleapis.com/maps/api/place/photo?maxheight=${opts.maxHeight}` }],
            opening_hours: { open_now: true, weekday_text: ["Monday: 9:00 AM – 7:00 PM"] },
          },
          "OK"
        )
      }
    )

    const result = await getPlaceDetails("ChIJ123")

    expect(result.placeId).toBe("ChIJ123")
    expect(result.name).toBe("Colosseum")
    expect(result.formattedAddress).toBe("Piazza del Colosseo, 1, 00184 Roma RM, Italy")
    expect(result.lat).toBe(41.8902)
    expect(result.lng).toBe(12.4922)
    expect(result.rating).toBe(4.7)
    expect(result.ratingCount).toBe(350000)
    expect(result.photoUrl).toContain("maxheight=400")
    expect(result.openNow).toBe(true)
    expect(result.weekdayText).toEqual(["Monday: 9:00 AM – 7:00 PM"])
  })

  it("rejects when status is not OK", async () => {
    mockGetDetails.mockImplementation(
      (_request: unknown, callback: (place: null, status: string) => void) => {
        callback(null, "NOT_FOUND")
      }
    )

    await expect(getPlaceDetails("invalid")).rejects.toThrow("Places service error")
  })

  it("handles place with no photos", async () => {
    mockGetDetails.mockImplementation(
      (_request: unknown, callback: (place: unknown, status: string) => void) => {
        callback(
          {
            place_id: "ChIJ456",
            name: "Some Place",
            formatted_address: "123 Main St",
            geometry: {
              location: { lat: () => 40.0, lng: () => -74.0 },
            },
          },
          "OK"
        )
      }
    )

    const result = await getPlaceDetails("ChIJ456")

    expect(result.name).toBe("Some Place")
    expect(result.photoUrl).toBeUndefined()
    expect(result.openNow).toBeUndefined()
  })
})
