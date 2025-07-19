import React from 'react';

// Define type (replace later)
interface SankeyData {
  nodes: { id: string; name?: string }[];
  links: { source: string; target: string; value: number }[];
}

interface SankeyDiagramProps {
  data: SankeyData;
  title?: string;
}

export default function SankeyDiagram({ data, title }: SankeyDiagramProps) {
  return (
    <div
      className="rounded-2xl bg-gradient-to-br from-indigo-900/60 to-slate-900/80 p-6 shadow"
      aria-label={`Sankey Diagram: ${title ?? 'Unnamed'}`}
    >
      {title && <div className="text-white font-bold mb-2">{title}</div>}
      {data?.nodes?.length ? (
        <>
          <div className="text-slate-400">[Sankey diagram placeholder]</div>
          {/* TODO: Replace with actual Sankey component */}
        </>
      ) : (
        <div className="text-slate-500 italic">No data available</div>
      )}
    </div>
  );
}
