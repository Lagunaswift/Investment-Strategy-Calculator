import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler // Import Filler for filled areas
} from 'chart.js';

// Register components when ready
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler // Register Filler
);

const ProjectionChart = ({ projections, currency }) => {

  // Check if the necessary time series data exists
  if (!projections?.timeSeriesData?.years || !projections.timeSeriesData.p50) {
    return (
      <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200 text-center h-64 md:h-80 flex items-center justify-center">
        <p className="text-gray-500 italic">Projection chart data not yet available from API.</p>
      </div>
    );
  }

  // --- Actual Chart Logic --- 

  const timeData = projections.timeSeriesData;
  const currencySymbols = { USD: '$', GBP: '£', EUR: '€', AUD: 'A$' }; // Consider moving to a shared util
  const symbol = currencySymbols[currency] || '$';

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
      title: { display: true, text: 'Projected Portfolio Growth' },
      tooltip: { 
        mode: 'index', 
        intersect: false,
        callbacks: { // Format tooltip values as currency
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) label += ': ';
            if (context.parsed.y !== null) {
              label += `${symbol}${Math.round(context.parsed.y).toLocaleString()}`;
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Years'
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: `Projected Value (${currency})`
        },
        ticks: { // Format Y-axis as currency
          callback: function(value, index, values) {
            if (value >= 1000000) return `${symbol}${(value / 1000000).toFixed(1)}M`;
            if (value >= 1000) return `${symbol}${(value / 1000).toFixed(0)}k`;
            return `${symbol}${value}`;
          }
        }
      }
    }
  };

  const chartData = {
    labels: timeData.years.map(year => `Year ${year}`),
    datasets: [
      {
        label: 'Worst 10% (P10)',
        data: timeData.p10,
        borderColor: 'rgba(255, 99, 132, 0.5)', // Light Red
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        tension: 0.1,
        pointRadius: 0, // Hide points
        fill: '+1' // Fill to next dataset (P50)
      },
      {
        label: 'Median (P50)',
        data: timeData.p50,
        borderColor: 'rgb(54, 162, 235)', // Blue
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        tension: 0.1,
        pointRadius: 0, // Hide points
        fill: '+1' // Fill to next dataset (P90)
      },
      {
        label: 'Best 10% (P90)',
        data: timeData.p90,
        borderColor: 'rgba(75, 192, 192, 0.5)', // Light Green
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        tension: 0.1,
        pointRadius: 0, // Hide points
        fill: false // Don't fill this line itself
      },
    ]
  };

  return (
    <div className="relative h-64 md:h-80 mt-8"> 
      <Line options={options} data={chartData} />
    </div>
  );
};

export default ProjectionChart;
