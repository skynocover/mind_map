import React, { useCallback } from 'react';
import * as antd from 'antd';

import {
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useParams, Link } from 'react-router-dom';

import { ProjectService, Project } from '../utils/firestore';
import { AppContext } from '../AppContext';
import Sidebar from '../components/SideBar';
import Admin from '../components/Admin';
import Flow from '../components/Flow';
import { useProjectService } from '../hooks/useProjectService';

const initialNodes = [
  {
    id: '0',
    type: 'input',
    data: { label: 'Node' },
    position: { x: 0, y: 50 },
    width: 150,
    height: 40,
  },
];

const AddNodeOnEdgeDrop = () => {
  const appCtx = React.useContext(AppContext);

  const [nodes, setNodes] = useNodesState(initialNodes);
  const [edges, setEdges] = useEdgesState([]);
  const { getViewport, setViewport } = useReactFlow();
  const [rfInstance, setRfInstance] = React.useState<ReactFlowInstance>();

  const [debug, setDebug] = React.useState<boolean>(false);

  const { projectId = '' } = useParams();
  // 使用Hook整理 code
  const { projectService, project, updateProject, getAuth, refresh } = useProjectService(projectId);

  React.useEffect(() => {
    // TODO: 刪除
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.project = project;

    if (project?.flow) {
      const { x = 0, y = 0, zoom = 1 } = project.flow.viewport;
      setViewport({ x, y, zoom });
      setNodes(project.flow.nodes || []);
      setEdges(project.flow.edges || []);
    }
  }, [project, setEdges, setNodes, setViewport]);

  const onSave = useCallback(async () => {
    if (rfInstance && project) {
      const flow = rfInstance.toObject();
      await updateProject({ ...project, flow });
    }
  }, [project, rfInstance, updateProject]);

  // 避免projectService在每次重新渲染時重新創建
  const ps = React.useMemo(() => projectService, [projectService]);

  return (
    <div className="flex h-screen">
      <div className="flex-1">
        {ps && getAuth(appCtx.user?.email || '', 'readAdmin') && (
          <Admin projectService={ps} rfInstance={rfInstance} refresh={refresh} />
        )}
        <div className="fixed right-0 z-10 flex space-x-2">
          {getAuth(appCtx.user?.email || '', 'save') && (
            <antd.Button type="primary" onClick={onSave}>
              save
            </antd.Button>
          )}

          {appCtx.user && (
            <antd.Button type="primary">
              <Link to={'/projects'}>Home</Link>
            </antd.Button>
          )}
          <antd.Button type="primary" onClick={() => setDebug(!debug)}>
            Show Debug
          </antd.Button>
        </div>

        <Flow
          initialNodes={nodes}
          initialEdges={edges}
          initialViewport={getViewport()}
          setRfInstance={setRfInstance}
          rfInstance={rfInstance}
        />
      </div>
      {project && <Sidebar nodes={nodes} project={project} show={debug} />}
    </div>
  );
};

const Projects = () => (
  <ReactFlowProvider>
    <AddNodeOnEdgeDrop />
  </ReactFlowProvider>
);

export default Projects;
