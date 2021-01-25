import { observable } from 'mobx';

import CONST from '@src/const';
import { apiHelper } from '@store/helpers';

export type Story = {
  id: string;
  slug: string;
  featured_media_url: string;
  title: { rendered: string };
};

export type StoriesStore = {
  isFetching: boolean;
  list: Story[];
  getStories: (count: number, lang?: string) => void;
};

export const StoriesStore: StoriesStore = observable<StoriesStore>({
  isFetching: false,
  list: [],

  async getStories(count, lang = CONST.defaultLang) {
    const res = await api.get(CONST.api.blog, { params: { per_page: count, lang } });
    StoriesStore.list = Array.isArray(res) ? res : [];
  },
});

const api = apiHelper(StoriesStore);
