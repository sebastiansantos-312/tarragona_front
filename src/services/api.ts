import type {
    ClienteRequest, ClienteResponse,
    FiestaRequest, FiestaResponse,
    ReporteMesResponse,
} from "../types";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

async function http<T>(url: string, options?: RequestInit): Promise<T> {
    const res = await fetch(url, {
        headers: { "Content-Type": "application/json" },
        ...options,
    });
    if (!res.ok) {
        let msg = `Error ${res.status}`;
        try {
            const body = await res.json();
            msg = body.message || body.error || msg;
        } catch {
            const text = await res.text();
            if (text) msg = text.substring(0, 120);
        }
        throw new Error(msg);
    }
    if (res.status === 204) return undefined as T;
    return res.json();
}

export const listarClientes = () =>
    http<ClienteResponse[]>(`${BASE}/clientes`);

export const crearCliente = (data: ClienteRequest) =>
    http<ClienteResponse>(`${BASE}/clientes`, {
        method: "POST",
        body: JSON.stringify(data),
    });

export const buscarCliente = (cedula: string) =>
    http<ClienteResponse>(`${BASE}/clientes/${cedula}`);

export const listarFiestas = (anio?: number, mes?: number) => {
    const p = new URLSearchParams();
    if (anio) p.set("anio", String(anio));
    if (mes) p.set("mes", String(mes));
    const qs = p.toString();
    return http<FiestaResponse[]>(`${BASE}/fiestas${qs ? `?${qs}` : ""}`);
};

export const crearFiesta = (data: FiestaRequest) =>
    http<FiestaResponse>(`${BASE}/fiestas`, {
        method: "POST",
        body: JSON.stringify(data),
    });

export const actualizarFiesta = (id: string, data: FiestaRequest) =>
    http<FiestaResponse>(`${BASE}/fiestas/${id}`, {
        method: "PUT",
        body: JSON.stringify({
            ...data,
            horasDuracion: Number(data.horasDuracion),
            numInvitados: Number(data.numInvitados),
        }),
    });

export const eliminarFiesta = (id: string) =>
    http<void>(`${BASE}/fiestas/${id}`, { method: "DELETE" });

export const getReporteMes = (anio: number, mes: number) =>
    http<ReporteMesResponse>(`${BASE}/reportes/mes?anio=${anio}&mes=${mes}`);