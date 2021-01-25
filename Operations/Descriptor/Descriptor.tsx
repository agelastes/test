import React from 'react';
import { Input, Button } from 'mercuryo-lab';
import { Observer, useLocalStore } from 'mobx-react-lite';

import { bemCssModules } from '@src/utils';
import { useStore } from '@store';

import { useTranslation } from 'react-i18next';
import style from './Descriptor.scss';

const cn = bemCssModules(style, 'Descriptor');

export interface Descriptor {
  className?: string;
}

export const Descriptor: React.FC<Descriptor> = ({ className }) => {
  const { wallets } = useStore();
  const { t } = useTranslation();
  const store = useLocalStore(() => ({
    get buttonDisabled() {
      return wallets.descriptor.code === wallets.descriptor.prefix || wallets.isFetching;
    },
  }));

  const handleChange = (e) => {
    wallets.setDescriptor(e.target.value);
  };
  const onSubmit = (e) => {
    e.preventDefault();
    wallets.verifyDescriptor();
  };

  return (
    <div className={cn(null, [className])}>
      <div className={cn('title')}>{t('card_confirmation.title')}</div>
      <div className={cn('subtitle')}>
        <b>{t('card_confirmation.subtitle_1')}</b>
      </div>
      <div className={cn('subtitle')}>{t('card_confirmation.subtitle_2')}</div>
      <ol className={cn('list')}>
        <li>
          Find mercuryo.io in recent transactions in your bank's app or find the info in bank's SMS
          or push notification.
          <div className={cn('example')}>
            <div>Mercuryo | 12345</div>
            <div>−XX EUR</div>
          </div>
        </li>
        <li>{t('card_confirmation.enter_code', { prefix: wallets.descriptor.prefix })}</li>
      </ol>
      <form className={cn('form')} onSubmit={onSubmit}>
        <Observer>
          {() => (
            <Input label="Code" value={wallets.descriptor.code} onChange={handleChange} autoFocus />
          )}
        </Observer>
        <Observer>
          {() => (
            <Button type="submit" disabled={store.buttonDisabled}>
              {t('confirm')}
            </Button>
          )}
        </Observer>
      </form>
    </div>
  );
};
