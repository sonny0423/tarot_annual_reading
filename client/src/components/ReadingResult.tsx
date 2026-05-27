import { TarotCard } from "./TarotCard";
import { FlowYearCycleTabs } from "./FlowYearCycleTabs";
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, User, Heart, Eye, Star, Calendar, Moon, Sun, TrendingUp } from "lucide-react";
import type { TarotCard as TarotCardType } from "../../../drizzle/schema";
import { Solar } from "lunar-javascript";
import { calculateMonthlyDayFortune, calculateFullReading } from "@/lib/tarotCalculator";
import { solarToLunar } from "@/lib/lunarConverter";

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
  // 當前日期的農曆轉換
  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth() + 1;
  const todayDay = today.getDate();
  
  // 判斷今年生日是否已過（國曆）
  const thisYearBirthday = new Date(todayYear, birthMonth - 1, birthDay);
  const isBirthdayPassed = today >= thisYearBirthday;
  const birthdayStatusText = isBirthdayPassed ? "今年生日已過" : "今年生日未過";
  
  // 判斷今年農曆生日是否已過
  const todaySolarForLunar = Solar.fromYmd(todayYear, todayMonth, todayDay);
  const todayLunarForCheck = todaySolarForLunar.getLunar();
  const currentLunarMonth = todayLunarForCheck.getMonth();
  const currentLunarDay = todayLunarForCheck.getDay();
  // 比較當前農曆月日與出生農曆月日
  const isLunarBirthdayPassed = currentLunarMonth > lunarMonth || 
    (currentLunarMonth === lunarMonth && currentLunarDay >= lunarDay);
  const lunarBirthdayStatusText = isLunarBirthdayPassed ? "今年生日已過" : "今年生日未過";
  
  // 轉換當前日期為農曆
  const todaySolar = Solar.fromYmd(todayYear, todayMonth, todayDay);
  const todayLunar = todaySolar.getLunar();
  const todayLunarYear = todayLunar.getYear();
  const todayLunarMonth = todayLunar.getMonth();
  const todayLunarDay = todayLunar.getDay();
  
  // 計算當前日期的流月牌和流日牌
  const lunarBirthSum = lunarYear + lunarMonth + lunarDay;
  
  // 當前月份的流月牌（農曆）
  const currentMonthSum = lunarBirthSum + todayLunarYear + todayLunarMonth;
  let currentMonthDigitSum = currentMonthSum.toString().split('').map(Number).reduce((sum: number, digit: number) => sum + digit, 0);
  while (currentMonthDigitSum > 21) {
    currentMonthDigitSum = currentMonthDigitSum.toString().split('').map(Number).reduce((sum: number, digit: number) => sum + digit, 0);
  }
  
  // 今天的流日牌（農曆）
  const currentDaySum = lunarBirthSum + todayLunarYear + todayLunarMonth + todayLunarDay;
  let currentDayDigitSum = currentDaySum.toString().split('').map(Number).reduce((sum: number, digit: number) => sum + digit, 0);
  while (currentDayDigitSum > 21) {
    currentDayDigitSum = currentDayDigitSum.toString().split('').map(Number).reduce((sum: number, digit: number) => sum + digit, 0);
  }
  
  // 找到對應的牌卡
  const currentMonthCard = allCards.find(c => c.id === currentMonthDigitSum);
  const currentDayCard = allCards.find(c => c.id === currentDayDigitSum);
  
  // 流年總表滾動容器的ref
  const multiYearScrollRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("current");
  // 展開的年份狀態（儲存年份，為 null 表示沒有展開）
  const [expandedYear, setExpandedYear] = useState<number | null>(null);
  // 展開的月份狀態（儲存 { year, month }，為 null 表示沒有展開）
  const [expandedMonth, setExpandedMonth] = useState<{ year: number; month: number } | null>(null);
  
  // 計算農曆本命牌組（前端本地計算）
  const lunarReadingData = (() => {
    if (!allCards || allCards.length === 0) return null;
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const currentDay = now.getDate();
    const reading = calculateFullReading(
      lunarYear, lunarMonth, lunarDay,
      lunarYear, lunarMonth, lunarDay,
      currentYear, currentMonth, currentDay
    );
    const cardMap = new Map(allCards.map(c => [c.id, c]));
    return {
      reading,
      cards: {
        core: cardMap.get(reading.coreCard),
        outer: cardMap.get(reading.outerCard),
        inner: cardMap.get(reading.innerCard),
        benefactorCore: cardMap.get(reading.benefactorCore),
        benefactorOuter: cardMap.get(reading.benefactorOuter),
        benefactorInner: cardMap.get(reading.benefactorInner),
      },
    };
  })();

  // 計算流年總表（0-100歲完整生命週期）
  const calculateMultiYearFortune = () => {
    const currentYear = new Date().getFullYear();
    const currentAge = currentYear - birthYear;
    const years = [];
    
    // 從0歲開始，到100歲結束
    for (let age = 0; age <= 100; age++) {
      const targetYear = birthYear + age;
      
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
        age: age,
        isCurrentYear: age === currentAge,
        solarCardNumber: solarYearCard,
        solarCard,
        lunarCardNumber: lunarYearCard,
        lunarCard,
      });
    }
    
    return years;
  };

  // 計算指定年份12個月的流月運勢
  const calculateYearMonths = (targetYear: number) => {
    const months = [];
    
    for (let month = 1; month <= 12; month++) {
      // 計算國曆每個月份對應的農曆月份（取該月月初1號）
      const solar = Solar.fromYmd(targetYear, month, 1);
      const lunar = solar.getLunar();
      const lunarYearValue = lunar.getYear();
      const lunarMonthValue = Math.abs(lunar.getMonth()); // 取絕對值，闰月是負數
      // 國曆流月運勢
      const solarBirthSum = birthYear + birthMonth + birthDay;
      const solarMonthSum = solarBirthSum + targetYear + month;
      const solarDigitSum = solarMonthSum.toString().split('').map(Number).reduce((sum, digit) => sum + digit, 0);
      let solarMonthCard = solarDigitSum;
      while (solarMonthCard > 21) {
        solarMonthCard = solarMonthCard.toString().split('').map(Number).reduce((sum, digit) => sum + digit, 0);
      }
      
      // 農曆流月心境
      const lunarBirthSum = lunarYear + lunarMonth + lunarDay;
      const lunarMonthSum = lunarBirthSum + lunarYearValue + lunarMonthValue;
      const lunarDigitSum = lunarMonthSum.toString().split('').map(Number).reduce((sum, digit) => sum + digit, 0);
      let lunarMonthCard = lunarDigitSum;
      while (lunarMonthCard > 21) {
        lunarMonthCard = lunarMonthCard.toString().split('').map(Number).reduce((sum, digit) => sum + digit, 0);
      }
      
      const solarCard = allCards.find(c => c.id === solarMonthCard);
      const lunarCard = allCards.find(c => c.id === lunarMonthCard);
      months.push({
        month,
        lunarYear: lunarYearValue,
        lunarMonth: lunarMonthValue,
        solarCardNumber: solarMonthCard,
        solarCard,
        lunarCardNumber: lunarMonthCard,
        lunarCard,
      });
    }
    
     return months;
  };

  // 計算指定年月的每日流日運勢
  const calculateMonthDays = (targetYear: number, targetMonth: number) => {
    const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
    const days = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      // 轉換為農曆日期
      const solar = Solar.fromYmd(targetYear, targetMonth, day);
      const lunar = solar.getLunar();
      const lunarYearValue = lunar.getYear();
      const lunarMonthValue = Math.abs(lunar.getMonth());
      const lunarDayValue = lunar.getDay();
      
      // 國曆流日運勢
      const solarBirthSum = birthYear + birthMonth + birthDay;
      const solarMonthSum = solarBirthSum + targetYear + targetMonth;
      const solarDaySum = solarMonthSum + day;
      const solarDigitSum = solarDaySum.toString().split('').map(Number).reduce((sum, digit) => sum + digit, 0);
      let solarDayCard = solarDigitSum;
      while (solarDayCard > 21) {
        solarDayCard = solarDayCard.toString().split('').map(Number).reduce((sum, digit) => sum + digit, 0);
      }
      
      // 農曆流日心境
      const lunarBirthSum = lunarYear + lunarMonth + lunarDay;
      const lunarMonthSum = lunarBirthSum + lunarYearValue + lunarMonthValue;
      const lunarDaySum = lunarMonthSum + lunarDayValue;
      const lunarDigitSum = lunarDaySum.toString().split('').map(Number).reduce((sum, digit) => sum + digit, 0);
      let lunarDayCard = lunarDigitSum;
      while (lunarDayCard > 21) {
        lunarDayCard = lunarDayCard.toString().split('').map(Number).reduce((sum, digit) => sum + digit, 0);
      }
      
      const solarCard = allCards.find(c => c.id === solarDayCard);
      const lunarCard = allCards.find(c => c.id === lunarDayCard);
      days.push({
        day,
        lunarYear: lunarYearValue,
        lunarMonth: lunarMonthValue,
        lunarDay: lunarDayValue,
        solarCardNumber: solarDayCard,
        solarCard,
        lunarCardNumber: lunarDayCard,
        lunarCard,
      });
    }
    
    return days;
  };

  // 使用後端API計算當月每日流日運勢勢
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const monthlyDayFortune = calculateMonthlyDayFortune(
    birthYear, birthMonth, birthDay,
    lunarYear, lunarMonth, lunarDay,
    currentYear, currentMonth,
    solarToLunar
  ).map(item => ({
    day: item.solarDay,
    lunarYear: item.lunarYear,
    lunarMonth: item.lunarMonth,
    lunarDay: item.lunarDay,
    isLeapMonth: item.isLeapMonth,
    solarCardNumber: item.solarCardNumber,
    solarCard: allCards.find(c => c.id === item.solarCardNumber),
    lunarCardNumber: item.lunarCardNumber,
    lunarCard: allCards.find(c => c.id === item.lunarCardNumber),
  }));

   // 當展開月份時，自動滾動到該年份卡片位置（置中）
  useEffect(() => {
    if (expandedMonth && multiYearScrollRef.current) {
      const yearCard = multiYearScrollRef.current.querySelector(`[data-year="${expandedMonth.year}"]`);
      if (yearCard) {
        yearCard.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      }
    }
  }, [expandedMonth]);

  // 當切換到多年流年頁籤時，自動滾動到當前年齡
  useEffect(() => {
    if (activeTab === "multi-year" && multiYearScrollRef.current) {
      // 等待DOM渲染完成
      setTimeout(() => {
        const currentYearCard = multiYearScrollRef.current?.querySelector('[data-current-year="true"]');
        if (currentYearCard) {
          currentYearCard.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      }, 100);
    }
  }, [activeTab]);

  const multiYearFortune = calculateMultiYearFortune();
  const currentDay = new Date().getDate();

  return (
    <div className="w-full space-y-12 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl md:text-5xl font-serif bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
          這是您的塔羅靈數
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
          重新計算
        </Button>
      </div>

      {/* 性格分析與貴人區塊（標籤頁） */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 justify-center">
          <User className="w-6 h-6 text-primary" />
          <h3 className="text-2xl font-serif text-foreground">性格與貴人分析</h3>
        </div>
        
        <Tabs defaultValue="personality" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto">
            <TabsTrigger value="personality" className="gap-2">
              <User className="w-4 h-4" />
              你的性格DNA
            </TabsTrigger>
            <TabsTrigger value="benefactor" className="gap-2">
              <Star className="w-4 h-4" />
              生命中的貴人
            </TabsTrigger>
            <TabsTrigger value="raw-cards" className="gap-2">
              <Eye className="w-4 h-4" />
              原始靈數
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personality" className="space-y-6 mt-6">
            <p className="text-muted-foreground text-center max-w-3xl mx-auto">
              透過國曆、農曆生日，計算出屬於你的性格DNA（重複牌卡已自動合併）
            </p>

        {(() => {
          // 合併國曆和農曆的6張牌，以牌卡id去重，只保留第一次出現的
          const allDnaCards: TarotCardType[] = [];
          const seenIds = new Set<number>();
          const candidates = [
            cards.core,
            cards.outer,
            cards.inner,
            lunarReadingData?.cards.core,
            lunarReadingData?.cards.outer,
            lunarReadingData?.cards.inner,
          ];
          for (const card of candidates) {
            if (card && !seenIds.has(card.id)) {
              seenIds.add(card.id);
              allDnaCards.push(card);
            }
          }
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {allDnaCards.map((card) => (
                <div key={card.id} className="space-y-2">
                  <TarotCard
                    card={card}
                    onClick={() => onCardClick?.(card)}
                    displayMode="traits"
                  />
                </div>
              ))}
            </div>
          );
        })()}
          </TabsContent>

          <TabsContent value="benefactor" className="space-y-6 mt-6">
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
          </TabsContent>

          <TabsContent value="raw-cards" className="space-y-6 mt-6">
            <p className="text-muted-foreground text-center max-w-3xl mx-auto">
              以下顯示由國曆與農曆生日各別計算出的原始 6 張靈數牌卡（不合併重複）
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 國曆性格 3 張 */}
              <Card className="border-2 border-secondary/30 bg-gradient-to-br from-card to-secondary/5">
                <CardHeader className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Sun className="w-5 h-5 text-secondary" />
                    <CardTitle className="text-xl font-serif text-secondary">國曆性格</CardTitle>
                  </div>
                  <CardDescription>由國曆生日計算的 3 張靈數牌卡</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4">
                    {cards.core && (
                      <div className="space-y-2">
                        <TarotCard
                          card={cards.core}
                          onClick={() => onCardClick?.(cards.core!)}
                          compact
                        />
                        <p className="text-xs text-center text-muted-foreground">本性</p>
                      </div>
                    )}
                    {cards.outer && (
                      <div className="space-y-2">
                        <TarotCard
                          card={cards.outer}
                          onClick={() => onCardClick?.(cards.outer!)}
                          compact
                        />
                        <p className="text-xs text-center text-muted-foreground">外顯</p>
                      </div>
                    )}
                    {cards.inner && (
                      <div className="space-y-2">
                        <TarotCard
                          card={cards.inner}
                          onClick={() => onCardClick?.(cards.inner!)}
                          compact
                        />
                        <p className="text-xs text-center text-muted-foreground">內心</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* 農曆性格 3 張 */}
              <Card className="border-2 border-accent/30 bg-gradient-to-br from-card to-accent/10">
                <CardHeader className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Moon className="w-5 h-5 text-accent" />
                    <CardTitle className="text-xl font-serif text-accent">農曆性格</CardTitle>
                  </div>
                  <CardDescription>由農曆生日計算的 3 張靈數牌卡</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4">
                      {lunarReadingData?.cards.core && (
                        <div className="space-y-2">
                          <TarotCard
                            card={lunarReadingData.cards.core}
                            onClick={() => onCardClick?.(lunarReadingData.cards.core!)}
                            compact
                          />
                          <p className="text-xs text-center text-muted-foreground">本性</p>
                        </div>
                      )}
                      {lunarReadingData?.cards.outer && (
                        <div className="space-y-2">
                          <TarotCard
                            card={lunarReadingData.cards.outer}
                            onClick={() => onCardClick?.(lunarReadingData.cards.outer!)}
                            compact
                          />
                          <p className="text-xs text-center text-muted-foreground">外顯</p>
                        </div>
                      )}
                      {lunarReadingData?.cards.inner && (
                        <div className="space-y-2">
                          <TarotCard
                            card={lunarReadingData.cards.inner}
                            onClick={() => onCardClick?.(lunarReadingData.cards.inner!)}
                            compact
                          />
                          <p className="text-xs text-center text-muted-foreground">內心</p>
                        </div>
                      )}
                    </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      <Separator className="my-12" />

      {/* 流年流月流日 */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-primary" />
          <h3 className="text-2xl font-serif text-foreground">流年運勢</h3>
        </div>
        
        <Tabs defaultValue="current" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="current">本年運勢</TabsTrigger>
            <TabsTrigger value="multi-year">0-100歲流年</TabsTrigger>
            <TabsTrigger value="monthly">本月流日</TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-6 mt-6">
            <p className="text-muted-foreground text-center">
              流年、流月、流日牌卡顯示您在不同時間週期的運勢走向與建議
            </p>
            
            {/* 流年能量週期（標籤切換） */}
            <FlowYearCycleTabs
              birthYear={birthYear}
              birthMonth={birthMonth}
              birthDay={birthDay}
              currentDate={new Date()}
            />
            
            {/* 三個區塊布局：流年、流月、流日 */}
            <div className="space-y-6">
              {/* 流年區塊：運勢 + 心境 */}
              <Card className="border-2 border-primary/30">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Sun className="w-5 h-5 text-primary" />
                    <CardTitle className="font-serif">流年運勢與心境</CardTitle>
                  </div>
                  <CardDescription className="text-[13px] leading-relaxed">
                    流年計算會根據生日是否已過決定年份：生日還沒到使用去年，生日已過使用今年
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 流年運勢(國曆) */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Sun className="w-4 h-4 text-primary" />
                        <h4 className="text-sm font-medium">流年運勢(國曆)</h4>
                      </div>
                      <p className="text-xs text-muted-foreground">目前的運勢主題為</p>
                      {cards.year && (
                        <TarotCard
                          card={cards.year}
                          onClick={() => onCardClick?.(cards.year!)}
                          className="border-primary/40"
                          displayMode="annual"
                        />
                      )}
                    </div>
                    
                    {/* 流年心境(農曆) */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Moon className="w-4 h-4 text-accent" />
                        <h4 className="text-sm font-medium">流年心境(農曆)</h4>
                      </div>
                      <p className="text-xs text-muted-foreground">目前的心境主題為</p>
                      {cards.lunarYear && (
                        <TarotCard
                          card={cards.lunarYear}
                          onClick={() => onCardClick?.(cards.lunarYear!)}
                          className="border-accent/40"
                          displayMode="annual"
                        />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 流月區塊：運勢 + 心境 */}
              <Card className="border-2 border-primary/30">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Moon className="w-5 h-5 text-primary" />
                    <CardTitle className="font-serif">流月運勢與心境</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 流月運勢 */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Moon className="w-4 h-4 text-primary" />
                        <h4 className="text-sm font-medium">流月運勢</h4>
                      </div>
                      <p className="text-xs text-muted-foreground">{currentMonth}月份的運勢重點</p>
                      {cards.month && (
                        <TarotCard
                          card={cards.month}
                          onClick={() => onCardClick?.(cards.month!)}
                          className="border-primary/30"
                          displayMode="annual"
                        />
                      )}
                    </div>
                    
                    {/* 流月心境 */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Moon className="w-4 h-4 text-accent" />
                        <h4 className="text-sm font-medium">流月心境</h4>
                      </div>
                      <p className="text-xs text-muted-foreground">{todayLunarYear}年{todayLunarMonth}月份的心境重點</p>
                      {currentMonthCard && (
                        <TarotCard
                          card={currentMonthCard}
                          onClick={() => onCardClick?.(currentMonthCard)}
                          className="border-accent/30"
                          displayMode="annual"
                        />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 流日區塊：運勢 + 心境 */}
              <Card className="border-2 border-primary/30">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-5 h-5 text-primary" />
                    <CardTitle className="font-serif">流日運勢與心境</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 流日運勢 */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-primary" />
                        <h4 className="text-sm font-medium">流日運勢</h4>
                      </div>
                      <p className="text-xs text-muted-foreground">今日({currentMonth}/{currentDay})的運勢提示</p>
                      {cards.day && (
                        <TarotCard
                          card={cards.day}
                          onClick={() => onCardClick?.(cards.day!)}
                          className="border-primary/30"
                          displayMode="annual"
                        />
                      )}
                    </div>
                    
                    {/* 流日心境 */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-accent" />
                        <h4 className="text-sm font-medium">流日心境</h4>
                      </div>
                      <p className="text-xs text-muted-foreground">農曆今日({todayLunarYear}年{todayLunarMonth}/{todayLunarDay})的心境提示</p>
                      {currentDayCard && (
                        <TarotCard
                          card={currentDayCard}
                          onClick={() => onCardClick?.(currentDayCard)}
                          className="border-accent/30"
                          displayMode="annual"
                        />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="multi-year" className="mt-6 space-y-6">
            <div className="text-center space-y-2">
              <h4 className="text-lg font-semibold">流年總表</h4>
              <p className="text-sm text-muted-foreground">
                查看0-100歲完整生命週期的運勢與心境變化，左右滾動瀏覽<br />點擊年份，可觀看當年度每月運勢
              </p>
            </div>

            {/* 時間軸卡片展示 */}
            <div className="space-y-6">
              <div className="overflow-x-auto" ref={multiYearScrollRef}>
                <div className="flex gap-0 pb-4 min-w-max justify-center">
                {multiYearFortune.map((item) => {
                  const isCurrentYear = item.isCurrentYear;
                  const isExpanded = expandedYear === item.year;
                  const yearMonths = isExpanded ? calculateYearMonths(item.year) : [];
                  
                  return (
                    <div key={item.year} className="flex-shrink-0" data-year={item.year}>
                      <Card 
                        data-current-year={isCurrentYear}
                        className={`w-32 cursor-pointer transition-all ${
                          isCurrentYear 
                            ? 'border-2 border-primary shadow-lg' 
                            : 'border border-border'
                        } ${
                          isExpanded ? 'ring-2 ring-orange-500/50 border-orange-500' : ''
                        }`}
                        onClick={() => setExpandedYear(isExpanded ? null : item.year)}
                      >
                      <CardHeader className="p-3 pb-2">
                        <CardTitle className={`text-center text-sm ${
                          isCurrentYear ? 'text-primary font-bold' : ''
                        }`}>
                          {item.year}
                          {isCurrentYear && <div className="text-[10px] text-primary">(今年)</div>}
                          <div className="text-[10px] text-muted-foreground mt-1">{item.age}歲</div>
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
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-50 font-bold text-orange-500 text-xs mx-auto mb-1">
                            {item.lunarCardNumber}
                          </div>
                          <div className="text-[10px] text-center line-clamp-2">
                            {item.lunarCard?.name || ""}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    </div>
                  );})}
                </div>
              </div>
              
              {/* 展開的流月表 */}
              {expandedYear && (() => {
                const item = multiYearFortune.find(y => y.year === expandedYear);
                if (!item) return null;
                const yearMonths = calculateYearMonths(item.year);
                return (
                  <div className="w-full">
                        <div className="text-center mb-3">
                          <h4 className="text-sm font-semibold">{item.year}年 流月運勢表</h4>
                          <p className="text-xs text-muted-foreground mt-1">點擊月份，可觀看當月每日運勢</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                              <thead>
                                <tr className="bg-muted/50">
                                  <th className="border p-2 text-xs font-semibold">國曆月</th>
                                  <th className="border p-2 text-xs font-semibold">流月牌</th>
                                  <th className="border p-2 text-xs font-semibold">農曆</th>
                                  <th className="border p-2 text-xs font-semibold">流月牌</th>
                                </tr>
                              </thead>
                              <tbody>
                                {yearMonths.map((monthItem) => {
                                  const isMonthExpanded = expandedMonth?.year === item.year && expandedMonth?.month === monthItem.month;
                                  
                                  return (
                                    <React.Fragment key={monthItem.month}>
                                      <tr 
                                        className={`cursor-pointer transition-colors ${
                                          isMonthExpanded ? 'bg-primary/5' : 'hover:bg-muted/30'
                                        }`}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setExpandedMonth(isMonthExpanded ? null : { year: item.year, month: monthItem.month });
                                        }}
                                      >
                                        <td className="border p-2 text-center">
                                          <div className="text-sm font-medium">{monthItem.month}月</div>
                                        </td>
                                        <td 
                                          className="border p-2 text-center cursor-pointer hover:bg-primary/10"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            monthItem.solarCard && onCardClick?.(monthItem.solarCard);
                                          }}
                                        >
                                          <div className="flex flex-col items-center gap-1">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 font-bold text-primary text-sm">
                                              {monthItem.solarCardNumber}
                                            </div>
                                            <div className="text-xs">{monthItem.solarCard?.name || ""}</div>
                                          </div>
                                        </td>
                                        <td className="border p-2 text-center">
                                          <div className="text-sm">{monthItem.lunarYear}年{monthItem.lunarMonth}月</div>
                                        </td>
                                        <td 
                                          className="border p-2 text-center cursor-pointer hover:bg-accent/10"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            monthItem.lunarCard && onCardClick?.(monthItem.lunarCard);
                                          }}
                                        >
                                          <div className="flex flex-col items-center gap-1">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-50 font-bold text-orange-500 text-sm">
                                              {monthItem.lunarCardNumber}
                                            </div>
                                            <div className="text-xs">{monthItem.lunarCard?.name || ""}</div>
                                          </div>
                                        </td>
                                      </tr>
                                      {/* 展開的流日表 */}
                                      {isMonthExpanded && (() => {
                                        const monthDays = calculateMonthDays(item.year, monthItem.month);
                                        return (
                                          <tr>
                                            <td colSpan={4} className="border-0 p-0">
                                              <div className="bg-accent/5 p-3">
                                                <div className="text-xs font-semibold text-center mb-2">
                                                  {item.year}年{monthItem.month}月 流日運勢表
                                                </div>
                                                <div className="overflow-x-auto">
                                                  <table className="w-full border-collapse text-xs">
                                                    <thead>
                                                      <tr className="bg-muted/50">
                                                        <th className="border p-1.5 font-semibold">國曆日</th>
                                                        <th className="border p-1.5 font-semibold">流日牌</th>
                                                        <th className="border p-1.5 font-semibold">農曆</th>
                                                        <th className="border p-1.5 font-semibold">流日牌</th>
                                                      </tr>
                                                    </thead>
                                                    <tbody>
                                                      {monthDays.map((dayItem) => (
                                                        <tr key={dayItem.day} className="hover:bg-muted/30 transition-colors">
                                                          <td className="border p-1.5 text-center">
                                                            <div className="text-xs font-medium">{dayItem.day}日</div>
                                                          </td>
                                                          <td 
                                                            className="border p-1.5 text-center cursor-pointer hover:bg-primary/10"
                                                            onClick={(e) => {
                                                              e.stopPropagation();
                                                              dayItem.solarCard && onCardClick?.(dayItem.solarCard);
                                                            }}
                                                          >
                                                            <div className="flex flex-col items-center gap-0.5">
                                                              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 font-bold text-primary text-xs">
                                                                {dayItem.solarCardNumber}
                                                              </div>
                                                              <div className="text-[10px]">{dayItem.solarCard?.name || ""}</div>
                                                            </div>
                                                          </td>
                                                          <td className="border p-1.5 text-center">
                                                            <div className="text-xs">{dayItem.lunarYear}年{dayItem.lunarMonth}月{dayItem.lunarDay}日</div>
                                                          </td>
                                                          <td 
                                                            className="border p-1.5 text-center cursor-pointer hover:bg-accent/10"
                                                            onClick={(e) => {
                                                              e.stopPropagation();
                                                              dayItem.lunarCard && onCardClick?.(dayItem.lunarCard);
                                                            }}
                                                          >
                                                            <div className="flex flex-col items-center gap-0.5">
                                                              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-50 font-bold text-orange-500 text-xs">
                                                                {dayItem.lunarCardNumber}
                                                              </div>
                                                              <div className="text-[10px]">{dayItem.lunarCard?.name || ""}</div>
                                                            </div>
                                                          </td>
                                                        </tr>
                                                      ))}
                                                    </tbody>
                                                  </table>
                                                </div>
                                              </div>
                                            </td>
                                          </tr>
                                        );
                                      })()}
                                    </React.Fragment>
                                  );
                                })}
                              </tbody>
                            </table>
                        </div>
                  </div>
                );
              })()}
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
                          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-orange-50 font-bold text-orange-500">
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
