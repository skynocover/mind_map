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

const Flow = ({ initialNodes = defaultNodes }: { initialNodes?: Node[] }) => {
  const reactFlowWrapper: any = useRef(null);
  const connectingNodeId = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { project } = useReactFlow();

  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), []);

  const onConnectStart = useCallback((_: any, { nodeId }: any) => {
    connectingNodeId.current = nodeId;
  }, []);

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
    <div className="flex h-screen bg-black" ref={reactFlowWrapper}>
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
      >
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default Flow;
