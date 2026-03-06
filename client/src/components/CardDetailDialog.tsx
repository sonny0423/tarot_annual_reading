import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sparkles, TrendingUp, TrendingDown, Scroll } from "lucide-react";
import type { TarotCard } from "../../../drizzle/schema";

interface CardDetailDialogProps {
  card: TarotCard | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export function CardDetailDialog({ card, open, onOpenChange }: CardDetailDialogProps) {
  if (!card) return null;

  const englishName = CARD_NAMES_EN[card.id] || "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-primary" />
            <div>
              <DialogTitle className="text-3xl font-serif bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {card.name}
              </DialogTitle>
              <DialogDescription className="text-base mt-1">
                {englishName} · No. {card.id}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 正面特質 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">正面特質</h3>
              <Badge variant="default" className="ml-auto">
                優勢
              </Badge>
            </div>
            <p className="text-foreground/80 leading-relaxed bg-primary/5 p-4 rounded-lg border border-primary/20">
              {card.positiveTraits}
            </p>
          </section>

          {/* 負面特質 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-destructive" />
              <h3 className="text-lg font-semibold">負面特質</h3>
              <Badge variant="destructive" className="ml-auto">
                挑戰
              </Badge>
            </div>
            <p className="text-foreground/70 leading-relaxed bg-destructive/5 p-4 rounded-lg border border-destructive/20">
              {card.negativeTraits}
            </p>
          </section>

          {card.scriptAnalysis && (
            <>
              <Separator />

              {/* 運勢劇本解析 */}
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <Scroll className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">運勢劇本解析</h3>
                </div>
                <p className="text-foreground/80 leading-relaxed bg-gradient-to-br from-primary/5 to-transparent p-4 rounded-lg border border-primary/20">
                  {card.scriptAnalysis}
                </p>
              </section>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
