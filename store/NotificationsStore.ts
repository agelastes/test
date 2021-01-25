import { observable } from 'mobx';

export type NotificationButton = {
  label: string;
  onClick: () => void;
};

export type Notification = {
  id: string;
  name?: string;
  message: React.ReactNode;
  buttons?: [NotificationButton, NotificationButton?];
};

export type NotificationsStore = {
  list: Notification[];

  push: (notification: Notification) => void;
  delete: (id: string) => void;
  deleteAll: () => void;
};

export const NotificationsStore: NotificationsStore = observable<NotificationsStore>({
  list: [],

  push(notification) {
    NotificationsStore.list.push(notification);
  },

  delete(id) {
    NotificationsStore.list = NotificationsStore.list.filter((item) => item.id !== id);
  },

  deleteAll() {
    NotificationsStore.list = [];
  },
});
