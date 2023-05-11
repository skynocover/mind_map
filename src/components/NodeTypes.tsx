import { NodeProps, Handle, Position } from 'reactflow';

const DiamondNode = ({ id, data }: NodeProps) => {
  return (
    <div id={id} className="relative" style={{ width: 150, height: 60 }}>
      <div className="text-base">{data.label}</div>
      <div className="bg-white"></div>
      <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
      <Handle type="source" position={Position.Right} id="a" style={{ background: '#555' }} />
      <Handle type="source" position={Position.Left} id="b" style={{ background: '#555' }} />
    </div>
  );
};

export const nodeTypes = {
  diamondNode: DiamondNode,
};
