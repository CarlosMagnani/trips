import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ConverterForm } from "./ConverterForm"

describe("ConverterForm", () => {
  const defaultProps = {
    fetchedRate: 180,
    fetchedSource: "live" as const,
    isLoading: false,
    fetchError: null,
    onRefresh: vi.fn(),
    onSaveRate: vi.fn(),
  }

  it("renders with fetched live rate", () => {
    render(<ConverterForm {...defaultProps} />)

    expect(screen.getByPlaceholderText("e.g. 180")).toHaveValue(180)
    expect(screen.getByTestId("rate-source-badge")).toHaveTextContent("Live")
  })

  it("switches to manual when user edits the rate", async () => {
    const user = userEvent.setup()
    render(<ConverterForm {...defaultProps} />)

    const rateInput = screen.getByPlaceholderText("e.g. 180")
    await user.clear(rateInput)
    await user.type(rateInput, "200")

    expect(screen.getByTestId("rate-source-badge")).toHaveTextContent("Manual")
  })

  it("calls onRefresh when refresh button is clicked", async () => {
    const user = userEvent.setup()
    const onRefresh = vi.fn()
    render(<ConverterForm {...defaultProps} onRefresh={onRefresh} />)

    await user.click(screen.getByTestId("refresh-rate-button"))
    expect(onRefresh).toHaveBeenCalledTimes(1)
  })

  it("shows loading spinner when isLoading is true", () => {
    render(<ConverterForm {...defaultProps} isLoading={true} />)

    expect(screen.getByTestId("refresh-rate-button")).toBeDisabled()
  })

  it("shows error message when fetchError is present", () => {
    render(
      <ConverterForm
        {...defaultProps}
        fetchError="Unable to fetch live rate. Using cached rate."
        fetchedSource="cached"
      />
    )

    expect(screen.getByTestId("fetch-error")).toHaveTextContent(
      "Unable to fetch live rate. Using cached rate."
    )
    expect(screen.getByTestId("rate-source-badge")).toHaveTextContent("Cached")
  })

  it("calls onSaveRate with correct source on submit", async () => {
    const user = userEvent.setup()
    const onSaveRate = vi.fn()
    render(<ConverterForm {...defaultProps} onSaveRate={onSaveRate} />)

    await user.type(screen.getByPlaceholderText("0.00"), "100")
    await user.click(screen.getByRole("button", { name: /convert/i }))

    expect(onSaveRate).toHaveBeenCalledWith(180, "live")
  })

  it("calls onSaveRate with manual source when rate was edited", async () => {
    const user = userEvent.setup()
    const onSaveRate = vi.fn()
    render(<ConverterForm {...defaultProps} onSaveRate={onSaveRate} />)

    const rateInput = screen.getByPlaceholderText("e.g. 180")
    await user.clear(rateInput)
    await user.type(rateInput, "200")

    await user.type(screen.getByPlaceholderText("0.00"), "100")
    await user.click(screen.getByRole("button", { name: /convert/i }))

    expect(onSaveRate).toHaveBeenCalledWith(200, "manual")
  })

  it("shows validation errors for invalid inputs", async () => {
    const user = userEvent.setup()
    render(<ConverterForm {...defaultProps} fetchedRate={undefined} />)

    await user.click(screen.getByRole("button", { name: /convert/i }))

    expect(screen.getByText("Enter a valid amount")).toBeInTheDocument()
    expect(
      screen.getByText("Enter a valid rate greater than 0")
    ).toBeInTheDocument()
  })

  it("pre-fills rate from fetchedRate when it changes", () => {
    const { rerender } = render(
      <ConverterForm {...defaultProps} fetchedRate={180} />
    )

    expect(screen.getByPlaceholderText("e.g. 180")).toHaveValue(180)

    rerender(<ConverterForm {...defaultProps} fetchedRate={190} />)

    expect(screen.getByPlaceholderText("e.g. 180")).toHaveValue(190)
  })
})
