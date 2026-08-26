import { describe, expect, it } from 'vitest';
import { getSubscriptionBadgeColor, getSubscriptionRemainingLabel } from './subscriptionDisplay';

describe('subscription display', () => {
  it('uses the correct warning colors at 30-day and 7-day thresholds', () => {
    expect(getSubscriptionBadgeColor(31)).toContain('text-green-600');
    expect(getSubscriptionBadgeColor(30)).toContain('text-amber-600');
    expect(getSubscriptionBadgeColor(7)).toContain('text-red-600');
  });

  it('provides a clear full label for mobile and a compact desktop label', () => {
    expect(getSubscriptionRemainingLabel(173)).toBe('使用剩餘 173 天');
    expect(getSubscriptionRemainingLabel(173, true)).toBe('剩 173 天');
  });
});
