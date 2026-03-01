import { describe, it, expect } from 'vitest';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { tarotCards } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

describe('Annual Meanings', () => {
  it('should have annual meanings for all tarot cards', async () => {
    const connection = await mysql.createConnection(process.env.DATABASE_URL!);
    const db = drizzle(connection);

    // 檢查所有牌卡都有流年牌義
    const cards = await db.select().from(tarotCards);
    
    expect(cards.length).toBe(22); // 應該有22張牌

    // 檢查每張牌都有流年正位牌義
    for (const card of cards) {
      expect(card.annualUpright).toBeTruthy();
      expect(card.annualUpright!.length).toBeGreaterThan(0);
    }

    await connection.end();
  });

  it('should have correct annual meaning for card 0 (愚人)', async () => {
    const connection = await mysql.createConnection(process.env.DATABASE_URL!);
    const db = drizzle(connection);

    const card = await db.select().from(tarotCards).where(eq(tarotCards.id, 0));
    
    expect(card[0].name).toBe('愚人');
    expect(card[0].annualUpright).toContain('活力充沛');
    expect(card[0].annualReversed).toContain('衝動魯莽');

    await connection.end();
  });

  it('should have correct annual meaning for card 10 (命運之輪)', async () => {
    const connection = await mysql.createConnection(process.env.DATABASE_URL!);
    const db = drizzle(connection);

    const card = await db.select().from(tarotCards).where(eq(tarotCards.id, 10));
    
    expect(card[0].name).toBe('命運之輪');
    expect(card[0].annualUpright).toContain('運氣好轉');
    expect(card[0].annualReversed).toContain('不公平');

    await connection.end();
  });
});
