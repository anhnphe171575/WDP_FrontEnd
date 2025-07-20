import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface Props {
  data: { time: string; revenue: number }[];
}

export default function RevenueLineChart({ data }: Props) {
  const chartData = {
    labels: data.map(item => item.time),
    datasets: [
      {
        label: 'Doanh thu',
        data: data.map(item => item.revenue),
        borderColor: 'rgb(34,197,94)',
        backgroundColor: 'rgba(34,197,94,0.2)',
        tension: 0.4,
      },
    ],
  };

  return <Line data={chartData} />;
} 