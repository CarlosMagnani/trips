export type CurrencyCode = "BRL" | "ARS"

export const CURRENCY_CODES: CurrencyCode[] = ["BRL", "ARS"]

export interface CurrencyMeta {
  code: CurrencyCode
  symbol: string
  label: string
}

export const CURRENCY_META: Record<CurrencyCode, CurrencyMeta> = {
  BRL: { code: "BRL", symbol: "R$", label: "Brazilian Real" },
  ARS: { code: "ARS", symbol: "$", label: "Argentine Peso" },
}
