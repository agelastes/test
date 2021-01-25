import { observable } from 'mobx';
import qs from 'qs';
import Cookies from 'js-cookie';

import CONST from '@src/const';
import i18n from '@src/i18n';
import { getFingerPrintData } from '@src/utils';

export type GlobalStore = {
  isFetching: boolean;
  lang: string;
  redirect: {
    to?: string;
    state?: Record<string, any>;
    search?: string;
  };
  fingerPrintData?: {};
  redirectTo: (
    to: string,
    params?: {
      state?: GlobalStore['redirect']['state'];
      search?: string | Record<string, any>;
    }
  ) => void;
  clearRedirect: () => void;
  setFingerPrintData: () => void;
  setI18nLang: (lang: string) => void;
};

export const GlobalStore: GlobalStore = observable<GlobalStore>({
  isFetching: false,
  lang: Cookies.get('lang') || i18n.language || CONST.defaultLang,
  redirect: {},

  redirectTo(to, params) {
    if (to) {
      GlobalStore.redirect = {
        to,
        state: params?.state,
        search: typeof params?.search === 'string' ? params?.search : qs.stringify(params?.search),
      };
    }
  },

  clearRedirect() {
    GlobalStore.redirect = {};
  },

  setFingerPrintData() {
    getFingerPrintData().then((data: any) => {
      GlobalStore.fingerPrintData = data;
    });
  },

  setI18nLang(lang) {
    Cookies.set('lang', lang, { expires: 3650 });
    if (i18n.language !== lang) i18n.changeLanguage(lang);
    GlobalStore.lang = lang;
  },
});
