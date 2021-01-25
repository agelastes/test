import { ApiAction } from '.';

export type CardsApiTypes = {
  '/cards/bind': ApiAction<
    {
      holder_name: string;
      number: string;
      cvv: string;
      expiration_month: string;
      expiration_year: string;
      redirect_url: string;
    },
    {
      id: string;
      status: string;
      redirect?: Record<string, any>;
    }
  >;
  '/cards/limit': ApiAction<
    void,
    {
      bindings: {
        count: number;
        limit: number;
      };
    }
  >;
};
