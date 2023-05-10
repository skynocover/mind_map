import { NodeProps, Handle, Position } from 'reactflow';

const DiamondNode = ({ id, data }: NodeProps) => {
  return (
    <div id={id} className="relative flex flex-col" style={{ width: 150, height: 60 }}>
      <div className="text-base">{data.label}</div>
      <div
        className="absolute flex-grow transform -translate-x-1/2 -translate-y-1/2 border-t-0 border-b-8 border-l-0 border-r-0 border-white border-solid -z-10 top-1/2 left-1/2"
        style={{
          borderBottom: '50px solid white',
          borderLeft: '50px solid transparent',
          borderRight: '50px solid transparent',
          width: 150,
          height: 40,
        }}
      ></div>
      <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
      <Handle type="source" position={Position.Right} id="a" style={{ background: '#555' }} />
      <Handle type="source" position={Position.Left} id="b" style={{ background: '#555' }} />
    </div>
  );
};

export const nodeTypes = {
  diamondNode: DiamondNode,
};
