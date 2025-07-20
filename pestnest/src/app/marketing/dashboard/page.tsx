"use client";
import React, { useEffect, useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import ChartMarketing from "@/components/ui/ChartMarketing";
import TableMarketing from "@/components/ui/TableMarketing";
import { useRef } from "react";

interface Summary {
  totalBlogs: number;
  totalBanners: number;
  totalReviews: number;
  totalSupportRequests: number;
  positiveReviews: number;
  negativeReviews: number;
  resolvedSupport: number;
  unresolvedSupport: number;
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
}

const DashboardPage = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [exporting, setExporting] = useState(false);
  const exportRef = useRef<HTMLAnchorElement>(null);

  // Danh sách năm cho dropdown (có thể mở rộng)
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
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 24, gap: 16 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, margin: 0 }}>Marketing Dashboard</h1>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
          <label htmlFor="year-select" style={{ marginRight: 8, fontWeight: 500 }}>Year:</label>
          <select
            id="year-select"
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            style={{ padding: 6, borderRadius: 6, border: "1px solid #ccc", fontSize: 16 }}
          >
            {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button
            onClick={handleExportExcel}
            style={{
              marginLeft: 16,
              padding: '8px 18px',
              borderRadius: 6,
              border: 'none',
              background: '#1e88e5',
              color: '#fff',
              fontWeight: 600,
              fontSize: 16,
              cursor: exporting ? 'not-allowed' : 'pointer',
              opacity: exporting ? 0.7 : 1,
              boxShadow: '0 2px 8px rgba(30,136,229,0.08)',
              transition: 'background 0.2s',
              display: 'flex', alignItems: 'center', gap: 8
            }}
            disabled={exporting}
          >
            {exporting ? 'Exporting...' : 'Export Excel'}
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="#fff" d="M16 2v2H8V2H2v20h20V2h-6zm4 18H4V4h4v2h8V4h4v16zm-7-7.59V8h2v4.59l1.3-1.3 1.4 1.42-4 4-4-4 1.4-1.42 1.3 1.3z"/></svg>
          </button>
          <a ref={exportRef} style={{ display: 'none' }}>Download Excel</a>
        </div>
      </div>
      {/* Overview cards */}
      <div style={{ display: "flex", gap: 16, marginBottom: 32 }}>
        <Card style={{ flex: 1 }}><CardContent><b>Blogs</b><div>{summary.totalBlogs}</div></CardContent></Card>
        <Card style={{ flex: 1 }}><CardContent><b>Banners</b><div>{summary.totalBanners}</div></CardContent></Card>
        <Card style={{ flex: 1 }}><CardContent><b>Reviews</b><div>{summary.totalReviews}</div></CardContent></Card>
        <Card style={{ flex: 1 }}><CardContent><b>Support Requests</b><div>{summary.totalSupportRequests}</div></CardContent></Card>
      </div>
      {/* Charts */}
      <div style={{ display: "flex", gap: 24, marginBottom: 32 }}>
        <div style={{ flex: 2, background: "#fff", borderRadius: 8, padding: 16 }}>
          <h3>Monthly Marketing Activities ({year})</h3>
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
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "#fff", borderRadius: 8, padding: 16 }}>
            <h4>Positive/Negative Review Ratio ({year})</h4>
            <ChartMarketing type="pie" data={[
              { label: "Positive", value: summary.positiveReviews },
              { label: "Negative", value: summary.negativeReviews },
            ]} />
          </div>
          <div style={{ background: "#fff", borderRadius: 8, padding: 16 }}>
            <h4>Resolved/Unresolved Support Requests ({year})</h4>
            <ChartMarketing type="pie" data={[
              { label: "Resolved", value: summary.resolvedSupport },
              { label: "Unresolved", value: summary.unresolvedSupport },
            ]} />
          </div>
        </div>
      </div>
      {/* Latest tables */}
      <div style={{ display: "flex", gap: 24 }}>
        <div style={{ flex: 1 }}>
          <h4>Latest Blogs ({year})</h4>
          <TableMarketing data={latest.blogs} columns={["title", "createdAt"]} />
        </div>
        <div style={{ flex: 1 }}>
          <h4>Latest Reviews ({year})</h4>
          <TableMarketing data={latest.reviews} columns={["user", "rating", "comment", "createdAt"]} />
        </div>
        <div style={{ flex: 1 }}>
          <h4>Latest Support Requests ({year})</h4>
          <TableMarketing data={latest.supports} columns={["user", "status", "createdAt"]} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 