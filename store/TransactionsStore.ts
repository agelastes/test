import { observable } from 'mobx';
import debounce from 'lodash.debounce';

import CONST from '@src/const';
import { apiHelper } from '@store/helpers';

export enum operations {
  sell = 'sell',
  buy = 'buy',
  withdraw = 'withdraw',
  deposit = 'deposit',
  other = 'other',
}

export type Transaction = {
  id: string;
  created_at: string;
  updated_at: string;
  type: operations;
  currency: string;
  amount: string;
  fiat_currency: string;
  fiat_amount: string;
  status: string;
  card?: {
    id: string;
    number: string;
    payment_system: string;
  };
  mercuryo_card?: {
    id: string;
    card_number: string;
    payment_system: string;
  };
  txid?: string;
  tx?: {
    id: string;
    url: string;
    address: string;
    fee: string;
  };
};

export type Response = {
  next?: string;
  total: number;
  data: Transaction[];
};

export type TransactionsFilter = {
  currency?: string;
  card?: string;
};

export type TransactionsStore = {
  isFetching: boolean;
  next?: Response['next'];
  total: Response['total'];
  data: Response['data'];
  noMore: boolean;
  groupedData: { [key: string]: Transaction[] };
  getTransactions: (limit?: number, filter?: TransactionsFilter) => void;
  getTransactionsDebounce: TransactionsStore['getTransactions'];
  getMoreTransactions: () => void;
  reset: () => void;
};

export const TransactionsStore: TransactionsStore = observable<TransactionsStore>({
  isFetching: false,
  total: 0,
  data: [],
  get noMore() {
    return TransactionsStore.total === TransactionsStore.data.length;
  },
  get groupedData() {
    const result = {};
    TransactionsStore.data.forEach((item) => {
      const date = item.created_at.slice(0, 10);
      if (!result[date]) result[date] = [];
      result[date].push(item);
    });
    return result;
  },

  async getTransactions(limit, filter) {
    TransactionsStore.data = [];
    const params = {
      limit,
      currency: filter?.currency,
      mercuryo_card_id: filter?.card,
    };
    const res: Response = await api.get(
      filter?.card ? `/transactions/by-card-id` : `/transactions`,
      { params }
    );
    TransactionsStore.next = res.next;
    TransactionsStore.total = res.total;
    TransactionsStore.data = res.data;
  },

  async getMoreTransactions() {
    const res: Response = await api.get(TransactionsStore.next || '/transactions');
    TransactionsStore.next = res.next;
    TransactionsStore.total = res.total;
    TransactionsStore.data = [...TransactionsStore.data, ...res.data];
  },

  getTransactionsDebounce: debounce(function (...args) {
    TransactionsStore.getTransactions(...args);
  }, CONST.inputDebounceTime),

  reset() {
    delete TransactionsStore.next;
    TransactionsStore.total = 0;
    TransactionsStore.data = [];
  },
});

const api = apiHelper(TransactionsStore);
