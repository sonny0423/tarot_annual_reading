import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FlowingYearTimeline } from "./FlowingYearTimeline";
import { FlowYearCycleChart } from "./FlowYearCycleChart";

interface FlowYearCycleTabsProps {
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  currentDate: Date;
}

export function FlowYearCycleTabs({
  birthYear,
  birthMonth,
  birthDay,
  currentDate,
}: FlowYearCycleTabsProps) {
  const [activeTab, setActiveTab] = useState("timeline");

  return (
    <div className="mb-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="timeline">簡易時間軸</TabsTrigger>
          <TabsTrigger value="chart">詳細週期圖</TabsTrigger>
        </TabsList>
        
        <TabsContent value="timeline" className="mt-0">
          <FlowingYearTimeline
            birthDate={new Date(birthYear, birthMonth - 1, birthDay)}
            currentDate={currentDate}
          />
        </TabsContent>
        
        <TabsContent value="chart" className="mt-0">
          <FlowYearCycleChart
            birthMonth={birthMonth}
            birthDay={birthDay}
            currentDate={currentDate}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
