import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { PlaceSearch } from "./PlaceSearch"
import type { ItineraryStop } from "./itineraryTypes"

vi.mock("./placesApi", () => ({
  autocompletePlaces: vi.fn(),
  getPlaceDetails: vi.fn(),
  getPhotoUrl: vi.fn(),
}))

import { autocompletePlaces, getPlaceDetails, getPhotoUrl } from "./placesApi"

const mockAutocomplete = vi.mocked(autocompletePlaces)
const mockGetDetails = vi.mocked(getPlaceDetails)
const mockGetPhotoUrl = vi.mocked(getPhotoUrl)

describe("PlaceSearch", () => {
  const onSelect = vi.fn<(stop: Omit<ItineraryStop, "id" | "order" | "createdAt" | "updatedAt">) => void>()

  beforeEach(() => {
    vi.clearAllMocks()
    mockAutocomplete.mockResolvedValue([])
    mockGetPhotoUrl.mockReturnValue("https://example.com/photo.jpg")
  })

  it("renders a search input", () => {
    render(<PlaceSearch onSelect={onSelect} onClose={vi.fn()} />)
    expect(screen.getByPlaceholderText(/search places/i)).toBeInTheDocument()
  })

  it("shows autocomplete suggestions when user types", async () => {
    const user = userEvent.setup()
    mockAutocomplete.mockResolvedValueOnce([
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
    ])

    render(<PlaceSearch onSelect={onSelect} onClose={vi.fn()} />)

    const input = screen.getByPlaceholderText(/search places/i)
    await user.type(input, "Colo")

    await waitFor(() => {
      expect(mockAutocomplete).toHaveBeenCalledWith("Colo")
    })

    await waitFor(() => {
      expect(screen.getByText("Colosseum")).toBeInTheDocument()
    })
  })

  it("calls onSelect with stop data when a suggestion is selected", async () => {
    const user = userEvent.setup()
    mockAutocomplete.mockResolvedValueOnce([
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
    ])
    mockGetDetails.mockResolvedValueOnce({
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
    })
    mockGetPhotoUrl.mockReturnValue("https://example.com/photo.jpg")

    render(<PlaceSearch onSelect={onSelect} onClose={vi.fn()} />)

    const input = screen.getByPlaceholderText(/search places/i)
    await user.type(input, "Colo")

    await waitFor(() => {
      expect(screen.getByText("Colosseum")).toBeInTheDocument()
    })

    await user.click(screen.getByText("Colosseum"))

    await waitFor(() => {
      expect(mockGetDetails).toHaveBeenCalledWith("ChIJ123")
    })

    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Colosseum",
        placeId: "ChIJ123",
        address: "Piazza del Colosseo, 1, 00184 Roma RM, Italy",
        lat: 41.8902,
        lng: 12.4922,
        rating: 4.7,
        openNow: true,
        photoUrl: "https://example.com/photo.jpg",
      })
    )
  })

  it("shows no results message when autocomplete returns empty", async () => {
    const user = userEvent.setup()
    mockAutocomplete.mockResolvedValueOnce([])

    render(<PlaceSearch onSelect={onSelect} onClose={vi.fn()} />)

    const input = screen.getByPlaceholderText(/search places/i)
    await user.type(input, "xyznonexistent")

    await waitFor(() => {
      expect(screen.getByText(/no results/i)).toBeInTheDocument()
    })
  })

  it("handles place with no photos", async () => {
    const user = userEvent.setup()
    mockAutocomplete.mockResolvedValueOnce([
      {
        placePrediction: {
          place: "places/ChIJ456",
          placeId: "ChIJ456",
          text: { text: "Some Place" },
          structuredFormat: {
            mainText: { text: "Some Place" },
            secondaryText: { text: "Somewhere" },
          },
        },
      },
    ])
    mockGetDetails.mockResolvedValueOnce({
      id: "ChIJ456",
      displayName: { text: "Some Place" },
      formattedAddress: "123 Main St",
      location: { latitude: 40.0, longitude: -74.0 },
    })

    render(<PlaceSearch onSelect={onSelect} onClose={vi.fn()} />)

    const input = screen.getByPlaceholderText(/search places/i)
    await user.type(input, "Some")

    await waitFor(() => {
      expect(screen.getByText("Some Place")).toBeInTheDocument()
    })

    await user.click(screen.getByText("Some Place"))

    await waitFor(() => {
      expect(onSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Some Place",
          photoUrl: undefined,
        })
      )
    })
  })
})
