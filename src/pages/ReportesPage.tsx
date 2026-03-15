import { useState } from "react";
import type { ReporteMesResponse } from "../types";
import { getReporteMes } from "../services/api";
import { toast } from "../components/Toast";
import { StatsSkeleton } from "../components/Skeleton";

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"] as const;
const YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => YEAR - i);

const money = (n: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);

const COLORS = ["#1fcc6a", "#5b5ef4", "#e8a020"] as const;

function Donut({ values, size = 116 }: { values: number[]; size?: number }) {
    const total = values.reduce((a, b) => a + b, 0);
    if (!total) return <div style={{ width: size, height: size, borderRadius: "50%", background: "var(--surface-3)" }} />;

    const r = (size / 2) * 0.82;
    const cx = size / 2;
    const cy = size / 2;
    const sw = size * 0.16;

    const pt = (a: number) => ({ x: cx + r * Math.cos((a * Math.PI) / 180), y: cy + r * Math.sin((a * Math.PI) / 180) });
    const arc = (s: number, e: number) => {
        const p1 = pt(e - 0.01), p2 = pt(s);
        return `M ${p1.x} ${p1.y} A ${r} ${r} 0 ${e - s > 180 ? 1 : 0} 0 ${p2.x} ${p2.y}`;
    };

    let off = -90;
    return (
        <svg width={size} height={size} style={{ overflow: "visible" }}>
            {values.map((v, i) => {
                const angle = (v / total) * 360;
                const d = arc(off, off + angle);
                off += angle;
                return <path key={i} d={d} fill="none" stroke={COLORS[i]} strokeWidth={sw} strokeLinecap="butt" opacity={0.85} />;
            })}
            <circle cx={cx} cy={cy} r={r - sw / 2 - 1} fill="var(--surface)" />
            <text x={cx} y={cy - 4} textAnchor="middle" fontSize={size * 0.14} fontWeight={600} fill="var(--text)" fontFamily="Geist">{total}</text>
            <text x={cx} y={cy + 12} textAnchor="middle" fontSize={size * 0.09} fill="var(--text-3)" fontFamily="Geist">fiestas</text>
        </svg>
    );
}

export default function ReportesPage() {
    const [anio, setAnio] = useState(YEAR);
    const [mes, setMes] = useState(new Date().getMonth() + 1);
    const [reporte, setReporte] = useState<ReporteMesResponse | null>(null);
    const [loading, setLoading] = useState(false);

    const consultar = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setReporte(null);
        try { setReporte(await getReporteMes(anio, mes)); }
        catch (e) { toast.err(e instanceof Error ? e.message : "Error al obtener reporte"); }
        finally { setLoading(false); }
    };

    // Usa los campos camelCase correctos del back
    const rows = reporte ? [
        { label: "1 – 3 h", value: reporte.fiestas1a3h, color: COLORS[0], cls: "b-green" },
        { label: "4 – 6 h", value: reporte.fiestas4a6h, color: COLORS[1], cls: "b-indigo" },
        { label: "Más de 6 h", value: reporte.fiestasMas6h, color: COLORS[2], cls: "b-amber" },
    ] : [];
    const totalRows = rows.reduce((a, r) => a + r.value, 0);

    return (
        <div className="ani">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Reportes</h1>
                    <p className="page-sub">Análisis mensual</p>
                </div>
            </div>

            {/* Selector */}
            <div className="card card-p" style={{ marginBottom: 20, maxWidth: 480 }}>
                <form onSubmit={e => void consultar(e)}>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
                        <label className="field" style={{ flex: 1, minWidth: 110 }}>
                            Año
                            <select className="input" value={anio} onChange={e => setAnio(Number(e.target.value))}>
                                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </label>
                        <label className="field" style={{ flex: 1, minWidth: 130 }}>
                            Mes
                            <select className="input" value={mes} onChange={e => setMes(Number(e.target.value))}>
                                {MESES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                            </select>
                        </label>
                        <button className="btn btn-primary" type="submit" disabled={loading}>
                            {loading ? "Cargando…" : "Ver reporte"}
                        </button>
                    </div>
                </form>
            </div>

            {loading && <StatsSkeleton />}

            {reporte && (
                <div className="ani">
                    <div style={{ marginBottom: 18 }}>
                        <span className="badge b-indigo" style={{ fontSize: "0.72rem", padding: "4px 12px" }}>
                            {MESES[reporte.mes - 1]} {reporte.anio}
                        </span>
                    </div>

                    {/* Stats */}
                    <div className="stat-grid">
                        <div className="stat-card ac">
                            <div className="s-label">Ingresos</div>
                            <div className="s-value ac" style={{ fontSize: "1.4rem" }}>{money(reporte.totalIngresos)}</div>
                            <div className="s-sub">Total del período</div>
                            <span className="s-icon">💰</span>
                        </div>
                        <div className="stat-card">
                            <div className="s-label">Fiestas</div>
                            <div className="s-value">{reporte.totalFiestas}</div>
                            <div className="s-sub">Eventos realizados</div>
                            <span className="s-icon">🎉</span>
                        </div>
                        <div className="stat-card">
                            <div className="s-label">Invitados</div>
                            <div className="s-value">{reporte.totalInvitados.toLocaleString()}</div>
                            <div className="s-sub">Total asistentes</div>
                            <span className="s-icon">👥</span>
                        </div>
                        <div className="stat-card">
                            <div className="s-label">Horas</div>
                            <div className="s-value">{Number(reporte.totalHoras).toLocaleString()}</div>
                            <div className="s-sub">Horas de evento</div>
                            <span className="s-icon">⏱️</span>
                        </div>
                    </div>

                    {/* Desglose */}
                    <div className="card card-p" style={{ marginBottom: 16 }}>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>Desglose por duración</div>
                        <div style={{ fontSize: "0.78rem", color: "var(--text-2)", marginBottom: 18 }}>
                            Distribución según horas contratadas
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 36, flexWrap: "wrap" }}>
                            <Donut values={rows.map(r => r.value)} size={130} />
                            <div style={{ flex: 1, minWidth: 180 }}>
                                {rows.map(({ label, value, color, cls }) => {
                                    const pct = totalRows > 0 ? (value / totalRows) * 100 : 0;
                                    return (
                                        <div key={label} style={{ marginBottom: 13 }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                                                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                                                    <span style={{ fontSize: "0.8rem", color: "var(--text-2)" }}>{label}</span>
                                                </div>
                                                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                                                    <span className={`badge ${cls}`}>{value}</span>
                                                    <span className="mono" style={{ fontSize: "0.72rem", color: "var(--text-3)", minWidth: 32, textAlign: "right" }}>
                                                        {pct.toFixed(0)}%
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="prog-bar">
                                                <div className="prog-fill" style={{ width: `${pct}%`, background: color }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Promedios */}
                    {reporte.totalFiestas > 0 && (
                        <div className="card card-p">
                            <div style={{ fontWeight: 600, marginBottom: 14 }}>Promedios</div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10 }}>
                                {[
                                    { label: "Ingreso / fiesta", val: money(reporte.totalIngresos / reporte.totalFiestas) },
                                    { label: "Invitados / fiesta", val: Math.round(reporte.totalInvitados / reporte.totalFiestas).toLocaleString() },
                                    { label: "Horas / fiesta", val: `${(Number(reporte.totalHoras) / reporte.totalFiestas).toFixed(1)}h` },
                                ].map(({ label, val }) => (
                                    <div key={label} style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", padding: "13px 15px" }}>
                                        <div style={{ fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-3)", fontWeight: 600, marginBottom: 5 }}>{label}</div>
                                        <div className="mono" style={{ fontSize: "1.1rem", fontWeight: 600 }}>{val}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {!reporte && !loading && (
                <div className="card card-p">
                    <div className="empty">
                        <div className="empty-ico">📊</div>
                        <div className="empty-title">Selecciona un período</div>
                        <div className="empty-sub">Elige año y mes, luego haz clic en "Ver reporte"</div>
                    </div>
                </div>
            )}
        </div>
    );
}
