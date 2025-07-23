"use client";
import React, { useEffect, useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import ChartMarketing from "@/components/ui/ChartMarketing";
import TableMarketing from "@/components/ui/TableMarketing";
import { useRef } from "react";
import { FaBlog, FaFlag, FaStar, FaHeadset, FaGift } from "react-icons/fa";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Summary {
  totalBlogs: number;
  totalBanners: number;
  totalReviews: number;
  totalSupportRequests: number;
  positiveReviews: number;
  negativeReviews: number;
  resolvedSupport: number;
  unresolvedSupport: number;
  // Voucher
  totalVouchers: number;
  usedVouchers: number;
  unusedVouchers: number;
  expiringVouchers: number;
}

interface MonthlyStat {
  month: string;
  blogs: number;
  banners: number;
  reviews: number;
  supports: number;
}

interface DashboardData {
  summary: Summary;
  monthlyStats: MonthlyStat[];
  latest: {
    blogs: any[];
    reviews: any[];
    supports: any[];
  };
  topBlogs: {
    title: string;
    views: number;
  }[];
  voucherStats: VoucherStat[];
}

interface VoucherStat {
  _id: string;
  code: string;
  received: number;
  used: number;
}

const cardStyles = [
  { bg: "#e3f2fd", color: "#1976d2", icon: <FaBlog size={32} /> },
  { bg: "#fff3e0", color: "#f57c00", icon: <FaFlag size={32} /> },
  { bg: "#f3e5f5", color: "#8e24aa", icon: <FaStar size={32} /> },
  { bg: "#e8f5e9", color: "#388e3c", icon: <FaHeadset size={32} /> },
  { bg: "#fce4ec", color: "#d81b60", icon: <FaGift size={32} /> },
];
const DashboardPage = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [exporting, setExporting] = useState(false);
  const exportRef = useRef<HTMLAnchorElement>(null);
  const [voucherStats, setVoucherStats] = useState<VoucherStat[]>([]);

  const yearOptions = useMemo(() => {
    const now = new Date().getFullYear();
    return [now, now - 1, now - 2];
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:5000/api/marketing/dashboard?year=${year}`)
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setVoucherStats(d.voucherStats || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [year]);

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/marketing/dashboard/excel?year=${year}`);
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = exportRef.current;
      if (a) {
        a.href = url;
        a.download = `marketing_dashboard_${year}.xlsx`;
        a.click();
        setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      }
    } catch (e) {
      alert('Export failed!');
    }
    setExporting(false);
  };

  if (loading) return <div>Loading dashboard...</div>;
  if (!data) return <div>Failed to load dashboard data.</div>;

  const { summary, monthlyStats, latest, topBlogs } = data;

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto', fontFamily: 'Inter, Arial, sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      {/* Header + Year select + Export */}
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', marginBottom: 32 }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, margin: 0, color: '#1976d2', letterSpacing: -1 }}>Marketing Dashboard</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <label htmlFor="year-select" style={{ marginRight: 8, fontWeight: 500, fontSize: 16 }}>Year:</label>
          <select
            id="year-select"
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            style={{ padding: 8, borderRadius: 8, border: "1px solid #bdbdbd", fontSize: 16, background: '#fff', minWidth: 90 }}
          >
            {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button
            onClick={handleExportExcel}
            style={{
              padding: '10px 22px',
              borderRadius: 8,
              border: 'none',
              background: '#1976d2',
              color: '#fff',
              fontWeight: 700,
              fontSize: 16,
              cursor: exporting ? 'not-allowed' : 'pointer',
              opacity: exporting ? 0.7 : 1,
              boxShadow: '0 2px 12px rgba(25,118,210,0.10)',
              transition: 'background 0.2s',
              display: 'flex', alignItems: 'center', gap: 10
            }}
            disabled={exporting}
          >
            {exporting ? 'Exporting...' : 'Export Excel'}
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path fill="#fff" d="M16 2v2H8V2H2v20h20V2h-6zm4 18H4V4h4v2h8V4h4v16zm-7-7.59V8h2v4.59l1.3-1.3 1.4 1.42-4 4-4-4 1.4-1.42 1.3 1.3z"/></svg>
          </button>
          <a ref={exportRef} style={{ display: 'none' }}>Download Excel</a>
        </div>
      </div>

      {/* Stats + Voucher Pie */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'space-between', alignItems: 'stretch', marginBottom: 32 }}>
        <div style={{ display: 'flex', flex: 1, gap: 24, minWidth: 320, flexWrap: 'wrap' }}>
          {[
            { label: 'Blogs', value: summary.totalBlogs },
            { label: 'Banners', value: summary.totalBanners },
            { label: 'Reviews', value: summary.totalReviews },
            { label: 'Support Requests', value: summary.totalSupportRequests },
            { label: 'Vouchers', value: summary.totalVouchers },
          ].map((item, idx) => (
            <div key={item.label} style={{
              flex: '1 1 180px',
              minWidth: 180,
              background: cardStyles[idx].bg,
              color: cardStyles[idx].color,
              borderRadius: 16,
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              padding: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              fontWeight: 700,
              fontSize: 18,
              letterSpacing: -0.5,
              marginBottom: 8
            }}>
              <div>{cardStyles[idx].icon}</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#555', marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: cardStyles[idx].color }}>{item.value}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ minWidth: 320, maxWidth: 400, flex: '0 1 350px', alignSelf: 'center', background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h4 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#d81b60', textAlign: 'center' }}>Voucher Distribution</h4>
          <div style={{ color: '#888', fontSize: 14, marginBottom: 10, textAlign: 'center' }}>Number of users received and used each voucher</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={voucherStats} margin={{ top: 10, right: 20, left: 0, bottom: 30 }}>
              <XAxis dataKey="code" angle={-20} textAnchor="end" interval={0} height={60} style={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="received" fill="#1976d2" name="Distributed" />
              <Bar dataKey="used" fill="#d81b60" name="Used" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts */}
      <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 32 }}>
        <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: '#1976d2' }}>Monthly Marketing Activities ({year})</h3>
        <div style={{ color: '#888', fontSize: 15, marginBottom: 12 }}>Bar chart: So sánh số lượng blogs, banners, reviews, support requests theo tháng.</div>
        <ChartMarketing type="bar" data={monthlyStats} />
        <div style={{ marginTop: 32 }}>
          <h3>Marketing Activity Trends by Month ({year})</h3>
          <ChartMarketing type="line" data={monthlyStats} />
        </div>
        <div style={{ marginTop: 32 }}>
          <h3>Top 5 Most Viewed Blogs ({year})</h3>
          <ChartMarketing type="bar" data={topBlogs.map(b => ({ ...b, month: b.title, blogs: b.views }))} />
        </div>
      </div>

      {/* Pie charts */}
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 40, justifyContent: 'space-between' }}>
        <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', flex: 1, minWidth: 280 }}>
          <h4 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#8e24aa' }}>Positive/Negative Review Ratio ({year})</h4>
          <div style={{ color: '#888', fontSize: 14, marginBottom: 10 }}>Pie chart: Đánh giá chất lượng sản phẩm/dịch vụ.</div>
          <ChartMarketing type="pie" data={[
            { label: "Positive", value: summary.positiveReviews },
            { label: "Negative", value: summary.negativeReviews },
          ]} />
        </div>
        <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', flex: 1, minWidth: 280 }}>
          <h4 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#388e3c' }}>Resolved/Unresolved Support Requests ({year})</h4>
          <div style={{ color: '#888', fontSize: 14, marginBottom: 10 }}>Pie chart: Hiệu quả chăm sóc khách hàng.</div>
          <ChartMarketing type="pie" data={[
            { label: "Resolved", value: summary.resolvedSupport },
            { label: "Unresolved", value: summary.unresolvedSupport },
          ]} />
        </div>
      </div>

      {/* Latest tables */}
      <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', marginBottom: 32 }}>
        <div style={{ flex: 1, minWidth: 320 }}>
          <h4 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: '#1976d2' }}>Latest Blogs ({year})</h4>
          <TableMarketing data={latest.blogs} columns={["title", "createdAt"]} />
        </div>
        <div style={{ flex: 1, minWidth: 320 }}>
          <h4 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: '#8e24aa' }}>Latest Reviews ({year})</h4>
          <TableMarketing data={latest.reviews} columns={["rating", "comment", "createdAt"]} />
        </div>
        <div style={{ flex: 1, minWidth: 320 }}>
          <h4 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: '#388e3c' }}>Latest Support Requests ({year})</h4>
          <TableMarketing data={latest.supports} columns={["user", "status", "createdAt"]} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 