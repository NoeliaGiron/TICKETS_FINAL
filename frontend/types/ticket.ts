export type TicketStatus =
  | 'Abierto'
  | 'En Progreso'
  | 'Cerrado';

export type TicketPriority =
  | 'Baja'
  | 'Media'
  | 'Alta';

export interface Ticket {
  id: string;
  asunto: string;
  descripcion: string; // 🛑 DEBE EXISTIR EN EL TIPO PRINCIPAL
  prioridad: 'Baja' | 'Media' | 'Alta';
  estado: 'Abierto' | 'En Progreso' | 'Cerrado';
  fechaCreacion: Date;
}

export type UserRole = 'admin' | 'operador' | 'cliente';

export interface User {
  id: number;
  nombre: string;
  email: string;
  rol: UserRole;
}
