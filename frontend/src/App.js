import React, { useState, useEffect } from 'react';
import { Card } from '@tremor/react';
import './App.css';
import FormComponent from './FormComponent';
import GraphData from './GraphData';

function App() {
  const [formData, setFormData] = useState({
    initial_income: '',
    wage_increase_pct: '',
    years: '',
    initial_credit_pct: '',
    max_credit_utilization: '',
    interest_rate: '',
    max_diff: '0',
    initial_debt: '',
  });
  const [resultData, setResultData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.title = 'Mastering the Art of Living Beyond Your Means';
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/optimal-living/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      setResultData(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1 className="text-xl font-bold text-white text-left">Mastering the Art of Living Beyond Your Means</h1>
        <div className="content flex w-full mt-10">  {/* Add margin-top to control the distance */}
          <FormComponent 
            formData={formData} 
            handleChange={handleChange} 
            handleSubmit={handleSubmit} 
            isLoading={isLoading} 
          />
          <div className="results flex-3 bg-gray-900 text-white p-6 rounded-lg ml-6">
            <Card className="bg-gray-800 shadow-none">
              {resultData ? <GraphData data={resultData} maxCreditUtilization={formData.max_credit_utilization} /> : <p>No data available</p>}
            </Card>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
