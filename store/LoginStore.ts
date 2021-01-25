import { observable } from 'mobx';
import moment from 'moment';
import Cookies from 'js-cookie';

import CONST from '@src/const';
import { apiHelper } from '@store/helpers';
import { addGAEvent, addGAPageview } from '@utils';
import { ApiTypes, createTypesafeGetPost } from '@store/apiTypes';
import { UserStore } from '@store/UserStore';
import { GlobalStore } from '@store/GlobalStore';
import { ErrorsStore } from '@store/ErrorsStore';
import { LibStore } from '@store/LibStore';

export type VerifyCodeType = 'phone' | 'email';
export type VerifiedApiMethods = '/user/signup';

export type LoginStore = {
  isFetching: boolean;
  isLoggedIn: boolean | null;
  captcha: {};
  verifyCode: {
    value: string;
    length: number;
    timeout: number;
  };
  phone: string;
  phonePrefix: string;
  email: string;
  password: string;
  accept: boolean;
  accept_news: boolean;
  country: string;
  verifyKey?: string;
  editToken?: string;
  idleTimeout?: number;
  timer: number;
  setPhone: (value: string) => void;
  setPhonePrefix: (value: string) => void;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  setAccept: (value: boolean) => void;
  setAcceptNews: () => void;
  setCountry: (value: string) => void;
  setCaptcha: (value: {}) => void;
  setTimer: () => void;
  updateLoginData: (data: {
    key?: string;
    edit_token?: string;
    code_length?: string;
    timeout?: number;
    masked?: string;
    next?: string | false;
    token?: string;
    nextState?: Record<string, any>;
  }) => void;
  signup: ApiTypes['/user/signup'];
  login: ApiTypes['/user/login'];
  loginVerifyCode: (type: VerifyCodeType) => void;
  signupSetEmail: () => void;
  customVerifyCode: (params: {
    apiMethod: string;
    type: VerifyCodeType;
    callback?: (data: any) => void;
    next?: Parameters<LoginStore['updateLoginData']>[0]['next'];
    saveCode?: boolean;
  }) => void;
  signupVerifyCode: (type: VerifyCodeType) => void;
  resendCode: () => void;
  resetTimer: () => void;
  setVerifyCode: (value: string, onSubmit?: () => void) => void;
  signupSetPersonalData: () => void;
  logout: () => void;
  getIntercomVerification: () => void;
  recover: ApiTypes['/user/recover'];
  recoverVerifyCode: (type: VerifyCodeType) => void;
  recoverSetPassword: (password: string) => void;
  keepAlive: ApiTypes['/user/keep-alive'];
};

export const LoginStore: LoginStore = observable<LoginStore>({
  isFetching: false,
  isLoggedIn: null,
  captcha: {},
  timer: 0,
  verifyCode: {
    value: '',
    length: 4,
    timeout: 0,
  },
  phone: '',
  phonePrefix: '+7',
  email: '',
  password: '',
  accept: false,
  accept_news: false,
  country: 'ru',

  setPhone(value) {
    LoginStore.phone = value;
    if (!value) ErrorsStore.deleteByData('phone');
  },

  setPhonePrefix(value) {
    LoginStore.phonePrefix = value;
  },

  setEmail(value) {
    LoginStore.email = value;
    if (!value) ErrorsStore.deleteByData('email');
  },

  setPassword(value) {
    LoginStore.password = value;
    if (!value) ErrorsStore.deleteByData('password');
  },

  setAccept(value) {
    LoginStore.accept = value;
  },

  setAcceptNews() {
    LoginStore.accept_news = !LoginStore.accept_news;
  },

  setCountry(value) {
    LoginStore.country = value;
  },

  setCaptcha(value) {
    LoginStore.captcha = value;
  },

  setTimer() {
    LoginStore.resetTimer();
    LoginStore.timer = window.setInterval(() => {
      if (LoginStore.verifyCode.timeout > 0) {
        LoginStore.verifyCode.timeout -= 1;
      } else {
        LoginStore.resetTimer();
      }
    }, 1000);
  },

  async resendCode() {
    const res = await api.post('/verification/resend', { key: LoginStore.verifyKey });
    if (res.data?.timeout) {
      LoginStore.verifyCode.timeout = res.data.timeout;
      LoginStore.verifyKey = res.data.key;
      LoginStore.setTimer();
    }
  },

  resetTimer() {
    window.clearInterval(LoginStore.timer);
  },

  updateLoginData({ key, edit_token, code_length, timeout, masked, next, token, nextState }) {
    if (!token) {
      if (key) LoginStore.verifyKey = key;
      if (edit_token) LoginStore.editToken = edit_token;
      if (code_length) LoginStore.verifyCode.length = +code_length;
      if (timeout) LoginStore.verifyCode.timeout = timeout;
      if (masked && next === 'verify-email') LoginStore.email = masked;
      if (masked && next === 'verify-phone') LoginStore.phone = masked;
    } else {
      LoginStore.editToken = '';
      LoginStore.verifyKey = '';
      if (timeout) LoginStore.idleTimeout = timeout;
      LoginStore.isLoggedIn = true;
      window.parent.postMessage({ type: 'mercuryoSignedIn' }, '*');
      addGAEvent({ category: 'login', action: 'success', label: 'scenario' });
    }
    if (next) GlobalStore.redirectTo(CONST.nav[next], { state: nextState });
  },

  async signup(params) {
    const data = await apiPost('/user/signup', params);
    LoginStore.updateLoginData(data);
    addGAEvent({ category: 'signup', action: 'success', label: 'country_and_phone' });
    return data;
  },

  async signupVerifyCode(type) {
    addGAEvent({ category: 'signup', action: 'submit', label: type });
    LoginStore.customVerifyCode({
      apiMethod: '/user/signup',
      type,
      callback: () => {
        addGAEvent({ category: 'signup', action: 'success', label: type });
      },
    });
  },

  async login(params) {
    const data = await apiPost('/user/login', params);
    LoginStore.updateLoginData({
      ...data,
      next: 'loginPasswordVerifyEmail',
      nextState: {
        masked: data.masked,
      },
    });
    return data;
  },

  async loginVerifyCode(type) {
    LoginStore.customVerifyCode({ apiMethod: '/user/login', type });
  },

  async signupSetEmail() {
    addGAEvent({ category: 'signup', action: 'submit', label: 'set_email' });
    try {
      const data = { email: LoginStore.email };
      const res = await api.post('/user/signup/set-email', data);
      LoginStore.updateLoginData(res.data);
      addGAEvent({ category: 'signup', action: 'success', label: 'set_email' });
    } finally {
      LoginStore.setVerifyCode('');
    }
  },

  async customVerifyCode({ apiMethod, type, next, callback, saveCode }) {
    const params = { code: LoginStore.verifyCode.value, key: LoginStore.verifyKey };
    try {
      const { data } = await api.post(`${apiMethod}/verify-${type}`, params);
      LoginStore.updateLoginData({ ...data, next: next ?? data.next });
      if (callback) callback(data);
      return data;
    } finally {
      if (saveCode) window.localStorage.setItem('emailCode', params.code);
    }
  },

  setVerifyCode(value, onSubmit) {
    LoginStore.verifyCode.value = value;
    if (LoginStore.verifyCode.value.length === LoginStore.verifyCode.length && onSubmit) {
      onSubmit();
    }
  },

  async signupSetPersonalData() {
    const data = {
      first_name: UserStore.firstName,
      last_name: UserStore.lastName,
      birthday: moment(UserStore.birthday, 'DD/MM/YYYY').format('YYYY-MM-DD'),
    };
    const res = await api.post('/user/signup/set-personal-data', data);
    LoginStore.updateLoginData(res.data);
    addGAEvent({ category: 'signup', action: 'success', label: 'personal_data' });
    if (res.data.token) {
      addGAEvent({ category: 'registration', action: 'success' });
      addGAPageview('/funnel-registration');
    }
    const lang = Cookies.get('lang');
    const languageCode = LibStore.languages.find(({ code }) => lang === code.slice(0, 2))?.code;
    if (languageCode) UserStore.setLanguage(languageCode);
  },

  async logout() {
    await api.get('/user/logout');
    LoginStore.isLoggedIn = false;
    LoginStore.idleTimeout = undefined;
    document.location.reload();
  },

  async getIntercomVerification() {
    const res = await api.get('/verification/intercom');
    window.intercomSettings.user_hash = res.data.web;
    window.intercomSettings.user_id = UserStore.data.email;
    window.Intercom('update');
  },

  async recover({ email }) {
    const data = await apiPost('/user/recover', { email });
    LoginStore.updateLoginData({ ...data, next: 'recoverVerifyPhone' });
    return data;
  },

  async recoverVerifyCode(type) {
    LoginStore.customVerifyCode({
      apiMethod: '/user/recover',
      type,
      next: type === 'phone' ? 'recoverVerifyEmail' : undefined,
      saveCode: type === 'email',
    });
    addGAEvent({ category: 'recover-verify', action: 'success', label: type });
  },

  async recoverSetPassword(password) {
    const res = await api.post('/user/recover/set-password', {
      password,
      code: window.localStorage.getItem('emailCode'),
      key: LoginStore.verifyKey,
    });
    LoginStore.updateLoginData(res.data);
    window.localStorage.removeItem('emailCode');
  },

  keepAlive: (params) => apiGet('/user/keep-alive', { params }),
});

const api = apiHelper(LoginStore);
const { apiGet, apiPost } = createTypesafeGetPost(api);
