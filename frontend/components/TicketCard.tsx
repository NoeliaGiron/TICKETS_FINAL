// components/TicketCard.tsx
'use client';

import { Ticket } from '@/types/ticket'; // Asumo que Ticket ya tiene la descripción
import { useAuth } from '@/context/AuthContext';
import { cambiarEstadoTicket, cambiarPrioridadTicket } from '@/lib/api'; 
import { useState } from 'react';

// Define el tipo de prioridad esperado por el frontend
type FEPriority = 'Baja' | 'Media' | 'Alta';

interface Props {
  ticket: Ticket;
  // onUpdate es CRUCIAL: permite al componente padre (la lista de tickets)
  // actualizar el estado de un ticket específico sin recargar toda la lista.
  onUpdate: (updatedTicket: Ticket) => void;
}

// Mapeo de estilos para la prioridad
const priorityStyles: Record<FEPriority, string> = {
  Baja: 'bg-green-100 text-green-700',
  Media: 'bg-yellow-100 text-yellow-700',
  Alta: 'bg-red-100 text-red-700',
};

// Mapeo de estilos para el estado
const statusStyles: Record<Ticket['estado'], string> = {
  Abierto: 'bg-blue-100 text-blue-700',
  'En Progreso': 'bg-orange-100 text-orange-700',
  Cerrado: 'bg-slate-100 text-slate-700',
};

export default function TicketCard({ ticket, onUpdate }: Props) {
  const { role } = useAuth();
  const [loading, setLoading] = useState(false);
  const isOperator = role === 'operador';

  // Convierte el estado de FE a BE para la API
  const mapFEStateToBE = (feState: Ticket['estado']): 'abierto' | 'en_proceso' | 'cerrado' => {
    if (feState === 'En Progreso') return 'en_proceso';
    if (feState === 'Abierto') return 'abierto';
    return 'cerrado';
  };
  
  // Convierte el estado de BE a FE para la UI
  const mapBEStateToFE = (beState: 'abierto' | 'en_proceso' | 'cerrado'): Ticket['estado'] => {
    if (beState === 'en_proceso') return 'En Progreso';
    if (beState === 'abierto') return 'Abierto';
    return 'Cerrado';
  };
  
  // Convierte la prioridad de FE a BE para la API
  const mapFEPriorityToBE = (fePriority: FEPriority): 'baja' | 'media' | 'alta' => {
      return fePriority.toLowerCase() as 'baja' | 'media' | 'alta';
  };


  const handleStatusChange = async (newStateBE: 'abierto' | 'en_proceso' | 'cerrado') => {
    if (!isOperator || loading) return;
    setLoading(true);
    try {
      await cambiarEstadoTicket(ticket.id, newStateBE);
      
      // Actualizamos el ticket en el frontend con el nuevo estado mapeado
      onUpdate({ 
          ...ticket, 
          estado: mapBEStateToFE(newStateBE) 
      });
    } catch (error) {
      alert('Error al cambiar el estado.');
    } finally {
      setLoading(false);
    }
  };
  
  // 🟢 FUNCIÓN PARA CAMBIAR PRIORIDAD
  const handlePriorityChange = async (newPriorityFE: FEPriority) => {
    if (!isOperator || loading) return;
    setLoading(true);
    
    // Convertir a formato de Backend
    const newPriorityBE = mapFEPriorityToBE(newPriorityFE);

    try {
      // 1. Llama a la API (el backend devuelve el objeto ticket actualizado)
      const updatedBackendTicket = await cambiarPrioridadTicket(ticket.id, newPriorityBE);
      
      // 2. Usar onUpdate para sincronizar el cambio en el componente padre
      onUpdate({
          ...ticket,
          // Reemplazamos la prioridad con la versión de FE
          prioridad: newPriorityFE,
          // Opcionalmente, puedes mapear todos los campos si el backend los devuelve
      });
      
    } catch (error: any) {
      alert(`Error al cambiar la prioridad: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const currentPriorityStyle = priorityStyles[ticket.prioridad];
  const currentStatusStyle = statusStyles[ticket.estado];

  return (
    <div className={`bg-white p-6 rounded-xl shadow-lg border-l-4 ${currentPriorityStyle.includes('red') ? 'border-red-500' : currentPriorityStyle.includes('yellow') ? 'border-yellow-500' : 'border-green-500'} transition duration-150`}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-semibold text-slate-800 line-clamp-2">{ticket.asunto}</h3>
        <span className={`text-xs font-medium px-3 py-1 rounded-full ${currentPriorityStyle}`}>
          {ticket.prioridad}
        </span>
      </div>

      {/* 🟢 MOSTRAR DESCRIPCIÓN */}
      <p className="text-sm text-slate-600 mb-4 line-clamp-3">
          {ticket.descripcion || 'Sin descripción detallada.'} 
      </p>

      <div className="flex justify-between items-center text-sm text-slate-500 mb-4">
        <span>ID: {ticket.id}</span>
        <span>{ticket.fechaCreacion.toLocaleDateString()}</span>
      </div>

      {/* 🟢 CONTROL DE PRIORIDAD (SOLO OPERADOR) */}
      {isOperator && (
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Cambiar Prioridad
          </label>
          <select
            value={ticket.prioridad}
            // Mapeamos el valor seleccionado a FEPriority para handlePriorityChange
            onChange={(e) => handlePriorityChange(e.target.value as FEPriority)}
            className="w-full border rounded-lg px-3 py-1 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            disabled={loading}
          >
            <option value="Baja">Baja</option>
            <option value="Media">Media</option>
            <option value="Alta">Alta</option>
          </select>
        </div>
      )}

      {/* CONTROL DE ESTADO (SOLO OPERADOR) */}
      <div className="flex justify-between items-center pt-4 border-t border-slate-100">
        <span className={`text-sm font-semibold px-3 py-1 rounded-lg ${currentStatusStyle}`}>
          {ticket.estado}
        </span>
        
        {isOperator && (
          <div className="flex space-x-2">
            {ticket.estado !== 'En Progreso' && ticket.estado !== 'Cerrado' && (
              <button
                onClick={() => handleStatusChange('en_proceso')}
                className="text-xs px-3 py-1 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50"
                disabled={loading}
              >
                Procesar
              </button>
            )}
            {ticket.estado !== 'Cerrado' && (
              <button
                onClick={() => handleStatusChange('cerrado')}
                className="text-xs px-3 py-1 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition disabled:opacity-50"
                disabled={loading}
              >
                Cerrar
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}