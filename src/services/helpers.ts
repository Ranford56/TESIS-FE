export function dateToDateFormat(date: Date) {
  return date.toISOString().split('T')[0]
}