export interface ClienteRequest {
  cedula: string;
  nombre: string;
  telefono?: string;
}

export interface ClienteResponse {
  id: number;
  cedula: string;
  nombre: string;
  telefono: string | null;
}

export interface FiestaRequest {
  cedula: string;
  numInvitados: number;
  horasDuracion: number;
  fechaFiesta: string;
}

export interface FiestaResponse {
  id: number;
  cedulaContratante: string;
  nombreContratante: string;
  numInvitados: number;
  horasDuracion: number;
  fechaFiesta: string;
  montoInvitados: number;
  montoHoras: number;
  montoTotal: number;
}

export interface ReporteMesResponse {
  anio: number;
  mes: number;
  totalFiestas: number;
  totalInvitados: number;
  totalHoras: number;
  totalIngresos: number;
  fiestas1a3h: number;
  fiestas4a6h: number;
  fiestasMas6h: number;
}