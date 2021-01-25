import React from 'react';
import { Observer } from 'mobx-react-lite';
import QRCode from 'qrcode.react';

import CONST from '@src/const';
import { bemCssModules } from '@src/utils';
import { useStore } from '@store';

import style from './Transfer.scss';

const cn = bemCssModules(style, 'Transfer');
const { hostDomain } = CONST;

export interface Transfer {
  className?: string;
}

export const Transfer: React.FC<Transfer> = ({ className }) => {
  const { converter } = useStore();

  return (
    <div className={cn(null, [className])}>
      <Observer>
        {() => (
          <div className={cn('title')}>
            Getting {converter.to.amount} {converter.to.currency}
          </div>
        )}
      </Observer>
      <div className={cn('table')}>
        <div>
          <div>1 BTC</div>
          <div>9,850.5 RUB</div>
        </div>
        <div>
          <div>Address</div>
          <div>BVndbeTJeXWLnQtm5bDC2UVpc0vH2TF2ksZPAPwcODSkb</div>
        </div>
      </div>
      <div className={cn('qr-block')}>
        <QRCode
          className={cn('qr-code')}
          value="123"
          size={220}
          bgColor="#fbfbfb"
          fgColor="#232323"
          renderAs="svg"
          level="H"
          imageSettings={{
            src: `${hostDomain}/img/logo_ears_dark.png`,
            x: undefined,
            y: undefined,
            height: 44,
            width: 44,
            excavate: true,
          }}
        />
        <div className={cn('qr-code-text')}>
          To send 0.0067 BTC scan this address with your other wallet. All amounts are calculated at
          a current rate. You will receive money to your card after 3 blockchain confirmations.
          Usually, it takes 15 mins. In some cases, it might take longer.
        </div>
      </div>
      {/* TODO: Common transaction footer */}
    </div>
  );
};
