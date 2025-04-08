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
    dispatch(addNode({ 
      id: sourceAddress, 
      entity_name: 'Unknown'
    }));

    dispatch(setInflows(inflows));
    dispatch(setOutflows(outflows));

    inflows.forEach(inflow => {
      const address = inflow.beneficiary_address;
      if (!address) return;
      
      dispatch(addNode({
        id: address,
        entity_name: inflow.entity_name || 'Unknown'
      }));

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

    outflows.forEach(outflow => {
      const address = outflow.payer_address;
      if (!address) return;
      
      dispatch(addNode({
        id: address,
        entity_name: outflow.entity_name || 'Unknown'
      }));

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