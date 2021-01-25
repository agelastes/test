import React, { useEffect } from 'react';
import { action, autorun } from 'mobx';
import { Observer, useLocalStore } from 'mobx-react-lite';
import { Checkbox } from 'mercuryo-lab';
import QRCode from 'qrcode.react';

import { bemCssModules } from '@src/utils';
import { useStore } from '@store';

import style from './Deposit.scss';

const cn = bemCssModules(style, 'Deposit');

export interface Deposit {
  className?: string;
}

export const Deposit: React.FC<Deposit> = ({ className }) => {
  const { lib, wallets } = useStore();
  const store = useLocalStore(() => ({
    selectedCurrency: 'BTC',
    setSelectedCurrency: action((currency?: string) => {
      if (currency) store.selectedCurrency = currency;
    }),
  }));

  useEffect(
    () =>
      autorun(() => {
        wallets.getAddress(store.selectedCurrency);
      }),
    []
  );

  return (
    <div className={cn(null, [className])}>
      <Observer>
        {() => (
          <>
            {lib.currencies.crypto.map((currency) => (
              <div className={cn('tabs')} key={currency}>
                <Checkbox
                  checked={store.selectedCurrency === currency}
                  onClick={() => store.setSelectedCurrency(currency)}
                />
                {currency}
              </div>
            ))}
            {wallets.deposit.address}
            <QRCode
              value={wallets.deposit.address}
              size={220}
              bgColor="#fbfbfb"
              fgColor="#232323"
            />
          </>
        )}
      </Observer>
    </div>
  );
};
