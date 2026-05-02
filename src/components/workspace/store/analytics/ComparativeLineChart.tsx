'use client';

import * as React from "react";
import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

import { useIsMobile } from "@/hooks/shadcn/use-mobile";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcn-ui/card";
import { useLocale, useTranslations } from "next-intl";

type ChartDataPoint = {
  date: string;
  previousDate?: string;
  [key: string]: any; // Current data
};

type ComparativeLineChartProps = {
  title: string;
  data: ChartDataPoint[] | null | undefined;
  currentDataKey: string;
  previousDataKey: string;
  currentLabel?: string;
  previousLabel?: string;
  valueFormatter?: (val: number) => string;
  yAxisWidth?: number;
};

export function ComparativeLineChart({ 
    title, 
    data, 
    currentDataKey, 
    previousDataKey,
    currentLabel = "Current",
    previousLabel = "Previous",
    valueFormatter = (val: number) => val.toString(),
    yAxisWidth = 40
}: ComparativeLineChartProps) {
  const isMobile = useIsMobile();
  const locale = useLocale();
  const t = useTranslations('Dashboard.chart');

  if (!data || data.length === 0) {
    return (
      <Card className="@container/card h-full flex flex-col">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center text-muted-foreground">
          <p>{t('noDisplay')}</p>
        </CardContent>
      </Card>
    );
  }

  // Filter out null data
  const validData = data.filter((item) => item !== null);

  return (
    <Card className="@container/card h-full flex flex-col">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 px-2 pt-4 sm:px-6 sm:pt-6">
        <div className="h-[250px] w-full text-muted-foreground">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={validData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tick={{ fill: "currentColor", fontSize: 12 }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString(locale, {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <YAxis 
                tickLine={false}
                axisLine={false}
                tickMargin={4}
                tick={{ fill: "currentColor", fontSize: 12 }}
                tickFormatter={valueFormatter}
                width={yAxisWidth}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-background border rounded-lg shadow-sm p-3 text-sm">
                        <p className="font-semibold mb-2">
                          {new Date(label).toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between gap-4">
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-primary" />
                              {currentLabel}
                            </span>
                            <span className="font-medium">{valueFormatter(payload[0].value as number)}</span>
                          </div>
                          {payload[1] && (
                            <div className="flex items-center justify-between gap-4">
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <span className="w-2 h-2 rounded-full border border-dashed border-muted-foreground" />
                                {previousLabel}
                              </span>
                              <span className="text-muted-foreground">{valueFormatter(payload[1].value as number)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {/* Previous Period (Dotted Grey Line) */}
              <Line
                type="monotone"
                dataKey={previousDataKey}
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                activeDot={{ r: 4 }}
              />
              {/* Current Period (Solid Theme Line) */}
              <Line
                type="monotone"
                dataKey={currentDataKey}
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
