import React, { useState, useEffect } from 'react';

interface Stats {
  jobs?: {
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  };
}

export function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch('/queuekit/stats')
      .then((r) => r.json())
      .then(setStats)
      .catch(() => setStats({}));
  }, []);

  if (!stats) return <div>Loading...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>QueueKit Dashboard</h1>
      <div>
        <p>Pending: {stats.jobs?.pending ?? 0}</p>
        <p>Processing: {stats.jobs?.processing ?? 0}</p>
        <p>Completed: {stats.jobs?.completed ?? 0}</p>
        <p>Failed: {stats.jobs?.failed ?? 0}</p>
      </div>
    </div>
  );
}
