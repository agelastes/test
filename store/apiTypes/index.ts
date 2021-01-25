import { AxiosInstance, AxiosRequestConfig } from 'axios';

import { UserApiTypes } from './user';
import { RateApiTypes } from './rate';
import { BuyApiTypes } from './buy';
import { WalletApiTypes } from './wallet';
import { CardsApiTypes } from './cards';
import { WithdrawApiTypes } from './withdraw';

export type ApiAction<RequestParams, SuccessData> = (params: RequestParams) => Promise<SuccessData>;

export type RequestParams<T extends keyof ApiTypes> = Parameters<ApiTypes[T]>[0];
export type SuccessData<T extends keyof ApiTypes> = UnwrapPromise<ReturnType<ApiTypes[T]>>;

export const createTypesafeGetPost = (apiInstance: AxiosInstance) => ({
  apiGet: <T extends keyof ApiTypes>(
    url: T,
    config?: AxiosRequestConfig & { params: RequestParams<T> }
  ) => apiInstance.get<UnwrapPromise<ReturnType<ApiTypes[T]>>>(url, config).then((res) => res.data),
  apiPost: <T extends keyof ApiTypes>(
    url: T,
    data?: RequestParams<T>,
    config?: AxiosRequestConfig
  ) =>
    apiInstance
      .post<UnwrapPromise<ReturnType<ApiTypes[T]>>>(url, data, config)
      .then((res) => res.data),
});

export type OperationStatus = 'pending' | 'paid' | 'succeeded' | 'failed';

export enum operations {
  buy = 'buy',
  sell = 'sell',
  withdraw = 'withdraw',
}

export type ApiTypes = UserApiTypes &
  RateApiTypes &
  BuyApiTypes &
  WalletApiTypes &
  CardsApiTypes &
  WithdrawApiTypes;
