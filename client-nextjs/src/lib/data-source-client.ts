export async function createDataSourceAPI(payload: {
  type: string;
  name: string;
  config: Record<string, any>;
}) {
  const res = await fetch('/api/data-source', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Unknown error');
  return res.json(); // { success: true }
}