import { observable } from 'mobx';

import CONST from '@src/const';
import { apiHelper } from '@store/helpers';
import { addGAEvent } from '@utils';
import { ApiTypes, createTypesafeGetPost, RequestParams } from '@store/apiTypes';
import { LoginStore, VerifyCodeType } from '@store/LoginStore';
import { GlobalStore } from '@store/GlobalStore';
import { ErrorsStore } from '@store/ErrorsStore';

type StatusType = 'incomplete' | 'under_review' | 'complete' | 'failed';

export type UserStore = {
  isFetching: boolean;
  firstName: string;
  lastName: string;
  birthday: string;
  documentTypes: RequestParams<'/user/upload'>['type'][];
  data: {
    first_name?: string;
    last_name?: string;
    first_name_en?: string;
    last_name_en?: string;
    birthday?: string;
    country_code?: string;
    language_code?: string;
    send_marketing_material?: boolean;
    fiat_currency?: string;
    is_card_enabled?: boolean;
    able_to_upload?: boolean;
    email?: string;
    phone?: string;
    referral?: string;
    uuid4?: string;
    checks?: {
      sanction?: StatusType;
      document?: StatusType;
      proof_of_address?: StatusType;
      document_details?: {
        check_enabled?: boolean;
        errors?: {};
        document_type?: 'passport';
        face_type?: 'face_with_document';
      };
    };
  };
  KYC: {
    sumsub?: {
      userId: string;
      accessToken: string;
    };
  };
  account: {
    next?: string;
  };
  clearNext: () => void;
  changeData: (data: string, type: 'phone' | 'email') => void;
  changeDataVerifyCode: (changeDataType: 'phone' | 'email', codeType: VerifyCodeType) => void;
  setFiatCurrency: (fiat: string) => void;
  setLanguage: (value: string) => void;
  setFirstName: (value: string) => void;
  setLastName: (value: string) => void;
  setBirthday: (value: string) => void;
  getData: () => void;
  getDocumentTypes: () => void;
  uploadFile: ApiTypes['/user/upload'];
  sendMarketingMaterialEdit: (value: boolean) => void;
  getDataByIp: () => void;
  getKycAccessToken: () => void;
  changePassword: (params: { password: string; newPassword: string }) => void;
  changePasswordVerifyCode: (codeType: VerifyCodeType) => void;
};

export const UserStore: UserStore = observable<UserStore>({
  isFetching: false,
  firstName: '',
  lastName: '',
  birthday: '',
  documentTypes: [],
  data: {},
  KYC: {},
  account: {},

  clearNext() {
    UserStore.account.next = undefined;
  },

  setFirstName(value) {
    UserStore.firstName = value;
  },

  setLastName(value) {
    UserStore.lastName = value;
  },

  setBirthday(value) {
    UserStore.birthday = value;
  },

  async getData() {
    try {
      const res = await api.get('/user/data');
      LoginStore.isLoggedIn = true;
      if (!LoginStore.idleTimeout) LoginStore.idleTimeout = CONST.defaultIdleTimeout;
      UserStore.data = res.data;
      GlobalStore.setI18nLang(res.data.language_code.slice(0, 2));
      const KYCStatus = UserStore.data.checks?.document;
      const KYCStarted = window.localStorage.getItem('KYCStarted');
      if (KYCStarted) {
        if (KYCStatus === 'complete') {
          addGAEvent({ category: 'kyc-finish-successfully-passed', action: 'success' });
          window.localStorage.removeItem('KYCStarted');
        } else if (KYCStatus === 'failed') {
          addGAEvent({ category: 'kyc-finish-failed-check', action: 'success' });
          window.localStorage.removeItem('KYCStarted');
        }
      }
    } catch {
      LoginStore.isLoggedIn = false;
    }
  },

  async getDocumentTypes() {
    const res = await api.get('file/types');
    UserStore.documentTypes = res.data;
  },

  uploadFile: (params) => apiPost('/user/upload', params),

  async sendMarketingMaterialEdit(value) {
    await api.post('user/edit', { send_marketing_material: value });
    UserStore.data.send_marketing_material = value;
  },

  async getDataByIp() {
    const res = await api.get('/public/data-by-ip');
    LoginStore.phonePrefix = res.data.country.phone_prefix;
    LoginStore.country = res.data.country.code;
  },

  async changeData(data, type) {
    const res = await api.post(`/user/change-${type}`, { [type]: data });
    LoginStore.updateLoginData({ ...res.data, next: false });
    UserStore.account.next = res.data.next;
  },

  async changeDataVerifyCode(changeDataType, codeType) {
    LoginStore.customVerifyCode({
      apiMethod: `/user/change-${changeDataType}`,
      type: codeType,
      callback: (data) => {
        UserStore.account.next = ['verify-phone', 'verify-email'].includes(data.next)
          ? data.next
          : undefined;
        if (!data.next) GlobalStore.redirectTo(CONST.nav.account);
        if (data[changeDataType]) UserStore.getData();
        LoginStore.setVerifyCode('');
        if (changeDataType === 'email' && codeType === 'email') {
          GlobalStore.redirectTo(CONST.nav.security);
        }
      },
      next: false,
    });
  },

  async setLanguage(language_code) {
    const res = await api.post('/user/edit', { language_code });
    UserStore.data.language_code = res.data.language_code;
    GlobalStore.setI18nLang(language_code.slice(0, 2));
  },

  async setFiatCurrency(fiat_currency) {
    const res = await api.post('/user/edit', { fiat_currency });
    UserStore.data.fiat_currency = res.data.fiat_currency;
  },

  async getKycAccessToken() {
    const res = await api.get('/user/kyc-access-token');
    UserStore.KYC.sumsub = {
      userId: res.data.id,
      accessToken: res.data.token,
    };
  },

  async changePassword({ password, newPassword }) {
    const res = await api.post('/user/change-password', {
      password,
      new_password: newPassword,
    });
    LoginStore.updateLoginData({ ...res.data, next: false });
    UserStore.account.next = res.data.next;
  },

  async changePasswordVerifyCode(codeType) {
    LoginStore.customVerifyCode({
      apiMethod: `/user/change-password`,
      type: codeType,
      callback: () => {
        UserStore.account.next = undefined;
        ErrorsStore.deleteByData('password');
        ErrorsStore.deleteByData('new_password');
      },
    });
  },
});

const api = apiHelper(UserStore);
const { apiPost } = createTypesafeGetPost(api);
