import { TarotCard } from "./TarotCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { RefreshCw, User, Heart, Eye, Star, Calendar, Moon, Sun } from "lucide-react";
import type { TarotCard as TarotCardType } from "../../../drizzle/schema";

interface ReadingResultProps {
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
}

export function ReadingResult({ cards, onReset, onCardClick }: ReadingResultProps) {
  return (
    <div className="w-full space-y-12 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl md:text-5xl font-serif bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
          您的塔羅靈數運勢
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          以下是根據您的生日計算出的專屬塔羅牌組，點擊任一牌卡可查看詳細解讀
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
          <h3 className="text-2xl font-serif text-foreground">本命牌組</h3>
        </div>
        <p className="text-muted-foreground">
          本命牌組代表您的核心特質與人格面向，包含本性、外顯與內心三個層面
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.core && (
            <TarotCard
              card={cards.core}
              label="本性"
              onClick={() => onCardClick?.(cards.core!)}
            />
          )}
          {cards.outer && (
            <TarotCard
              card={cards.outer}
              label="外顯"
              onClick={() => onCardClick?.(cards.outer!)}
            />
          )}
          {cards.inner && (
            <TarotCard
              card={cards.inner}
              label="內心"
              onClick={() => onCardClick?.(cards.inner!)}
            />
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

      {/* 流年流月流日 */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-primary" />
          <h3 className="text-2xl font-serif text-foreground">當前運勢</h3>
        </div>
        <p className="text-muted-foreground">
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
                <CardDescription>整年度的運勢主題</CardDescription>
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
                <CardDescription>本月份的運勢重點</CardDescription>
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
                <CardDescription>今日的運勢提示</CardDescription>
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
      </section>
    </div>
  );
}
