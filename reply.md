### Implementation Summary

Implemented live BRL to ARS exchange rate fetching in the currency converter.

- **Live fetch**: Calls `https://api.exchangerate-api.com/v4/latest/BRL` on page load and on manual refresh.
- **Rate status badge**: Shows `Live` (green), `Cached` (amber), or `Manual` (slate) next to the rate input and in the result card.
- **Loading state**: Refresh button shows a spinner while fetching.
- **Error handling**: If the API fails, the UI displays an inline error message and automatically falls back to the last cached rate from `localStorage`. If no cached rate exists, it prompts the user to enter a rate manually.
- **Manual fallback**: Users can still type their own rate at any time; editing the input switches the source to `Manual`.
- **Persistence**: Every successful live fetch is saved to `localStorage` via the existing storage layer.

### Files Changed

- `src/currency/exchangeRates.ts`: expanded `RateSource` union to `"live" | "cached" | "manual"`; added `fetchBrlToArsRate` API client.
- `src/currency/exchangeRates.test.ts`: tests for the API client.
- `src/currency/useExchangeRate.ts`: new hook managing fetch, loading, error, and fallback to cached/manual state.
- `src/currency/useExchangeRate.test.ts`: tests for live, cached, failure, and refresh paths.
- `src/gadgets/converter/converterTypes.ts`: re-exported updated types.
- `src/gadgets/converter/ConverterForm.tsx`: added status badge, refresh button, loading spinner, error alert, and manual-override logic.
- `src/gadgets/converter/ConverterForm.test.tsx`: tests for badge switching, refresh, error display, and save callbacks.
- `src/pages/ConverterPage.tsx`: wired in `useExchangeRate` and updated `saveRate` to persist the correct source.

### Validation

- `npm run lint` — pass
- `npm run typecheck` — pass
- `npm test` — 55 tests pass

### Notes

- The form pre-fills with the live/cached rate but switches to `Manual` as soon as the user edits the input. Clicking **Refresh** resets the input back to the fetched rate on success.
- No backend or new dependencies were added.
