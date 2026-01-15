import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { TarotCard } from "@/components/TarotCard";
import { CardDetailDialog } from "@/components/CardDetailDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Search, ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "wouter";
import type { TarotCard as TarotCardType } from "../../../drizzle/schema";

export default function CardsLibrary() {
  const [selectedCard, setSelectedCard] = useState<TarotCardType | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: allCards, isLoading } = trpc.tarot.getAllCards.useQuery();

  const filteredCards = allCards?.filter((card) =>
    card.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-primary" />
            <h1 className="text-2xl md:text-3xl font-serif bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              塔羅牌資料庫
            </h1>
          </div>
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              返回首頁
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <section className="container py-12 space-y-8">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-serif text-foreground">
            22張大阿爾克那牌卡
          </h2>
          <p className="text-muted-foreground">
            探索每張塔羅牌的深層含義、正逆位解讀與特質分析
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="搜尋牌卡名稱..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Cards Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="w-16 h-16 text-primary animate-spin" />
            <p className="text-xl text-muted-foreground">載入牌卡資料中...</p>
          </div>
        ) : filteredCards && filteredCards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCards.map((card) => (
              <TarotCard
                key={card.id}
                card={card}
                onClick={() => setSelectedCard(card)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <p className="text-xl text-muted-foreground">找不到符合的牌卡</p>
          </div>
        )}
      </section>

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
