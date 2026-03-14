interface SkeletonProps {
  readonly width?: string;
  readonly height?: string;
  readonly className?: string;
}

export function Skeleton({ width = "100%", height = "16px", className = "" }: SkeletonProps) {
  return <div className={`skeleton ${className}`} style={{ width, height }} />;
}

export function TableSkeleton({ rows = 5, cols = 5 }: { readonly rows?: number; readonly cols?: number }) {
  return (
    <div className="card">
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {Array.from({ length: cols }, (_, i) => (
                <th key={`h-${i}`}>
                  <Skeleton height="12px" width={i === 0 ? "120px" : "80px"} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }, (_, r) => (
              <tr key={`r-${r}`}>
                {Array.from({ length: cols }, (_, c) => (
                  <td key={`c-${c}`}>
                    <Skeleton height="14px" width={c === 0 ? "140px" : "70px"} />
                  </td>
                ))}
              </tr>
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
        <div key={`s-${i}`} className="card" style={{ padding: "20px 22px" }}>
          <Skeleton height="10px" width="80px" />
          <div style={{ marginTop: 10 }}>
            <Skeleton height="32px" width="100px" />
          </div>
        </div>
      ))}
    </div>
  );
}