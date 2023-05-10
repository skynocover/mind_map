import React, { useCallback, useRef } from 'react';

import ReactFlow, {
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  Controls,
  Node,
  Edge,
  XYPosition,
  Connection,
  MiniMap,
  Background,
  OnConnectStartParams,
  Viewport,
} from 'reactflow';

const defaultNodes: Node[] = [
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
  return { id, data: { label: `Node ${id}` }, position };
};

const fitViewOptions = { padding: 3 };
const minimapStyle = { height: 100 };

let preX = 0;
let preY = 0;
let changeNodeIds: string[] = [];

const Flow = ({
  initialNodes = defaultNodes,
  initialEdges,
  initialViewport,
  setRfInstance,
}: {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  initialViewport?: Viewport;
  setRfInstance?: React.Dispatch<any>;
}) => {
  ////////////////////////////////////     功能     ////////////////////////////////////

  //////////////////////////////////     Setting     //////////////////////////////////
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null);
  const connectingNodeId = useRef<string | null>('');
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { setViewport, project: rfProject } = useReactFlow();

  React.useEffect(() => {
    setNodes(initialNodes);
    if (initialEdges) {
      setEdges(initialEdges);
    }
    if (initialViewport) {
      setViewport(initialViewport);
    }
  }, [initialNodes, initialEdges, initialViewport, setNodes, setEdges, setViewport]);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onConnectStart = useCallback(
    (_: React.MouseEvent | React.TouchEvent, { nodeId }: OnConnectStartParams) => {
      connectingNodeId.current = nodeId;
    },
    [],
  );

  const onConnectEnd = useCallback(
    (event: any) => {
      const targetIsPane = event.target.classList.contains('react-flow__pane');

      if (targetIsPane && reactFlowWrapper?.current) {
        const { top, left } = reactFlowWrapper.current.getBoundingClientRect() || {
          top: 0,
          left: 0,
        };

        const newNode = getNewNode(
          rfProject({ x: event.clientX - left - 75, y: event.clientY - top }),
        );
        setNodes((nds) => nds.concat(newNode));
        setEdges((eds) =>
          eds.concat({
            id: newNode.id,
            source: connectingNodeId.current || '',
            target: newNode.id,
          }),
        );
      }
    },
    [rfProject, setEdges, setNodes],
  );

  const onNodeDoubleClick = (_: React.MouseEvent, node: Node) => {
    const label = prompt('Enter a new label for the node:', node.data.label);

    if (label) {
      const updatedNode = { ...node, data: { ...node.data, label } };
      setNodes((els) => els.map((el) => (el.id === updatedNode.id ? updatedNode : el)));
    }
  };

  const findChildNodes = (nodeId: string): Edge[] => {
    const childNodes = edges.filter((edge) => edge.source === nodeId);
    return childNodes.flatMap((childNode) => [childNode, ...findChildNodes(childNode.id)]);
  };

  const onNodeDragStart = (_: React.MouseEvent<Element, MouseEvent>, node: Node) => {
    preX = node.position.x;
    preY = node.position.y;
    // 取得所有需要改變的子node
    changeNodeIds = findChildNodes(node.id).map((node) => node.id);
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
    <div className="flex h-screen bg-slate-800" ref={reactFlowWrapper}>
      <ReactFlow
        onNodeDragStart={onNodeDragStart}
        onNodeDrag={onNodeDrag}
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
        <MiniMap style={minimapStyle} zoomable pannable />
        <Background color="#aaa" gap={16} />
      </ReactFlow>
    </div>
  );
};

export default Flow;
