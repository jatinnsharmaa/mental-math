import { useEffect, useState } from 'react';

export function Timer({ startedAt }: { startedAt: number }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setElapsed(Date.now() - startedAt), 100);
    return () => clearInterval(id);
  }, [startedAt]);
  return <span className="text-xs tabular-nums text-gray-400">{(elapsed / 1000).toFixed(1)}s</span>;
}
