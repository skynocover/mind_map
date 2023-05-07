import React, { useCallback, useRef } from 'react';
import ReactFlow, {
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  ReactFlowProvider,
  useStore,
  Controls,
} from 'reactflow';

const transformSelector = (state: any) => state.transform;
const Sidebar = ({ nodes, setNodes }: any) => {
  const transform = useStore(transformSelector);

  const selectAll = useCallback(() => {
    setNodes((nds: any) =>
      nds.map((node: any) => {
        node.selected = true;
        return node;
      }),
    );
  }, [setNodes]);

  return (
    <aside>
      <div className="description">
        This is an example of how you can access the internal state outside of the ReactFlow
        component.
      </div>
      <div className="title">Zoom & pan transform</div>
      <div className="transform">
        [{transform[0].toFixed(2)}, {transform[1].toFixed(2)}, {transform[2].toFixed(2)}]
      </div>
      <div className="title">Nodes</div>
      {nodes.map((node: any) => (
        <div key={node.id}>
          Node {node.id} - x: {node.position.x.toFixed(2)}, y: {node.position.y.toFixed(2)}
        </div>
      ))}

      <div className="selectall">
        <button onClick={selectAll}>select all nodes</button>
      </div>
    </aside>
  );
};

export default Sidebar;
