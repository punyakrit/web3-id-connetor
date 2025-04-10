import { NextResponse } from 'next/server';

// This would connect to your real backend in a production application
export async function GET(
  // _request: Request,
  // { params }: { params: { address: any } }
) {
  // const address = params.address;
  
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

  return NextResponse.json(mockData);
} 