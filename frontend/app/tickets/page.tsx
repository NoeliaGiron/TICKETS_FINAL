// app/tickets/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Ticket } from '@/types/ticket';
import { getTickets } from '@/lib/api';
import TicketCard from '@/components/TicketCard';
import NewTicketModal from '@/components/NewTicketModal';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const { user, role, loading } = useAuth(); 
  const router = useRouter(); 

  // Protección de ruta
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login'); 
    }
  }, [loading, user, router]);

  const cargarTickets = async () => {
    const userId = user?.id || (user as any)?.id_usuario;
    if (userId && role) {
      try {
        const data = await getTickets(userId, role); 
        setTickets(data);
      } catch (error) {
        console.error("Error al cargar tickets:", error);
      }
    }
  };

  useEffect(() => {
    if (user) cargarTickets();
  }, [user, role]);

  const actualizarTicketEnLista = (updatedTicket: Ticket) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === updatedTicket.id ? updatedTicket : t))
    );
  };

  if (loading || !user) return null;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">🎟️ Mis Tickets</h1>
          <p className="text-slate-500 text-sm">
            {role === 'operador' 
              ? 'Gestiona todos los tickets del sistema' 
              : 'Consulta el estado de tus solicitudes'}
          </p>
        </div>

        {role === 'operador' && (
          <button
            onClick={() => setMostrarModal(true)}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold shadow-md hover:bg-indigo-700 transition-all"
          >
            ➕ Nuevo Ticket
          </button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tickets.length > 0 ? (
          tickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onUpdate={actualizarTicketEnLista}
            />
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-slate-200">
            <p className="text-slate-400">No hay tickets disponibles.</p>
          </div>
        )}
      </div>

      {mostrarModal && (
        <NewTicketModal
          onClose={() => setMostrarModal(false)}
          onCreated={cargarTickets} 
        />
      )}
    </div>
  );
}