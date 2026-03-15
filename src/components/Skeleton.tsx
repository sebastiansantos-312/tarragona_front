export function Skeleton({ w = "100%", h = "14px" }: { w?: string; h?: string }) {
  return <div className="skeleton" style={{ width: w, height: h }} />;
}

export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="card">
      <div className="tbl-wrap">
        <table>
          <thead>
            <tr>{Array.from({ length: cols }, (_, i) => <th key={i}><Skeleton h="10px" w={i === 0 ? "100px" : "64px"} /></th>)}</tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }, (_, r) => (
              <tr key={r}>{Array.from({ length: cols }, (_, c) => <td key={c}><Skeleton h="13px" w={c === 0 ? "120px" : "60px"} /></td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="stat-grid">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="card" style={{ padding: "18px 20px" }}>
          <Skeleton h="9px" w="70px" />
          <div style={{ marginTop: 10 }}><Skeleton h="28px" w="90px" /></div>
        </div>
      ))}
    </div>
  );
}
