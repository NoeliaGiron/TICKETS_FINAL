// lib/api.ts
import { Ticket } from '@/types/ticket';
import { User, UserRole } from '@/types/users'; 
import { Interaccion } from '@/types/interacciones';

const API_URL = '/api';

/* ======================================================
   AUTENTICACIÓN (Actualizado para identificación por email)
====================================================== */

// 🟢 ACTUALIZADO: Ahora acepta un email opcional
export async function getUsuarioActual(email?: string): Promise<User> {
  const url = email 
    ? `${API_URL}/me?email=${encodeURIComponent(email)}` 
    : `${API_URL}/me`;

  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) { throw new Error('No autenticado'); }
  return res.json();
}

export async function loginUser(email: string): Promise<User> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Error desconocido al iniciar sesión');
  }
  return res.json();
}

export async function registerUser(nombre: string, email: string, rol: UserRole) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre: nombre, email: email, rol: rol }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Error al registrar usuario');
  }
  return res.json();
}

/* ================= MAPPER Y API TICKETS ================= */

interface TicketBackend {
  id_ticket: number;
  asunto: string;
  descripcion: string;
  prioridad: 'baja' | 'media' | 'alta';
  estado: 'abierto' | 'en_proceso' | 'cerrado';
  fecha_creacion: string;
}

function mapTicket(t: TicketBackend): Ticket {
  return {
    id: String(t.id_ticket),
    asunto: t.asunto,
    descripcion: t.descripcion,
    prioridad: t.prioridad.charAt(0).toUpperCase() + t.prioridad.slice(1) as Ticket['prioridad'],
    estado: t.estado === 'en_proceso' ? 'En Progreso' : t.estado.charAt(0).toUpperCase() + t.estado.slice(1) as Ticket['estado'],
    fechaCreacion: new Date(t.fecha_creacion),
  };
}

export async function getTickets(userId: number, userRole: UserRole): Promise<Ticket[]> {
  const params = new URLSearchParams({
    user_id: String(userId),
    user_role: userRole,
  });

  const res = await fetch(`${API_URL}/tickets?${params}`, {
    cache: 'no-store',
  });
  
  if (!res.ok) {
    const error = await res.json(); 
    throw new Error(error.detail || 'Error al obtener tickets');
  }

  const data: TicketBackend[] = await res.json();
  return data.map(mapTicket);
}

export async function crearTicket(data: {
  operator_id: number;
  client_email: string;
  asunto: string;
  descripcion: string;
  prioridad: 'baja' | 'media' | 'alta';
}) {
  const params = new URLSearchParams({
    operator_id: String(data.operator_id), 
  });
  
  const res = await fetch(`${API_URL}/tickets?${params}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        client_email: data.client_email,
        asunto: data.asunto,
        descripcion: data.descripcion,
        prioridad: data.prioridad, 
    }),
  });

  if (!res.ok) {
    const error = await res.json(); 
    throw new Error(error.detail || 'Error al crear ticket');
  }

  return res.json();
}

export async function cambiarEstadoTicket(id: string, nuevoEstado: 'abierto' | 'en_proceso' | 'cerrado') {
  const res = await fetch(`${API_URL}/tickets/${id}/estado?nuevo_estado=${nuevoEstado}`, { method: 'PUT' });
  if (!res.ok) { throw new Error('Error al cambiar estado'); }
  return res.json();
}

export async function cambiarPrioridadTicket(id: string, nuevaPrioridad: 'baja' | 'media' | 'alta'): Promise<TicketBackend> { 
  const res = await fetch(`${API_URL}/tickets/${id}/prioridad?nueva_prioridad=${nuevaPrioridad}`, { method: 'PUT' });
  if (!res.ok) {
    const error = await res.json(); 
    throw new Error(error.detail || 'Error al cambiar prioridad');
  }
  return res.json();
}

export async function getHistorialTicket(idTicket: string): Promise<Interaccion[]> {
  const res = await fetch(`${API_URL}/tickets/${idTicket}/historial`, { cache: 'no-store' });
  if (!res.ok) { throw new Error('Error al obtener historial'); }
  return res.json();
}

/* ================= MAPPER Y API USUARIOS ================= */

interface UsuarioBackend {
  id_usuario: number;
  nombre: string;
  email: string;
  rol: UserRole;
  activo?: boolean; // Asegúrate de que este campo exista en tu DB
}

// Transformamos los datos del Backend al formato del Frontend
function mapUsuario(u: UsuarioBackend): User {
  return {
    id: u.id_usuario, // Convertimos id_usuario a id para el componente
    nombre: u.nombre,
    email: u.email,
    rol: u.rol,
    activo: u.activo ?? true, 
  } as any;
}

export async function getUsuarios(): Promise<User[]> {
  try {
    const res = await fetch(`${API_URL}/usuarios`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Error al obtener usuarios');

    const data = await res.json();

    // Mapeo exacto basado en tu clase Usuario de SQLAlchemy
    return data.map((u: any) => ({
      id: u.id_usuario, // id_usuario es la Primary Key en tu main.py
      nombre: u.nombre,
      email: u.email,
      rol: u.rol
    }));
  } catch (error) {
    console.error("Fallo al conectar con FastAPI:", error);
    return [];
  }
}

export async function updateUsuario(id: number, updates: Partial<User>): Promise<User> {
  // Ajustamos para que coincida con lo que tu backend espera (id_usuario)
  const res = await fetch(`${API_URL}/usuarios/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Error al actualizar');
  return res.json();
}

