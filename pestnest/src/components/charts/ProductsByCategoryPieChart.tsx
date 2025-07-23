'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, TooltipProps } from 'recharts';
import { Button } from '@/components/ui/button';
import React from 'react';

interface CategoryData {
  categoryName: string;
  productCount: number;
  subCategories?: CategoryData[];
}

interface Props {
  data: CategoryData[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943', '#0C19A5'];

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 text-sm bg-background border rounded-md shadow-lg">
        <p className="font-bold">{`${payload[0].name}`}</p>
        <p className="text-muted-foreground">{`Số lượng: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

import { useState } from 'react';

export default function ProductsByCategoryPieChart({ data }: Props) {
  const [history, setHistory] = useState<CategoryData[][]>([]);
  const [currentCategories, setCurrentCategories] = useState<CategoryData[]>(data);

  // Khi data thay đổi từ cha (ví dụ: filter lại), reset drilldown
  React.useEffect(() => {
    setCurrentCategories(data);
    setHistory([]);
  }, [data]);

  const handleDrillDown = (cat: CategoryData) => {
    if (cat.subCategories && cat.subCategories.length > 0) {
      setHistory((prev) => [...prev, currentCategories]);
      setCurrentCategories(cat.subCategories);
    }
  };

  const handleBack = () => {
    if (history.length > 0) {
      setCurrentCategories(history[history.length - 1]);
      setHistory((prev) => prev.slice(0, -1));
    }
  };

  return (
    <div>
      {history.length > 0 && (
        <Button size="sm" variant="outline" className="mb-2" onClick={handleBack}>
          Quay lại
        </Button>
      )}
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={currentCategories}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={120}
            innerRadius={60}
            fill="#8884d8"
            dataKey="productCount"
            nameKey="categoryName"
          >
            {currentCategories.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                style={{ cursor: entry.subCategories && entry.subCategories.length > 0 ? 'pointer' : 'default' }}
                // Đã bỏ onClick ở đây
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend iconSize={10} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-2 mt-2">
        {currentCategories.map((cat) =>
          cat.subCategories && cat.subCategories.length > 0 ? (
            <Button key={cat.categoryName} size="sm" variant="secondary" onClick={() => handleDrillDown(cat)}>
              {cat.categoryName}
            </Button>
          ) : null
        )}
      </div>
    </div>
  );
} 