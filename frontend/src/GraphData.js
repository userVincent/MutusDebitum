import React, { useState, useMemo } from 'react';
import { AreaChart, DonutChart, List, ListItem, Badge, BadgeDelta, ProgressBar, Card, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@tremor/react';
import { format, addMonths, isValid } from 'date-fns';
import { Calendar } from 'primereact/calendar';
import 'primereact/resources/primereact.min.css';
import 'primereact/resources/themes/bootstrap4-dark-blue/theme.css'; // Import the dark theme

const dataFormatter = (number) =>
  `$${Intl.NumberFormat('us').format(number).toString()}`;

const getMonthNames = (startDate, length) =>
  Array.from({ length }, (_, i) => format(addMonths(startDate, i), 'MMM yyyy'));

function GraphData({ data, maxCreditUtilization, years = 1 }) {
  const currentDate = new Date();
  const [selectedDate, setSelectedDate] = useState(currentDate);

  // Calculate the maximum selectable date based on the number of years provided
  const maxDate = addMonths(currentDate, years * 12 - 1);
  const minDate = currentDate; // Start from the current month

  const handleDateChange = (e) => {
    const date = e.value;
    if (isValid(date)) {
      if (date >= minDate && date <= maxDate) {
        setSelectedDate(date);
      } else {
        setSelectedDate(currentDate); // Reset to current date if out of range
      }
    } else {
      setSelectedDate(currentDate); // Reset to current date if invalid
    }
  };

  const chartData = data
    ? data.monthly_income_years.map((income, index) => {
        const spending = data.monthly_goods_spending[index];
        const spendingAboveMeans = spending > income ? spending - income : 0;
        const spendingBelowMeans = spending <= income ? spending : income;
        const interestPayment = data.monthly_spending[index] - spending;
        const debtPayment = income > spending + interestPayment ? income - spending - interestPayment : 0;

        return {
          month: getMonthNames(currentDate, data.monthly_income_years.length)[index],
          Income: income,
          Spending: spending,
          'Spending Above Means': spendingAboveMeans,
          'Spending Within Means': spendingBelowMeans,
          'Interest Payment': interestPayment,
          'Debt Payment': debtPayment,
          'Spending + Interest Payment': data.monthly_spending[index],
          'Total Debt': data.monthly_debt[index],
          'Accrued Debt': spendingAboveMeans + spendingBelowMeans + interestPayment - income,
          'Credit Limit': data.annual_credit_limits[Math.floor(index / 12)],
          'Utilization Limit': data.annual_credit_limits[Math.floor(index / 12)] * (maxCreditUtilization / 100),
          'Spending Factor': (data.monthly_goods_spending[index] - income) / income,
        };
      })
    : [];

  const selectedMonth = format(selectedDate, 'MMM yyyy');
  const selectedChartData = chartData.find(entry => entry.month === selectedMonth) || {};
  const accruedDebt = selectedChartData['Accrued Debt'];
  const totalDebt = selectedChartData['Total Debt'];
  const creditLimit = selectedChartData['Credit Limit'];
  const debtPercentage = ((totalDebt / creditLimit) * 100).toFixed(2);

  // Calculate the average spending factor
  const averageSpendingFactor = useMemo(() => {
    const totalSpendingFactor = chartData.reduce((sum, entry) => sum + entry['Spending Factor'], 0);
    return totalSpendingFactor / chartData.length;
  }, [chartData]);

  // Satirical Text
  const satiricalText = `Congrats, on average, you'll be able to live ${(
    averageSpendingFactor * 100
  ).toFixed(2)}% above your means over ${years} year(s).`;

  // Data for the DonutChart
  const spendingData = [
    { name: 'Spending Within Means', value: selectedChartData['Spending Within Means'] || 0 },
    { name: 'Spending Above Means', value: selectedChartData['Spending Above Means'] || 0 },
    { name: 'Interest Payment', value: selectedChartData['Interest Payment'] || 0 },
    { name: 'Debt Payment', value: selectedChartData['Debt Payment'] || 0 },
  ];

  return (
    <div className="flex flex-col space-y-4">
      {/* Satirical Text */}
      <h2 className="text-left font-bold text-white text-xl mb-4">
        {satiricalText}
      </h2>

      {/* Top section with title and calendar */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Financial Snapshot: {selectedMonth}</h2>
        <Calendar
          value={selectedDate}
          onChange={handleDateChange}
          view="month"
          dateFormat="mm/yy"
          minDate={minDate}
          maxDate={maxDate}
          className="p-2 rounded-md"
          inputStyle={{
            backgroundColor: '#1f2937', // Dark background for the input
            color: '#ffffff', // Light text for the input
            border: '1px solid #4b5563', // Matching border color
            borderRadius: '0.375rem', // Rounded corners for the input
            padding: '0.5rem', // Padding inside the input field
          }}
          panelStyle={{
            backgroundColor: '#374151', // Dark background for the date picker panel
            color: '#ffffff', // Light text for the date picker panel
          }}
          style={{
            color: '#ffffff', // Light text color
            borderRadius: '0.375rem', // Rounded corners to match Tremor
          }}
        />
      </div>

      {/* Grid layout for DonutChart and information cards */}
      <div className="grid grid-cols-3 gap-4">
        {/* DonutChart */}
        <div className="flex items-center justify-center">
          <DonutChart
            data={spendingData}
            category="value"
            index="name"
            valueFormatter={dataFormatter}
            colors={['green', 'purple', 'red', 'blue']}
            className="w-60 h-60"
          />
        </div>

        {/* Information Sections */}
        <div className="col-span-2 grid grid-cols-2 gap-4">
          {/* Debt Information */}
          <Card>
            <h3 className="text-lg font-semibold mb-2">Debt Overview</h3>
            <List>
              <ListItem>
                <span>Accrued Debt (This Month):</span>
                <BadgeDelta
                  deltaType={accruedDebt >= 0 ? 'increase' : 'decrease'}
                  color={accruedDebt >= 0 ? 'rose' : 'green'}
                  isIncreasePositive={false}
                >
                  {dataFormatter(accruedDebt)}
                </BadgeDelta>
              </ListItem>
              <ListItem>
                <span>Credit Limit:</span>
                <Badge>{dataFormatter(selectedChartData['Credit Limit'])}</Badge>
              </ListItem>
              <ListItem>
                <span>Utilization Limit:</span>
                <Badge color={'yellow'}>{dataFormatter(selectedChartData['Utilization Limit'])}</Badge>
              </ListItem>
              <ListItem>
                <span>Total Debt:</span>
                <span className="flex items-center space-x-1">
                  <span>{dataFormatter(selectedChartData['Total Debt'])}</span>
                  <span>&bull; {debtPercentage}%</span>
                </span>
              </ListItem>
              <ProgressBar value={debtPercentage} color={'rose'} className="mt-3" />
            </List>
          </Card>

          {/* Spending Information */}
          <Card>
            <h3 className="text-lg font-semibold mb-2">Spending Breakdown</h3>
            <List>
              <ListItem>
                <span>Spending Within Means:</span>
                <Badge color={'green'}>{dataFormatter(selectedChartData['Spending Within Means'])}</Badge>
              </ListItem>
              <ListItem>
                <span>Spending Above Means:</span>
                <Badge color={'purple'}>
                  {dataFormatter(selectedChartData['Spending Above Means'])}
                </Badge>
              </ListItem>
              <ListItem>
                <span>Interest Payment:</span>
                <Badge color={'rose'}>
                  {dataFormatter(selectedChartData['Interest Payment'])}
                </Badge>
              </ListItem>
              <ListItem>
                <span>Spending Factor:</span>
                <BadgeDelta deltaType={selectedChartData['Spending Factor'] >= 0 ? 'increase' : 'decrease'}
                            color={selectedChartData['Spending Factor'] >= 0 ? 'green' : 'rose'}>
                  {(selectedChartData['Spending Factor'] * 100).toFixed(2)}%
                </BadgeDelta>
              </ListItem>
            </List>
          </Card>
        </div>
      </div>

      {/* Bottom charts */}
      <div className="flex space-x-4">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white mb-4">Spending & Interest Over Time</h2>
          <AreaChart
            className="h-80"
            data={chartData}
            index="month"
            categories={['Spending + Interest Payment', 'Spending', 'Income']}
            colors={['rose', 'purple', 'green']}
            valueFormatter={dataFormatter}
            yAxisWidth={60}
            minValue={Math.min(...chartData.map(d => Math.min(d.Income, d['Spending'], d['Spending + Interest Payment'])))}
          />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white mb-4">Debt Trends</h2>
          <AreaChart
            className="h-80"
            data={chartData}
            index="month"
            categories={['Credit Limit', 'Utilization Limit', 'Total Debt']}
            colors={['blue', 'yellow', 'rose']}
            valueFormatter={dataFormatter}
            yAxisWidth={60}
            minValue={Math.min(...chartData.map(d => Math.min(d['Total Debt'], d['Credit Limit'], d['Utilization Limit'])))}
          />
        </div>
      </div>

      {/* Data Overview Table */}
      <Card className="mt-6">
        <h2 className="text-tremor-content-strong dark:text-dark-tremor-content-strong text-xl font-bold text-white mb-4">Monthly Data Overview</h2>
        <Table className="mt-5">
          <TableHead>
            <TableRow>
              <TableHeaderCell>Month</TableHeaderCell>
              <TableHeaderCell>Income</TableHeaderCell>
              <TableHeaderCell>Spending</TableHeaderCell>
              <TableHeaderCell>Interest Payment</TableHeaderCell>
              <TableHeaderCell>Accrued Debt</TableHeaderCell>
              <TableHeaderCell>Total Debt</TableHeaderCell>
              <TableHeaderCell>Spending Factor</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {chartData.map((item) => (
              <TableRow key={item.month}>
                <TableCell>{item.month}</TableCell>
                <TableCell>{dataFormatter(item.Income)}</TableCell>
                <TableCell>{dataFormatter(item.Spending)}</TableCell>
                <TableCell>{dataFormatter(item['Interest Payment'])}</TableCell>
                <TableCell>
                  <BadgeDelta
                    deltaType={item['Accrued Debt'] >= 0 ? 'increase' : 'decrease'}
                    color={item['Accrued Debt'] >= 0 ? 'rose' : 'green'}
                    isIncreasePositive={false}
                  >
                    {dataFormatter(item['Accrued Debt'])}
                  </BadgeDelta>
                </TableCell>
                <TableCell>{dataFormatter(item['Total Debt'])}</TableCell>
                <TableCell>
                  <BadgeDelta
                    deltaType={item['Spending Factor'] >= 0 ? 'increase' : 'decrease'}
                    color={item['Spending Factor'] >= 0 ? 'green' : 'rose'}
                  >
                    {(item['Spending Factor'] * 100).toFixed(2)}%
                  </BadgeDelta>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

export default GraphData;
