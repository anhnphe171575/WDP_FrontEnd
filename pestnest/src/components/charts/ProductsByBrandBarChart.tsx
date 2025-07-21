'use client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, TooltipProps } from 'recharts';

interface BrandData {
  brandName: string;
  count: number;
}

interface Props {
  data: BrandData[];
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 text-sm bg-background border rounded-md shadow-lg">
          <p className="font-bold">{label}</p>
          <p className="text-muted-foreground">{`Số lượng: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
};

export default function ProductsByBrandBarChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis dataKey="brandName" type="category" width={80} tick={{ fontSize: 12 }} />
        <Tooltip cursor={{ fill: 'transparent' }} content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="count" fill="#82ca9d" name="Số sản phẩm" barSize={20} />
      </BarChart>
    </ResponsiveContainer>
  );
} 