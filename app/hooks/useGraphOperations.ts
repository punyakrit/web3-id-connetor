'use client';

import { useDispatch } from 'react-redux';
import { addNode, addLink, setInflows, setOutflows, WalletConnection } from '@/app/store/graphSlice';

export function useGraphOperations() {
  const dispatch = useDispatch();

  const processWalletConnections = (
    sourceAddress: string, 
    inflows: WalletConnection[], 
    outflows: WalletConnection[]
  ) => {
    // Add the source node if not already in the graph
    dispatch(addNode({ 
      id: sourceAddress, 
      entity_name: 'Unknown'
    }));

    // Store inflows and outflows in the state
    dispatch(setInflows(inflows));
    dispatch(setOutflows(outflows));

    // Process inflow connections (these connect to the source node)
    inflows.forEach(inflow => {
      const address = inflow.beneficiary_address;
      if (!address) return; // Skip if address is undefined
      
      // Add the connected node
      dispatch(addNode({
        id: address,
        entity_name: inflow.entity_name || 'Unknown'
      }));

      // Add links for each transaction
      inflow.transactions.forEach(tx => {
        dispatch(addLink({
          source: address,
          target: sourceAddress,
          amount: tx.tx_amount,
          date: tx.date_time,
          transaction_id: tx.transaction_id
        }));
      });
    });

    // Process outflow connections (these go from the source node)
    outflows.forEach(outflow => {
      const address = outflow.payer_address;
      if (!address) return; // Skip if address is undefined
      
      // Add the connected node
      dispatch(addNode({
        id: address,
        entity_name: outflow.entity_name || 'Unknown'
      }));

      // Add links for each transaction
      outflow.transactions.forEach(tx => {
        dispatch(addLink({
          source: sourceAddress,
          target: address,
          amount: tx.tx_amount,
          date: tx.date_time,
          transaction_id: tx.transaction_id
        }));
      });
    });
  };

  return { processWalletConnections };
} 