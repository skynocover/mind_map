import { useCallback } from 'react';
import { useStore } from 'reactflow';

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
      <div className="mt-10">
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
      </div>
    </aside>
  );
};

export default Sidebar;
