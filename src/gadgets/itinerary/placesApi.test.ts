import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest"
import { autocompletePlaces, getPlaceDetails } from "./placesApi"

vi.mock("@googlemaps/js-api-loader", () => ({
  setOptions: vi.fn(),
  importLibrary: vi.fn().mockResolvedValue(undefined),
}))

const mockFetchAutocompleteSuggestions = vi.fn()
const mockFetchFields = vi.fn()
const mockIsOpen = vi.fn()

let mockPlaceState: Record<string, unknown> = {}

beforeAll(() => {
  const g = globalThis as Record<string, unknown>
  g.google = {
    maps: {
      places: {
        AutocompleteSuggestion: {
          fetchAutocompleteSuggestions: mockFetchAutocompleteSuggestions,
        },
        Place: vi.fn(function (opts: { id: string }) {
          const self = this as Record<string, unknown>
          self.id = opts.id
          self.displayName = undefined
          self.formattedAddress = undefined
          self.location = undefined
          self.rating = undefined
          self.userRatingCount = undefined
          self.photos = undefined
          self.regularOpeningHours = undefined
          self.currentOpeningHours = undefined
          self.fetchFields = async (request: { fields: string[] }) => {
            await mockFetchFields(request)
            Object.assign(self, mockPlaceState)
          }
          self.isOpen = mockIsOpen
        }),
      },
    },
  }
})

describe("autocompletePlaces", () => {
  beforeEach(() => {
    mockFetchAutocompleteSuggestions.mockReset()
  })

  it("returns predictions from the Maps JS API", async () => {
    mockFetchAutocompleteSuggestions.mockResolvedValue({
      suggestions: [
        {
          placePrediction: {
            placeId: "ChIJ123",
            text: { toString: () => "Colosseum, Rome, Italy" },
            mainText: { toString: () => "Colosseum" },
            secondaryText: { toString: () => "Rome, Italy" },
          },
        },
      ],
    })

    const results = await autocompletePlaces("Colos")

    expect(results).toHaveLength(1)
    expect(results[0]).toEqual({
      placeId: "ChIJ123",
      description: "Colosseum, Rome, Italy",
      mainText: "Colosseum",
      secondaryText: "Rome, Italy",
    })
    expect(mockFetchAutocompleteSuggestions).toHaveBeenCalledWith({
      input: "Colos",
    })
  })

  it("returns empty array when suggestions is empty", async () => {
    mockFetchAutocompleteSuggestions.mockResolvedValue({
      suggestions: [],
    })

    const results = await autocompletePlaces("xyznonexistent")
    expect(results).toEqual([])
  })

  it("returns empty array when suggestions is null", async () => {
    mockFetchAutocompleteSuggestions.mockResolvedValue({
      suggestions: null,
    })

    const results = await autocompletePlaces("test")
    expect(results).toEqual([])
  })
})

describe("getPlaceDetails", () => {
  beforeEach(() => {
    mockFetchFields.mockReset()
    mockIsOpen.mockReset()
    mockPlaceState = {}
  })

  it("returns flattened place details from the Maps JS API", async () => {
    mockPlaceState = {
      displayName: "Colosseum",
      formattedAddress: "Piazza del Colosseo, 1, 00184 Roma RM, Italy",
      location: { lat: () => 41.8902, lng: () => 12.4922 },
      rating: 4.7,
      userRatingCount: 350000,
      photos: [{ getURI: () => "https://maps.googleapis.com/maps/api/place/photo?maxheight=400" }],
      regularOpeningHours: {
        weekdayDescriptions: ["Monday: 9:00 AM – 7:00 PM"],
      },
    }
    mockIsOpen.mockResolvedValue(true)

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

  it("rejects when fetchFields throws", async () => {
    mockFetchFields.mockRejectedValue(new Error("Places service error: NOT_FOUND"))

    await expect(getPlaceDetails("invalid")).rejects.toThrow("Places service error")
  })

  it("handles place with no photos", async () => {
    mockPlaceState = {
      displayName: "Some Place",
      formattedAddress: "123 Main St",
      location: { lat: () => 40.0, lng: () => -74.0 },
    }
    mockIsOpen.mockRejectedValue(new Error("no hours"))

    const result = await getPlaceDetails("ChIJ456")

    expect(result.name).toBe("Some Place")
    expect(result.photoUrl).toBeUndefined()
    expect(result.openNow).toBeUndefined()
  })
})
