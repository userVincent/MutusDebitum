import React, { useState } from 'react';
import { NumberInput, Button, Tab, TabGroup, TabList, TabPanels, TabPanel } from '@tremor/react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';
import { Card, Divider } from '@tremor/react';

function FormComponent({ formData, handleChange, handleSubmit, isLoading }) {
  const [errors, setErrors] = useState({});
  const [selectedTab, setSelectedTab] = useState(0);

  const handleValueChange = (name, value, min, max) => {
    handleChange({ target: { name, value } });
    if (value < min || value > max) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: `Value must be between ${min} and ${max}` }));
    } else {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
    }
  };

  const logValues = [
    0,
    0.00001, 0.00002, 0.00003, 0.00004, 0.00005, 0.00006, 0.00007, 0.00008, 0.00009,
    0.0001, 0.0002, 0.0003, 0.0004, 0.0005, 0.0006, 0.0007, 0.0008, 0.0009, 
    0.001, 0.002, 0.003, 0.004, 0.005, 0.006, 0.007, 0.008, 0.009,
    0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.07, 0.08, 0.09,
    0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9,
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10
  ];

  const [maxDiffValue, setMaxDiffValue] = useState(0);

  const handleSliderChange = (event, newValue) => {
    const value = logValues[newValue];
    setMaxDiffValue(value);
    handleChange({ target: { name: 'max_diff', value } });
  };

  return (
    <div className="form bg-gray-900 text-white p-6 rounded-lg shadow-lg flex-1 space-y-4">
      <TabGroup defaultIndex={0} onChange={setSelectedTab}>
        <TabList variant="solid">
          <Tab>Calculate</Tab>
          <Tab>Explanation</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">Initial Yearly Income:</label>
                <NumberInput
                  placeholder="1000 - 1000000"
                  min={1000}
                  max={1000000}
                  step={1000}
                  onValueChange={(value) => handleValueChange('initial_income', value, 1000, 1000000)}
                  error={!!errors.initial_income}
                  errorMessage={errors.initial_income}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Yearly Wage Increase (%):</label>
                <NumberInput
                  placeholder="0 - 100"
                  min={0}
                  max={100}
                  onValueChange={(value) => handleValueChange('wage_increase_pct', value, 0, 100)}
                  error={!!errors.wage_increase_pct}
                  errorMessage={errors.wage_increase_pct}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Years:</label>
                <NumberInput
                  placeholder="1 - 50"
                  min={1}
                  max={50}
                  onValueChange={(value) => handleValueChange('years', value, 1, 50)}
                  error={!!errors.years}
                  errorMessage={errors.years}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Credit Limit as a Percentage of Income (%):</label>
                <NumberInput
                  placeholder="0 - 200"
                  min={0}
                  max={200}
                  onValueChange={(value) => handleValueChange('initial_credit_pct', value, 0, 200)}
                  error={!!errors.initial_credit_pct}
                  errorMessage={errors.initial_credit_pct}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Max Credit Utilization (%):</label>
                <NumberInput
                  placeholder="0 - 100"
                  min={0}
                  max={100}
                  onValueChange={(value) => handleValueChange('max_credit_utilization', value, 0, 100)}
                  error={!!errors.max_credit_utilization}
                  errorMessage={errors.max_credit_utilization}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Interest Rate (%):</label>
                <NumberInput
                  placeholder="0 - 100"
                  min={0}
                  max={100}
                  onValueChange={(value) => handleValueChange('interest_rate', value, 0, 100)}
                  error={!!errors.interest_rate}
                  errorMessage={errors.interest_rate}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Initial Debt:</label>
                <NumberInput
                  placeholder="0 - (Credit Limit * Max Credit Utilization * 90%)"
                  min={0}
                  max={formData.initial_income*formData.initial_credit_pct/100*formData.max_credit_utilization/100*0.9}
                  step={500}
                  onValueChange={(value) => handleValueChange('initial_debt', value, 0, formData.initial_income*formData.initial_credit_pct/100*formData.max_credit_utilization/100*0.9)}
                  error={!!errors.initial_debt}
                  errorMessage={errors.initial_debt}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Max Difference Consecutive Factors:</label>
                <Box sx={{}}>
                  <Slider
                    value={logValues.indexOf(maxDiffValue)}
                    min={0}
                    max={logValues.length - 1}
                    step={1}
                    onChange={handleSliderChange}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(v) => logValues[v]}
                    aria-labelledby="non-linear-slider"
                  />
                </Box>
                {errors.max_diff && (
                  <Typography color="error">{errors.max_diff}</Typography>
                )}
              </div>
              <div className="flex justify-center">
                <Button 
                  variant="primary" 
                  loading={isLoading} 
                  type="submit" 
                  size="lg"
                  loadingText='Calculating'
                >
                  Calculate
                </Button>
              </div>
            </form>
          </TabPanel>
          <TabPanel>
          <div className="p-4">
            <h2 className="text-xl font-bold text-white mb-4">The Mathematics Driving Our Spending Optimization</h2>
            <Divider>Explanation</Divider>
            <p className="text-gray-300 mb-4">
                Our objective is to strategically use debt to maximize our spending beyond our income, effectively optimizing our ability to live above our means. We quantify this with the factor <InlineMath math={'f_i = \\frac{\\text{spending}_i}{\\text{income}_i}'} /> where <InlineMath math={'f_i'} /> represents the ratio of spending (excluding interest) to income in month <InlineMath math={'i'} />. In other words, we aim for <InlineMath math={'f_i > 1'} />, indicating that spending exceeds income. To achieve this, we formulate and solve a Linear Programming problem using the simplex algorithm. The optimization function is designed to maximize the sum of <InlineMath math={'f_i'} /> across all months, thereby maximizing our overall spending relative to income over time.
            </p>
            <p className="text-gray-300 mb-4">
                The problem is subject to several constraints, which ensure that we stay within allowable debt limits and maintain consistent spending patterns over time. Without these constraints, particularly when interest rates are zero, the model could yield an infinite number of solutions, causing erratic results.
            </p>
            <p className="text-gray-300 mb-4">
                To prevent this, we introduce a constraint that limits the variation in spending from month to month. This constraint can force the difference in spending factors between months to be constant (e.g., zero) or allow for some controlled variation. By doing so, we ensure a more even distribution of spending over time, avoiding a scenario where interest payments cause the majority of the debt to be spent in the last month. This approach also mitigates the erratic results that can occur when interest rates are zero and the difference is not limited.
            </p>
            <Divider>Linear Programming Model</Divider>
            <BlockMath math={'\\text{Maximize } \\sum_{i=1}^{n} f_i'} />
            <p className="text-gray-300 mb-4">
                Subject to the constraints:
            </p>
            <BlockMath math={'d_1 = (f_1 \\cdot \\text{Income}_1) - \\text{Income}_1'} />
            <BlockMath math={'d_i = d_{i-1} + (f_i \\cdot \\text{Income}_i) - \\text{Income}_i + (d_{i-1} \\cdot \\text{Monthly Interest Rate}), \\quad \\forall i > 1'} />
            <p className="text-gray-300 mb-4">
                Here, <InlineMath math={'d_i'} /> represents the total debt accrued in month <InlineMath math={'i'} />, which accumulates from the previous month’s debt, the current month’s spending, and any interest on the existing debt.
            </p>
            <BlockMath math={'d_i \\leq \\text{Annual Credit Limit} \\cdot \\text{Max Credit Utilization}, \\quad \\forall i'} />
            <BlockMath math={'-10 \\leq f_i \\leq 10, \\quad \\forall i'} />
            <p className="text-gray-300 mb-4">
                Additionally, to ensure consistent spending, we impose constraints on the difference between consecutive spending factors:
            </p>
            <BlockMath math={'|f_{i+1} - f_i| \\leq \\text{Max Difference}, \\quad \\forall i'} />
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
}

export default FormComponent;
