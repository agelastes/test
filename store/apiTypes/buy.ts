import { ApiAction, OperationStatus } from '.';

export type BuyApiTypes = {
  '/buy': ApiAction<
    {
      pay_token?: string;
      card_id: string;
      cvv: string;
      redirect_url: string;
      buy_token: string;
      user_deviceid: string;
      user_user_agent: string;
      user_time_zone: string;
      user_language: string;
      user_platform: string;
      client: string;
    },
    {
      id: string;
      status: OperationStatus;
      redirect?: {};
    }
  >;
};
