// app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Ticket } from '@/types/ticket';
import { getTickets } from '@/lib/api';
import TicketCard from '@/components/TicketCard';
import DashboardStats from '@/components/DashboardStats';
import NewTicketModal from '@/components/NewTicketModal';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Page() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const { user, role, loading, logout } = useAuth(); 
  const router = useRouter(); 

  /* =========================
      PROTECCIÓN DE RUTA
  ========================== */
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login'); 
    }
  }, [loading, user, router]);

  const refrescarTickets = async () => {
    // Verificamos el ID dinámicamente (puede ser .id o .id_usuario según tu tipo)
    const userId = user?.id || (user as any)?.id_usuario;

    if (userId && role) {
      try {
        const data = await getTickets(userId, role); 
        setTickets(data);
      } catch (error) {
        console.error("Fallo al cargar tickets:", error);
      }
    }
  };

  useEffect(() => {
    if (user) {
      refrescarTickets();
    }
  }, [user]); 

  const actualizarTicket = async (updatedTicket: Ticket) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === updatedTicket.id ? updatedTicket : t))
    );
  };

  // 🛑 Bloqueo visual: Si está cargando o no hay usuario, mostramos un spinner
  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="text-slate-600 font-medium">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="p-8 max-w-7xl mx-auto">
      {/* HEADER Y CERRAR SESIÓN */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            🎫 Gestión de Tickets
          </h1>
          <p className="text-slate-500">Bienvenido, {user.nombre} ({role})</p>
        </div>
      </div>

      {/* ACCIONES PRINCIPALES */}
      <div className="mb-8 flex justify-end">
        {role === 'operador' && (
          <button
            onClick={() => setMostrarModal(true)}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 transition-all"
          >
            ➕ Crear Nuevo Ticket
          </button>
        )}
      </div>
      
      {/* ESTADÍSTICAS */}
      <DashboardStats tickets={tickets} />

      {/* LISTADO DE TICKETS */}
      <section className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tickets.length > 0 ? (
          tickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onUpdate={actualizarTicket}
            />
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <p className="text-slate-400">No se encontraron tickets en tu cuenta.</p>
          </div>
        )}
      </section>

      {/* MODAL */}
      {mostrarModal && (
        <NewTicketModal
          onClose={() => setMostrarModal(false)}
          onCreated={refrescarTickets} 
        />
      )}
    </main>
  );
}