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
      
      processWalletConnections(address, inflowsData.data, outflowsData.data);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    }
  };

  return (
    <div className={`w-80 h-full ${darkMode ? 'bg-gray-800 bg-opacity-70' : 'bg-white bg-opacity-90'} backdrop-blur-sm flex flex-col shadow-xl transition-all duration-300 ease-in-out`}>
      <div className="p-5 border-b border-gray-700/30">
        <div className="text-xl font-extrabold mb-5 text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">WALLET TRACE EXPLORER</div>
        <div className="mb-5">
          <h3 className="mb-2 font-medium text-sm uppercase tracking-wider opacity-70">Add Wallet Address:</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="Enter wallet address"
              className={`p-3 rounded-lg w-full text-sm ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-100 text-black border-gray-200'} border focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none`}
            />
            <button 
              onClick={handleAddWallet}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-lg shadow-lg hover:shadow-indigo-500/20 transition-all duration-300 font-medium text-sm"
            >
              ADD
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex border-b border-gray-700/30">
        <button 
          className={`flex-1 py-4 text-center font-medium transition-all duration-300 text-sm tracking-wide ${activeTab === 'inflows' ? 'text-indigo-500 border-b-2 border-indigo-500' : 'opacity-60 hover:opacity-100'}`}
          onClick={() => setActiveTab('inflows')}
        >
          INFLOWS
        </button>
        <button 
          className={`flex-1 py-4 text-center font-medium transition-all duration-300 text-sm tracking-wide ${activeTab === 'outflows' ? 'text-purple-500 border-b-2 border-purple-500' : 'opacity-60 hover:opacity-100'}`}
          onClick={() => setActiveTab('outflows')}
        >
          OUTFLOWS
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {activeTab === 'inflows' ? (
          <div className="space-y-3">
            {inflows.length === 0 ? (
              <div className="text-center py-10 opacity-50 italic">No inflow data to display</div>
            ) : (
              inflows.map((inflow, index) => (
                <div key={index} className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700/60' : 'bg-gray-100/80'} shadow-sm hover:shadow-md transition-all group`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-400 mr-2"></div>
                      {inflow.entity_name || 'Unknown'}
                    </div>
                    <div className="font-mono font-bold text-indigo-500">{inflow.amount.toFixed(8)} BTC</div>
                  </div>
                  <div className="text-xs opacity-60 group-hover:opacity-100 transition-opacity">{inflow.date}</div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {outflows.length === 0 ? (
              <div className="text-center py-10 opacity-50 italic">No outflow data to display</div>
            ) : (
              outflows.map((outflow, index) => (
                <div key={index} className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700/60' : 'bg-gray-100/80'} shadow-sm hover:shadow-md transition-all group`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium flex items-center">
                      <div className="w-2 h-2 rounded-full bg-red-400 mr-2"></div>
                      {outflow.entity_name || 'Unknown'}
                    </div>
                    <div className="font-mono font-bold text-purple-500">{outflow.amount.toFixed(8)} BTC</div>
                  </div>
                  <div className="text-xs opacity-60 group-hover:opacity-100 transition-opacity">{outflow.date}</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
} 