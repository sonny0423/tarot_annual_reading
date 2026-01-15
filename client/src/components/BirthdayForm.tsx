import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Sparkles } from "lucide-react";

interface BirthdayFormProps {
  onSubmit: (data: {
    year: number;
    month: number;
    day: number;
    isLunar: boolean;
  }) => void;
  loading?: boolean;
}

export function BirthdayForm({ onSubmit, loading = false }: BirthdayFormProps) {
  const [calendarType, setCalendarType] = useState<"solar" | "lunar">("solar");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);
    const dayNum = parseInt(day);

    if (!yearNum || !monthNum || !dayNum) {
      return;
    }

    if (yearNum < 1900 || yearNum > 2100) {
      alert("請輸入有效的年份 (1900-2100)");
      return;
    }

    if (monthNum < 1 || monthNum > 12) {
      alert("請輸入有效的月份 (1-12)");
      return;
    }

    if (dayNum < 1 || dayNum > 31) {
      alert("請輸入有效的日期 (1-31)");
      return;
    }

    onSubmit({
      year: yearNum,
      month: monthNum,
      day: dayNum,
      isLunar: calendarType === "lunar",
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-2 border-primary/20 shadow-xl">
      <CardHeader className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Calendar className="w-6 h-6 text-primary" />
          <CardTitle className="text-3xl font-serif bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            輸入您的生日
          </CardTitle>
        </div>
        <CardDescription className="text-base">
          請選擇曆法類型並輸入完整的出生日期，系統將為您計算專屬的塔羅靈數運勢
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Calendar Type Toggle */}
          <div className="flex gap-2 p-1 bg-muted rounded-lg">
            <button
              type="button"
              onClick={() => setCalendarType("solar")}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                calendarType === "solar"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              國曆 (西曆)
            </button>
            <button
              type="button"
              onClick={() => setCalendarType("lunar")}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                calendarType === "lunar"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              農曆
            </button>
          </div>

          {/* Input Fields */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">年份</Label>
              <Input
                id="year"
                type="number"
                placeholder="1990"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                min={1900}
                max={2100}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="month">月份</Label>
              <Input
                id="month"
                type="number"
                placeholder="4"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                min={1}
                max={12}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="day">日期</Label>
              <Input
                id="day"
                type="number"
                placeholder="23"
                value={day}
                onChange={(e) => setDay(e.target.value)}
                min={1}
                max={31}
                required
              />
            </div>
          </div>

          {calendarType === "lunar" && (
            <p className="text-sm text-muted-foreground">
              * 農曆日期請確認是否為閏月，目前系統暫不支援閏月校正
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full font-semibold text-lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                計算中...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                開始占卜
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
