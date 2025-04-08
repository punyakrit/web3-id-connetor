import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Transaction {
  tx_amount: number;
  date_time: string;
  transaction_id: string;
}

export interface WalletConnection {
  beneficiary_address?: string;
  payer_address?: string;
  amount: number;
  date: string;
  transactions: Transaction[];
  entity_name: string;
  token_type: string;
  transaction_type: string;
}

export interface Node {
  id: string;
  entity_name: string;
  x?: number;
  y?: number;
}

export interface Link {
  source: string;
  target: string;
  amount: number;
  date: string;
  transaction_id: string;
}

export interface GraphState {
  nodes: Node[];
  links: Link[];
  selectedNode: string | null;
  inflows: WalletConnection[];
  outflows: WalletConnection[];
}

const initialState: GraphState = {
  nodes: [],
  links: [],
  selectedNode: null,
  inflows: [],
  outflows: [],
};

export const graphSlice = createSlice({
  name: 'graph',
  initialState,
  reducers: {
    addNode: (state, action: PayloadAction<Node>) => {
      if (!state.nodes.find(node => node.id === action.payload.id)) {
        state.nodes.push(action.payload);
      }
    },
    addLink: (state, action: PayloadAction<Link>) => {
      if (!state.links.find(link => 
        link.source === action.payload.source && 
        link.target === action.payload.target &&
        link.transaction_id === action.payload.transaction_id
      )) {
        state.links.push(action.payload);
      }
    },
    setSelectedNode: (state, action: PayloadAction<string | null>) => {
      state.selectedNode = action.payload;
    },
    setInflows: (state, action: PayloadAction<WalletConnection[]>) => {
      state.inflows = action.payload;
    },
    setOutflows: (state, action: PayloadAction<WalletConnection[]>) => {
      state.outflows = action.payload;
    },
    clearGraph: (state) => {
      state.nodes = [];
      state.links = [];
      state.selectedNode = null;
      state.inflows = [];
      state.outflows = [];
    }
  },
});

export const { addNode, addLink, setSelectedNode, setInflows, setOutflows, clearGraph } = graphSlice.actions;

export default graphSlice.reducer; 