import React, { useCallback, useRef, useMemo } from 'react';
import * as antd from 'antd';
import ReactFlow, {
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  ReactFlowProvider,
  Controls,
  Node,
  Edge,
  XYPosition,
} from 'reactflow';

import 'reactflow/dist/style.css';

import { useParams, Link } from 'react-router-dom';
import { ProjectService, Project } from '../utils/firestore';
import { AppContext } from '../AppContext';
import Sidebar from '../components/SideBar';
import Admin from '../components/Admin';

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

const getNewNode = (position: XYPosition): Node => {
  const id = `${+new Date()}`;
  return {
    id,
    data: { label: `Node ${id}` },
    position,
  };
};

const fitViewOptions = { padding: 3 };

let preX = 0;
let preY = 0;
let changeNodeIds: string[] = [];

const AddNodeOnEdgeDrop = () => {
  const appCtx = React.useContext(AppContext);
  const reactFlowWrapper: any = useRef<any>(null);
  const connectingNodeId = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { setViewport, project } = useReactFlow();

  const [rfInstance, setRfInstance] = React.useState<any>(null);
  const [projectName, setProjectName] = React.useState<string>('');
  const [projectService, setProjectService] = React.useState<ProjectService>();
  const [debug, setDebug] = React.useState<boolean>(false);

  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), []);

  const onConnectStart = useCallback((_: any, { nodeId }: any) => {
    connectingNodeId.current = nodeId;
  }, []);

  const { projectId } = useParams();

  const init = useCallback(async () => {
    const projectService = new ProjectService(projectId || '');
    await projectService.init();
    setProjectService(projectService);
    const project = projectService.getProject();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.project = project;
    if (project) {
      const { projectName, flow } = project;
      setProjectName(projectName);
      if (flow) {
        const { x = 0, y = 0, zoom = 1 } = flow.viewport;
        setViewport({ x, y, zoom });
        setNodes(flow.nodes || []);
        setEdges(flow.edges || []);
      }
    }
  }, [projectId, setEdges, setNodes, setViewport]);

  React.useEffect(() => {
    init();
  }, [projectId, appCtx.user, project, init]);

  const onConnectEnd = useCallback(
    (event: any) => {
      const targetIsPane = event.target.classList.contains('react-flow__pane');

      if (targetIsPane) {
        // eslint-disable-next-line no-unsafe-optional-chaining
        const { top, left } = reactFlowWrapper?.current?.getBoundingClientRect();

        const newNode = getNewNode(
          project({ x: event.clientX - left - 75, y: event.clientY - top }),
        );
        setNodes((nds: any[]) => nds.concat(newNode));
        setEdges((eds: any[]) =>
          eds.concat({ id: newNode.id, source: connectingNodeId.current, target: newNode.id }),
        );
      }
    },
    [project],
  );

  const onNodeDoubleClick = (event: any, node: Node) => {
    const label = prompt('Enter a new label for the node:', node.data.label);

    if (label) {
      const updatedNode = {
        ...node,
        data: {
          ...node.data,
          label,
        },
      };

      setNodes((els) => els.map((el) => (el.id === updatedNode.id ? updatedNode : el)));
    }
  };

  const onSave = useCallback(async () => {
    if (rfInstance) {
      const flow = rfInstance.toObject();
      // localStorage.setItem('temp', JSON.stringify(flow));

      if (appCtx.user && projectId) {
        await projectService?.setProject({ id: projectId, flow, projectName });
      }
    }
  }, [rfInstance, projectName]);

  const onNodeDragStart = (_: React.MouseEvent<Element, MouseEvent>, node: Node) => {
    preX = node.position.x;
    preY = node.position.y;
    // 取得所有需要改變的子node
    changeNodeIds = findChildNodes(node.id).map((node) => node.id);
  };

  const findChildNodes = (nodeId: string): Edge[] => {
    const childNodes = edges.filter((edge) => edge.source === nodeId);
    return childNodes.flatMap((childNode) => [childNode, ...findChildNodes(childNode.id)]);
  };

  const onNodeDrag = (_: React.MouseEvent<Element, MouseEvent>, node: Node) => {
    const dx = node.position.x - preX;
    const dy = node.position.y - preY;
    preX = node.position.x;
    preY = node.position.y;

    const newNodes = nodes.map((nd) => {
      if (changeNodeIds.includes(nd.id) || nd.id === node.id) {
        return { ...nd, position: { x: nd.position.x + dx, y: nd.position.y + dy } };
      }
      return nd;
    });
    setNodes(newNodes);
  };

  return (
    <div className="flex h-screen">
      <div className="flex-1 bg-black" ref={reactFlowWrapper}>
        {appCtx.user && projectService && (
          <Admin projectService={projectService} rfInstance={rfInstance} refresh={init} />
        )}
        <div className="flex fixed right-0 z-10 space-x-2">
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

        <ReactFlow
          onNodeDragStart={onNodeDragStart}
          onNodeDrag={onNodeDrag}
          // onNodeDragStop={onNodeDragStop}
          onNodeDoubleClick={onNodeDoubleClick}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onConnectStart={onConnectStart}
          onConnectEnd={onConnectEnd}
          fitView
          fitViewOptions={fitViewOptions}
          onInit={setRfInstance}
        >
          <Controls />
        </ReactFlow>
        <div className=""></div>
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
