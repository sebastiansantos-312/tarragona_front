export interface ClienteRequest {
  cedula: string;
  nombre: string;
}

export interface ClienteResponse {
  id: string;
  cedula: string;
  nombre: string;
}

export interface FiestaRequest {
  cedula: string;
  numInvitados: number;
  horasDuracion: number;
  fechaFiesta: string;
}

export interface FiestaResponse {
  id: string;
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
  fiestas1_3h: number;
  fiestas4_6h: number;
  fiestasMas6h: number;
}