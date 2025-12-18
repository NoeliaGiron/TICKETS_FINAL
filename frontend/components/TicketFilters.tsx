'use client';

import { TicketStatus, TicketPriority } from '@/types/ticket';

interface Props {
  estado: TicketStatus | 'Todos';
  prioridad: TicketPriority | 'Todas';
  onChange: (filters: {
    estado: TicketStatus | 'Todos';
    prioridad: TicketPriority | 'Todas';
  }) => void;
}

export default function TicketFilter({
  estado,
  prioridad,
  onChange,
}: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 mb-6 flex flex-col sm:flex-row gap-4">

      {/* FILTRO ESTADO */}
      <div className="flex-1">
        <label className="block text-sm font-medium text-slate-600 mb-1">
          Estado
        </label>
        <select
          value={estado}
          onChange={(e) =>
            onChange({
              estado: e.target.value as any,
              prioridad,
            })
          }
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-300"
        >
          <option value="Todos">Todos</option>
          <option value="Abierto">Abierto</option>
          <option value="En Progreso">En Progreso</option>
          <option value="Cerrado">Cerrado</option>
          <option value="Rechazado">Rechazado</option>
        </select>
      </div>

      {/* FILTRO PRIORIDAD */}
      <div className="flex-1">
        <label className="block text-sm font-medium text-slate-600 mb-1">
          Prioridad
        </label>
        <select
          value={prioridad}
          onChange={(e) =>
            onChange({
              estado,
              prioridad: e.target.value as any,
            })
          }
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-300"
        >
          <option value="Todas">Todas</option>
          <option value="Baja">Baja</option>
          <option value="Media">Media</option>
          <option value="Alta">Alta</option>
          <option value="Urgente">Urgente</option>
        </select>
      </div>
    </div>
  );
}
