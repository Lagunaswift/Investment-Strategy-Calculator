import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS, // Ensure ChartJS is imported
    ArcElement,
    Tooltip,
    Legend
} from 'chart.js';

// Register Chart.js components (important!)
ChartJS.register(ArcElement, Tooltip, Legend);

const AllocationChart = ({ allocations, includeCrypto, includeGold }) => {
    // Ensure allocations exist and are numbers, default to 0
    const stock = typeof allocations?.stock === 'number' ? allocations.stock : 0;
    const bond = typeof allocations?.bond === 'number' ? allocations.bond : 0;
    const crypto = includeCrypto && typeof allocations?.crypto === 'number' ? allocations.crypto : 0;
    const gold = includeGold && typeof allocations?.gold === 'number' ? allocations.gold : 0;

    // Filter out zero allocations for a cleaner chart
    const labels = [];
    const dataValues = [];
    const backgroundColors = [];
    const borderColors = [];

    if (stock > 0) {
        labels.push('Stocks');
        dataValues.push(stock);
        backgroundColors.push('rgba(54, 162, 235, 0.6)'); // Blue
        borderColors.push('rgba(54, 162, 235, 1)');
    }
    if (bond > 0) {
        labels.push('Bonds');
        dataValues.push(bond);
        backgroundColors.push('rgba(75, 192, 192, 0.6)'); // Green
        borderColors.push('rgba(75, 192, 192, 1)');
    }
    if (crypto > 0) {
        labels.push('Crypto');
        dataValues.push(crypto);
        backgroundColors.push('rgba(255, 159, 64, 0.6)'); // Orange
        borderColors.push('rgba(255, 159, 64, 1)');
    }
    if (gold > 0) {
        labels.push('Gold');
        dataValues.push(gold);
        backgroundColors.push('rgba(255, 206, 86, 0.6)'); // Yellow
        borderColors.push('rgba(255, 206, 86, 1)');
    }

    const data = {
        labels: labels,
        datasets: [
            {
                label: 'Allocation %',
                data: dataValues,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false, // Adjust aspect ratio as needed
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        let label = context.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed !== null) {
                            label += context.parsed.toFixed(1) + '%'; // Format tooltip value
                        }
                        return label;
                    }
                }
            }
        },
        cutout: '60%', // Makes it a doughnut chart
    };

    // Check if there's any data to display
    if (dataValues.reduce((sum, val) => sum + val, 0) <= 0) {
        return <p className="text-center text-gray-500 italic">No allocation data to display.</p>;
    }

    return (
        <div className="relative h-64 md:h-80"> {/* Adjust height as needed */}
            <Doughnut data={data} options={options} />
        </div>
    );
};

export default AllocationChart;
