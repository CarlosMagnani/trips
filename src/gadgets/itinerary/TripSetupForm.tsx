import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FieldError } from "@/components/FieldError"
import { isValidDateRange } from "./itineraryUtils"

interface TripSetupFormProps {
  onSubmit: (startDate: string, endDate: string) => void
}

export function TripSetupForm({ onSubmit }: TripSetupFormProps) {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [dateError, setDateError] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!startDate || !endDate) {
      setDateError("Both start and end dates are required")
      return
    }

    if (!isValidDateRange(startDate, endDate)) {
      setDateError("End date must be on or after start date")
      return
    }

    setDateError("")
    onSubmit(startDate, endDate)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="trip-start">Start Date</Label>
        <Input
          id="trip-start"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="trip-end">End Date</Label>
        <Input
          id="trip-end"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      <FieldError message={dateError} />

      <Button type="submit" className="w-full">
        Create Trip
      </Button>
    </form>
  )
}
