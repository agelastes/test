import React, { useEffect, ChangeEvent } from 'react';
import { Observer } from 'mobx-react-lite';
import { Select, Input } from 'mercuryo-lab';

import { bemCssModules } from '@src/utils';
import { useStore } from '@src/store';

import style from './CardSelect.scss';

const cn = bemCssModules(style, 'CardSelect');

export interface CardSelect {
  className?: string;
  operationType: 'buy' | 'sell';
  cvv: string;
  setCvv: (e: ChangeEvent<HTMLInputElement>) => void;
}

export const CardSelect: React.FC<CardSelect> = ({ className, operationType, cvv, setCvv }) => {
  const { cards, wallets } = useStore();

  useEffect(() => {
    if (!cards.list.length) cards.getCards(true);
  }, []);

  return (
    <div className={cn({ operationType }, [className])}>
      <Observer>
        {() => (
          <Select
            className={cn('select')}
            value={wallets.operation.cardId}
            onChange={wallets.setOperationCardId}
            options={cards.list.map((card) => ({
              value: card.id,
              label: `${card.payment_system.toUpperCase()} ${card.card_number.slice(-5)}`,
            }))}
          />
        )}
      </Observer>
      {operationType === 'buy' && (
        <Observer>
          {() => (
            <Input label="CVC" type="password" hideVisibilityIcon value={cvv} onChange={setCvv} />
          )}
        </Observer>
      )}
    </div>
  );
};
