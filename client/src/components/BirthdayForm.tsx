import { useState } from "react";
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

// 驗證規則
function validateYear(val: string): string {
  if (!val) return "";
  const n = parseInt(val);
  if (isNaN(n)) return "請輸入有效數字";
  if (n < 1900 || n > 2100) return "年份須介於 1900 – 2100";
  return "";
}

function validateMonth(val: string): string {
  if (!val) return "";
  const n = parseInt(val);
  if (isNaN(n)) return "請輸入有效數字";
  if (n < 1 || n > 12) return "月份須介於 1 – 12";
  return "";
}

function validateDay(val: string): string {
  if (!val) return "";
  const n = parseInt(val);
  if (isNaN(n)) return "請輸入有效數字";
  if (n < 1 || n > 31) return "日期須介於 1 – 31";
  return "";
}

export function BirthdayForm({ onSubmit }: BirthdayFormProps) {
  const [calendarType, setCalendarType] = useState<"solar" | "lunar">("solar");

  // 國曆輸入
  const [solarYear, setSolarYear] = useState("");
  const [solarMonth, setSolarMonth] = useState("");
  const [solarDay, setSolarDay] = useState("");

  // 國曆錯誤
  const [solarYearErr, setSolarYearErr] = useState("");
  const [solarMonthErr, setSolarMonthErr] = useState("");
  const [solarDayErr, setSolarDayErr] = useState("");

  // 農曆輸入
  const [lunarYear, setLunarYear] = useState("");
  const [lunarMonth, setLunarMonth] = useState("");
  const [lunarDay, setLunarDay] = useState("");
  const [isLeapMonth, setIsLeapMonth] = useState(false);

  // 農曆錯誤
  const [lunarYearErr, setLunarYearErr] = useState("");
  const [lunarMonthErr, setLunarMonthErr] = useState("");
  const [lunarDayErr, setLunarDayErr] = useState("");

  // 轉換後的顯示
  const [convertedDate, setConvertedDate] = useState<string>("");

  // 國曆轉農曆
  const solarToLunarMutation = trpc.tarot.solarToLunar.useMutation({
    onSuccess: (data) => {
      if (data) {
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

  // 手動觸發國曆轉農曆（onBlur）
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

  // 手動觸發農曆轉國曆（onBlur）
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

  const hasErrors = () => {
    if (calendarType === "solar") {
      return !!(solarYearErr || solarMonthErr || solarDayErr);
    }
    return !!(lunarYearErr || lunarMonthErr || lunarDayErr);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (calendarType === "solar") {
      // 觸發所有欄位驗證
      const yErr = validateYear(solarYear) || (!solarYear ? "請輸入年份" : "");
      const mErr = validateMonth(solarMonth) || (!solarMonth ? "請輸入月份" : "");
      const dErr = validateDay(solarDay) || (!solarDay ? "請輸入日期" : "");
      setSolarYearErr(yErr);
      setSolarMonthErr(mErr);
      setSolarDayErr(dErr);
      if (yErr || mErr || dErr) return;

      const year = parseInt(solarYear);
      const month = parseInt(solarMonth);
      const day = parseInt(solarDay);

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
      const yErr = validateYear(lunarYear) || (!lunarYear ? "請輸入年份" : "");
      const mErr = validateMonth(lunarMonth) || (!lunarMonth ? "請輸入月份" : "");
      const dErr = validateDay(lunarDay) || (!lunarDay ? "請輸入日期" : "");
      setLunarYearErr(yErr);
      setLunarMonthErr(mErr);
      setLunarDayErr(dErr);
      if (yErr || mErr || dErr) return;

      const year = parseInt(lunarYear);
      const month = parseInt(lunarMonth);
      const day = parseInt(lunarDay);

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
            國曆 (西元)
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
                {/* 年份 */}
                <div className="space-y-1">
                  <Label htmlFor="solar-year">年份</Label>
                  <Input
                    id="solar-year"
                    type="number"
                    placeholder="1990"
                    value={solarYear}
                    onChange={(e) => {
                      setSolarYear(e.target.value);
                      setSolarYearErr(validateYear(e.target.value));
                    }}
                    onBlur={handleSolarToLunar}
                    min="1900"
                    max="2100"
                    className={solarYearErr ? "border-red-500 focus-visible:ring-red-400" : ""}
                  />
                  {solarYearErr && <p className="text-xs text-red-500 mt-1">{solarYearErr}</p>}
                </div>
                {/* 月份 */}
                <div className="space-y-1">
                  <Label htmlFor="solar-month">月份</Label>
                  <Input
                    id="solar-month"
                    type="number"
                    placeholder="1"
                    value={solarMonth}
                    onChange={(e) => {
                      setSolarMonth(e.target.value);
                      setSolarMonthErr(validateMonth(e.target.value));
                    }}
                    onBlur={handleSolarToLunar}
                    min="1"
                    max="12"
                    className={solarMonthErr ? "border-red-500 focus-visible:ring-red-400" : ""}
                  />
                  {solarMonthErr && <p className="text-xs text-red-500 mt-1">{solarMonthErr}</p>}
                </div>
                {/* 日期 */}
                <div className="space-y-1">
                  <Label htmlFor="solar-day">日期</Label>
                  <Input
                    id="solar-day"
                    type="number"
                    placeholder="1"
                    value={solarDay}
                    onChange={(e) => {
                      setSolarDay(e.target.value);
                      setSolarDayErr(validateDay(e.target.value));
                    }}
                    onBlur={handleSolarToLunar}
                    min="1"
                    max="31"
                    className={solarDayErr ? "border-red-500 focus-visible:ring-red-400" : ""}
                  />
                  {solarDayErr && <p className="text-xs text-red-500 mt-1">{solarDayErr}</p>}
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
                {/* 農曆年份 */}
                <div className="space-y-1">
                  <Label htmlFor="lunar-year">年份</Label>
                  <Input
                    id="lunar-year"
                    type="number"
                    placeholder="1990"
                    value={lunarYear}
                    onChange={(e) => {
                      setLunarYear(e.target.value);
                      setLunarYearErr(validateYear(e.target.value));
                    }}
                    onBlur={handleLunarToSolar}
                    min="1900"
                    max="2100"
                    className={lunarYearErr ? "border-red-500 focus-visible:ring-red-400" : ""}
                  />
                  {lunarYearErr && <p className="text-xs text-red-500 mt-1">{lunarYearErr}</p>}
                </div>
                {/* 農曆月份 */}
                <div className="space-y-1">
                  <Label htmlFor="lunar-month">月份</Label>
                  <Input
                    id="lunar-month"
                    type="number"
                    placeholder="3"
                    value={lunarMonth}
                    onChange={(e) => {
                      setLunarMonth(e.target.value);
                      setLunarMonthErr(validateMonth(e.target.value));
                    }}
                    onBlur={handleLunarToSolar}
                    min="1"
                    max="12"
                    className={lunarMonthErr ? "border-red-500 focus-visible:ring-red-400" : ""}
                  />
                  {lunarMonthErr && <p className="text-xs text-red-500 mt-1">{lunarMonthErr}</p>}
                </div>
                {/* 農曆日期 */}
                <div className="space-y-1">
                  <Label htmlFor="lunar-day">日期</Label>
                  <Input
                    id="lunar-day"
                    type="number"
                    placeholder="20"
                    value={lunarDay}
                    onChange={(e) => {
                      setLunarDay(e.target.value);
                      setLunarDayErr(validateDay(e.target.value));
                    }}
                    onBlur={handleLunarToSolar}
                    min="1"
                    max="31"
                    className={lunarDayErr ? "border-red-500 focus-visible:ring-red-400" : ""}
                  />
                  {lunarDayErr && <p className="text-xs text-red-500 mt-1">{lunarDayErr}</p>}
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

          <Button
            type="submit"
            className="w-full gap-2 text-lg py-6"
            disabled={solarToLunarMutation.isPending || lunarToSolarMutation.isPending || hasErrors()}
          >
            <Sparkles className="w-5 h-5" />
            開始計算
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
