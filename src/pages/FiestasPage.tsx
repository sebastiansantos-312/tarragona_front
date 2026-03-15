import { useEffect, useState } from "react";
import type { FiestaResponse, FiestaRequest } from "../types";
import { listarFiestas, crearFiesta, actualizarFiesta, eliminarFiesta } from "../services/api";
import { toast } from "../components/Toast";
import { TableSkeleton } from "../components/Skeleton";

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"] as const;
const YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => YEAR - i);

const money = (n: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);

const fmtDate = (s: string) => { const [y, m, d] = s.split("-"); return `${d}/${m}/${y}`; };

const durBadge = (h: number) => {
    if (h <= 3) return <span className="badge b-green">{h}h</span>;
    if (h <= 6) return <span className="badge b-indigo">{h}h</span>;
    return <span className="badge b-amber">{h}h</span>;
};

const tarifaLabel = (inv: number, hrs: number) => ({
    inv: inv <= 100 ? "$8,000/p" : inv <= 500 ? "$6,000/p" : "$4,000/p",
    hrs: hrs <= 3 ? "$100,000" : hrs <= 6 ? "$200,000" : "$300,000",
});

const EMPTY: FiestaRequest = { cedula: "", numInvitados: 50, horasDuracion: 3, fechaFiesta: "" };

export default function FiestasPage() {
    const [fiestas, setFiestas] = useState<FiestaResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [form, setForm] = useState<FiestaRequest>(EMPTY);
    const [invStr, setInvStr] = useState("50");
    const [hrsStr, setHrsStr] = useState("3");
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState<number | null>(null);
    const [filtroAnio, setFiltroAnio] = useState<number | "">("");
    const [filtroMes, setFiltroMes] = useState<number | "">("");
    const [confirmDel, setConfirmDel] = useState<FiestaResponse | null>(null);

    const cargar = async (anio?: number | "", mes?: number | "") => {
        setLoading(true);
        try {
            setFiestas(await listarFiestas(
                anio !== "" ? (anio as number) : undefined,
                mes !== "" ? (mes as number) : undefined,
            ));
        } catch (e) {
            toast.err(e instanceof Error ? e.message : "Error al cargar");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { void cargar(); }, []);

    const openCreate = () => {
        setEditId(null); setForm(EMPTY); setInvStr("50"); setHrsStr("3"); setShowModal(true);
    };

    const openEdit = (f: FiestaResponse) => {
        setEditId(f.id);
        setForm({ cedula: f.cedulaContratante, numInvitados: f.numInvitados, horasDuracion: f.horasDuracion, fechaFiesta: f.fechaFiesta });
        setInvStr(String(f.numInvitados));
        setHrsStr(String(f.horasDuracion));
        setShowModal(true);
    };

    const closeModal = () => { setShowModal(false); setEditId(null); };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const inv = parseInt(invStr, 10);
        const hrs = parseFloat(hrsStr);
        if (!inv || inv < 1) { toast.err("Invitados inválido"); return; }
        if (!hrs || hrs < 0.5) { toast.err("Horas inválidas"); return; }

        const payload: FiestaRequest = { ...form, numInvitados: inv, horasDuracion: hrs };
        setSaving(true);
        try {
            if (editId !== null) {
                await actualizarFiesta(editId, payload);
                toast.ok("Fiesta actualizada");
            } else {
                await crearFiesta(payload);
                toast.ok("Fiesta registrada");
            }
            closeModal();
            setTimeout(() => void cargar(filtroAnio, filtroMes), 120);
        } catch (e) {
            toast.err(e instanceof Error ? e.message : "Error al guardar");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (f: FiestaResponse) => {
        setDeleting(f.id);
        try {
            await eliminarFiesta(f.id);
            toast.ok("Fiesta eliminada");
            setConfirmDel(null);
            void cargar(filtroAnio, filtroMes);
        } catch (e) {
            toast.err(e instanceof Error ? e.message : "Error al eliminar");
        } finally {
            setDeleting(null);
        }
    };

    const totalIngresos = fiestas.reduce((s, f) => s + f.montoTotal, 0);
    const prevInv = parseInt(invStr, 10) || 0;
    const prevHrs = parseFloat(hrsStr) || 0;
    const tarifa = tarifaLabel(prevInv, prevHrs);

    return (
        <div className="ani">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Fiestas</h1>
                    <p className="page-sub">{fiestas.length} evento{fiestas.length !== 1 ? "s" : ""} · {money(totalIngresos)}</p>
                </div>
                <button className="btn btn-primary" onClick={openCreate}>+ Nueva</button>
            </div>

            {/* Filtros */}
            <div className="filter-bar">
                <label className="field" style={{ flex: 1, minWidth: 110 }}>
                    Año
                    <select className="input" value={filtroAnio} onChange={e => setFiltroAnio(e.target.value ? Number(e.target.value) : "")}>
                        <option value="">Todos</option>
                        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </label>
                <label className="field" style={{ flex: 1, minWidth: 130 }}>
                    Mes
                    <select className="input" value={filtroMes} onChange={e => setFiltroMes(e.target.value ? Number(e.target.value) : "")}>
                        <option value="">Todos</option>
                        {MESES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                    </select>
                </label>
                <button className="btn btn-outline" style={{ alignSelf: "flex-end" }}
                    onClick={() => void cargar(filtroMes !== "" && filtroAnio === "" ? YEAR : filtroAnio, filtroMes)}>
                    Filtrar
                </button>
                {(filtroAnio !== "" || filtroMes !== "") && (
                    <button className="btn btn-ghost" style={{ alignSelf: "flex-end" }}
                        onClick={() => { setFiltroAnio(""); setFiltroMes(""); void cargar(); }}>
                        Limpiar
                    </button>
                )}
            </div>

            {/* Lista */}
            {loading ? (
                <TableSkeleton rows={6} cols={8} />
            ) : fiestas.length === 0 ? (
                <div className="card card-p">
                    <div className="empty">
                        <div className="empty-ico">🎉</div>
                        <div className="empty-title">Sin fiestas</div>
                        <div className="empty-sub">Registra la primera con el botón de arriba</div>
                    </div>
                </div>
            ) : (
                <>
                    <div className="card tbl-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Contratante</th><th>Cédula</th><th>Fecha</th>
                                    <th className="tr">Invitados</th><th>Duración</th>
                                    <th className="tr">Inv.</th><th className="tr">Hrs.</th>
                                    <th className="tr">Total</th><th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {fiestas.map(f => (
                                    <tr key={f.id}>
                                        <td className="hi">{f.nombreContratante}</td>
                                        <td className="mono">{f.cedulaContratante}</td>
                                        <td>{fmtDate(f.fechaFiesta)}</td>
                                        <td className="tr">{f.numInvitados.toLocaleString()}</td>
                                        <td>{durBadge(f.horasDuracion)}</td>
                                        <td className="tr mono">{money(f.montoInvitados)}</td>
                                        <td className="tr mono">{money(f.montoHoras)}</td>
                                        <td className="tr mono hi">{money(f.montoTotal)}</td>
                                        <td>
                                            <div style={{ display: "flex", gap: 5, justifyContent: "flex-end" }}>
                                                <button className="icon-btn" title="Editar" onClick={() => openEdit(f)}>✏️</button>
                                                <button className="icon-btn del" title="Eliminar" onClick={() => setConfirmDel(f)}>🗑️</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mob-cards">
                        {fiestas.map(f => (
                            <div key={f.id} className="card card-p ani" style={{ marginBottom: 10 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{f.nombreContratante}</div>
                                        <div className="mono" style={{ color: "var(--text-3)", marginTop: 1 }}>{f.cedulaContratante}</div>
                                    </div>
                                    <div style={{ display: "flex", gap: 5 }}>
                                        <button className="icon-btn" onClick={() => openEdit(f)}>✏️</button>
                                        <button className="icon-btn del" onClick={() => setConfirmDel(f)}>🗑️</button>
                                    </div>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: "0.8rem" }}>
                                    <div><div style={{ color: "var(--text-3)", marginBottom: 2 }}>Fecha</div><div style={{ fontWeight: 500 }}>{fmtDate(f.fechaFiesta)}</div></div>
                                    <div><div style={{ color: "var(--text-3)", marginBottom: 2 }}>Invitados</div><div style={{ fontWeight: 500 }}>{f.numInvitados.toLocaleString()}</div></div>
                                    <div><div style={{ color: "var(--text-3)", marginBottom: 2 }}>Duración</div>{durBadge(f.horasDuracion)}</div>
                                    <div><div style={{ color: "var(--text-3)", marginBottom: 2 }}>Total</div><div className="mono" style={{ color: "var(--accent-2)", fontWeight: 600 }}>{money(f.montoTotal)}</div></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Modal crear/editar */}
            {showModal && (
                <div className="backdrop" onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
                    <div className="modal">
                        <div className="modal-title">{editId !== null ? "Editar fiesta" : "Nueva fiesta"}</div>
                        <div className="modal-sub">{editId !== null ? "Modifica los datos" : "Completa los datos para registrar"}</div>
                        <form onSubmit={e => void handleSubmit(e)}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 18px" }}>
                                <label className="field" style={{ gridColumn: "1 / -1" }}>
                                    Cédula del contratante
                                    <input className="input" type="text" required maxLength={20}
                                        placeholder="Ej: 1001234567" value={form.cedula}
                                        onChange={e => setForm({ ...form, cedula: e.target.value })}
                                        disabled={editId !== null} />
                                </label>
                                <label className="field">
                                    Invitados
                                    <input className="input" type="number" required min={1} value={invStr}
                                        onChange={e => { setInvStr(e.target.value); const n = parseInt(e.target.value, 10); if (!isNaN(n)) setForm(f => ({ ...f, numInvitados: n })); }} />
                                </label>
                                <label className="field">
                                    Horas
                                    <input className="input" type="number" required min={0.5} step={0.5} value={hrsStr}
                                        onChange={e => { setHrsStr(e.target.value); const n = parseFloat(e.target.value); if (!isNaN(n)) setForm(f => ({ ...f, horasDuracion: n })); }} />
                                </label>
                                <label className="field" style={{ gridColumn: "1 / -1" }}>
                                    Fecha
                                    <input className="input" type="date" required value={form.fechaFiesta}
                                        onChange={e => setForm({ ...form, fechaFiesta: e.target.value })} />
                                </label>
                            </div>

                            {prevInv > 0 && (
                                <div style={{ marginTop: 14, padding: "10px 12px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", fontSize: "0.78rem", color: "var(--text-2)" }}>
                                    <div style={{ fontWeight: 600, color: "var(--text)", marginBottom: 5 }}>Vista previa</div>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                                        <span>Tarifa invitados</span><span className="mono">{tarifa.inv}</span>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <span>Tarifa horas</span><span className="mono">{tarifa.hrs}</span>
                                    </div>
                                </div>
                            )}

                            <div className="modal-foot">
                                <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancelar</button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? "Guardando…" : editId !== null ? "Actualizar" : "Registrar"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirmar eliminación */}
            {confirmDel !== null && (
                <div className="backdrop" onClick={e => { if (e.target === e.currentTarget) setConfirmDel(null); }}>
                    <div className="modal" style={{ maxWidth: 400 }}>
                        <div className="modal-title">¿Eliminar fiesta?</div>
                        <div className="modal-sub">
                            <strong>{confirmDel.nombreContratante}</strong> · {fmtDate(confirmDel.fechaFiesta)}<br />
                            Esta acción no se puede deshacer.
                        </div>
                        <div className="modal-foot">
                            <button className="btn btn-ghost" onClick={() => setConfirmDel(null)}>Cancelar</button>
                            <button className="btn btn-danger" disabled={deleting !== null}
                                onClick={() => void handleDelete(confirmDel)}>
                                {deleting === confirmDel.id ? "Eliminando…" : "Eliminar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
