import { observable } from 'mobx';
import { displayRate } from 'mercuryo-lab';

import { apiHelper } from '@store/helpers';

export type LibStore = {
  isFetching: boolean;
  currencies: {
    fiat: string[];
    crypto: string[];
    config?: {
      base: {
        [key: string]: string;
      };
      display_options: {
        [key: string]: {
          fullname: string;
          total_digits: number;
          display_digits: number;
        };
      };
      icons: {
        [key: string]: {
          svg: string;
          png: string;
          relative: {
            svg: string;
            png: string;
          };
        };
      };
    };
  };
  countries: {
    code: string;
    title: string;
    phone_prefix: string;
  }[];
  languages: {
    code: string;
    name: string;
  }[];
  getCurrencies: () => void;
  getCountries: () => void;
  getLanguages: () => void;
  displayRate: (
    amount: string | number,
    currency: string,
    config?: { hideCurrency?: boolean; showTrailingZeros?: boolean; debug?: boolean }
  ) => string;
};

export const LibStore: LibStore = observable<LibStore>({
  isFetching: false,
  languages: [],
  currencies: {
    fiat: [],
    crypto: [],
  },
  countries: [],

  async getCurrencies() {
    const res = await api.get('/lib/currencies');
    LibStore.currencies = res.data;
  },

  async getCountries() {
    const res = await api.get('/lib/countries');
    LibStore.countries = res.data;
  },

  async getLanguages() {
    const languages = await api.get('/lib/languages');
    LibStore.languages = languages.data;
  },

  displayRate: (amount, currency, config) => {
    const displayDigits = LibStore.currencies.config?.display_options[currency].display_digits || 0;
    return displayRate(amount, currency, displayDigits, {
      showCurrency: !config?.hideCurrency,
      showTrailingZeros: config?.showTrailingZeros,
    });
  },
});

const api = apiHelper(LibStore);
