import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import qs from 'qs';

import CONST from '@src/const';
import { bemCssModules } from '@src/utils';
import { useStore } from '@src/store';
import { Card3DSFlow } from '@src/containers';

import style from './Verify3DS.scss';

const cn = bemCssModules(style, 'Verify3DS');
const { nav } = CONST;

export interface Verify3DS {
  className?: string;
}

export const Verify3DS: React.FC<Verify3DS> = ({ className }) => {
  const { wallets, global } = useStore();
  const location = useLocation();
  const search: any = qs.parse(location.search, { ignoreQueryPrefix: true });

  useEffect(() => {
    if (!search.id || !search.type) global.redirectTo(nav.root);
  }, []);

  return (
    <Card3DSFlow
      className={cn(null, [className])}
      onSuccess={(type, id) =>
        wallets.getStatus(type, id).then(({ next }) => {
          global.redirectTo(next ? nav[next] : nav.status, {
            search: { type, id },
          });
        })
      }
    />
  );
};
