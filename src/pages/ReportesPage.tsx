import { useState } from "react";
import type { ReporteMesResponse } from "../types";
import { getReporteMes } from "../services/api";
import { toast } from "../components/Toast";
import { StatsSkeleton } from "../components/Skeleton";

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"] as const;
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i);

const fmt = (n: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);

interface DonutProps {
    readonly values: number[];
    readonly colors: string[];
    readonly size?: number;
}

function DonutChart({ values, colors, size = 120 }: DonutProps) {
    const total = values.reduce((a, b) => a + b, 0);
    if (total === 0) {
        return <div style={{ width: size, height: size, borderRadius: "50%", background: "var(--surface-3)" }} />;
    }

    const radius = (size / 2) * 0.85;
    const cx = size / 2;
    const cy = size / 2;
    const strokeWidth = size * 0.15;

    const polarToCartesian = (angle: number) => {
        const rad = (angle * Math.PI) / 180;
        return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
    };

    const describeArc = (startAngle: number, endAngle: number) => {
        const start = polarToCartesian(endAngle - 0.01);
        const end = polarToCartesian(startAngle);
        const largeArc = endAngle - startAngle > 180 ? 1 : 0;
        return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 0 ${end.x} ${end.y}`;
    };

    let offset = -90;
    const segments = values.map((v, i) => {
        const angle = (v / total) * 360;
        const startAngle = offset;
        offset += angle;
        return { startAngle, angle, color: colors[i] };
    });

    return (
        <svg width={size} height={size} style={{ overflow: "visible" }}>
            {segments.map((s, i) => (
                <path
                    key={colors[i]}
                    d={describeArc(s.startAngle, s.startAngle + s.angle)}
                    fill="none"
                    stroke={s.color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="butt"
                    opacity={0.9}
                />
            ))}
            <circle cx={cx} cy={cy} r={radius - strokeWidth / 2 - 2} fill="var(--surface)" />
            <text x={cx} y={cy - 6} textAnchor="middle" fontSize={size * 0.14} fontWeight={700} fill="var(--text)" fontFamily="DM Sans">
                {total}
            </text>
            <text x={cx} y={cy + 12} textAnchor="middle" fontSize={size * 0.1} fill="var(--text-tertiary)" fontFamily="DM Sans">
                fiestas
            </text>
        </svg>
    );
}

const CHART_COLORS = ["#22c55e", "#6366f1", "#f59e0b"] as const;

interface BreakdownRow {
    readonly label: string;
    readonly value: number;
    readonly color: string;
    readonly badgeClass: string;
}

export default function ReportesPage() {
    const [anio, setAnio] = useState(currentYear);
    const [mes, setMes] = useState(new Date().getMonth() + 1);
    const [reporte, setReporte] = useState<ReporteMesResponse | null>(null);
    const [loading, setLoading] = useState(false);

    const consultar = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setReporte(null);
        try {
            const data = await getReporteMes(anio, mes);
            setReporte(data);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error al obtener reporte");
        } finally {
            setLoading(false);
        }
    };

    const total = reporte
        ? reporte.fiestas1_3h + reporte.fiestas4_6h + reporte.fiestasMas6h
        : 0;

    const breakdown: BreakdownRow[] = reporte
        ? [
            { label: "1 – 3 horas", value: reporte.fiestas1_3h, color: CHART_COLORS[0], badgeClass: "badge-green" },
            { label: "4 – 6 horas", value: reporte.fiestas4_6h, color: CHART_COLORS[1], badgeClass: "badge-indigo" },
            { label: "Más de 6 horas", value: reporte.fiestasMas6h, color: CHART_COLORS[2], badgeClass: "badge-amber" },
        ]
        : [];

    return (
        <div className="animate-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Reportes</h1>
                    <p className="page-subtitle">Análisis financiero mensual</p>
                </div>
            </div>

            <div className="card card-padded" style={{ marginBottom: 24, maxWidth: 520 }}>
                <div style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: 16 }}>Seleccionar período</div>
                <form onSubmit={e => void consultar(e)}>
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
                        <label className="form-label" style={{ flex: 1, minWidth: 120 }}>
                            Año
                            <select
                                className="form-input"
                                value={anio}
                                onChange={e => setAnio(Number(e.target.value))}
                            >
                                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </label>
                        <label className="form-label" style={{ flex: 1, minWidth: 140 }}>
                            Mes
                            <select
                                className="form-input"
                                value={mes}
                                onChange={e => setMes(Number(e.target.value))}
                            >
                                {MESES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                            </select>
                        </label>
                        <button className="btn btn-primary" type="submit" disabled={loading}>
                            {loading ? "Consultando…" : "Ver reporte"}
                        </button>
                    </div>
                </form>
            </div>

            {loading && <StatsSkeleton />}

            {reporte && (
                <div className="animate-in">
                    <div style={{ marginBottom: 20 }}>
                        <span className="badge badge-indigo" style={{ fontSize: "0.8rem", padding: "5px 14px" }}>
                            {MESES[reporte.mes - 1]} {reporte.anio}
                        </span>
                    </div>

                    <div className="stat-grid">
                        <div className="stat-card stat-card-accent">
                            <div className="stat-label">Total Ingresos</div>
                            <div className="stat-value stat-value-accent" style={{ fontSize: "1.5rem" }}>
                                {fmt(reporte.totalIngresos)}
                            </div>
                            <div className="stat-sub">Ingresos del período</div>
                            <span className="stat-icon">💰</span>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Fiestas</div>
                            <div className="stat-value">{reporte.totalFiestas}</div>
                            <div className="stat-sub">Eventos realizados</div>
                            <span className="stat-icon">🎉</span>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Invitados</div>
                            <div className="stat-value">{reporte.totalInvitados.toLocaleString()}</div>
                            <div className="stat-sub">Total asistentes</div>
                            <span className="stat-icon">👥</span>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Horas</div>
                            <div className="stat-value">{reporte.totalHoras}</div>
                            <div className="stat-sub">Horas de evento</div>
                            <span className="stat-icon">⏱️</span>
                        </div>
                    </div>

                    <div className="card card-padded" style={{ marginBottom: 20 }}>
                        <div style={{ fontWeight: 700, fontSize: "1rem", marginBottom: 4 }}>Desglose por duración</div>
                        <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: 20 }}>
                            Distribución de fiestas según horas contratadas
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 40, flexWrap: "wrap" }}>
                            <div style={{ flexShrink: 0 }}>
                                <DonutChart
                                    values={[reporte.fiestas1_3h, reporte.fiestas4_6h, reporte.fiestasMas6h]}
                                    colors={[...CHART_COLORS]}
                                    size={140}
                                />
                            </div>
                            <div style={{ flex: 1, minWidth: 200 }}>
                                {breakdown.map(({ label, value, color, badgeClass }) => {
                                    const pct = total > 0 ? (value / total) * 100 : 0;
                                    return (
                                        <div key={label} style={{ marginBottom: 14 }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, flexShrink: 0 }} />
                                                    <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>{label}</span>
                                                </div>
                                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                    <span className={`badge ${badgeClass}`}>{value}</span>
                                                    <span style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", fontFamily: "'DM Mono',monospace", minWidth: 36, textAlign: "right" }}>
                                                        {pct.toFixed(0)}%
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="progress-bar">
                                                <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {reporte.totalFiestas > 0 && (
                        <div className="card card-padded">
                            <div style={{ fontWeight: 700, fontSize: "1rem", marginBottom: 16 }}>Promedios del período</div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: 12 }}>
                                {([
                                    { label: "Ingreso promedio", value: fmt(reporte.totalIngresos / reporte.totalFiestas) },
                                    { label: "Invitados promedio", value: Math.round(reporte.totalInvitados / reporte.totalFiestas).toLocaleString() },
                                    { label: "Horas promedio", value: `${(reporte.totalHoras / reporte.totalFiestas).toFixed(1)}h` },
                                ] as const).map(({ label, value }) => (
                                    <div key={label} style={{
                                        background: "var(--surface-2)", border: "1px solid var(--border)",
                                        borderRadius: "var(--radius-sm)", padding: "14px 16px",
                                    }}>
                                        <div style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-tertiary)", fontWeight: 600, marginBottom: 6 }}>
                                            {label}
                                        </div>
                                        <div style={{ fontSize: "1.15rem", fontWeight: 700, letterSpacing: "-0.02em", fontFamily: "'DM Mono',monospace", color: "var(--text)" }}>
                                            {value}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {!reporte && !loading && (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-icon">📊</div>
                        <div className="empty-title">Selecciona un período</div>
                        <div className="empty-sub">Elige el año y mes y haz clic en "Ver reporte"</div>
                    </div>
                </div>
            )}
        </div>
    );
}