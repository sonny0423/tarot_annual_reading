import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { BirthdayForm } from "@/components/BirthdayForm";
import { ReadingResult } from "@/components/ReadingResult";
import { CardDetailDialog } from "@/components/CardDetailDialog";
import { Button } from "@/components/ui/button";
import { Sparkles, LogOut, User, ShieldCheck, KeyRound } from "lucide-react";
import { Link } from "wouter";
import type { TarotCard } from "../../../drizzle/schema";
import { getSubscriptionBadgeColor, getSubscriptionRemainingLabel } from "@/lib/subscriptionDisplay";
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
    soulShift: number;
  } | null>(null);

  const [readingData, setReadingData] = useState<any>(null);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);

  const calculateReading = trpc.tarot.calculateReading.useMutation({
    onSuccess: (data) => setReadingData(data),
  });

  const { data: cardDetail } = trpc.tarot.getCard.useQuery(
    { id: selectedCardId ?? 0 },
    { enabled: selectedCardId !== null },
  );

  const handleFormSubmit = (data: {
    solarYear: number;
    solarMonth: number;
    solarDay: number;
    lunarYear: number;
    lunarMonth: number;
    lunarDay: number;
    isLeapMonth: boolean;
    soulShift: number;
  }) => {
    setBirthData(data);
    setReadingData(null);
    const now = new Date();
    calculateReading.mutate({
      birthYear: data.solarYear,
      birthMonth: data.solarMonth,
      birthDay: data.solarDay,
      lunarBirthYear: data.lunarYear,
      lunarBirthMonth: data.lunarMonth,
      lunarBirthDay: data.lunarDay,
      targetYear: now.getFullYear(),
      targetMonth: now.getMonth() + 1,
      targetDay: now.getDate(),
      soulShift: data.soulShift as -1 | 0 | 1,
    });
  };

  const handleReset = () => {
    setBirthData(null);
    setReadingData(null);
    setSelectedCardId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-primary shrink-0" />
              <h1 className="text-xl sm:text-2xl md:text-3xl font-serif bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent whitespace-nowrap">
                塔羅流年運勢
              </h1>
            </div>
            {/* 右上角使用者資訊與登出 */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {user && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline font-medium text-foreground">{user.name && user.name !== user.email ? user.name : (user.email || '使用者')}</span>
              </div>
            )}
            {user && user.role !== 'admin' && (user as any).daysLeft !== undefined && (
              <div className={`hidden sm:flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${getSubscriptionBadgeColor((user as any).daysLeft)}`}>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {getSubscriptionRemainingLabel((user as any).daysLeft, true)}
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
            <Link href="/change-password">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-muted-foreground hover:text-purple-700"
                aria-label="變更密碼"
              >
                <KeyRound className="w-4 h-4" />
                <span className="hidden md:inline">變更密碼</span>
              </Button>
            </Link>
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
          {user && user.role !== 'admin' && (user as any).daysLeft !== undefined && (
            <div className="flex sm:hidden justify-end mt-2">
              <div className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${getSubscriptionBadgeColor((user as any).daysLeft)}`}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {getSubscriptionRemainingLabel((user as any).daysLeft)}
              </div>
            </div>
          )}
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
          {calculateReading.isPending ? (
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
              soulShift={birthData?.soulShift ?? 0}
              cards={readingData.cards}
              lunarPersonality={readingData.lunarPersonality}
              onReset={handleReset}
              onCardClick={(user?.role === 'admin' || user?.role === 'assistant') ? (card) => setSelectedCardId(card.id) : undefined}
            />
          ) : (
            <div className="text-center py-24">
              <p className="text-xl text-destructive">{calculateReading.error?.message || '計算失敗，請重試'}</p>
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
        card={cardDetail as TarotCard | null}
        open={selectedCardId !== null}
        onOpenChange={(open) => !open && setSelectedCardId(null)}
      />
    </div>
  );
}
