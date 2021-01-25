import { observable } from 'mobx';

export type ApiError = {
  name: string;
  message: string;
  code?: number;
  status?: number;
  data?: {
    phone?: [string?];
    email?: [string?];
    password?: [string?];
    new_password?: [string?];
    amount?: [string?];
    number?: [string?];
    holder_name?: [string?];
    captcha?: {};
  };
};

export type Error = {
  id: string;
  buttons?: [string, string?];
} & ApiError;

export type ErrorsStore = {
  list: Error[];

  push: (error: Error) => void;
  delete: (id: string) => void;
  deleteByData: (key: keyof NonNullable<Error['data']>) => void;
  deleteAll: () => void;
};

export const ErrorsStore: ErrorsStore = observable<ErrorsStore>({
  list: [],

  push(error) {
    ErrorsStore.list = [];
    ErrorsStore.list.push(error);
  },

  delete(id) {
    ErrorsStore.list = ErrorsStore.list.filter((item) => item.id !== id);
  },

  deleteByData(key) {
    ErrorsStore.list
      .filter((item) => !!item.data?.[key])
      .forEach((item) => {
        ErrorsStore.delete(item.id);
      });
  },

  deleteAll() {
    ErrorsStore.list = [];
  },
});
