import { create } from 'zustand';
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow';

type RFState = {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
};

const initialNodes = [
  {
    id: '0',
    type: 'input',
    data: { label: 'Node' },
    position: { x: 0, y: 50 },
    width: 150,
    height: 40,
  },
  // {
  //   id: '1',
  //   position: { x: -61.9375474330505, y: 129.09792291126126 },
  //   data: { label: 'Node 1' },
  //   width: 150,
  //   height: 40,
  // },
  // {
  //   id: '2',
  //   position: { x: 135.77948371746024, y: 149.32639804547193 },
  //   data: { label: 'Node 2' },
  //   width: 150,
  //   height: 40,
  // },
  // {
  //   id: '3',
  //   position: { x: -82.16602256726117, y: 196.96119432925835 },
  //   data: { label: 'Node 3' },
  //   width: 150,
  //   height: 40,
  // },
];

const initialEdges = [
  // { id: '1', source: '0', target: '1' },
  // { id: '2', source: '0', target: '2' },
  // { id: '3', source: '1', target: '3' },
];

// this is our useStore hook that we can use in our components to get parts of the store and call actions
const useStore = create<RFState>((set, get) => ({
  nodes: initialNodes,
  edges: [],
  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onConnect: (connection: Connection) => {
    set({
      edges: addEdge(connection, get().edges),
    });
  },
}));

export default useStore;
