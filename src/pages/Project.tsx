import React, { useCallback, useRef } from 'react';
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
import { getProject, setProject } from '../utils/firestore';
import { AppContext } from '../AppContext';
import Sidebar from '../components/SideBar';

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

  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), []);

  const onConnectStart = useCallback((_: any, { nodeId }: any) => {
    connectingNodeId.current = nodeId;
  }, []);

  const { projectId } = useParams();

  const init = async () => {
    if (appCtx.user && projectId) {
      const project = await getProject(appCtx.user.uid, projectId);
      if (project) {
        const { projectName, flow } = project;
        setProjectName(projectName);
        if (flow) {
          const { x = 0, y = 0, zoom = 1 } = flow.viewport;
          console.log({ x, y, zoom });
          setViewport({ x, y, zoom });
          setNodes(flow.nodes || []);
          setEdges(flow.edges || []);
        }
      }
    }
  };
  React.useEffect(() => {
    init();
  }, [projectId, appCtx.user, project]);

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
        await setProject(appCtx.user.uid, { id: projectId, flow, projectName });
      }
    }
  }, [rfInstance, projectName]);

  const changeName = () => {
    const projectName = prompt('修改專案名稱: ');
    if (projectName) {
      setProjectName(projectName);
      if (rfInstance) {
        const flow = rfInstance.toObject();
        if (appCtx.user && projectId) {
          setProject(appCtx.user.uid, { id: projectId, flow, projectName });
        }
      }
    }
  };

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

    // const changeNodeIds = findChildNodes(node.id).map((node) => node.id);
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
      </div>
      <div className="w-96">
        <div className="flex justify-end space-x-2">
          <antd.Button onClick={changeName}>{'專案: ' + projectName}</antd.Button>
          <antd.Button type="primary" onClick={onSave}>
            save
          </antd.Button>
          {/* <antd.Button onClick={onAdd}>add node</antd.Button> */}
          <antd.Button type="primary">
            <Link to={'/projects'}>GoBack</Link>
          </antd.Button>
        </div>
        <Sidebar nodes={nodes} setNodes={setNodes} />
      </div>
    </div>
  );
};

const Projects = () => (
  <ReactFlowProvider>
    <AddNodeOnEdgeDrop />
  </ReactFlowProvider>
);

export default Projects;
