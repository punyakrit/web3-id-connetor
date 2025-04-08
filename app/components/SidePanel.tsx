'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/app/store/store';
import { addNode, setSelectedNode } from '@/app/store/graphSlice';
import { fetchWalletInflows, fetchWalletOutflows } from '@/app/services/walletService';
import { useGraphOperations } from '@/app/hooks/useGraphOperations';

export default function SidePanel() {
  const [walletAddress, setWalletAddress] = useState('');
  const [activeTab, setActiveTab] = useState('inflows');
  const dispatch = useDispatch();
  const { processWalletConnections } = useGraphOperations();
  
  const inflows = useSelector((state: RootState) => state.graph.inflows);
  const outflows = useSelector((state: RootState) => state.graph.outflows);
  const selectedNode = useSelector((state: RootState) => state.graph.selectedNode);
  const darkMode = useSelector((state: RootState) => state.theme.darkMode);

  const handleAddWallet = async () => {
    if (!walletAddress) return;
    
    try {
      dispatch(addNode({ id: walletAddress, entity_name: 'Unknown' }));
      dispatch(setSelectedNode(walletAddress));
      
      // Fetch and process inflows/outflows
      await handleFetchData(walletAddress);
      
      setWalletAddress('');
    } catch (error) {
      console.error('Error adding wallet:', error);
    }
  };

  const handleFetchData = async (address: string) => {
    try {
      const inflowsData = await fetchWalletInflows(address);
      const outflowsData = await fetchWalletOutflows(address);
      
      // Use the hook to process wallet data
      processWalletConnections(address, inflowsData.data, outflowsData.data);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    }
  };

  return (
    <div className={`w-64 h-full ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'} flex flex-col`}>
      <div className="p-4 border-b border-gray-700">
        <div className="text-xl font-bold mb-4">TOGGLE VISIBLE TRACE NODES:</div>
        <div className="mb-4">
          <h3 className="mb-2">Add Wallet Address:</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="Enter wallet address"
              className="p-2 rounded w-full text-black"
            />
            <button 
              onClick={handleAddWallet}
              className="bg-yellow-500 text-black px-2 py-1 rounded"
            >
              ADD
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex border-b border-gray-700">
        <button 
          className={`flex-1 py-2 text-center ${activeTab === 'inflows' ? 'border-b-2 border-yellow-500' : ''}`}
          onClick={() => setActiveTab('inflows')}
        >
          INFLOWS
        </button>
        <button 
          className={`flex-1 py-2 text-center ${activeTab === 'outflows' ? 'border-b-2 border-yellow-500' : ''}`}
          onClick={() => setActiveTab('outflows')}
        >
          OUTFLOWS
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'inflows' ? (
          <div>
            {inflows.map((inflow, index) => (
              <div key={index} className="mb-2 p-2 border border-gray-700 rounded">
                <div>{inflow.entity_name || 'Unknown'} - {inflow.amount} BTC</div>
                <div className="text-xs">{inflow.date}</div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            {outflows.map((outflow, index) => (
              <div key={index} className="mb-2 p-2 border border-gray-700 rounded">
                <div>{outflow.entity_name || 'Unknown'} - {outflow.amount} BTC</div>
                <div className="text-xs">{outflow.date}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 