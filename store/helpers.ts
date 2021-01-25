import axios from 'axios';
import shortid from 'shortid';

import CONST from '@src/const';
import { RootStore } from '@store';

export const apiHelper = <TStore extends { isFetching: boolean }>(store: TStore) => {
  const api = axios.create({
    baseURL: CONST.api.url,
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      Accept: 'application/json',
    },
    withCredentials: true,
    validateStatus: (status) => status === 200,
    // onUploadProgress: (progressEvent) => {
    //   const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
    //   console.log('percentCompleted', percentCompleted);
    // },
  });
  api.interceptors.request.use((config) => {
    localStorage.setItem('idle_timestamp', new Date().getTime().toString());
    if (RootStore?.login?.editToken) {
      config.headers.common['X-Api-Edit-Token'] = RootStore?.login?.editToken;
    }
    store.isFetching = true;
    return config;
  });
  api.interceptors.response.use(
    (res) => {
      store.isFetching = false;
      return res.data;
    },
    (error) => {
      const notification = {
        ...error?.response?.data,
        id: shortid.generate(),
      };
      if (error?.response?.data?.code === CONST.errorCodes.unathorized) {
        RootStore.login.isLoggedIn = false;
        RootStore.global.redirectTo(CONST.nav.root);
      } else {
        RootStore.errors.push(notification);
      }
      store.isFetching = false;
      return Promise.reject(notification);
    }
  );
  return api;
};
