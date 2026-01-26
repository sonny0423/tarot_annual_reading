import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface BirthdayFormProps {
  onSubmit: (data: {
    solarYear: number;
    solarMonth: number;
    solarDay: number;
    lunarYear: number;
    lunarMonth: number;
    lunarDay: number;
    isLeapMonth: boolean;
  }) => void;
}

export function BirthdayForm({ onSubmit }: BirthdayFormProps) {
  const [calendarType, setCalendarType] = useState<"solar" | "lunar">("solar");
  
  // 國曆輸入
  const [solarYear, setSolarYear] = useState("");
  const [solarMonth, setSolarMonth] = useState("");
  const [solarDay, setSolarDay] = useState("");
  
  // 農曆輸入
  const [lunarYear, setLunarYear] = useState("");
  const [lunarMonth, setLunarMonth] = useState("");
  const [lunarDay, setLunarDay] = useState("");
  const [isLeapMonth, setIsLeapMonth] = useState(false);
  
  // 轉換後的顯示
  const [convertedDate, setConvertedDate] = useState<string>("");

  // 國曆轉農曆
  const solarToLunarMutation = trpc.tarot.solarToLunar.useMutation({
    onSuccess: (data) => {
      if (data) {
        // 使用阿拉伯數字顯示，月份需要取絕對值（處理閏月負數）
        const month = Math.abs(data.month);
        setConvertedDate(`農曆：${data.year}年${data.isLeapMonth ? '閏' : ''}${month}月${data.day}日`);
      }
    },
  });

  // 農曆轉國曆
  const lunarToSolarMutation = trpc.tarot.lunarToSolar.useMutation({
    onSuccess: (data) => {
      if (data) {
        setConvertedDate(`國曆：${data.year}年${data.month}月${data.day}日`);
      }
    },
  });

  // 手動觸發國曆轉農曆
  const handleSolarToLunar = () => {
    if (calendarType === "solar" && solarYear && solarMonth && solarDay) {
      const year = parseInt(solarYear);
      const month = parseInt(solarMonth);
      const day = parseInt(solarDay);
      
      if (year >= 1900 && year <= 2100 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        solarToLunarMutation.mutate({ year, month, day });
      }
    }
  };

  // 手動觸發農曆轉國曆
  const handleLunarToSolar = () => {
    if (calendarType === "lunar" && lunarYear && lunarMonth && lunarDay) {
      const year = parseInt(lunarYear);
      const month = parseInt(lunarMonth);
      const day = parseInt(lunarDay);
      
      if (year >= 1900 && year <= 2100 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        lunarToSolarMutation.mutate({ year, month, day, isLeapMonth });
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (calendarType === "solar") {
      const year = parseInt(solarYear);
      const month = parseInt(solarMonth);
      const day = parseInt(solarDay);

      if (!year || !month || !day) {
        alert("請輸入完整的生日資訊");
        return;
      }

      if (year < 1900 || year > 2100) {
        alert("年份必須在1900-2100之間");
        return;
      }

      if (month < 1 || month > 12) {
        alert("月份必須在1-12之間");
        return;
      }

      if (day < 1 || day > 31) {
        alert("日期必須在1-31之間");
        return;
      }

      // 取得農曆日期
      solarToLunarMutation.mutate(
        { year, month, day },
        {
          onSuccess: (lunarData) => {
            if (lunarData) {
              onSubmit({
                solarYear: year,
                solarMonth: month,
                solarDay: day,
                lunarYear: lunarData.year,
                lunarMonth: Math.abs(lunarData.month),
                lunarDay: lunarData.day,
                isLeapMonth: lunarData.isLeapMonth,
              });
            }
          },
        }
      );
    } else {
      const year = parseInt(lunarYear);
      const month = parseInt(lunarMonth);
      const day = parseInt(lunarDay);

      if (!year || !month || !day) {
        alert("請輸入完整的生日資訊");
        return;
      }

      if (year < 1900 || year > 2100) {
        alert("年份必須在1900-2100之間");
        return;
      }

      if (month < 1 || month > 12) {
        alert("月份必須在1-12之間");
        return;
      }

      if (day < 1 || day > 31) {
        alert("日期必須在1-31之間");
        return;
      }

      // 取得國曆日期
      lunarToSolarMutation.mutate(
        { year, month, day, isLeapMonth },
        {
          onSuccess: (solarData) => {
            if (solarData) {
              onSubmit({
                solarYear: solarData.year,
                solarMonth: solarData.month,
                solarDay: solarData.day,
                lunarYear: year,
                lunarMonth: month,
                lunarDay: day,
                isLeapMonth,
              });
            }
          },
        }
      );
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto backdrop-blur-sm bg-card/80 border-primary/20 shadow-xl">
      <CardHeader className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Calendar className="w-6 h-6 text-primary" />
          <CardTitle className="text-2xl font-serif bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            輸入您的生日
          </CardTitle>
        </div>
        <CardDescription className="text-base">
          請選擇曆法類型並輸入完整的出生日期，系統將為您計算專屬的塔羅靈數運勢
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 曆法選擇 */}
        <div className="flex gap-2">
          <Button
            type="button"
            variant={calendarType === "solar" ? "default" : "outline"}
            className="flex-1"
            onClick={() => {
              setCalendarType("solar");
              setConvertedDate("");
            }}
          >
            國曆 (西曆)
          </Button>
          <Button
            type="button"
            variant={calendarType === "lunar" ? "default" : "outline"}
            className="flex-1"
            onClick={() => {
              setCalendarType("lunar");
              setConvertedDate("");
            }}
          >
            農曆
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {calendarType === "solar" ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="solar-year">年份</Label>
                  <Input
                    id="solar-year"
                    type="number"
                    placeholder="1990"
                    value={solarYear}
                    onChange={(e) => setSolarYear(e.target.value)}
                    onBlur={handleSolarToLunar}
                    min="1900"
                    max="2100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="solar-month">月份</Label>
                  <Input
                    id="solar-month"
                    type="number"
                    placeholder="4"
                    value={solarMonth}
                    onChange={(e) => setSolarMonth(e.target.value)}
                    onBlur={handleSolarToLunar}
                    min="1"
                    max="12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="solar-day">日期</Label>
                  <Input
                    id="solar-day"
                    type="number"
                    placeholder="23"
                    value={solarDay}
                    onChange={(e) => setSolarDay(e.target.value)}
                    onBlur={handleSolarToLunar}
                    min="1"
                    max="31"
                  />
                </div>
              </div>
              {convertedDate && (
                <div className="p-3 bg-secondary/10 rounded-lg border border-secondary/30">
                  <p className="text-sm text-center text-secondary font-medium">{convertedDate}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lunar-year">年份</Label>
                  <Input
                    id="lunar-year"
                    type="number"
                    placeholder="1990"
                    value={lunarYear}
                    onChange={(e) => setLunarYear(e.target.value)}
                    onBlur={handleLunarToSolar}
                    min="1900"
                    max="2100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lunar-month">月份</Label>
                  <Input
                    id="lunar-month"
                    type="number"
                    placeholder="3"
                    value={lunarMonth}
                    onChange={(e) => setLunarMonth(e.target.value)}
                    onBlur={handleLunarToSolar}
                    min="1"
                    max="12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lunar-day">日期</Label>
                  <Input
                    id="lunar-day"
                    type="number"
                    placeholder="20"
                    value={lunarDay}
                    onChange={(e) => setLunarDay(e.target.value)}
                    onBlur={handleLunarToSolar}
                    min="1"
                    max="31"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="leap-month"
                  checked={isLeapMonth}
                  onChange={(e) => setIsLeapMonth(e.target.checked)}
                  className="w-4 h-4 rounded border-primary/30"
                />
                <Label htmlFor="leap-month" className="cursor-pointer">
                  閏月
                </Label>
              </div>
              {convertedDate && (
                <div className="p-3 bg-secondary/10 rounded-lg border border-secondary/30">
                  <p className="text-sm text-center text-secondary font-medium">{convertedDate}</p>
                </div>
              )}
            </div>
          )}

          <Button type="submit" className="w-full gap-2 text-lg py-6" disabled={solarToLunarMutation.isPending || lunarToSolarMutation.isPending}>
            <Sparkles className="w-5 h-5" />
            開始占卜
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
