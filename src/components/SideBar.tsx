import * as antd from 'antd';
import { useCallback } from 'react';
import { useStore, Node } from 'reactflow';
import ReactJson from 'react-json-view';
import { Project } from '../utils/firestore';

const Sidebar = ({ nodes, project }: { nodes: Node[]; project: Project }) => {
  const transform = useStore((state: any) => state.transform);
  const { flow } = project;

  return (
    <aside>
      <div className="mt-10">
        <antd.Collapse defaultActiveKey={['2', '3']}>
          <antd.Collapse.Panel header="Flow" key="1">
            <ReactJson src={flow} />
          </antd.Collapse.Panel>
          <antd.Collapse.Panel header="Zoom & pan transform" key="2">
            <div>
              [{transform[0].toFixed(2)}, {transform[1].toFixed(2)}, {transform[2].toFixed(2)}]
            </div>
          </antd.Collapse.Panel>
          <antd.Collapse.Panel header="Nodes" key="3">
            {nodes.map((node: any) => (
              <div key={node.id}>
                Node {node.id} - x: {node.position.x.toFixed(2)}, y: {node.position.y.toFixed(2)}
              </div>
            ))}
          </antd.Collapse.Panel>
        </antd.Collapse>
      </div>
    </aside>
  );
};

export default Sidebar;
