import { ApiAction } from '.';

export type WithdrawApiTypes = {
  '/withdraw': ApiAction<
    {
      currency: string;
      address: string;
      amount: string;
      estimate_id?: string;
      client?: 'web' | 'ios' | 'android' | 'widget';
    },
    {
      key: string;
      code_length: string;
      next: string;
      timeout: number;
    }
  >;
  '/withdraw/estimate-fee': ApiAction<
    {
      currency: string;
      fiat_currency: string;
      address: string;
      amount: string;
      level?: string;
    },
    {
      currency: string;
      fiat_currency: string;
      fees: {
        id: string;
        level: string;
        fee: string;
        estimated_time: {
          min?: number;
          max?: number;
        };
        fiat_amount: string;
        is_paid_by_user: boolean;
      }[];
    }
  >;
};
