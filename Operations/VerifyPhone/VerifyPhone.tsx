import React from 'react';

import { bemCssModules } from '@src/utils';
import { useStore } from '@store';
import { Verify } from '@containers/Verify';

import style from './VerifyPhone.scss';

const cn = bemCssModules(style, 'VerifyPhone');

export interface VerifyPhone {
  className?: string;
}

export const VerifyPhone: React.FC<VerifyPhone> = ({ className }) => {
  const { wallets } = useStore();

  return (
    <div className={cn(null, [className])}>
      <div className={cn('title')}>SMS code sent to your phone</div>
      <Verify onSubmit={() => wallets.withdrawVerifyCode('phone')} />
    </div>
  );
};
