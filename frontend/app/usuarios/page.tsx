// app/usuarios/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getUsuarios } from '@/lib/api';
import { User } from '@/types/users';

export default function UsuariosPage() {
  const { role, loading: authLoading } = useAuth();
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      if (role === 'operador') {
        const data = await getUsuarios();
        setUsuarios(data);
      }
      setCargando(false);
    };
    if (!authLoading) cargar();
  }, [role, authLoading]);

  // Contadores basados en tu CHECK (rol IN ('cliente', 'operador'))
  const totalOperadores = usuarios.filter(u => u.rol === 'operador').length;
  const totalClientes = usuarios.filter(u => u.rol === 'cliente').length;

  if (authLoading || cargando) return <div className="p-10 text-center font-bold">Cargando base de datos SQL...</div>;

  return (
    <main className="p-8 bg-slate-50 min-h-screen max-w-5xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-black text-slate-800">Directorio de Usuarios</h1>
        <p className="text-slate-500">Datos extraídos de la tabla `usuarios`</p>
      </header>

      {/* KPIs Superiores */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <StatCard label="Total en DB" value={usuarios.length} color="text-slate-800" />
        <StatCard label="Operadores" value={totalOperadores} color="text-indigo-600" />
        <StatCard label="Clientes" value={totalClientes} color="text-emerald-600" />
      </div>

      {/* Lista de Usuarios */}
      <div className="space-y-4">
        {usuarios.length > 0 ? (
          usuarios.map((u) => (
            <div key={u.id} className="bg-white p-5 rounded-[2rem] border border-slate-200 flex items-center justify-between px-8 shadow-sm">
              <div className="flex items-center gap-5">
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-md ${u.rol === 'operador' ? 'bg-indigo-600' : 'bg-slate-500'}`}>
                  {u.nombre.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 leading-none mb-1">{u.nombre}</h3>
                  <p className="text-sm text-slate-400">{u.email}</p>
                </div>
              </div>

              {/* Badge de Rol */}
              <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                u.rol === 'operador' 
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-600' 
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}>
                {u.rol}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-20 rounded-[3rem] border-2 border-dashed border-slate-200 text-center">
            <p className="text-slate-400 font-bold">No se encontraron registros en la tabla `usuarios`.</p>
          </div>
        )}
      </div>
    </main>
  );
}

function StatCard({ label, value, color }: any) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-4xl font-black ${color}`}>{value}</p>
    </div>
  );
}