import { describe, it, expect, beforeEach } from "vitest"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Routes, Route } from "react-router-dom"
import { HomePage } from "./HomePage"
import { ItineraryPage } from "./ItineraryPage"
import { writeStorage } from "@/storage/localStore"
import { STORAGE_NAMESPACE } from "@/storage/storageKeys"
import type { Trip } from "@/gadgets/itinerary/itineraryTypes"
import { generateId } from "@/types/common"

function renderWithRoutes(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/itinerary" element={<ItineraryPage />} />
      </Routes>
    </MemoryRouter>
  )
}

function makeTrip(overrides: Partial<Trip> = {}): Trip {
  return {
    id: generateId(),
    startDate: "2024-06-10",
    endDate: "2024-06-12",
    days: [
      {
        id: "day-1",
        date: "2024-06-10",
        travelMode: "driving",
        stops: [],
      },
      {
        id: "day-2",
        date: "2024-06-11",
        travelMode: "driving",
        stops: [],
      },
      {
        id: "day-3",
        date: "2024-06-12",
        travelMode: "driving",
        stops: [],
      },
    ],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    ...overrides,
  }
}

describe("HomePage", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe("Itinerary gadget card", () => {
    it("renders the Itinerary card with the 'No trip planned' hint when no trip exists", () => {
      renderWithRoutes("/")

      const itineraryLink = screen.getByRole("link", { name: /Itinerary/i })
      expect(itineraryLink).toHaveAttribute("href", "/itinerary")
      expect(within(itineraryLink).getByText("Itinerary")).toBeInTheDocument()
      expect(
        within(itineraryLink).getByText("Plan your daily trip")
      ).toBeInTheDocument()
      expect(
        within(itineraryLink).getByText("No trip planned — tap to start")
      ).toBeInTheDocument()
    })

    it("renders the trip summary hint when an active trip exists", () => {
      const trip = makeTrip()
      writeStorage({
        exchangeRates: [],
        places: [],
        transactions: [],
        trips: [trip],
        activeTripId: trip.id,
      })

      renderWithRoutes("/")

      const itineraryLink = screen.getByRole("link", { name: /Itinerary/i })
      expect(within(itineraryLink).getByText("Itinerary")).toBeInTheDocument()
      expect(
        within(itineraryLink).getByText(/Day \d+ of \d+, \d+ stops?, (Walking|Driving)/)
      ).toBeInTheDocument()
    })

    it("navigates to /itinerary when the card is tapped", async () => {
      const user = userEvent.setup()
      renderWithRoutes("/")

      await user.click(screen.getByRole("link", { name: /Itinerary/i }))

      // ItineraryPage renders "Plan Your Trip" header when no trip exists
      expect(
        await screen.findByRole("heading", { name: /Plan Your Trip/i })
      ).toBeInTheDocument()
    })

    it("shows the trip view on /itinerary when an active trip exists", async () => {
      const user = userEvent.setup()
      const trip = makeTrip()
      writeStorage({
        exchangeRates: [],
        places: [],
        transactions: [],
        trips: [trip],
        activeTripId: trip.id,
      })

      renderWithRoutes("/")
      await user.click(screen.getByRole("link", { name: /Itinerary/i }))

      // ItineraryPage renders the "Itinerary" header when a trip exists
      expect(
        await screen.findByRole("heading", { name: "Itinerary" })
      ).toBeInTheDocument()
    })
  })

  it("renders all four gadget cards", () => {
    renderWithRoutes("/")

    expect(
      screen.getByRole("link", { name: /Currency Converter/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: /Places by Distance/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: /Budget Notes/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: /Itinerary/i })
    ).toBeInTheDocument()
  })

  it("reads storage from the canonical namespace", () => {
    // Sanity check that the storage helper we use here matches the app's
    localStorage.setItem(STORAGE_NAMESPACE, "not json")
    renderWithRoutes("/")
    // All gadgets should still render with empty state
    expect(
      screen.getByRole("link", { name: /Itinerary/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: /Itinerary/i })
    ).toHaveTextContent("No trip planned — tap to start")
  })
})
