import React, { useCallback } from 'react';
import * as antd from 'antd';

import { useNodesState, useEdgesState, useReactFlow, ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';

import { useParams, Link } from 'react-router-dom';

import { ProjectService } from '../utils/firestore';
import { AppContext } from '../AppContext';
import Sidebar from '../components/SideBar';
import Admin from '../components/Admin';
import Flow from '../components/Flow';

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
  const { getViewport, setViewport, project: rfProject } = useReactFlow();
  const [rfInstance, setRfInstance] = React.useState<any>(null);

  const [projectName, setProjectName] = React.useState<string>('');
  const [projectService, setProjectService] = React.useState<ProjectService>();
  const [debug, setDebug] = React.useState<boolean>(false);

  const { projectId } = useParams();

  const init = useCallback(async () => {
    const projectService = new ProjectService(projectId || '');
    await projectService.init();
    setProjectService(projectService);

    const project = projectService.getProject();
    // TODO: 刪除
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.project = project;

    const { projectName, flow } = project;
    setProjectName(projectName);

    if (flow) {
      const { x = 0, y = 0, zoom = 1 } = flow.viewport;
      setViewport({ x, y, zoom });
      setNodes(flow.nodes || []);
      setEdges(flow.edges || []);
    }
  }, [projectId, setEdges, setNodes, setViewport]);

  React.useEffect(() => {
    init();
  }, [projectId, appCtx.user, rfProject, init]);

  const onSave = useCallback(async () => {
    if (rfInstance) {
      const flow = rfInstance.toObject();

      if (projectService) {
        const project = projectService.getProject();
        await projectService?.updateProject({
          id: project.id,
          flow,
          projectName,
          public: project.public,
        });
      }
    }
  }, [rfInstance, projectService, projectName]);

  return (
    <div className="flex h-screen">
      <div className="flex-1 bg-slate-800">
        {appCtx.user && projectService && (
          <Admin projectService={projectService} rfInstance={rfInstance} refresh={init} />
        )}
        <div className="fixed right-0 z-10 flex space-x-2">
          {appCtx.user &&
            projectService &&
            projectService?.getAuth(appCtx.user.email || '', 'save') && (
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
        />
      </div>
      {debug && (
        <div className="w-96">
          <Sidebar nodes={nodes} setNodes={setNodes} />
        </div>
      )}
    </div>
  );
};

const Projects = () => (
  <ReactFlowProvider>
    <AddNodeOnEdgeDrop />
  </ReactFlowProvider>
);

export default Projects;
