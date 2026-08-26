export function getSubscriptionBadgeColor(daysLeft: number): string {
  if (daysLeft <= 7) return 'bg-red-100 text-red-600';
  if (daysLeft <= 30) return 'bg-amber-100 text-amber-600';
  return 'bg-green-100 text-green-600';
}

export function getSubscriptionRemainingLabel(daysLeft: number, compact = false): string {
  return compact ? `剩 ${daysLeft} 天` : `使用剩餘 ${daysLeft} 天`;
}
