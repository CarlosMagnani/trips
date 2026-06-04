import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { PlaceSearch } from "./PlaceSearch"
import type { ItineraryStop } from "./itineraryTypes"

vi.mock("./placesApi", () => ({
  autocompletePlaces: vi.fn(),
  getPlaceDetails: vi.fn(),
}))

import { autocompletePlaces, getPlaceDetails } from "./placesApi"

const mockAutocomplete = vi.mocked(autocompletePlaces)
const mockGetDetails = vi.mocked(getPlaceDetails)

describe("PlaceSearch", () => {
  const onSelect = vi.fn<(stop: Omit<ItineraryStop, "id" | "order" | "createdAt" | "updatedAt">) => void>()

  beforeEach(() => {
    vi.clearAllMocks()
    mockAutocomplete.mockResolvedValue([])
  })

  it("renders a search input", () => {
    render(<PlaceSearch onSelect={onSelect} onClose={vi.fn()} />)
    expect(screen.getByPlaceholderText(/search places/i)).toBeInTheDocument()
  })

  it("shows autocomplete suggestions when user types", async () => {
    const user = userEvent.setup()
    mockAutocomplete.mockResolvedValueOnce([
      {
        placeId: "ChIJ123",
        description: "Colosseum, Rome, Italy",
        mainText: "Colosseum",
        secondaryText: "Rome, Italy",
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
        placeId: "ChIJ123",
        description: "Colosseum, Rome, Italy",
        mainText: "Colosseum",
        secondaryText: "Rome, Italy",
      },
    ])
    mockGetDetails.mockResolvedValueOnce({
      placeId: "ChIJ123",
      name: "Colosseum",
      formattedAddress: "Piazza del Colosseo, 1, 00184 Roma RM, Italy",
      lat: 41.8902,
      lng: 12.4922,
      rating: 4.7,
      ratingCount: 350000,
      photoUrl: "https://maps.googleapis.com/maps/api/place/photo?maxheight=400",
      openNow: true,
      weekdayText: ["Monday: 9:00 AM – 7:00 PM"],
    })

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
        photoUrl: "https://maps.googleapis.com/maps/api/place/photo?maxheight=400",
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
        placeId: "ChIJ456",
        description: "Some Place, Somewhere",
        mainText: "Some Place",
        secondaryText: "Somewhere",
      },
    ])
    mockGetDetails.mockResolvedValueOnce({
      placeId: "ChIJ456",
      name: "Some Place",
      formattedAddress: "123 Main St",
      lat: 40.0,
      lng: -74.0,
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

  it("discards stale autocomplete responses", async () => {
    const user = userEvent.setup()
    let resolveFirst: ((value: unknown[]) => void) | null = null
    const firstRequest = new Promise<unknown[]>((resolve) => {
      resolveFirst = resolve
    })
    const secondRequest = Promise.resolve([
      {
        placeId: "ChIJ999",
        description: "Rome, Italy",
        mainText: "Rome",
        secondaryText: "Italy",
      },
    ])

    mockAutocomplete
      .mockReturnValueOnce(firstRequest as Promise<never[]>)
      .mockReturnValueOnce(secondRequest)

    render(<PlaceSearch onSelect={onSelect} onClose={vi.fn()} />)

    const input = screen.getByPlaceholderText(/search places/i)
    await user.type(input, "Pari")

    await waitFor(() => {
      expect(mockAutocomplete).toHaveBeenCalledWith("Pari")
    })

    await user.clear(input)
    await user.type(input, "Rome")

    await waitFor(() => {
      expect(mockAutocomplete).toHaveBeenCalledWith("Rome")
    })

    // Resolve the stale "Pari" request after "Rome" has already been requested
    resolveFirst!([
      {
        placeId: "ChIJ777",
        description: "Paris, France",
        mainText: "Paris",
        secondaryText: "France",
      },
    ])

    // Wait for the Rome results to appear
    await waitFor(() => {
      expect(screen.getByText("Rome")).toBeInTheDocument()
    })

    // Paris should NOT appear — the stale response was discarded
    expect(screen.queryByText("Paris")).not.toBeInTheDocument()
  })
})
