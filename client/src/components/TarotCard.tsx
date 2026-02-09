import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import type { TarotCard as TarotCardType } from "../../../drizzle/schema";

interface TarotCardProps {
  card: TarotCardType;
  label?: string;
  onClick?: () => void;
  className?: string;
  displayMode?: 'traits' | 'annual'; // 'traits' for personality traits, 'annual' for annual fortune
  compact?: boolean; // If true, hide trait details and only show card name
}

const CARD_NAMES_EN = [
  "The Fool",
  "The Magician",
  "The High Priestess",
  "The Empress",
  "The Emperor",
  "The Hierophant",
  "The Lovers",
  "The Chariot",
  "Strength",
  "The Hermit",
  "Wheel of Fortune",
  "Justice",
  "The Hanged Man",
  "Death",
  "Temperance",
  "The Devil",
  "The Tower",
  "The Star",
  "The Moon",
  "The Sun",
  "Judgement",
  "The World",
];

export function TarotCard({ card, label, onClick, className = "", displayMode = 'traits', compact = false }: TarotCardProps) {
  const englishName = CARD_NAMES_EN[card.id] || "";

  return (
    <Card
      className={`group relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-card to-accent/30 shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:border-primary/40 cursor-pointer ${className}`}
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardHeader className="relative z-10 pb-3">
        {label && (
          <Badge variant="secondary" className="w-fit mb-2 font-serif">
            {label}
          </Badge>
        )}
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <CardTitle className={`font-serif bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent ${compact ? 'text-3xl' : 'text-2xl'}`}>
            {card.name}
          </CardTitle>
        </div>
        <CardDescription className={`font-medium text-muted-foreground ${compact ? 'text-base' : 'text-sm'}`}>
          {englishName} · No. {card.id}
        </CardDescription>
      </CardHeader>

      {!compact && (
        <CardContent className="relative z-10 space-y-3">
        {displayMode === 'traits' ? (
          <>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-primary flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                正面特質
              </h4>
              <p className="text-sm text-foreground/80 leading-relaxed">
                {card.positiveTraits}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-destructive flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                負面特質
              </h4>
              <p className="text-sm text-foreground/70 leading-relaxed">
                {card.negativeTraits}
              </p>
            </div>
          </>
        ) : (
          <>
            {card.scriptAnalysis && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-primary flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  運勢劇本解析
                </h4>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {card.scriptAnalysis}
                </p>
              </div>
            )}
          </>
        )}
        </CardContent>
      )}

      <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-primary/10 to-transparent rounded-tl-full opacity-50" />
    </Card>
  );
}
