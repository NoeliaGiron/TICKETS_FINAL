'use client';

import { useState } from 'react';
import { crearTicket } from '@/lib/api';
import { useAuth } from '@/context/AuthContext'; 
import { Ticket } from '@/types/ticket'; 

interface Props {
  onClose: () => void;
  onCreated: (newTicket: Ticket) => void; 
}

export default function NewTicketModal({ onClose, onCreated }: Props) {
  const { user, role } = useAuth(); // Obtener el usuario autenticado

  // 🛑 ESTADOS NECESARIOS
  const [clientEmail, setClientEmail] = useState('');
  const [asunto, setAsunto] = useState('');
  const [descripcion, setDescripcion] = useState(''); // 🟢 Estado de la descripción
  const [prioridad, setPrioridad] = useState<'baja' | 'media' | 'alta'>('baja');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Solo los operadores pueden crear tickets a través de este modal
  if (role !== 'operador') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-xl">
          <p className="text-lg text-red-600">Acceso denegado. Solo operadores pueden crear tickets.</p>
          <button onClick={onClose} className="mt-4 w-full bg-slate-500 text-white py-2 rounded-lg">Cerrar</button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user || !user.id) {
        setError('Error de autenticación del operador.');
        return;
    }

    setLoading(true);
    try {
      const response = await crearTicket({
        operator_id: user.id, // ID del operador
        client_email: clientEmail,
        asunto,
        descripcion, // 🟢 ENVIANDO DESCRIPCIÓN
        prioridad,
      });

      // Si la API devuelve el ticket creado (o su ID/info), puedes notificar al componente padre
      console.log('Ticket creado:', response);
      
      // En un entorno real, usarías la respuesta de la API para crear el objeto Ticket, 
      // pero por ahora solo cerramos y forzamos la recarga en el componente padre.
      onClose();

    } catch (err: any) {
      console.error('Error al crear ticket:', err);
      setError(err.message || 'Error desconocido al crear el ticket.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4 text-slate-800">Crear Nuevo Ticket (Operador)</h2>
        
        {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* CAMPO EMAIL DEL CLIENTE */}
          <div>
            <label className="block text-sm font-medium text-slate-700">Email del Cliente</label>
            <input
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="cliente@ejemplo.com"
              required
              disabled={loading}
            />
          </div>

          {/* CAMPO ASUNTO */}
          <div>
            <label className="block text-sm font-medium text-slate-700">Asunto</label>
            <input
              type="text"
              value={asunto}
              onChange={(e) => setAsunto(e.target.value)}
              className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Asunto principal del ticket"
              required
              disabled={loading}
            />
          </div>

          {/* 🟢 CAMPO DESCRIPCIÓN */}
          <div>
            <label className="block text-sm font-medium text-slate-700">Descripción Detallada</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={3}
              className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Detalles, pasos para reproducir o información de soporte."
              required
              disabled={loading}
            />
          </div>

          {/* CAMPO PRIORIDAD */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Prioridad</label>
            <div className="flex space-x-2">
              {(['baja', 'media', 'alta'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPrioridad(p)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition duration-150 ${
                    prioridad === p
                      ? 'bg-indigo-600 text-white'
                      : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                  }`}
                  disabled={loading}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 transition"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Creando...' : 'Crear Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}