import axios from 'axios';

// For demo purposes we'll use mock data - in a real app this would connect to your backend
const API_BASE_URL = '/api';

export interface ApiResponse<T> {
  message: string;
  data: T;
}

export const fetchWalletInflows = async (address: string) => {
  try {
    // In a real app this would be:
    // const response = await axios.get<ApiResponse<WalletConnection[]>>(`${API_BASE_URL}/inflows/${address}`);
    // return response.data;
    
    // For demo purposes:
    return mockInflows(address);
  } catch (error) {
    console.error('Error fetching inflows:', error);
    throw error;
  }
};

export const fetchWalletOutflows = async (address: string) => {
  try {
    // In a real app:
    // const response = await axios.get<ApiResponse<WalletConnection[]>>(`${API_BASE_URL}/outflows/${address}`);
    // return response.data;
    
    // For demo purposes:
    return mockOutflows(address);
  } catch (error) {
    console.error('Error fetching outflows:', error);
    throw error;
  }
};

// Mock data based on example JSON
function mockInflows(address: string) {
  // Sample data matching the structure in the assignment
  const mockData = {
    message: "success",
    data: [
      {
        beneficiary_address: "bc1qq7ldp3mza8q7q9e9gmzg72rzafyegckg57wluu",
        amount: 0.01000191,
        date: "2022-07-17 14:10:09",
        transactions: [
          {
            tx_amount: 0.01000191,
            date_time: "2022-07-17 14:10:09",
            transaction_id: "7e9885a3d2d236ea21bcb10c0b65f89010b3abbe9e705375b4f2856b0da32c7c"
          }
        ],
        entity_name: "Unknown",
        token_type: "BTC",
        transaction_type: "Normal Tx"
      },
      {
        beneficiary_address: "bc1qng0keqn7cq6p8qdt4rjnzdxrygnzq7nd0pju8q",
        amount: 2.4163156,
        date: "2022-07-17 14:10:09",
        transactions: [
          {
            tx_amount: 2.4163156,
            date_time: "2022-07-17 14:10:09",
            transaction_id: "7e9885a3d2d236ea21bcb10c0b65f89010b3abbe9e705375b4f2856b0da32c7c"
          }
        ],
        entity_name: "Changenow",
        token_type: "BTC",
        transaction_type: "Normal Tx"
      }
    ]
  };
  return mockData;
}

function mockOutflows(address: string) {
  const mockData = {
    message: "success",
    data: [
      {
        payer_address: "bc1qf786lw92dy09cx3tt9qhn4tf69dw9ak7m3ktkk",
        amount: 1.47741817,
        date: "2022-07-13 00:35:37",
        transactions: [
          {
            tx_amount: 1.47741817,
            date_time: "2022-07-13 00:35:37",
            transaction_id: "31e72dac1b2528efd3d6bf6b0108bd0558dbe2612ec6af3c9b0af746196af7c9"
          }
        ],
        entity_name: "Whitebit",
        token_type: "BTC",
        transaction_type: "Normal Tx"
      },
      {
        payer_address: "bc1qajuxzxmpejurlslkrq7y9dpyegp7392ty8x5xt",
        amount: 0.01007642,
        date: "2022-07-18 14:13:07",
        transactions: [
          {
            tx_amount: 0.01007642,
            date_time: "2022-07-18 14:13:07",
            transaction_id: "b576270267daf47c30f030542a03d95532c09884cbbf89bdfe89e94d517f2bb8"
          }
        ],
        entity_name: "Whitebit",
        token_type: "BTC",
        transaction_type: "Normal Tx"
      }
    ]
  };
  return mockData;
} 