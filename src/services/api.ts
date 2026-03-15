import type {
    ClienteRequest, ClienteResponse,
    FiestaRequest, FiestaResponse,
    ReporteMesResponse,
} from "../types";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";

async function http<T>(url: string, init?: RequestInit): Promise<T> {
    const res = await fetch(url, {
        headers: { "Content-Type": "application/json" },
        ...init,
    });
    if (!res.ok) {
        let msg = `Error ${res.status}`;
        try {
            const b = await res.json() as { message?: string; error?: string };
            msg = b.message ?? b.error ?? msg;
        } catch {
            const t = await res.text();
            if (t) msg = t.slice(0, 120);
        }
        throw new Error(msg);
    }
    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
}

// ── Clientes ─────────────────────────────────────────
export const listarClientes = () => http<ClienteResponse[]>(`${BASE}/clientes`);
export const buscarCliente = (cedula: string) => http<ClienteResponse>(`${BASE}/clientes/${encodeURIComponent(cedula)}`);
export const crearCliente = (data: ClienteRequest) => http<ClienteResponse>(`${BASE}/clientes`, { method: "POST", body: JSON.stringify(data) });
export const actualizarCliente = (id: number, data: ClienteRequest) =>
    http<ClienteResponse>(`${BASE}/clientes/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const eliminarCliente = (id: number) => http<void>(`${BASE}/clientes/${id}`, { method: "DELETE" });

// ── Fiestas ──────────────────────────────────────────
export const listarFiestas = (anio?: number, mes?: number) => {
    const p = new URLSearchParams();
    if (anio != null) p.set("anio", String(anio));
    if (mes != null) p.set("mes", String(mes));
    const qs = p.toString();
    return http<FiestaResponse[]>(`${BASE}/fiestas${qs ? `?${qs}` : ""}`);
};
export const crearFiesta = (data: FiestaRequest) => http<FiestaResponse>(`${BASE}/fiestas`, { method: "POST", body: JSON.stringify(data) });
export const actualizarFiesta = (id: number, data: FiestaRequest) =>
    http<FiestaResponse>(`${BASE}/fiestas/${id}`, {
        method: "PUT",
        body: JSON.stringify({
            cedula: data.cedula,
            numInvitados: Math.round(data.numInvitados),
            horasDuracion: parseFloat(String(data.horasDuracion)),
            fechaFiesta: data.fechaFiesta,
        }),
    });
export const eliminarFiesta = (id: number) => http<void>(`${BASE}/fiestas/${id}`, { method: "DELETE" });

// ── Reportes ─────────────────────────────────────────
export const getReporteMes = (anio: number, mes: number) =>
    http<ReporteMesResponse>(`${BASE}/reportes/mes?anio=${anio}&mes=${mes}`);