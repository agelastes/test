import { observable } from 'mobx';

import { apiHelper } from '@store/helpers';

export type ReferralStore = {
  isFetching: boolean;
  data: {
    code?: string;
    url?: string;
    count?: string;
    sum?: {
      total: string;
      expected: string;
    };
    monthly: {
      month: string;
      total: string;
      expected: string;
    }[];
  };
  transactions: {
    id: string;
    created_at: string;
    currency: string;
    amount: string;
    status: string;
  }[];
  getReferralLink: (currency?: string) => void;
  getReferralTransactions: (month: string) => void;
};

export const ReferralStore: ReferralStore = observable<ReferralStore>({
  isFetching: false,
  data: {
    monthly: [],
  },
  transactions: [],

  // async checkReferrals(currency) {
  //   const referralRes = await api.get('/referral');
  //   if (referralRes.data.monthly.length > 0) {
  //     ReferralStore.getReferralLink(currency);
  //   } else {
  //     runInAction(() => {
  //       ReferralStore.data = referralRes.data;
  //     });
  //   }
  // },

  async getReferralLink(currency) {
    const referralRes = await api.get('/referral', { params: { currency } });
    ReferralStore.data = referralRes.data;
  },

  async getReferralTransactions(month) {
    const res = await api.get('/referral/transactions', { params: { month, type: 'month' } });
    ReferralStore.transactions = res.data;
  },
});

const api = apiHelper(ReferralStore);
