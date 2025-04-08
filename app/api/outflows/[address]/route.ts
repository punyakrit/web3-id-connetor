import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { address: string } }
) {
  const address = params.address;
  
  // Mock data based on example from assignment
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

  return NextResponse.json(mockData);
} 