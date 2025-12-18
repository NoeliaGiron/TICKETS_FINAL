'use client';

import { Interaccion } from '@/types/interacciones';

interface Props {
  historial: Interaccion[];
}

export default function TicketChat({ historial }: Props) {
  return (
    <div className="border rounded-xl p-4 bg-slate-50 max-h-64 overflow-y-auto space-y-3">
      {historial.map((msg) => (
        <div
          key={msg.id_interaccion}
          className={`flex ${
            msg.autor === 'operador'
              ? 'justify-end'
              : 'justify-start'
          }`}
        >
          <div
            className={`max-w-[75%] px-4 py-2 rounded-xl text-sm ${
              msg.autor === 'operador'
                ? 'bg-indigo-600 text-white'
                : 'bg-white border'
            }`}
          >
            <p className="font-semibold mb-1 capitalize">
              {msg.autor}
            </p>
            <p>{msg.mensaje}</p>
            <p className="text-[10px] opacity-70 mt-1 text-right">
              {new Date(msg.fecha_creacion).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
