import React, { useCallback, useRef } from 'react';
import ReactFlow, {
  addEdge,
  Controls,
  Node,
  Edge,
  XYPosition,
  Connection,
  MiniMap,
  Background,
  OnConnectStartParams,
} from 'reactflow';

import { DiamondNode } from './NodeTypes/DiamondNode';
import { FlowContext } from '../components/FlowContext';

const nodeTypes = {
  diamondNode: DiamondNode,
};

const getNewNode = (position: XYPosition, type = 'default'): Node => {
  const id = `${+new Date()}`;
  return { id, data: { label: `Node ${id}` }, position, type };
};

const fitViewOptions = { padding: 3 };
const minimapStyle = { height: 100 };

let preX = 0;
let preY = 0;
let changeNodeIds: string[] = [];
let connecting = false;

const Flow = () => {
  ////////////////////////////////////     功能     ////////////////////////////////////

  //////////////////////////////////     Setting     //////////////////////////////////
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null);
  const connectingNodeId = useRef<string | null>('');
  const connectingHandleId = useRef<string | null>('');

  const {
    nodes,
    setNodes,
    edges,
    setEdges,
    rfInstance,
    setRfInstance,
    rfProject,
    onNodesChange,
    onEdgesChange,
  } = React.useContext(FlowContext);

  const onConnect = useCallback(
    (params: Edge | Connection) => {
      connecting = true;
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges],
  );

  const onConnectStart = useCallback(
    (_: React.MouseEvent | React.TouchEvent, { nodeId, handleId }: OnConnectStartParams) => {
      connectingNodeId.current = nodeId;
      connectingHandleId.current = handleId;
    },
    [],
  );

  const onConnectEnd = useCallback(
    (event: any) => {
      // 如果拖曳到的是面板上就新增
      const targetIsPane = event.target.classList.contains('react-flow__pane');

      if (targetIsPane && reactFlowWrapper?.current && !connecting) {
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
            sourceHandle: connectingHandleId.current || undefined,
          }),
        );
      }
      connecting = false;
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

  const onEdgeDoubleClick = (_: React.MouseEvent, edge: any) => {
    const newLabel = prompt('Enter new label for edge:', edge.label);
    if (newLabel !== null) {
      const newEdges = edges.map((el) => {
        if (el.id === edge.id) {
          el.label = newLabel;
        }
        return el;
      });
      setEdges(newEdges);
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
    changeNodeIds = findChildNodes(node.id).map((node) => node.target);
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

  const onDragOver = useCallback((event: any) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: any) => {
      event.preventDefault();

      // eslint-disable-next-line no-unsafe-optional-chaining
      const reactFlowBounds = reactFlowWrapper?.current?.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      if (typeof type === 'undefined' || !type || !reactFlowBounds || !rfInstance) return;

      const position = rfInstance.project({
        x: event.clientX - reactFlowBounds.left - 75,
        y: event.clientY - reactFlowBounds.top - 20,
      });

      setNodes((nds) => nds.concat(getNewNode(position, type)));
    },
    [rfInstance, setNodes],
  );

  return (
    <div className="flex h-screen bg-slate-800" ref={reactFlowWrapper}>
      <ToolBox />
      <ReactFlow
        onNodeDragStart={onNodeDragStart}
        onNodeDrag={onNodeDrag}
        onNodeDoubleClick={onNodeDoubleClick}
        onEdgeDoubleClick={onEdgeDoubleClick}
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
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
      >
        <Controls />
        <MiniMap style={minimapStyle} zoomable pannable />
        <Background color="#aaa" gap={16} />
      </ReactFlow>
    </div>
  );
};

function ToolBox() {
  const onDragStart = (event: any, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="fixed left-0 z-20 p-2 m-1 transform -translate-y-1/2 bg-white rounded-lg shadow-lg top-1/2">
      <div className="mx-2 my-1 text-xl font-bold">Tool Box</div>
      <div
        className="items-center justify-center p-1 my-1 text-xl border border-black border-solid rounded-md"
        onDragStart={(event) => onDragStart(event, 'default')}
        draggable
      >
        Node
      </div>
      <div
        className="items-center justify-center p-1 my-1 text-xl border border-black border-solid rounded-md"
        onDragStart={(event) => onDragStart(event, 'input')}
        draggable
      >
        Input Node
      </div>
      <div
        className="items-center justify-center p-1 my-1 text-xl border border-black border-solid rounded-md"
        onDragStart={(event) => onDragStart(event, 'output')}
        draggable
      >
        Output Node
      </div>

      <div
        className="items-center justify-center p-1 my-1 text-xl border border-black border-solid rounded-md"
        onDragStart={(event) => onDragStart(event, 'diamondNode')}
        draggable
      >
        Diamond Node
      </div>
    </div>
  );
}

export default Flow;
