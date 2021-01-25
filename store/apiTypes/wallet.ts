import { ApiAction, operations } from '.';

export type WalletApiTypes = {
  '/wallet': ApiAction<
    void,
    {
      [key: string]: {
        created_at: string;
        updated_at: string;
        created_at_ts: number;
        updated_at_ts: number;
        currency: string;
        balance: string;
        fiat_currency: string;
        fiat_balance: string;
        fiat: {
          currency: string;
          balance: string;
        }[];
      };
    }
  >;
  '/wallet/limits': ApiAction<
    {
      crypto_currency: string;
      currency?: string;
      type?: string;
    },
    {
      [key in operations]: {
        [key: string]: {
          init_month?: string;
          month?: string;
          init_week?: string;
          week?: string;
          init_day?: string;
          day?: string;
          min: string;
          max: string;
          operation_min: string;
          operation_max: string;
        };
      };
    }
  >;
};
