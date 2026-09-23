"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Users,
  BookOpen,
  Building2,
  Activity,
  Newspaper,
  Eye,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { API_ENDPOINTS } from "@/app/api/losbackend/api";

const DashboardAdmin = () => {
  const [data, setData] = useState({
    guru: 0,
    siswa: 0,
    fasilitas: 0,
    ekstrakurikuler: 0,
    berita: 0,
    visitor: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          guruRes,
          siswaRes,
          fasilitasRes,
          ekskulRes,
          beritaRes,
          visitorRes,
        ] = await Promise.all([
          axios.get(API_ENDPOINTS.GETGuru),
          axios.get(API_ENDPOINTS.GETSECTIONLanding),
          axios.get(API_ENDPOINTS.GETFasilitas),
          axios.get(API_ENDPOINTS.GETEkskul),
          axios.get(API_ENDPOINTS.GETBerita),
          axios.get(API_ENDPOINTS.GETVisitor),
        ]);

        const siswaSection = siswaRes.data.find(
          (item: any) => item.section === "3" && item.total_siswa !== null
        );
        const totalSiswa = siswaSection ? siswaSection.total_siswa : 0;

        setData({
          guru: guruRes.data.length || 0,
          siswa: totalSiswa,
          fasilitas: fasilitasRes.data.length || 0,
          ekstrakurikuler: ekskulRes.data.length || 0,
          berita: beritaRes.data.length || 0,
          visitor: visitorRes.data.length || 0,
        });
      } catch (err) {
        console.error("❌ Gagal mengambil data dashboard:", err);
      }
    };

    fetchData();
  }, []);

  const chartData = [
    { name: "Guru", value: data.guru },
    { name: "Siswa", value: data.siswa },
    { name: "Fasilitas", value: data.fasilitas },
    { name: "Ekskul", value: data.ekstrakurikuler },
    { name: "Berita", value: data.berita },
    { name: "Visitor", value: data.visitor },
  ];

  const COLORS = [
    "#3b82f6", // Biru
    "#10b981", // Hijau
    "#ef4444", // Merah
    "#8b5cf6", // Ungu
    "#f472b6", // Pink
    "#6366f1", // Indigo
  ];

  return (
    <div className="p-6">
      <h1 className="text-[24px] font-semibold mb-6">Dashboard Admin Sekolah</h1>

      {/* CARD DATA */}
      <div className="bg-white shadow-md rounded-xl p-6 mb-8 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Data Guru" icon={<Users size={36} />} color="#3b82f6" value={data.guru} />
          <Card title="Total Siswa" icon={<BookOpen size={36} />} color="#10b981" value={data.siswa} />
          <Card title="Fasilitas" icon={<Building2 size={36} />} color="#ef4444" value={data.fasilitas} />
          <Card title="Ekstrakurikuler" icon={<Activity size={36} />} color="#8b5cf6" value={data.ekstrakurikuler} />
          <Card title="Berita" icon={<Newspaper size={36} />} color="#f472b6" value={data.berita} />
          <Card title="Visitor" icon={<Eye size={36} />} color="#6366f1" value={data.visitor} />
        </div>
      </div>

      {/* VISUALISASI DATA */}
      <div className="bg-white/80 backdrop-blur-sm border border-gray-200 p-6 rounded-xl shadow-sm">
        <h2 className="text-[24px] font-semibold mb-4">Visualisasi Data</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* KOTAK CHART BAR */}
          <div className="bg-white border-2 border-gray-300 rounded-xl shadow-lg p-5 hover:shadow-xl transition-all">
            <h3 className="font-semibold mb-3 text-gray-700">Statistik Konten</h3>
            <div className="bg-gradient-to-b from-blue-50/60 to-white p-3 rounded-lg">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {chartData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* KOTAK CHART PIE */}
          <div className="bg-white border-2 border-gray-300 rounded-xl shadow-lg p-5 hover:shadow-xl transition-all">
            <h3 className="font-semibold mb-3 text-gray-700">Persentase Konten</h3>
            <div className="bg-gradient-to-b from-pink-50/60 to-white p-3 rounded-lg">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {chartData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 🧩 Komponen Kartu Mini (Persegi Panjang)
const Card = ({ title, icon, color, value }: any) => {
  return (
    <div
      className="flex items-center justify-between p-6 rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition-all h-32"
      style={{
        background: `linear-gradient(to right, ${color}25, white)`,
      }}
    >
      <div className="flex items-center gap-5">
        <div
          className="p-4 rounded-full"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {icon}
        </div>
        <div>
          <h4 className="text-lg font-medium text-gray-700">{title}</h4>
          <p className="text-3xl font-bold" style={{ color }}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;
