// components/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { role, logout, user, loading } = useAuth();

  // 1. Evitamos el flash de contenido durante la hidratación o carga
  if (loading || !user) return null;

  // 2. Función de clases optimizada para scannability
  const itemClass = (path: string) => {
    const isActive = pathname === path;
    return `group flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
      isActive
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
        : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'
    }`;
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 p-5 flex flex-col h-screen sticky top-0 z-40">
      {/* BRAND / LOGO */}
      <div className="mb-8 px-2">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <span className="text-white text-xl">🎫</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            TicketApp
          </h2>
        </div>
        <div className="mt-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 uppercase tracking-wider">
          {role}
        </div>
      </div>

      {/* NAVEGACIÓN PRINCIPAL */}
      <nav className="space-y-1.5 flex-grow">
        <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
          Menú Principal
        </p>
        
        <Link href="/" className={itemClass('/')}>
          <span className="text-lg">🏠</span>
          <span>Inicio</span>
        </Link>

        <Link href="/tickets" className={itemClass('/tickets')}>
          <span className="text-lg">🎟️</span>
          <span>Mis Tickets</span>
        </Link>

        {/* VISTAS EXCLUSIVAS PARA OPERADOR */}
        {role === 'operador' && (
          <div className="pt-4 space-y-1.5">
            <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              Administración
            </p>
            <Link href="/reportes" className={itemClass('/reportes')}>
              <span className="text-lg">📊</span>
              <span>Reportes</span>
            </Link>
            <Link href="/usuarios" className={itemClass('/usuarios')}>
              <span className="text-lg">👥</span>
              <span>Usuarios</span>
            </Link>
          </div>
        )}
      </nav>

      {/* PERFIL Y LOGOUT */}
     <div className="pt-5 border-t border-slate-100 mt-auto">
  <div className="group relative flex items-center">
    {/* Contenedor Principal del Botón */}
    <button
      onClick={logout}
      className="flex items-center gap-0 group-hover:gap-3 p-2 rounded-2xl transition-all duration-500 ease-in-out hover:bg-slate-50"
    >
      {/* Icono de la Puerta Rojo */}
      <div className="h-12 w-12 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-200 transition-transform duration-300 group-hover:scale-105 active:scale-95">
        <span className="text-2xl">🚪</span>
      </div>

      {/* Flecha y Texto que aparecen en Hover */}
      <div className="flex items-center opacity-0 -translate-x-4 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 group-hover:pointer-events-auto transition-all duration-500 ease-out">
        {/* Flechita Roja */}
        <span className="text-red-500 font-bold text-xl mr-2">→</span>
        
        {/* Etiqueta Cerrar Sesión */}
        <div className="px-4 py-2 bg-white border border-slate-200 rounded-full shadow-sm">
          <span className="text-red-600 font-bold whitespace-nowrap text-sm">
            Cerrar sesión
          </span>
        </div>
      </div>
    </button>
  </div>
</div>
    </aside>
  );
}