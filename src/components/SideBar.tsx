import * as antd from 'antd';
import React from 'react';
import ReactJson from 'react-json-view';
import { useStore, ReactFlowState } from 'reactflow';

import { Project } from '../utils/firestore';
import { FlowContext } from '../components/FlowContext';

const Sidebar = ({ project }: { project: Project }) => {
  const { nodes } = React.useContext(FlowContext);
  const transform = useStore((state: ReactFlowState) => state.transform);

  return (
    <aside>
      <div className="mt-10 w-96">
        <antd.Collapse defaultActiveKey={['2', '3']}>
          <antd.Collapse.Panel header="Flow" key="1">
            <ReactJson src={project.flow} />
          </antd.Collapse.Panel>
          <antd.Collapse.Panel header="Zoom & pan transform" key="2">
            <div>
              [{transform[0].toFixed(2)}, {transform[1].toFixed(2)}, {transform[2].toFixed(2)}]
            </div>
          </antd.Collapse.Panel>
          <antd.Collapse.Panel header="Nodes" key="3">
            {nodes.map((node) => (
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
