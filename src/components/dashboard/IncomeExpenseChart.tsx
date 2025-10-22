"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import type { Transaction } from "@/lib/types"
import { format, startOfMonth, parseISO } from "date-fns"

type ChartData = {
  month: string;
  income: number;
  expense: number;
}

const chartConfig = {
  income: {
    label: "Income",
    color: "hsl(var(--chart-2))",
  },
  expense: {
    label: "Expense",
    color: "hsl(var(--chart-1))",
  },
}

export function IncomeExpenseChart({ transactions, currency }: { transactions: Transaction[], currency: string }) {
    const monthlyData = transactions.reduce((acc, tx) => {
        const month = format(startOfMonth(parseISO(tx.date)), 'MMM yyyy');
        if (!acc[month]) {
            acc[month] = { month, income: 0, expense: 0 };
        }
        if (tx.type === 'income') {
            acc[month].income += tx.amount;
        } else {
            acc[month].expense += tx.amount;
        }
        return acc;
    }, {} as Record<string, ChartData>);

    const chartData = Object.values(monthlyData).reverse();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Income vs. Expense</CardTitle>
        <CardDescription>Monthly cash flow analysis.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart data={chartData} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis
                tickFormatter={(value) => `${currency}${Number(value) / 1000}k`}
            />
            <ChartTooltip content={<ChartTooltipContent formatter={(value) => `${currency}${Number(value).toFixed(2)}`} />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="income" fill="var(--color-income)" radius={4} />
            <Bar dataKey="expense" fill="var(--color-expense)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
