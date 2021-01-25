import { observable } from 'mobx';
import shortid from 'shortid';

import CONST from '@src/const';
import { apiHelper } from '@store/helpers';
import { ApiTypes, createTypesafeGetPost, SuccessData } from '@store/apiTypes';
import { WalletsStore } from './WalletsStore';
import { Error } from './ErrorsStore';
import { LibStore } from './LibStore';

export type OperationType = 'buy' | 'sell' | 'withdraw';

export type OperationRateData = {
  buy_token?: string;
  sell_token?: string;
  withdraw_token?: string;
  rate: string;
  fee: {
    [key: string]: string;
  };
  subtotal: {
    [key: string]: string;
  };
  total: {
    [key: string]: string;
  };
};

export type RateData = {
  from: string;
  to: string;
  type: string;
  rate: string;
  amount: string;
};

export type ConverterStore = {
  isFetching: boolean;
  from: {
    amount: string;
    currency: string;
  };
  to: {
    amount: string;
    currency: string;
  };
  type: OperationType;
  rate?: {
    from?: string;
    to?: string;
    amount?: string;
    rate?: string;
    type?: string;
  };
  limit?: SuccessData<'/wallet/limits'>;
  setFromCurrency: (value: string) => void;
  setFromAmount: (value: string) => void;
  setToCurrency: (value: string) => void;
  setToAmount: (value: string) => void;
  getOperationRate: (params: {
    from: string;
    to: string;
    amount: string;
    type: OperationType;
    onSuccess?: (data: OperationRateData) => void;
    onError?: (error: Error) => void;
  }) => void;
  getRate: ApiTypes['/rate'];
  setRate: (rate: ConverterStore['rate']) => void;
};

export const ConverterStore: ConverterStore = observable<ConverterStore>({
  isFetching: false,
  from: {
    amount: '',
    currency: '',
  },
  to: {
    amount: '',
    currency: CONST.defaultCryptoCurrency,
  },

  get type(): ConverterStore['type'] {
    return LibStore.currencies.fiat.includes(ConverterStore.from.currency)
      ? CONST.operations.buy
      : CONST.operations.sell;
  },

  setFromCurrency(value) {
    ConverterStore.from.currency = value;
  },

  setFromAmount(value) {
    ConverterStore.from.amount = value;
    if (!value && ConverterStore.to.amount) ConverterStore.setToAmount('');
  },

  setToCurrency(value) {
    ConverterStore.to.currency = value;
  },

  setToAmount(value) {
    ConverterStore.to.amount = value;
    if (!value && ConverterStore.from.amount) ConverterStore.setFromAmount('');
  },

  async getOperationRate({ from, to, amount, type, onSuccess, onError }) {
    delete WalletsStore.operation.token;
    if (from && to && Number(amount) > 0) {
      try {
        const params = { from, to, amount };
        const data: OperationRateData = await api
          .get(`/${type}/rate`, { params })
          .then((res) => res.data);
        if (onSuccess) onSuccess(data);
        WalletsStore.operation.token =
          type === CONST.operations.withdraw ? shortid() : data[`${type}_token`];
        const getCurrency = (name: 'fiat' | 'crypto'): string =>
          Object.keys(data.total).find((item) => LibStore.currencies?.[name].includes(item)) || '';
        WalletsStore.operation.amount = data.total?.[getCurrency('crypto')];
        WalletsStore.operation.currency = getCurrency('crypto');
        WalletsStore.operation.fiat_amount = data.total?.[getCurrency('fiat')];
        WalletsStore.operation.fiat_currency = getCurrency('fiat');
      } catch (err) {
        if (onError) onError(err);
      }
    }
  },

  getRate: (params) => apiGet('/rate', { params }),

  setRate(rate) {
    ConverterStore.rate = rate;
  },
});

export const api = apiHelper(ConverterStore);
const { apiGet, apiPost } = createTypesafeGetPost(api);
