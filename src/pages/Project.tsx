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
} from 'reactflow';

import 'reactflow/dist/style.css';
import { getAuth } from 'firebase/auth';
import { useParams, Link } from 'react-router-dom';
import { getProject, setProject } from '../utils/firestore';

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

const getNewNode = (x: number, y: number): Node => {
  const id = `RNN_${+new Date()}`;
  return {
    id,
    data: { label: `Node ${id}` },
    position: { x, y },
  };
};

const fitViewOptions = {
  padding: 3,
};

const AddNodeOnEdgeDrop = () => {
  const reactFlowWrapper: any = useRef<any>(null);
  const connectingNodeId = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [rfInstance, setRfInstance] = React.useState<any>(null);
  const { getViewport, setViewport } = useReactFlow();
  const [projectName, setProjectName] = React.useState<string>('');

  const { project } = useReactFlow();
  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), []);

  const onConnectStart = useCallback((_: any, { nodeId }: any) => {
    connectingNodeId.current = nodeId;
  }, []);

  const { projectId } = useParams();
  const auth = getAuth();
  const user = auth.currentUser;

  const init = async () => {
    if (user && projectId) {
      const project = await getProject(user.uid, projectId);
      if (project) {
        const { projectName, flow } = project;
        setProjectName(projectName);
        if (flow) {
          // const { x = 0, y = 0, zoom = 1 } = flow.viewport;
          setViewport(flow.viewport);
          setNodes(flow.nodes || []);
          setEdges(flow.edges || []);
          // setViewport({ x, y, zoom });
        }
      }
    }
  };
  React.useEffect(() => {
    init();
  }, [projectId]);

  const onConnectEnd = useCallback(
    (event: any) => {
      const targetIsPane = event.target.classList.contains('react-flow__pane');

      if (targetIsPane) {
        // we need to remove the wrapper bounds, in order to get the correct position
        // eslint-disable-next-line no-unsafe-optional-chaining
        const { top, left } = reactFlowWrapper?.current?.getBoundingClientRect();
        console.log({ x: event.clientX, left, y: event.clientY, top });

        const newNode = getNewNode(event.clientX - 700, event.clientY - 350);
        setNodes((nds: any[]) => nds.concat(newNode));
        setEdges((eds: any[]) =>
          eds.concat({ id: newNode.id, source: connectingNodeId.current, target: newNode.id }),
        );
      }
    },
    [project],
  );

  const onNodeDoubleClick = (event: any, node: any) => {
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
    console.log('aaaa', projectName);
    if (rfInstance) {
      const flow = rfInstance.toObject();
      // localStorage.setItem('temp', JSON.stringify(flow));

      const user = auth.currentUser;
      if (user && projectId) {
        await setProject(user.uid, { id: projectId, flow, projectName });
      }
    }
  }, [rfInstance, projectName]);

  const changeName = () => {
    const projectName = prompt('修改專案名稱: ');
    if (projectName) {
      setProjectName(projectName);
      if (rfInstance) {
        const flow = rfInstance.toObject();
        const user = auth.currentUser;
        if (user && projectId) {
          setProject(user.uid, { id: projectId, flow, projectName });
        }
      }
    }
  };

  const onRestore = useCallback(() => {
    // const restoreFlow = async () => {
    //   const flow = JSON.parse(localStorage.getItem('temp') || '');
    //   if (flow) {
    //     const { x = 0, y = 0, zoom = 1 } = flow.viewport;
    //     setNodes(flow.nodes || []);
    //     setEdges(flow.edges || []);
    //     setViewport({ x, y, zoom });
    //   }
    // };
    // restoreFlow();
  }, [setNodes, setViewport]);

  const onAdd = useCallback(() => {
    // setNodes((nds) =>
    //   nds.concat(
    //     getNewNode(Math.random() * window.innerWidth - 100, Math.random() * window.innerHeight),
    //   ),
    // );
  }, [setNodes]);

  return (
    <div
      className="flex"
      ref={reactFlowWrapper}
      style={{ width: '1200px', height: '900px', backgroundColor: 'black' }}
    >
      <div className="save__controls">
        <antd.Button onClick={changeName}>{'專案: ' + projectName}</antd.Button>
        <antd.Button onClick={onSave}>save</antd.Button>
        {/* <antd.Button onClick={onAdd}>add node</antd.Button> */}
        <antd.Button>
          <Link to={'/projects'}>GoBack</Link>
        </antd.Button>
      </div>
      <ReactFlow
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
      <Sidebar nodes={nodes} setNodes={setNodes} />
    </div>
  );
};

const Projects = () => (
  <ReactFlowProvider>
    <AddNodeOnEdgeDrop />
  </ReactFlowProvider>
);

export default Projects;
