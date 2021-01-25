import { observable } from 'mobx';

import CONST from '@src/const';
import { apiHelper } from '@store/helpers';
import { addGAEvent } from '@utils';
import { ApiTypes, createTypesafeGetPost, SuccessData } from '@store/apiTypes';
import { GlobalStore } from '@store/GlobalStore';
import { WalletsStore } from '@store/WalletsStore';
import shortid from 'shortid';
import { NotificationsStore } from './NotificationsStore';

export type CardsStore = {
  isFetching: boolean;
  modal?: 'new' | 'delete';
  card3ds: {
    redirect?: {};
    id?: string;
    isFetching?: boolean;
    getStatusCounter?: number;
  };
  list: {
    id: string;
    payment_system: 'visa' | 'mastercard';
    card_number: string;
  }[];
  limit?: SuccessData<'/cards/limit'>['bindings'];
  setModal: (value?: CardsStore['modal']) => void;
  set3dsData: (data?: SuccessData<'/cards/bind'>) => void;
  bindCard: ApiTypes['/cards/bind'];
  getBindCardStatus: () => void;
  getCards: (redirect?: boolean) => void;
  deleteCard: (id?: string) => void;
  getCardsLimit: ApiTypes['/cards/limit'];
};

export const CardsStore: CardsStore = observable<CardsStore>({
  isFetching: false,
  card3ds: {},
  list: [],

  setModal(value) {
    CardsStore.modal = value;
  },

  set3dsData(data) {
    if (data?.redirect?.form) {
      data.redirect.form.forEach((param) => {
        param.value = param.template;
      });
    }
    CardsStore.card3ds = {
      redirect: data?.redirect,
      id: data?.id,
      getStatusCounter: 0,
    };
  },

  async bindCard(params) {
    addGAEvent({ category: 'bind-card', action: 'submit' });
    const data = await apiPost('/cards/bind', params);
    CardsStore.set3dsData(data);
    addGAEvent({ category: 'bind-card', action: 'success' });
    return data;
  },

  async getBindCardStatus() {
    delete CardsStore.card3ds.redirect;
    CardsStore.card3ds.isFetching = true;
    CardsStore.card3ds.getStatusCounter = (CardsStore.card3ds.getStatusCounter || 0) + 1;
    const res = await api.get(`cards/${CardsStore.card3ds.id}/bind-status`);
    if (
      res.data.status === 'pending' &&
      CardsStore.card3ds.getStatusCounter < CONST.maxBindCardStatusRequests
    ) {
      setTimeout(CardsStore.getBindCardStatus, CONST.getStatusInterval);
    } else {
      if (CardsStore.card3ds.getStatusCounter >= CONST.maxBindCardStatusRequests) {
        NotificationsStore.push({
          id: shortid.generate(),
          message: 'Your order is currently being processed. We’ll send you email when it’s done.',
        });
      }
      CardsStore.card3ds.isFetching = false;
      delete CardsStore.modal;
      CardsStore.getCards();
      GlobalStore.redirectTo(CONST.nav.root);
    }
  },

  async getCards(redirect) {
    const res = await api.get('/cards');
    CardsStore.list = res.data;
    WalletsStore.setOperationCardId(res.data[0]?.id);
    if (redirect && !res.data.length) GlobalStore.redirectTo(CONST.nav.newCard);
  },

  async deleteCard(id) {
    await api.post(`/cards/${id}/delete`);
    CardsStore.list = CardsStore.list.filter((card) => card.id !== id);
  },

  async getCardsLimit(params) {
    const data = await apiGet('/cards/limit', { params });
    CardsStore.limit = data.bindings;
    return data;
  },
});

const api = apiHelper(CardsStore);
const { apiGet, apiPost } = createTypesafeGetPost(api);
