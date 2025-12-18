export type AutorInteraccion = 'cliente' | 'operador';

export interface Interaccion {
  id_interaccion: number;
  autor: AutorInteraccion;
  mensaje: string;
  fecha_creacion: string;
}
