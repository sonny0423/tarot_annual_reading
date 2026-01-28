import { TarotCard } from "./TarotCard";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, User, Heart, Eye, Star, Calendar, Moon, Sun, TrendingUp } from "lucide-react";
import type { TarotCard as TarotCardType } from "../../../drizzle/schema";
import { trpc } from "@/lib/trpc";

interface ReadingResultProps {
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  lunarYear: number;
  lunarMonth: number;
  lunarDay: number;
  cards: {
    core?: TarotCardType;
    outer?: TarotCardType;
    inner?: TarotCardType;
    benefactorCore?: TarotCardType;
    benefactorOuter?: TarotCardType;
    benefactorInner?: TarotCardType;
    year?: TarotCardType;
    month?: TarotCardType;
    day?: TarotCardType;
    lunarYear?: TarotCardType;
    lunarMonth?: TarotCardType;
    lunarDay?: TarotCardType;
  };
  onReset: () => void;
  onCardClick?: (card: TarotCardType) => void;
  allCards: TarotCardType[];
}

export function ReadingResult({ 
  birthYear, 
  birthMonth, 
  birthDay,
  lunarYear,
  lunarMonth,
  lunarDay,
  cards, 
  onReset, 
  onCardClick, 
  allCards 
}: ReadingResultProps) {
  // 計算農曆本命牌組
  const [lunarReadingData, setLunarReadingData] = useState<any>(null);
  const lunarCalculateMutation = trpc.tarot.calculateReading.useMutation({
    onSuccess: (data) => {
      setLunarReadingData(data);
    },
  });

  useEffect(() => {
    lunarCalculateMutation.mutate({
      birthYear: lunarYear,
      birthMonth: lunarMonth,
      birthDay: lunarDay,
      lunarBirthYear: lunarYear,
      lunarBirthMonth: lunarMonth,
      lunarBirthDay: lunarDay,
    });
  }, [lunarYear, lunarMonth, lunarDay]);

  // 計算近年運勢（往前2年+今年+往後4年，共7年）
  const calculateMultiYearFortune = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    
    // 從前2年開始，到後4年結束
    for (let i = -2; i <= 4; i++) {
      const targetYear = currentYear + i;
      
      // 國曆流年運勢
      const solarBenefactorSum = birthMonth + birthDay;
      const solarYearSum = targetYear + solarBenefactorSum;
      const solarDigitSum = solarYearSum.toString().split('').map(Number).reduce((sum, digit) => sum + digit, 0);
      let solarYearCard = solarDigitSum;
      while (solarYearCard > 21) {
        solarYearCard = solarYearCard.toString().split('').map(Number).reduce((sum, digit) => sum + digit, 0);
      }
      
      // 農曆流年心境
      const lunarBenefactorSum = lunarMonth + lunarDay;
      const lunarYearSum = targetYear + lunarBenefactorSum;
      const lunarDigitSum = lunarYearSum.toString().split('').map(Number).reduce((sum, digit) => sum + digit, 0);
      let lunarYearCard = lunarDigitSum;
      while (lunarYearCard > 21) {
        lunarYearCard = lunarYearCard.toString().split('').map(Number).reduce((sum, digit) => sum + digit, 0);
      }
      
      const solarCard = allCards.find(c => c.id === solarYearCard);
      const lunarCard = allCards.find(c => c.id === lunarYearCard);
      years.push({
        year: targetYear,
        solarCardNumber: solarYearCard,
        solarCard,
        lunarCardNumber: lunarYearCard,
        lunarCard,
      });
    }
    
    return years;
  };

  // 使用後端批次API計算當月每日流日運勢
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const { data: monthlyDayFortuneData } = trpc.tarot.calculateMonthlyDayFortune.useQuery({
    solarBirthYear: birthYear,
    solarBirthMonth: birthMonth,
    solarBirthDay: birthDay,
    lunarBirthYear: lunarYear,
    lunarBirthMonth: lunarMonth,
    lunarBirthDay: lunarDay,
    targetYear: currentYear,
    targetMonth: currentMonth,
  });
  
  const monthlyDayFortune = monthlyDayFortuneData?.map(item => ({
    day: item.solarDay,
    lunarYear: item.lunarYear,
    lunarMonth: item.lunarMonth,
    lunarDay: item.lunarDay,
    isLeapMonth: item.isLeapMonth,
    solarCardNumber: item.solarCardNumber,
    solarCard: allCards.find(c => c.id === item.solarCardNumber),
    lunarCardNumber: item.lunarCardNumber,
    lunarCard: allCards.find(c => c.id === item.lunarCardNumber),
  })) || [];

  const multiYearFortune = calculateMultiYearFortune();
  const currentDay = new Date().getDate();

  return (
    <div className="w-full space-y-12 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl md:text-5xl font-serif bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
          您的塔羅靈數運勢
        </h2>
        <div className="space-y-2">
          <p className="text-muted-foreground">
            國曆生日：{birthYear}年{birthMonth}月{birthDay}日
          </p>
          <p className="text-muted-foreground">
            農曆生日：{lunarYear}年{lunarMonth}月{lunarDay}日
          </p>
        </div>
        <Button variant="outline" onClick={onReset} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          重新占卜
        </Button>
      </div>

      {/* 雙重性格分析 */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 justify-center">
          <User className="w-6 h-6 text-primary" />
          <h3 className="text-2xl font-serif text-foreground">內、外在性格分析</h3>
        </div>
        <p className="text-muted-foreground text-center max-w-3xl mx-auto">
          國曆生日代表您「給人的感覺」，是外在展現的人格特質；農曆生日代表您的「另一面特性」，是內在隱藏的性格面向
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 國曆性格 - 給人的感覺 */}
          <Card className="border-2 border-primary/30 bg-gradient-to-br from-card to-primary/5">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sun className="w-5 h-5 text-primary" />
                <CardTitle className="text-xl font-serif text-primary">國曆性格</CardTitle>
              </div>
              <CardDescription>給人的感覺 · 外在人格</CardDescription>
              <p className="text-sm font-medium pt-2">
                {birthYear}年{birthMonth}月{birthDay}日
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {cards.core && (
                <div className="space-y-2">
                  <TarotCard
                    card={cards.core}
                    label="本性"
                    onClick={() => onCardClick?.(cards.core!)}
                    compact
                  />
                  <p className="text-xs text-center text-muted-foreground">核心特質</p>
                </div>
              )}
              {cards.outer && (
                <div className="space-y-2">
                  <TarotCard
                    card={cards.outer}
                    label="外顯"
                    onClick={() => onCardClick?.(cards.outer!)}
                    compact
                  />
                  <p className="text-xs text-center text-muted-foreground">外在表現</p>
                </div>
              )}
              {cards.inner && (
                <div className="space-y-2">
                  <TarotCard
                    card={cards.inner}
                    label="內心"
                    onClick={() => onCardClick?.(cards.inner!)}
                    compact
                  />
                  <p className="text-xs text-center text-muted-foreground">內在特質</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 農曆性格 - 另一面特性 */}
          <Card className="border-2 border-secondary/30 bg-gradient-to-br from-card to-secondary/5">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Moon className="w-5 h-5 text-secondary" />
                <CardTitle className="text-xl font-serif text-secondary">農曆性格</CardTitle>
              </div>
              <CardDescription>另一面特性 · 內在人格</CardDescription>
              <p className="text-sm font-medium pt-2">
                {lunarYear}年{lunarMonth}月{lunarDay}日
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {lunarReadingData?.cards.core && (
                <div className="space-y-2">
                  <TarotCard
                    card={lunarReadingData.cards.core}
                    label="本性"
                    onClick={() => onCardClick?.(lunarReadingData.cards.core!)}
                    compact
                  />
                  <p className="text-xs text-center text-muted-foreground">核心特質</p>
                </div>
              )}
              {lunarReadingData?.cards.outer && (
                <div className="space-y-2">
                  <TarotCard
                    card={lunarReadingData.cards.outer}
                    label="外顯"
                    onClick={() => onCardClick?.(lunarReadingData.cards.outer!)}
                    compact
                  />
                  <p className="text-xs text-center text-muted-foreground">外在表現</p>
                </div>
              )}
              {lunarReadingData?.cards.inner && (
                <div className="space-y-2">
                  <TarotCard
                    card={lunarReadingData.cards.inner}
                    label="內心"
                    onClick={() => onCardClick?.(lunarReadingData.cards.inner!)}
                    compact
                  />
                  <p className="text-xs text-center text-muted-foreground">內在特質</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator className="my-12" />

      {/* 生命中的貴人 */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 justify-center">
          <Star className="w-6 h-6 text-secondary" />
          <h3 className="text-2xl font-serif text-foreground">生命中的貴人</h3>
        </div>
        <p className="text-muted-foreground text-center max-w-3xl mx-auto">
          貴人牌顯示能夠幫助您、支持您的人所具備的特質，同樣分為國曆與農曆兩個面向
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 國曆貴人 - 給人的感覺 */}
          <Card className="border-2 border-secondary/30 bg-gradient-to-br from-card to-secondary/5">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sun className="w-5 h-5 text-secondary" />
                <CardTitle className="text-xl font-serif text-secondary">國曆貴人</CardTitle>
              </div>
              <CardDescription>給人的感覺 · 外在貴人</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                {cards.benefactorCore && (
                  <div className="space-y-2">
                    <TarotCard
                      card={cards.benefactorCore}
                      onClick={() => onCardClick?.(cards.benefactorCore!)}
                      compact
                    />
                    <p className="text-xs text-center text-muted-foreground">貴人本性</p>
                  </div>
                )}
                {cards.benefactorOuter && (
                  <div className="space-y-2">
                    <TarotCard
                      card={cards.benefactorOuter}
                      onClick={() => onCardClick?.(cards.benefactorOuter!)}
                      compact
                    />
                    <p className="text-xs text-center text-muted-foreground">貴人外顯</p>
                  </div>
                )}
                {cards.benefactorInner && (
                  <div className="space-y-2">
                    <TarotCard
                      card={cards.benefactorInner}
                      onClick={() => onCardClick?.(cards.benefactorInner!)}
                      compact
                    />
                    <p className="text-xs text-center text-muted-foreground">貴人內心</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 農曆貴人 - 另一面特性 */}
          <Card className="border-2 border-accent/30 bg-gradient-to-br from-card to-accent/10">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Moon className="w-5 h-5 text-accent" />
                <CardTitle className="text-xl font-serif text-accent">農曆貴人</CardTitle>
              </div>
              <CardDescription>另一面特性 · 內在貴人</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                {lunarReadingData?.cards.benefactorCore && (
                  <div className="space-y-2">
                    <TarotCard
                      card={lunarReadingData.cards.benefactorCore}
                      onClick={() => onCardClick?.(lunarReadingData.cards.benefactorCore!)}
                      compact
                    />
                    <p className="text-xs text-center text-muted-foreground">貴人本性</p>
                  </div>
                )}
                {lunarReadingData?.cards.benefactorOuter && (
                  <div className="space-y-2">
                    <TarotCard
                      card={lunarReadingData.cards.benefactorOuter}
                      onClick={() => onCardClick?.(lunarReadingData.cards.benefactorOuter!)}
                      compact
                    />
                    <p className="text-xs text-center text-muted-foreground">貴人外顯</p>
                  </div>
                )}
                {lunarReadingData?.cards.benefactorInner && (
                  <div className="space-y-2">
                    <TarotCard
                      card={lunarReadingData.cards.benefactorInner}
                      onClick={() => onCardClick?.(lunarReadingData.cards.benefactorInner!)}
                      compact
                    />
                    <p className="text-xs text-center text-muted-foreground">貴人內心</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator className="my-12" />

      {/* 流年流月流日 */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-primary" />
          <h3 className="text-2xl font-serif text-foreground">流年運勢</h3>
        </div>
        
        <Tabs defaultValue="current" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="current">本年運勢</TabsTrigger>
            <TabsTrigger value="multi-year">多年流年</TabsTrigger>
            <TabsTrigger value="monthly">本月流日</TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-6 mt-6">
            <p className="text-muted-foreground text-center">
              流年、流月、流日牌卡顯示您在不同時間週期的運勢走向與建議
            </p>
            
            {/* 左右兩欄布局 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 左欄：運勢（國曆） */}
              <div className="space-y-6">
                <Card className="border-2 border-primary/30 bg-gradient-to-br from-card to-primary/5">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Sun className="w-5 h-5 text-primary" />
                      <CardTitle className="font-serif">運勢</CardTitle>
                    </div>
                    <CardDescription>國曆 · {currentYear}年整年度的運勢主題</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* 流年運勢 */}
                    {cards.year && (
                      <TarotCard
                        card={cards.year}
                        onClick={() => onCardClick?.(cards.year!)}
                        className="border-primary/40"
                        displayMode="annual"
                      />
                    )}
                    
                    {/* 流月運勢 */}
                    {cards.month && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Moon className="w-4 h-4 text-primary" />
                          <h4 className="text-sm font-medium">流月運勢</h4>
                        </div>
                        <p className="text-xs text-muted-foreground">{currentMonth}月份的運勢重點</p>
                        <TarotCard
                          card={cards.month}
                          onClick={() => onCardClick?.(cards.month!)}
                          className="border-primary/30"
                        />
                      </div>
                    )}
                    
                    {/* 流日運勢 */}
                    {cards.day && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-primary" />
                          <h4 className="text-sm font-medium">流日運勢</h4>
                        </div>
                        <p className="text-xs text-muted-foreground">今日({currentMonth}/{currentDay})的運勢提示</p>
                        <TarotCard
                          card={cards.day}
                          onClick={() => onCardClick?.(cards.day!)}
                          className="border-primary/30"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* 右欄：心境（農曆） */}
              <div className="space-y-6">
                <Card className="border-2 border-accent/30 bg-gradient-to-br from-card to-accent/10">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Moon className="w-5 h-5 text-accent" />
                      <CardTitle className="font-serif">心境</CardTitle>
                    </div>
                    <CardDescription>農曆 · {currentYear}年整年度的心境主題</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* 流年心境 */}
                    {cards.lunarYear && (
                      <TarotCard
                        card={cards.lunarYear}
                        onClick={() => onCardClick?.(cards.lunarYear!)}
                        className="border-accent/40"
                        displayMode="annual"
                      />
                    )}
                    
                    {/* 流月心境 */}
                    {lunarReadingData?.cards.month && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Moon className="w-4 h-4 text-accent" />
                          <h4 className="text-sm font-medium">流月心境</h4>
                        </div>
                        <p className="text-xs text-muted-foreground">{lunarMonth}月份的心境重點</p>
                        <TarotCard
                          card={lunarReadingData.cards.month}
                          onClick={() => onCardClick?.(lunarReadingData.cards.month!)}
                          className="border-accent/30"
                        />
                      </div>
                    )}
                    
                    {/* 流日心境 */}
                    {lunarReadingData?.cards.day && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-accent" />
                          <h4 className="text-sm font-medium">流日心境</h4>
                        </div>
                        <p className="text-xs text-muted-foreground">農曆今日({lunarMonth}/{lunarDay})的心境提示</p>
                        <TarotCard
                          card={lunarReadingData.cards.day}
                          onClick={() => onCardClick?.(lunarReadingData.cards.day!)}
                          className="border-accent/30"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="multi-year" className="mt-6 space-y-6">
            <div className="text-center space-y-2">
              <h4 className="text-lg font-semibold">近年運勢走勢</h4>
              <p className="text-sm text-muted-foreground">
                查看近七年（往前2年+今年+往後4年）的運勢與心境變化
              </p>
            </div>

            {/* 時間軸卡片展示 */}
            <div className="overflow-x-auto">
              <div className="flex gap-3 pb-4 min-w-max">
                {multiYearFortune.map((item) => {
                  const isCurrentYear = item.year === new Date().getFullYear();
                  return (
                    <Card 
                      key={item.year} 
                      className={`flex-shrink-0 w-32 ${
                        isCurrentYear 
                          ? 'border-2 border-primary shadow-lg' 
                          : 'border border-border'
                      }`}
                    >
                      <CardHeader className="p-3 pb-2">
                        <CardTitle className={`text-center text-sm ${
                          isCurrentYear ? 'text-primary font-bold' : ''
                        }`}>
                          {item.year}
                          {isCurrentYear && <div className="text-[10px] text-primary">(今年)</div>}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 pt-0 space-y-3">
                        {/* 運勢牌 */}
                        <div 
                          className="cursor-pointer hover:bg-primary/5 p-2 rounded transition-colors"
                          onClick={() => item.solarCard && onCardClick?.(item.solarCard)}
                        >
                          <div className="flex items-center gap-1 mb-1">
                            <Sun className="w-3 h-3 text-primary" />
                            <span className="text-[10px] text-muted-foreground">運勢</span>
                          </div>
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 font-bold text-primary text-xs mx-auto mb-1">
                            {item.solarCardNumber}
                          </div>
                          <div className="text-[10px] text-center line-clamp-2">
                            {item.solarCard?.name || ""}
                          </div>
                        </div>
                        {/* 心境牌 */}
                        <div 
                          className="cursor-pointer hover:bg-accent/5 p-2 rounded transition-colors"
                          onClick={() => item.lunarCard && onCardClick?.(item.lunarCard)}
                        >
                          <div className="flex items-center gap-1 mb-1">
                            <Moon className="w-3 h-3 text-accent" />
                            <span className="text-[10px] text-muted-foreground">心境</span>
                          </div>
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent/10 font-bold text-accent text-xs mx-auto mb-1">
                            {item.lunarCardNumber}
                          </div>
                          <div className="text-[10px] text-center line-clamp-2">
                            {item.lunarCard?.name || ""}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* 詳細表格 */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-primary/10">
                    <th className="border border-border p-3 text-center font-semibold">年份</th>
                    <th className="border border-border p-3 text-center font-semibold">運勢（國曆）</th>
                    <th className="border border-border p-3 text-center font-semibold">心境（農曆）</th>
                  </tr>
                </thead>
                <tbody>
                  {multiYearFortune.map((item, index) => {
                    const isCurrentYear = item.year === new Date().getFullYear();
                    return (
                    <tr 
                      key={item.year} 
                      className={`hover:bg-muted/50 transition-colors ${isCurrentYear ? 'bg-primary/5' : ''}`}
                    >
                      <td className="border border-border p-3 text-center font-medium">
                        {item.year} {isCurrentYear && <span className="text-xs text-primary ml-2">(今年)</span>}
                      </td>
                      <td className="border border-border p-3 text-center cursor-pointer hover:bg-primary/5" onClick={() => item.solarCard && onCardClick?.(item.solarCard)}>
                        <div className="flex flex-col items-center gap-2">
                          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 font-bold text-primary">
                            {item.solarCardNumber}
                          </div>
                          <div className="text-sm">{item.solarCard?.name || ""}</div>
                        </div>
                      </td>
                      <td className="border border-border p-3 text-center cursor-pointer hover:bg-accent/5" onClick={() => item.lunarCard && onCardClick?.(item.lunarCard)}>
                        <div className="flex flex-col items-center gap-2">
                          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-accent/10 font-bold text-accent">
                            {item.lunarCardNumber}
                          </div>
                          <div className="text-sm">{item.lunarCard?.name || ""}</div>
                        </div>
                      </td>
                    </tr>
                  );
                  })}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="monthly" className="mt-6 space-y-4">
            <h4 className="text-lg font-semibold text-center">
              {currentYear}年{currentMonth}月 每日流日運勢
            </h4>
            <p className="text-sm text-muted-foreground text-center">
              查看本月每一天的流日牌卡，掌握每日運勢變化
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-primary/10">
                    <th className="border border-border p-2 text-center font-semibold">國曆日期</th>
                    <th className="border border-border p-2 text-center font-semibold">流日牌（運勢）</th>
                    <th className="border border-border p-2 text-center font-semibold">牌卡名稱</th>
                    <th className="border border-border p-2 text-center font-semibold bg-accent/10">農曆日期</th>
                    <th className="border border-border p-2 text-center font-semibold bg-accent/10">流日牌（心境）</th>
                    <th className="border border-border p-2 text-center font-semibold bg-accent/10">牌卡名稱</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyDayFortune.map((item) => {
                    const isToday = item.day === currentDay;
                    return (
                      <tr 
                        key={item.day} 
                        className={`hover:bg-muted/50 transition-colors ${isToday ? 'bg-primary/5' : ''}`}
                      >
                        <td className="border border-border p-2 text-center font-medium">
                          {currentMonth}月{item.day}日 {isToday && <span className="text-xs text-primary ml-1">(今日)</span>}
                        </td>
                        <td className="border border-border p-2 text-center cursor-pointer hover:bg-primary/5" onClick={() => item.solarCard && onCardClick?.(item.solarCard)}>
                          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 font-bold text-primary">
                            {item.solarCardNumber}
                          </div>
                        </td>
                        <td className="border border-border p-2 text-center cursor-pointer hover:bg-primary/5" onClick={() => item.solarCard && onCardClick?.(item.solarCard)}>
                          {item.solarCard?.name || ""}
                        </td>
                        <td className="border border-border p-2 text-center font-medium bg-accent/5">
                          {item.lunarMonth}月{item.lunarDay}日 {item.isLeapMonth && <span className="text-xs text-accent ml-1">(閏)</span>}
                        </td>
                        <td className="border border-border p-2 text-center cursor-pointer hover:bg-accent/10" onClick={() => item.lunarCard && onCardClick?.(item.lunarCard)}>
                          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-accent/10 font-bold text-accent">
                            {item.lunarCardNumber}
                          </div>
                        </td>
                        <td className="border border-border p-2 text-center cursor-pointer hover:bg-accent/10" onClick={() => item.lunarCard && onCardClick?.(item.lunarCard)}>
                          {item.lunarCard?.name || ""}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
