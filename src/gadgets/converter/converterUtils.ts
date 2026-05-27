export function convert(amount: number, rate: number): number {
  if (!Number.isFinite(amount) || !Number.isFinite(rate) || rate <= 0) return 0
  return amount * rate
}

export function isValidRate(rate: number): boolean {
  return Number.isFinite(rate) && rate > 0
}

export function isValidAmount(amount: number): boolean {
  return Number.isFinite(amount) && amount >= 0
}
