import { TarotCard } from "./TarotCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, User, Heart, Eye, Star, Calendar, Moon, Sun, TrendingUp } from "lucide-react";
import type { TarotCard as TarotCardType } from "../../../drizzle/schema";

interface ReadingResultProps {
  birthYear: number;
  birthMonth: number;
  birthDay: number;
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
  };
  onReset: () => void;
  onCardClick?: (card: TarotCardType) => void;
  allCards: TarotCardType[];
}

export function ReadingResult({ birthYear, birthMonth, birthDay, cards, onReset, onCardClick, allCards }: ReadingResultProps) {
  // 計算多年流年運勢
  const calculateMultiYearFortune = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    
    for (let i = 0; i < 5; i++) {
      const targetYear = currentYear + i;
      const benefactorSum = birthMonth + birthDay;
      const yearSum = targetYear + benefactorSum;
      const digitSum = yearSum.toString().split('').map(Number).reduce((sum, digit) => sum + digit, 0);
      let yearCard = digitSum;
      while (yearCard > 21) {
        yearCard = yearCard.toString().split('').map(Number).reduce((sum, digit) => sum + digit, 0);
      }
      
      const card = allCards.find(c => c.id === yearCard);
      years.push({
        year: targetYear,
        cardNumber: yearCard,
        card,
      });
    }
    
    return years;
  };

  // 計算當月每日流日運勢
  const calculateMonthlyDayFortune = () => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const days = [];
    
    const birthSum = birthYear + birthMonth + birthDay;
    const monthSum = birthSum + currentYear + currentMonth;
    
    for (let day = 1; day <= daysInMonth; day++) {
      const daySum = monthSum + day;
      const digitSum = daySum.toString().split('').map(Number).reduce((sum, digit) => sum + digit, 0);
      
      let dayCard = digitSum;
      if (digitSum >= 22) {
        dayCard = digitSum - 21;
      }
      
      const card = allCards.find(c => c.id === dayCard);
      days.push({
        day,
        cardNumber: dayCard,
        card,
      });
    }
    
    return days;
  };

  const multiYearFortune = calculateMultiYearFortune();
  const monthlyDayFortune = calculateMonthlyDayFortune();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const currentDay = new Date().getDate();

  return (
    <div className="w-full space-y-12 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl md:text-5xl font-serif bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
          您的塔羅靈數運勢
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          生日：{birthYear}年{birthMonth}月{birthDay}日
        </p>
        <Button variant="outline" onClick={onReset} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          重新占卜
        </Button>
      </div>

      {/* 本命牌組 */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <User className="w-6 h-6 text-primary" />
          <h3 className="text-2xl font-serif text-foreground">本命形象和個性</h3>
        </div>
        <p className="text-muted-foreground">
          本命牌組代表您的核心特質與人格面向，包含本性、外顯與內心三個層面
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.core && (
            <div className="space-y-2">
              <TarotCard
                card={cards.core}
                label="本性"
                onClick={() => onCardClick?.(cards.core!)}
              />
              <p className="text-xs text-center text-muted-foreground">核心靈數</p>
            </div>
          )}
          {cards.outer && (
            <div className="space-y-2">
              <TarotCard
                card={cards.outer}
                label="外顯"
                onClick={() => onCardClick?.(cards.outer!)}
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
              />
              <p className="text-xs text-center text-muted-foreground">內在特質</p>
            </div>
          )}
        </div>
      </section>

      <Separator className="my-12" />

      {/* 貴人牌組 */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Star className="w-6 h-6 text-secondary" />
          <h3 className="text-2xl font-serif text-foreground">貴人牌組</h3>
        </div>
        <p className="text-muted-foreground">
          貴人牌組顯示能夠幫助您、支持您的人所具備的特質
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.benefactorCore && (
            <TarotCard
              card={cards.benefactorCore}
              label="貴人本性"
              onClick={() => onCardClick?.(cards.benefactorCore!)}
            />
          )}
          {cards.benefactorOuter && (
            <TarotCard
              card={cards.benefactorOuter}
              label="貴人外顯"
              onClick={() => onCardClick?.(cards.benefactorOuter!)}
            />
          )}
          {cards.benefactorInner && (
            <TarotCard
              card={cards.benefactorInner}
              label="貴人內心"
              onClick={() => onCardClick?.(cards.benefactorInner!)}
            />
          )}
        </div>
      </section>

      <Separator className="my-12" />

      {/* 本命與貴人對照 */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-primary" />
          <h3 className="text-2xl font-serif text-foreground">本命與貴人對照</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle className="text-center">本命牌組</CardTitle>
              <CardDescription className="text-center">與生俱來的特質</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                <span className="font-medium">本性:</span>
                <span className="text-primary font-semibold">
                  {cards.core?.id} - {cards.core?.name}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                <span className="font-medium">外顯:</span>
                <span className="text-primary font-semibold">
                  {cards.outer?.id} - {cards.outer?.name}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                <span className="font-medium">內心:</span>
                <span className="text-primary font-semibold">
                  {cards.inner?.id} - {cards.inner?.name}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-secondary/30">
            <CardHeader>
              <CardTitle className="text-center">貴人牌組</CardTitle>
              <CardDescription className="text-center">能助您的人的特質</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                <span className="font-medium">貴人本性:</span>
                <span className="text-secondary font-semibold">
                  {cards.benefactorCore?.id} - {cards.benefactorCore?.name}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                <span className="font-medium">貴人外顯:</span>
                <span className="text-secondary font-semibold">
                  {cards.benefactorOuter?.id} - {cards.benefactorOuter?.name}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                <span className="font-medium">貴人內心:</span>
                <span className="text-secondary font-semibold">
                  {cards.benefactorInner?.id} - {cards.benefactorInner?.name}
                </span>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {cards.year && (
                <Card className="border-2 border-primary/30 bg-gradient-to-br from-card to-primary/5">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Sun className="w-5 h-5 text-primary" />
                      <CardTitle className="font-serif">流年運勢</CardTitle>
                    </div>
                    <CardDescription>{currentYear}年整年度的運勢主題</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TarotCard
                      card={cards.year}
                      onClick={() => onCardClick?.(cards.year!)}
                      className="border-primary/40"
                    />
                  </CardContent>
                </Card>
              )}
              {cards.month && (
                <Card className="border-2 border-secondary/30 bg-gradient-to-br from-card to-secondary/5">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Moon className="w-5 h-5 text-secondary" />
                      <CardTitle className="font-serif">流月運勢</CardTitle>
                    </div>
                    <CardDescription>{currentMonth}月份的運勢重點</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TarotCard
                      card={cards.month}
                      onClick={() => onCardClick?.(cards.month!)}
                      className="border-secondary/40"
                    />
                  </CardContent>
                </Card>
              )}
              {cards.day && (
                <Card className="border-2 border-accent/30 bg-gradient-to-br from-card to-accent/10">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="w-5 h-5 text-primary" />
                      <CardTitle className="font-serif">流日運勢</CardTitle>
                    </div>
                    <CardDescription>今日({currentMonth}/{currentDay})的運勢提示</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TarotCard
                      card={cards.day}
                      onClick={() => onCardClick?.(cards.day!)}
                      className="border-accent/40"
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="multi-year" className="mt-6 space-y-4">
            <h4 className="text-lg font-semibold text-center">未來五年流年運勢</h4>
            <p className="text-sm text-muted-foreground text-center">
              查看未來五年的流年牌卡，了解長期運勢走向
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-primary/10">
                    <th className="border border-border p-3 text-center font-semibold">年份</th>
                    <th className="border border-border p-3 text-center font-semibold">流年牌</th>
                    <th className="border border-border p-3 text-center font-semibold">牌卡名稱</th>
                  </tr>
                </thead>
                <tbody>
                  {multiYearFortune.map((item, index) => (
                    <tr 
                      key={item.year} 
                      className={`hover:bg-muted/50 transition-colors cursor-pointer ${index === 0 ? 'bg-primary/5' : ''}`}
                      onClick={() => item.card && onCardClick?.(item.card)}
                    >
                      <td className="border border-border p-3 text-center font-medium">
                        {item.year} {index === 0 && <span className="text-xs text-primary ml-2">(本年)</span>}
                      </td>
                      <td className="border border-border p-3 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 font-bold text-primary">
                          {item.cardNumber}
                        </div>
                      </td>
                      <td className="border border-border p-3 text-center">
                        {item.card?.name || ""}
                      </td>
                    </tr>
                  ))}
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
                    <th className="border border-border p-2 text-center font-semibold">日期</th>
                    <th className="border border-border p-2 text-center font-semibold">流日牌</th>
                    <th className="border border-border p-2 text-center font-semibold">牌卡名稱</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyDayFortune.map((item) => {
                    const isToday = item.day === currentDay;
                    return (
                      <tr 
                        key={item.day} 
                        className={`hover:bg-muted/50 transition-colors cursor-pointer ${isToday ? 'bg-primary/5' : ''}`}
                        onClick={() => item.card && onCardClick?.(item.card)}
                      >
                        <td className="border border-border p-2 text-center font-medium">
                          {currentMonth}月{item.day}日 {isToday && <span className="text-xs text-primary ml-1">(今日)</span>}
                        </td>
                        <td className="border border-border p-2 text-center">
                          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 font-bold text-primary">
                            {item.cardNumber}
                          </div>
                        </td>
                        <td className="border border-border p-2 text-center">
                          {item.card?.name || ""}
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
