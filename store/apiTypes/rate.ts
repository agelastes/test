import { ApiAction } from '.';

export type RateApiTypes = {
  '/rate': ApiAction<
    {
      from: string;
      to: string;
      type: 'buy' | 'sell';
      amount?: string;
    },
    {
      from: string;
      to: string;
      type: string;
      rate: string;
    }
  >;
};
