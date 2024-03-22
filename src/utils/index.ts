export * from './gui'

export function arrayLike(val: any) {
  if (Array.isArray(val)) return val
  return [val]
}
