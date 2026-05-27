export type Id = string

export function generateId(): Id {
  return crypto.randomUUID()
}

export function isoNow(): string {
  return new Date().toISOString()
}
