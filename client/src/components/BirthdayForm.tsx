import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
          <Tabs value={calendarType} onValueChange={(v) => setCalendarType(v as "solar" | "lunar")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="solar">國曆 (西曆)</TabsTrigger>
              <TabsTrigger value="lunar">農曆</TabsTrigger>
            </TabsList>

            <TabsContent value="solar" className="space-y-4 mt-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="solar-year">年份</Label>
                  <Input
                    id="solar-year"
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
                  <Label htmlFor="solar-month">月份</Label>
                  <Input
                    id="solar-month"
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
                  <Label htmlFor="solar-day">日期</Label>
                  <Input
                    id="solar-day"
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
            </TabsContent>

            <TabsContent value="lunar" className="space-y-4 mt-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lunar-year">年份</Label>
                  <Input
                    id="lunar-year"
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
                  <Label htmlFor="lunar-month">月份</Label>
                  <Input
                    id="lunar-month"
                    type="number"
                    placeholder="3"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    min={1}
                    max={12}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lunar-day">日期</Label>
                  <Input
                    id="lunar-day"
                    type="number"
                    placeholder="19"
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                    min={1}
                    max={30}
                    required
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                * 農曆日期請確認是否為閏月，目前系統暫不支援閏月校正
              </p>
            </TabsContent>
          </Tabs>

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
