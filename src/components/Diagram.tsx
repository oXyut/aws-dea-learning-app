import { Workflow, Layers3, Database, Shield, Radio, Cpu, Boxes, Activity } from 'lucide-react';
import { categories, serviceMap, type Service } from '../data/services';
import { type Pattern, type FlowNode } from '../data/patterns';

export const icons = {
  ingestion: Radio,
  storage: Database,
  processing: Cpu,
  catalog: Boxes,
  analytics: Layers3,
  orchestration: Workflow,
  security: Shield,
  monitoring: Activity,
};
export function ServiceIcon({ service, size = 22 }: { service?: Service; size?: number }) {
  const Icon = service ? icons[service.category] : Boxes;
  return <Icon size={size} />;
}
export function colorFor(service?: Service) {
  return categories.find((c) => c.id === service?.category)?.color || '#a4b3c7';
}
export function Diagram({
  pattern,
  selected,
  onSelect,
  playing,
}: {
  pattern: Pattern;
  selected: string;
  onSelect: (id: string) => void;
  playing: boolean;
}) {
  const w = 1000,
    h = 445;
  const pathFor = (from: FlowNode, to: FlowNode, bend?: number) => {
    const sx = from.x + 154,
      sy = from.y + 51,
      tx = to.x,
      ty = to.y + 51;
    if (bend)
      return `M ${from.x + 77} ${from.y + 102} C ${from.x + 77} ${from.y + 102 + bend}, ${to.x + 77} ${to.y + 102 + bend}, ${to.x + 77} ${to.y + 102}`;
    if (from.x === to.x) return `M ${from.x + 77} ${from.y + 102} L ${to.x + 77} ${to.y}`;
    return `M ${sx} ${sy} C ${(sx + tx) / 2} ${sy}, ${(sx + tx) / 2} ${ty}, ${tx} ${ty}`;
  };
  return (
    <div
      role="region"
      aria-label={`${pattern.name}のデータフロー図。左右にスクロールできます`}
      tabIndex={0}
      className={`diagram-scroll ${playing ? '' : 'paused'}`}
    >
      <ul className="sr-only">
        {pattern.edges.map((edge, i) => {
          const from = pattern.nodes.find((n) => n.id === edge.from)!;
          const to = pattern.nodes.find((n) => n.id === edge.to)!;
          return (
            <li key={i}>
              {from.service ? serviceMap[from.service].short : from.label}から
              {to.service ? serviceMap[to.service].short : to.label}へ、{edge.label}（
              {edge.kind === 'data'
                ? '実データ'
                : edge.kind === 'metadata'
                  ? 'メタデータ'
                  : '制御イベント'}
              ）
            </li>
          );
        })}
      </ul>
      <div className="diagram-board">
        <svg viewBox={`0 0 ${w} ${h}`} aria-hidden="true" className="connections">
          <defs>
            {['data', 'metadata', 'event'].map((k) => (
              <marker
                key={k}
                id={`arrow-${k}`}
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" className={`arrow-${k}`} />
              </marker>
            ))}
          </defs>
          {pattern.edges.map((edge, i) => {
            const from = pattern.nodes.find((n) => n.id === edge.from)!,
              to = pattern.nodes.find((n) => n.id === edge.to)!;
            const path = pathFor(from, to, edge.bend);
            const lx =
              from.x === to.x
                ? from.x + 116
                : edge.bend
                  ? (from.x + to.x) / 2 + 77
                  : (from.x + 154 + to.x) / 2;
            const ly = edge.bend
              ? (from.y + to.y) / 2 + 102 + edge.bend * 0.75 + 20
              : from.x === to.x
                ? (from.y + 102 + to.y) / 2
                : (from.y + to.y) / 2 + 30;
            return (
              <g key={i}>
                <path
                  d={path}
                  className={`edge ${edge.kind}`}
                  markerEnd={`url(#arrow-${edge.kind})`}
                />
                <path
                  d={path}
                  className={`flow-pulse ${edge.kind}`}
                  style={{ animationDelay: `-${i * 0.8}s` }}
                />
                <text x={lx} y={ly} className={`edge-label ${edge.kind}`} textAnchor="middle">
                  {edge.label}
                </text>
              </g>
            );
          })}
        </svg>
        {pattern.nodes.map((node, i) => {
          const service = node.service ? serviceMap[node.service] : undefined;
          return (
            <button
              key={node.id}
              className={`flow-node ${selected === node.id ? 'selected' : ''}`}
              style={
                {
                  left: `${(node.x / w) * 100}%`,
                  top: `${(node.y / h) * 100}%`,
                  '--accent': colorFor(service),
                } as React.CSSProperties
              }
              onClick={() => onSelect(node.id)}
              aria-pressed={selected === node.id}
            >
              <span className="node-top">
                <span className="node-icon">
                  <ServiceIcon service={service} />
                </span>
                <span className="node-number">{String(i + 1).padStart(2, '0')}</span>
              </span>
              <strong>{service?.short || node.label}</strong>
              <span className="node-subtitle">{node.subtitle}</span>
            </button>
          );
        })}
        <span className="canvas-note">
          <span className="tiny-dot" />
          AWS CLOUD · CONCEPTUAL ARCHITECTURE
        </span>
      </div>
    </div>
  );
}
