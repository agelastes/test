import React, { createContext, useContext } from 'react';

import { UserStore } from '@store/UserStore';
import { LoginStore } from '@store/LoginStore';
import { GlobalStore } from '@store/GlobalStore';
import { LibStore } from '@store/LibStore';
import { NotificationsStore } from '@store/NotificationsStore';
import { ErrorsStore } from '@store/ErrorsStore';
import { CardsStore } from '@store/CardsStore';
import { ConverterStore } from '@store/ConverterStore';
import { WalletsStore } from '@store/WalletsStore';
import { TransactionsStore } from '@store/TransactionsStore';
import { ReferralStore } from '@store/ReferralStore';
import { StoriesStore } from '@store/StoriesStore';

export const RootStore = {
  user: UserStore,
  login: LoginStore,
  global: GlobalStore,
  lib: LibStore,
  notifications: NotificationsStore,
  errors: ErrorsStore,
  cards: CardsStore,
  converter: ConverterStore,
  wallets: WalletsStore,
  referral: ReferralStore,
  transactions: TransactionsStore,
  stories: StoriesStore,
};

export const StoreContext = createContext<typeof RootStore | null>(null);

export const useStore = () => {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error('useStore must be used within a StoreProvider.');
  }
  return store;
};

export const StoreProvider: React.FC = ({ children }) => (
  <StoreContext.Provider value={RootStore}>{children}</StoreContext.Provider>
);
