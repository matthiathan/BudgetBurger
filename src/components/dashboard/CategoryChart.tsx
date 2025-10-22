"use client"

import { Pie, PieChart } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

type CategoryChartProps = {
    data: {
        category: string;
        amount: number;
        fill: string;
    }[];
    currency: string;
}

const chartConfig = {
    amount: {
      label: "Amount",
    },
}

export function CategoryChart({ data: chartData, currency }: CategoryChartProps) {
  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square h-[250px]"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent 
            hideLabel 
            formatter={(value, name) => `${name}: ${currency}${Number(value).toFixed(2)}`}
          />}
        />
        <Pie
          data={chartData}
          dataKey="amount"
          nameKey="category"
          innerRadius={60}
          strokeWidth={5}
        >
        </Pie>
      </PieChart>
    </ChartContainer>
  )
}
