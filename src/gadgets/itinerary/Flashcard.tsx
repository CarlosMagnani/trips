import type { ItineraryStop } from "./itineraryTypes"
import { GripVertical, MoreVertical } from "lucide-react"

interface FlashcardProps {
  stop: ItineraryStop
}

export function Flashcard({ stop }: FlashcardProps) {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
      {stop.photoUrl && (
        <img
          src={stop.photoUrl}
          alt={stop.name}
          className="w-full h-[120px] object-cover"
        />
      )}

      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm leading-tight">{stop.name}</h3>

            {stop.address && (
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {stop.address}
              </p>
            )}

            <div className="flex items-center gap-2 mt-1">
              {stop.rating != null && (
                <span className="text-xs text-muted-foreground">
                  {stop.rating} ★
                </span>
              )}

              {stop.openNow != null && (
                <span
                  className={`text-xs font-medium ${
                    stop.openNow ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stop.openNow ? "Open" : "Closed"}
                </span>
              )}
            </div>

            {stop.userNote && (
              <p className="text-xs italic text-muted-foreground mt-1">
                {stop.userNote}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <span
              data-testid="drag-handle"
              className="cursor-grab text-muted-foreground p-1"
            >
              <GripVertical className="h-4 w-4" />
            </span>
            <span
              data-testid="context-menu"
              className="cursor-pointer text-muted-foreground p-1"
            >
              <MoreVertical className="h-4 w-4" />
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
