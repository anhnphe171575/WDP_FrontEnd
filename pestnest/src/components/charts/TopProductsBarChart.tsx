import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Props {
  data: { productName: string; totalRevenue: number }[];
}

export default function TopProductsBarChart({ data }: Props) {
  const chartData = {
    labels: data.map(item => item.productName),
    datasets: [
      {
        label: 'Doanh thu',
        data: data.map(item => item.totalRevenue),
        backgroundColor: 'rgba(59,130,246,0.7)',
      },
    ],
  };

  return <Bar data={chartData} />;
} 