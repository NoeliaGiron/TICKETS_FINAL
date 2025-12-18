// app/reportes/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getTickets } from '@/lib/api';
import { Ticket } from '@/types/ticket';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend 
} from 'recharts';

export default function ReportesPage() {
  const { user, role, loading } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      const userId = user?.id || (user as any)?.id_usuario;
      if (userId && role === 'operador') {
        try {
          const data = await getTickets(userId, role);
          setTickets(data || []);
        } catch (error) {
          console.error("Error en reportes:", error);
        } finally {
          setCargando(false);
        }
      }
    };
    if (user) cargarDatos();
  }, [user, role]);

  // Lógica de estadísticas con protecciones para evitar errores de undefined
  const stats = {
    total: tickets?.length || 0,
    abiertos: tickets?.filter(t => t.estado === 'Abierto').length || 0,
    proceso: tickets?.filter(t => t.estado === 'En Progreso').length || 0,
    cerrados: tickets?.filter(t =>  t.estado === 'Cerrado').length || 0,
  };

  // Datos formateados para Recharts
  const dataGraficas = [
    { name: 'Abiertos', value: stats.abiertos, color: '#F59E0B' }, // Naranja
    { name: 'En Proceso', value: stats.proceso, color: '#3B82F6' }, // Azul
    { name: 'Cerrados', value: stats.cerrados, color: '#10B981' },  // Verde
  ];

  if (loading || cargando) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <main className="p-8 bg-slate-50 min-h-screen max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800">📊 Panel de Reportes</h1>
        <p className="text-slate-500">Visualización de métricas y rendimiento de tickets.</p>
      </div>

      {/* 1. TARJETAS DE INDICADORES (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <KPICard label="Total" value={stats.total} color="text-indigo-600" border="border-indigo-100" />
        <KPICard label="Abiertos" value={stats.abiertos} color="text-amber-500" border="border-amber-100" />
        <KPICard label="En Proceso" value={stats.proceso} color="text-blue-500" border="border-blue-100" />
        <KPICard label="Cerrados" value={stats.cerrados} color="text-emerald-500" border="border-emerald-100" />
      </div>

      {/* 2. CONTENEDOR DE GRÁFICAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Gráfica de Distribución (Pie Chart) */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Distribución de Tickets</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataGraficas}
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {dataGraficas.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                />
                <Legend iconType="circle" verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfica de Barras por Estado */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Tickets por Estado</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataGraficas} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="value" radius={[12, 12, 12, 12]} barSize={50}>
                  {dataGraficas.map((entry, index) => (
                    <Cell key={`cell-bar-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </main>
  );
}

// Componente de Tarjeta KPI
function KPICard({ label, value, color, border }: any) {
  return (
    <div className={`bg-white p-7 rounded-[2rem] border-2 ${border} shadow-sm transition-all hover:scale-[1.02] hover:shadow-md`}>
      <p className="text-xs font-black text-slate-400 uppercase tracking-[0.15em] mb-2">{label}</p>
      <p className={`text-4xl font-black ${color}`}>{value}</p>
    </div>
  );
}