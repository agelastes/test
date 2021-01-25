import { observable } from 'mobx';
import qs from 'qs';
import shortid from 'shortid';

import CONST from '@src/const';
import { apiHelper } from '@store/helpers';
import { addGAEvent } from '@utils';
import { ApiTypes, createTypesafeGetPost, OperationStatus, SuccessData } from '@store/apiTypes';
import { CardsStore } from '@store/CardsStore';
import { GlobalStore } from '@store/GlobalStore';
import { LoginStore, VerifyCodeType } from '@store/LoginStore';
import { OperationRateData } from '@store/ConverterStore';
import { NotificationsStore } from './NotificationsStore';

export type WalletsStore = {
  isFetching: boolean;
  operation: {
    cardId?: string;
    id?: string;
    status?: OperationStatus;
    token?: string;
    currency?: string;
    amount?: string;
    fiat_currency?: string;
    fiat_amount?: string;
    type?: 'buy' | 'sell';
    rate?: OperationRateData;
  };
  descriptor: {
    length: number;
    prefix: string;
    code?: string;
  };
  deposit: {
    address: string;
  };
  data: SuccessData<'/wallet'>;
  setOperationCardId: (value: string) => void;
  setDepositAddress: (address: string) => void;
  setDescriptor: (value: string) => void;
  buy: (cvv: string) => void;
  sell: () => void;
  verifyDescriptor: () => void;
  getStatus: (
    type: 'buy' | 'sell',
    id: string
  ) => Promise<{ id: string; status: string; next?: string }>;
  withdraw: ApiTypes['/withdraw'];
  withdrawVerifyCode: (type: VerifyCodeType) => void;
  getAddress: (currency: string) => void;
  getWalletData: ApiTypes['/wallet'];
  getWithdrawalFee: ApiTypes['/withdraw/estimate-fee'];
  updateOperationRate: (rate?: OperationRateData) => void;
  getLimits: ApiTypes['/wallet/limits'];
};

export const WalletsStore: WalletsStore = observable<WalletsStore>({
  isFetching: false,
  operation: {},
  descriptor: {
    length: 5,
    prefix: 'M - ',
    code: 'M - ',
  },
  deposit: {
    address: '',
  },
  data: {},

  setOperationCardId(value) {
    WalletsStore.operation.cardId = value;
  },

  setDepositAddress(address) {
    WalletsStore.deposit.address = address;
  },

  setDescriptor(value) {
    WalletsStore.descriptor.code = value || WalletsStore.descriptor.prefix;
  },

  async buy(cvv) {
    const res = await api.post('/buy', {
      card_id: WalletsStore.operation.cardId,
      cvv,
      buy_token: WalletsStore.operation.token,
      redirect_url: `${CONST.card3dsDomain}?buy_id={invoice_id}`,
      client: CONST.client,
      ...GlobalStore.fingerPrintData,
    });
    CardsStore.set3dsData(res.data);
    GlobalStore.redirectTo(CONST.nav.verify3ds, { search: { type: 'buy', id: res.data.id } });
  },

  async sell() {
    const res = await api.post('/sell', {
      card_id: WalletsStore.operation.cardId,
      sell_token: WalletsStore.operation.token,
      client: CONST.client,
    });
    GlobalStore.redirectTo(CONST.nav.status, { search: { type: 'sell', id: res.data.id } });
  },

  async verifyDescriptor() {
    try {
      const res = await api.post(`/buy/${CardsStore.card3ds.id}/status/verify-descriptor`, {
        code: WalletsStore.descriptor.code?.slice(WalletsStore.descriptor.prefix.length),
      });
      addGAEvent({ category: 'verify-descriptor', action: 'success', label: 'full' });
      GlobalStore.redirectTo(CONST.nav[res.data.next] || CONST.nav.status);
    } catch {
      addGAEvent({ category: 'verify-descriptor', action: 'failure', label: 'full' });
    }
  },

  async getStatus(type, id) {
    delete CardsStore.card3ds.redirect;
    const query = qs.stringify(GlobalStore.fingerPrintData, { addQueryPrefix: true });
    const data: { id: string; status: OperationStatus; next?: string } = await api
      // .post(`/widget/${type}/${id}/status${query}`)
      .post(`/${type}/${id}/status${query}`)
      .then((res) => res.data);
    delete WalletsStore.operation.token;
    return data;
  },

  async withdraw(params) {
    const data = await apiPost('/withdraw', params);
    if (data.next === 'verify-phone') {
      LoginStore.updateLoginData(data);
      GlobalStore.redirectTo(CONST.nav.operationVerifyPhone);
    }
    return data;
  },

  async withdrawVerifyCode(type) {
    LoginStore.customVerifyCode({
      apiMethod: '/withdraw',
      type,
      callback: (data) => {
        if (!data.next) GlobalStore.redirectTo(CONST.nav.root);
        NotificationsStore.push({
          id: shortid.generate(),
          message: 'You have successfully withdrawn',
        });
      },
    });
  },

  async getAddress(currency) {
    const res = await api.get(
      `topup/address${qs.stringify({ currency }, { addQueryPrefix: true })}`
    );
    WalletsStore.setDepositAddress(res.data.address);
  },

  async getWalletData() {
    const data = await apiGet(`/wallet`);
    WalletsStore.data = data;
    return data;
  },

  getWithdrawalFee: (params) => apiGet(`/withdraw/estimate-fee`, { params }),

  updateOperationRate(rate) {
    WalletsStore.operation.rate = rate;
  },

  getLimits: (params) => apiGet('/wallet/limits', { params }),
});

const api = apiHelper(WalletsStore);
const { apiGet, apiPost } = createTypesafeGetPost(api);
