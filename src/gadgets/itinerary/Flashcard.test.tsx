import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { Flashcard } from "./Flashcard"
import type { ItineraryStop } from "./itineraryTypes"

function makeStop(overrides: Partial<ItineraryStop> = {}): ItineraryStop {
  return {
    id: "stop-1",
    name: "Colosseum",
    address: "Piazza del Colosseo, 1, 00184 Roma RM, Italy",
    lat: 41.8902,
    lng: 12.4922,
    photoUrl: "https://example.com/photo.jpg",
    rating: 4.7,
    ratingCount: 350000,
    openNow: true,
    openingHours: { weekdayText: ["Monday: 9:00 AM – 7:00 PM"] },
    userNote: "Try the empanadas",
    order: 0,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    ...overrides,
  }
}

describe("Flashcard", () => {
  it("renders all fields when fully populated", () => {
    render(<Flashcard stop={makeStop()} />)

    expect(screen.getByText("Colosseum")).toBeInTheDocument()
    expect(screen.getByText("Piazza del Colosseo, 1, 00184 Roma RM, Italy")).toBeInTheDocument()
    expect(screen.getByText(/4\.7/)).toBeInTheDocument()
    expect(screen.getByText("Open")).toBeInTheDocument()
    expect(screen.getByText("Try the empanadas")).toBeInTheDocument()
    expect(screen.getByRole("img")).toHaveAttribute("src", "https://example.com/photo.jpg")
  })

  it("renders with minimal fields (name only)", () => {
    render(
      <Flashcard
        stop={makeStop({
          address: undefined,
          photoUrl: undefined,
          rating: undefined,
          ratingCount: undefined,
          openNow: undefined,
          openingHours: undefined,
          userNote: undefined,
        })}
      />
    )

    expect(screen.getByText("Colosseum")).toBeInTheDocument()
    expect(screen.queryByText(/Open|Closed/)).not.toBeInTheDocument()
    expect(screen.queryByRole("img")).not.toBeInTheDocument()
  })

  it('shows "Closed" when openNow is false', () => {
    render(<Flashcard stop={makeStop({ openNow: false })} />)
    expect(screen.getByText("Closed")).toBeInTheDocument()
  })

  it('shows "Open" when openNow is true', () => {
    render(<Flashcard stop={makeStop({ openNow: true })} />)
    expect(screen.getByText("Open")).toBeInTheDocument()
  })

  it("renders rating with star symbol", () => {
    render(<Flashcard stop={makeStop({ rating: 4.5 })} />)
    expect(screen.getByText(/4\.5/)).toBeInTheDocument()
    expect(screen.getByText(/★/)).toBeInTheDocument()
  })

  it("does not render rating section when rating is absent", () => {
    render(<Flashcard stop={makeStop({ rating: undefined })} />)
    expect(screen.queryByText(/★/)).not.toBeInTheDocument()
  })

  it("renders user note when present", () => {
    render(<Flashcard stop={makeStop({ userNote: "Must see!" })} />)
    expect(screen.getByText("Must see!")).toBeInTheDocument()
  })

  it("does not render user note section when absent", () => {
    render(<Flashcard stop={makeStop({ userNote: undefined })} />)
    expect(screen.queryByText("Try the empanadas")).not.toBeInTheDocument()
  })

  it("renders a drag handle", () => {
    render(<Flashcard stop={makeStop()} />)
    expect(screen.getByTestId("drag-handle")).toBeInTheDocument()
  })

  it("renders a context menu icon", () => {
    render(<Flashcard stop={makeStop()} />)
    expect(screen.getByTestId("context-menu")).toBeInTheDocument()
  })

  it("renders photo with correct dimensions", () => {
    render(<Flashcard stop={makeStop()} />)
    const img = screen.getByRole("img")
    expect(img).toHaveClass("h-[120px]")
  })
})
