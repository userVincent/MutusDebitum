import React from 'react';
import { AreaChart } from '@tremor/react';
import { format, addMonths } from 'date-fns';

const dataFormatter = (number) =>
  `$${Intl.NumberFormat('us').format(number).toString()}`;

function getMonthNames(startDate, length) {
  return Array.from({ length }, (_, i) => format(addMonths(startDate, i), 'MMM yyyy'));
}

function GraphData({ data, maxCreditUtilization }) {
  const startDate = new Date();
  const chartData = data
    ? data.monthly_income_years.map((income, index) => ({
        month: getMonthNames(startDate, data.monthly_income_years.length)[index],
        Income: income,
        'Spending': data.monthly_goods_spending[index],
        'Spending + Interest': data.monthly_spending[index],
        'Total Debt': data.monthly_debt[index],
        'Credit Limit': data.annual_credit_limits[Math.floor(index / 12)],
        'Utilization Limit': data.annual_credit_limits[Math.floor(index / 12)] * (maxCreditUtilization / 100),
      }))
    : [];

  const minValueSpending = chartData.length > 0
    ? Math.min(
        ...chartData.flatMap((entry) => [entry.Income, entry['Spending'], entry['Spending + Interest']])
      )
    : 0;

  const minValueDebt = chartData.length > 0
    ? Math.min(
        ...chartData.flatMap((entry) => [entry['Total Debt'], entry['Credit Limit'], entry['Utilization Limit']])
      )
    : 0;

  return (
    <div className="flex w-full space-x-6">
      <div className="flex-1">
        <h2 className="text-xl font-bold text-white mb-4">Optimized Spending</h2>
        <AreaChart
          className="h-80"
          data={chartData}
          index="month"
          categories={['Spending + Interest', 'Spending', 'Income']}
          colors={['rose', 'purple', 'green']}
          valueFormatter={dataFormatter}
          yAxisWidth={60}
          minValue={minValueSpending}
        />
      </div>
      <div className="flex-1">
        <h2 className="text-xl font-bold text-white mb-4">Debt</h2>
        <AreaChart
          className="h-80"
          data={chartData}
          index="month"
          categories={['Credit Limit', 'Utilization Limit', 'Total Debt']}
          colors={['blue', 'yellow', 'rose']}
          valueFormatter={dataFormatter}
          yAxisWidth={60}
          minValue={minValueDebt}
        />
      </div>
    </div>
  );
}

export default GraphData;
