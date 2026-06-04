import { describe, it, expect, vi, beforeEach } from "vitest"
import { autocompletePlaces, getPlaceDetails, getPhotoUrl } from "./placesApi"

const mockFetch = vi.fn()
vi.stubGlobal("fetch", mockFetch)

describe("autocompletePlaces", () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it("returns suggestions from the API", async () => {
    const mockResponse = {
      suggestions: [
        {
          placePrediction: {
            place: "places/ChIJ123",
            placeId: "ChIJ123",
            text: { text: "Colosseum, Rome, Italy" },
            structuredFormat: {
              mainText: { text: "Colosseum" },
              secondaryText: { text: "Rome, Italy" },
            },
          },
        },
      ],
    }
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockResponse),
    })

    const results = await autocompletePlaces("Colos")

    expect(results).toHaveLength(1)
    expect(results[0].placePrediction.placeId).toBe("ChIJ123")
    expect(mockFetch).toHaveBeenCalledWith(
      "https://places.googleapis.com/v1/places:autocomplete",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ input: "Colos" }),
      })
    )
  })

  it("returns empty array when no suggestions", async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({}),
    })

    const results = await autocompletePlaces("xyznonexistent")
    expect(results).toEqual([])
  })
})

describe("getPlaceDetails", () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it("returns place details from the API", async () => {
    const mockDetails = {
      id: "ChIJ123",
      displayName: { text: "Colosseum" },
      formattedAddress: "Piazza del Colosseo, 1, 00184 Roma RM, Italy",
      location: { latitude: 41.8902, longitude: 12.4922 },
      rating: 4.7,
      userRatingCount: 350000,
      photos: [{ name: "places/ChIJ123/photos/Aa", widthPx: 4000, heightPx: 3000 }],
      currentOpeningHours: { openNow: true },
      regularOpeningHours: {
        weekdayDescriptions: ["Monday: 9:00 AM – 7:00 PM"],
      },
    }
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockDetails),
    })

    const result = await getPlaceDetails("ChIJ123")

    expect(result.displayName.text).toBe("Colosseum")
    expect(result.location.latitude).toBe(41.8902)
    expect(result.rating).toBe(4.7)
    expect(result.currentOpeningHours?.openNow).toBe(true)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("https://places.googleapis.com/v1/places/ChIJ123"),
      expect.any(Object)
    )
  })
})

describe("getPhotoUrl", () => {
  it("constructs a photo URL with default max height", () => {
    const url = getPhotoUrl("places/ChIJ123/photos/Aa")
    expect(url).toContain("places/ChIJ123/photos/Aa/media")
    expect(url).toContain("maxHeightPx=400")
  })

  it("constructs a photo URL with custom max height", () => {
    const url = getPhotoUrl("places/ChIJ123/photos/Aa", 200)
    expect(url).toContain("maxHeightPx=200")
  })
})
