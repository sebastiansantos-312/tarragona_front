import { useEffect, useState } from "react";
import type { ClienteResponse } from "../types";
import { listarClientes, buscarCliente, crearCliente } from "../services/api";

export default function ClientesPage() {
    const [clientes, setClientes] = useState<ClienteResponse[]>([]);
    const [busqueda, setBusqueda] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // form crear
    const [showForm, setShowForm] = useState(false);
    const [cedula, setCedula] = useState("");
    const [nombre, setNombre] = useState("");

    const cargar = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await listarClientes();
            setClientes(data);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Error al cargar clientes");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargar();
    }, []);

    const handleBuscar = async () => {
        if (!busqueda.trim()) {
            cargar();
            return;
        }
        setLoading(true);
        setError("");
        try {
            const data = await buscarCliente(busqueda.trim());
            setClientes([data]);
        } catch (err: unknown) {
            setClientes([]);
            setError(err instanceof Error ? err.message : "Cliente no encontrado");
        } finally {
            setLoading(false);
        }
    };

    const handleCrear = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        try {
            const data = await crearCliente({ cedula, nombre });
            setSuccess(`Cliente "${data.nombre}" creado exitosamente`);
            setCedula("");
            setNombre("");
            setShowForm(false);
            cargar();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Error al crear cliente");
        }
    };

    const filtrados = busqueda.trim()
        ? clientes
        : clientes;

    return (
        <div className="page">
            <div className="page-header">
                <h1>Clientes</h1>
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                    {showForm ? "Cancelar" : "+ Nuevo Cliente"}
                </button>
            </div>

            {/* Form crear */}
            {showForm && (
                <div className="card form-card" style={{ maxWidth: 480 }}>
                    <h2>Crear cliente</h2>
                    <form onSubmit={handleCrear}>
                        <label>
                            Cédula
                            <input
                                type="text"
                                required
                                maxLength={20}
                                value={cedula}
                                onChange={(e) => setCedula(e.target.value)}
                                placeholder="Ej: 12345678"
                            />
                        </label>
                        <label>
                            Nombre
                            <input
                                type="text"
                                maxLength={100}
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                placeholder="Nombre completo"
                            />
                        </label>
                        <button className="btn btn-primary" type="submit">
                            Crear Cliente
                        </button>
                    </form>
                </div>
            )}

            {/* Barra de búsqueda */}
            <div className="card filter-bar">
                <label style={{ flex: 1, marginBottom: 0 }}>
                    Buscar por cédula
                    <input
                        type="text"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        placeholder="Ingresa la cédula…"
                        onKeyDown={(e) => e.key === "Enter" && handleBuscar()}
                    />
                </label>
                <button className="btn btn-secondary" onClick={handleBuscar}>Buscar</button>
                {busqueda && (
                    <button className="btn btn-ghost" onClick={() => { setBusqueda(""); cargar(); }}>
                        Limpiar
                    </button>
                )}
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {/* Tabla */}
            {loading ? (
                <p className="text-center">Cargando…</p>
            ) : (
                <div className="card table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Cédula</th>
                                <th>ID</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtrados.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="text-center">No hay clientes</td>
                                </tr>
                            ) : (
                                filtrados.map((c) => (
                                    <tr key={c.id}>
                                        <td>{c.nombre}</td>
                                        <td>{c.cedula}</td>
                                        <td><code style={{ fontSize: "0.75rem" }}>{c.id}</code></td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
