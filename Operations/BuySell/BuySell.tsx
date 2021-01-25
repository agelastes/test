import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Observer, useLocalStore } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { Button, removeTrailingZeros } from 'mercuryo-lab';
import qs from 'qs';

import CONST from '@src/const';
import { bemCssModules } from '@src/utils';
import { useStore } from '@store';
import { OperationRateData } from '@store/ConverterStore';
import { Converter, Rate } from '@containers';

import { CardSelect } from './CardSelect';
import style from './BuySell.scss';

const cn = bemCssModules(style, 'BuySell');

export interface BuySell {
  className?: string;
}

export const BuySell: React.FC<BuySell> = ({ className }) => {
  const { wallets, lib } = useStore();
  const { t } = useTranslation();
  const location = useLocation();
  const search: any = qs.parse(location.search, { ignoreQueryPrefix: true });

  const store = useLocalStore(() => ({
    cvv: '',
    setCvv: (e) => {
      store.cvv = e.target.value;
    },
    userInput: {
      from: {
        amount: search?.from?.amount || '',
        currency: search?.from?.currency || CONST.defaultFiatCurrency,
      },
      to: {
        amount: search?.to?.amount || '',
        currency: search?.to?.currency || CONST.defaultCryptoCurrency,
      },
      whichInput: search?.whichInput as Converter['whichInput'],
      amount: undefined as string | undefined,
    },
    get type() {
      return store.userInput.from.currency &&
        lib.currencies.fiat.includes(store.userInput.from.currency)
        ? CONST.operations.buy
        : CONST.operations.sell;
    },
    rate: undefined as OperationRateData | undefined,
    getRateData(name: 'fee' | 'subtotal' | 'total', currency: string) {
      const amount = store.rate?.[name]?.[currency];
      const prettyAmount = removeTrailingZeros(amount || '0');
      return `${prettyAmount} ${currency}`;
    },
    get cryptoCurrency() {
      return store.userInput[store.type === CONST.operations.buy ? 'to' : 'from'].currency;
    },
    get fiatCurrency() {
      return store.userInput[store.type === CONST.operations.buy ? 'from' : 'to'].currency;
    },
    get buttonDisabled() {
      return (store.type === CONST.operations.buy && !store.cvv) || !wallets.operation.token;
    },
  }));

  useEffect(() => {
    wallets.updateOperationRate();
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    if (store.type === CONST.operations.buy) {
      wallets.buy(store.cvv);
    } else if (store.type === CONST.operations.sell) {
      wallets.sell();
    }
    wallets.updateOperationRate(store.rate);
  };

  const onUserInput: Converter['onUserInput'] = (input) => {
    store.rate = undefined;
    store.userInput.amount = input.amount;
    if (input.whichInput) {
      if (input.amount) {
        store.userInput[input.whichInput].amount = input.amount;
        store.userInput.whichInput = input.whichInput;
      }
      if (input.currency) {
        store.userInput[input.whichInput].currency = input.currency;
      }
    }
  };

  const onChangeRate: Converter['onChangeRate'] = (data) => {
    store.rate = data;
  };

  return (
    <form className={cn(null, [className])} onSubmit={onSubmit}>
      <Observer>
        {() => (
          <div className={cn('title')}>
            {store.type === CONST.operations.buy
              ? t('operations.buy.title')
              : t('operations.sell.title')}{' '}
          </div>
        )}
      </Observer>
      <Converter
        className={cn('converter')}
        fromAmount={store.userInput.from.amount}
        fromCurrency={store.userInput.from.currency}
        toAmount={store.userInput.to.amount}
        toCurrency={store.userInput.to.currency}
        onUserInput={onUserInput}
        onChangeRate={onChangeRate}
        showLimits
      />
      <div className={cn('content')}>
        <Observer>
          {() => (
            <CardSelect
              className={cn('card-select')}
              operationType={store.type}
              cvv={store.cvv}
              setCvv={store.setCvv}
            />
          )}
        </Observer>
        <Observer>
          {() => (
            <div className={cn('info')}>
              <Rate
                className={cn('rate')}
                from={
                  store.userInput.whichInput === 'to'
                    ? store.userInput.to.currency
                    : store.userInput.from.currency
                }
                to={
                  store.userInput.whichInput === 'to'
                    ? store.userInput.from.currency
                    : store.userInput.to.currency
                }
                amount={store.userInput.amount}
                type={store.type}
              />
              <div className={cn('table')}>
                <div>
                  <div>{t('converter.fee')}</div>
                  <div>{store.getRateData('fee', store.userInput.from.currency)}</div>
                </div>
                <div>
                  <div>{t('converter.charge')}</div>
                  <div>{store.getRateData('total', store.userInput.from.currency)}</div>
                </div>
                <div>
                  <div>{t('converter.deposit')}</div>
                  <div>{store.getRateData('total', store.userInput.to.currency)}</div>
                </div>
              </div>
            </div>
          )}
        </Observer>
        <Observer>
          {() => (
            <Button
              className={cn('button')}
              type="submit"
              disabled={store.buttonDisabled}
              isLoading={wallets.isFetching}
            >
              {store.type === 'buy' ? t('operations.types.buy') : t('operations.types.sell')}{' '}
              {store.cryptoCurrency}
            </Button>
          )}
        </Observer>
      </div>
    </form>
  );
};
