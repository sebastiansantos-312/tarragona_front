import { useState } from "react";
import type { ReporteMesResponse } from "../types";
import { getReporteMes } from "../services/api";

const MESES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const currentYear = new Date().getFullYear();

export default function ReportesPage() {
    const [anio, setAnio] = useState(currentYear);
    const [mes, setMes] = useState(new Date().getMonth() + 1);
    const [reporte, setReporte] = useState<ReporteMesResponse | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const consultar = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setReporte(null);
        setLoading(true);
        try {
            const data = await getReporteMes(anio, mes);
            setReporte(data);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Error al obtener reporte");
        } finally {
            setLoading(false);
        }
    };

    const fmt = (n: number) =>
        new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);

    return (
        <div className="page">
            <div className="page-header">
                <h1>Reportes Mensuales</h1>
            </div>

            <div className="card form-card" style={{ maxWidth: 480 }}>
                <form onSubmit={consultar} className="filter-bar">
                    <label>
                        Año
                        <select value={anio} onChange={(e) => setAnio(Number(e.target.value))}>
                            {Array.from({ length: 5 }, (_, i) => currentYear - i).map((y) => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </label>
                    <label>
                        Mes
                        <select value={mes} onChange={(e) => setMes(Number(e.target.value))}>
                            {MESES.map((m, i) => (
                                <option key={i} value={i + 1}>{m}</option>
                            ))}
                        </select>
                    </label>
                    <button className="btn btn-primary" type="submit" disabled={loading}>
                        {loading ? "Consultando…" : "Consultar"}
                    </button>
                </form>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {reporte && (
                <>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <span className="stat-label">Total Fiestas</span>
                            <span className="stat-value">{reporte.totalFiestas}</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-label">Total Invitados</span>
                            <span className="stat-value">{reporte.totalInvitados}</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-label">Total Horas</span>
                            <span className="stat-value">{reporte.totalHoras}</span>
                        </div>
                        <div className="stat-card accent">
                            <span className="stat-label">Total Ingresos</span>
                            <span className="stat-value">{fmt(reporte.totalIngresos)}</span>
                        </div>
                    </div>

                    <div className="card">
                        <h2>Desglose por duración</h2>
                        <div className="breakdown-grid">
                            <div className="breakdown-item">
                                <span className="breakdown-label">1 – 3 horas</span>
                                <span className="breakdown-value">{reporte.fiestas1_3h}</span>
                                <span className="breakdown-suffix">fiestas</span>
                            </div>
                            <div className="breakdown-item">
                                <span className="breakdown-label">4 – 6 horas</span>
                                <span className="breakdown-value">{reporte.fiestas4_6h}</span>
                                <span className="breakdown-suffix">fiestas</span>
                            </div>
                            <div className="breakdown-item">
                                <span className="breakdown-label">Más de 6 horas</span>
                                <span className="breakdown-value">{reporte.fiestasMas6h}</span>
                                <span className="breakdown-suffix">fiestas</span>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
