'use client';

import { Ticket } from '../types/ticket';
import {
  TicketCheck,
  Clock,
  AlertTriangle,
  ListChecks,
} from 'lucide-react';

interface Props {
  tickets: Ticket[];
}

export default function DashboardStats({ tickets }: Props) {
  const total = tickets.length;
  const abiertos = tickets.filter(t => t.estado === 'Abierto').length;
  const enProgreso = tickets.filter(t => t.estado === 'En Progreso').length;
  const cerrados = tickets.filter(t => t.estado === 'Cerrado').length;

  const stats = [
    {
      label: 'Total Tickets',
      value: total,
      icon: ListChecks,
      color: 'bg-indigo-100 text-indigo-700',
    },
    {
      label: 'Abiertos',
      value: abiertos,
      icon: AlertTriangle,
      color: 'bg-blue-100 text-blue-700',
    },
    {
      label: 'En Progreso',
      value: enProgreso,
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-700',
    },
    {
      label: 'Cerrados',
      value: cerrados,
      icon: TicketCheck,
      color: 'bg-green-100 text-green-700',
    },
  ];

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
      {stats.map(({ label, value, icon: Icon, color }) => (
        <div
          key={label}
          className="bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${color}`}>
              <Icon size={22} />
            </div>

            <div>
              <p className="text-sm text-slate-500">{label}</p>
              <p className="text-2xl font-bold text-slate-800">{value}</p>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
