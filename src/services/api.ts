import type {
    ClienteRequest,
    ClienteResponse,
    FiestaRequest,
    FiestaResponse,
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

/* ── Clientes ─────────────────────────────────────────── */

export function listarClientes() {
    return http<ClienteResponse[]>(`${BASE}/clientes`);
}

export function crearCliente(data: ClienteRequest) {
    return http<ClienteResponse>(`${BASE}/clientes`, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export function buscarCliente(cedula: string) {
    return http<ClienteResponse>(`${BASE}/clientes/${cedula}`);
}

/* ── Fiestas ──────────────────────────────────────────── */

export function listarFiestas(anio?: number, mes?: number) {
    const params = new URLSearchParams();
    if (anio !== undefined) params.set("anio", String(anio));
    if (mes !== undefined) params.set("mes", String(mes));
    const qs = params.toString();
    return http<FiestaResponse[]>(`${BASE}/fiestas${qs ? `?${qs}` : ""}`);
}

export function obtenerFiesta(id: string) {
    return http<FiestaResponse>(`${BASE}/fiestas/${id}`);
}

export function crearFiesta(data: FiestaRequest) {
    return http<FiestaResponse>(`${BASE}/fiestas`, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export function actualizarFiesta(id: string, data: FiestaRequest) {
    return http<FiestaResponse>(`${BASE}/fiestas/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export function eliminarFiesta(id: string) {
    return http<void>(`${BASE}/fiestas/${id}`, { method: "DELETE" });
}

/* ── Reportes ─────────────────────────────────────────── */

export function getReporteMes(anio: number, mes: number) {
    return http<ReporteMesResponse>(
        `${BASE}/reportes/mes?anio=${anio}&mes=${mes}`
    );
}
