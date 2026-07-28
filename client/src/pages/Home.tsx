import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { BirthdayForm } from "@/components/BirthdayForm";
import { ReadingResult } from "@/components/ReadingResult";
import { CardDetailDialog } from "@/components/CardDetailDialog";
import { Button } from "@/components/ui/button";
import { Sparkles, LogOut, User, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import type { TarotCard } from "../../../drizzle/schema";
import { calculateFullReading } from "@/lib/tarotCalculator";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Home() {
  const { user, logout } = useAuth();
  const [selectedCard, setSelectedCard] = useState<TarotCard | null>(null);
  const [birthData, setBirthData] = useState<{
    solarYear: number;
    solarMonth: number;
    solarDay: number;
    lunarYear: number;
    lunarMonth: number;
    lunarDay: number;
    isLeapMonth: boolean;
  } | null>(null);

  const [readingData, setReadingData] = useState<any>(null);

  // 預先載入所有塔羅牌資料（只需一次，之後本地快取）
  const { data: allCardsData } = trpc.tarot.getAllCards.useQuery();

  useEffect(() => {
    if (birthData && allCardsData && allCardsData.length > 0) {
      // 使用瀏覽器的當前日期，完全本地計算
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      const currentDay = now.getDate();

      const reading = calculateFullReading(
        birthData.solarYear,
        birthData.solarMonth,
        birthData.solarDay,
        birthData.lunarYear,
        birthData.lunarMonth,
        birthData.lunarDay,
        currentYear,
        currentMonth,
        currentDay
      );

      // 建立牌卡 Map
      const cardMap = new Map(allCardsData.map((c: TarotCard) => [c.id, c]));

      setReadingData({
        reading,
        cards: {
          core: cardMap.get(reading.coreCard),
          outer: cardMap.get(reading.outerCard),
          inner: cardMap.get(reading.innerCard),
          benefactorCore: cardMap.get(reading.benefactorCore),
          benefactorOuter: cardMap.get(reading.benefactorOuter),
          benefactorInner: cardMap.get(reading.benefactorInner),
          year: cardMap.get(reading.yearCard),
          month: cardMap.get(reading.monthCard),
          day: cardMap.get(reading.dayCard),
          lunarYear: cardMap.get(reading.lunarYearCard),
          lunarMonth: cardMap.get(reading.lunarMonthCard),
          lunarDay: cardMap.get(reading.lunarDayCard),
        },
        allCards: allCardsData,
      });
    }
  }, [birthData, allCardsData]);

  const handleFormSubmit = (data: {
    solarYear: number;
    solarMonth: number;
    solarDay: number;
    lunarYear: number;
    lunarMonth: number;
    lunarDay: number;
    isLeapMonth: boolean;
  }) => {
    setBirthData(data);
  };

  const handleReset = () => {
    setBirthData(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-primary" />
            <h1 className="text-2xl md:text-3xl font-serif bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              塔羅流年運勢
            </h1>
          </div>
          {/* 右上角使用者資訊與登出 */}
          <div className="flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline font-medium text-foreground">{user.name && user.name !== user.email ? user.name : (user.email || '使用者')}</span>
              </div>
            )}
            {user?.role === 'admin' && (
              <Link href="/admin/users">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-purple-600 border-purple-300 hover:bg-purple-50 hover:text-purple-700"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span className="hidden sm:inline">管理員後台</span>
                </Button>
              </Link>
            )}
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-foreground"
              onClick={async () => {
                await logout();
                window.location.href = '/welcome';
              }}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">登出</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      {!birthData && (
        <section className="container py-16 md:py-24 space-y-8">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-serif bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent leading-tight">
              探索您的塔羅靈數
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              透過生日計算專屬的靈數DNA，深入了解您的本性、外顯與內心特質<br />
              以及流年、流月、流日的運勢走向
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 blur-3xl opacity-30 animate-pulse pointer-events-none" />
            <BirthdayForm onSubmit={handleFormSubmit} />
          </div>
        </section>
      )}

      {/* Results Section */}
      {birthData && (
        <section className="container py-12 md:py-16">
          {!readingData ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
              <Sparkles className="w-16 h-16 text-primary animate-spin" />
              <p className="text-xl text-muted-foreground">正在為您計算塔羅靈數...</p>
            </div>
          ) : readingData ? (
            <ReadingResult
              birthYear={birthData?.solarYear ?? 0}
              birthMonth={birthData?.solarMonth ?? 0}
              birthDay={birthData?.solarDay ?? 0}
              lunarYear={birthData?.lunarYear ?? 0}
              lunarMonth={birthData?.lunarMonth ?? 0}
              lunarDay={birthData?.lunarDay ?? 0}
              cards={readingData.cards}
              onReset={handleReset}
              onCardClick={setSelectedCard}
              allCards={readingData.allCards || []}
            />
          ) : (
            <div className="text-center py-24">
              <p className="text-xl text-destructive">計算失敗，請重試</p>
              <Button onClick={handleReset} className="mt-4">
                重新開始
              </Button>
            </div>
          )}
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30 backdrop-blur-sm mt-24">
        <div className="container py-8 text-center text-sm text-muted-foreground">
          <p>塔羅流年運勢查詢系統 · 探索內在智慧，洞察人生運勢</p>
        </div>
      </footer>

      {/* Card Detail Dialog */}
      <CardDetailDialog
        card={selectedCard}
        open={!!selectedCard}
        onOpenChange={(open) => !open && setSelectedCard(null)}
      />
    </div>
  );
}
