import React, { useEffect } from 'react';
import { useObserver, useLocalStore } from 'mobx-react-lite';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import qs from 'qs';
import { Loader, removeTrailingZeros } from 'mercuryo-lab';

import CONST from '@src/const';
import { bemCssModules } from '@src/utils';
import { useStore } from '@store';

import style from './Status.scss';

const cn = bemCssModules(style, 'Status');
let timeout;

export interface Status {
  className?: string;
}

export const Status: React.FC<Status> = ({ className }) => {
  const { cards, user, wallets } = useStore();
  const { t } = useTranslation();
  const location = useLocation();
  const search: any = qs.parse(location.search, { ignoreQueryPrefix: true });

  const store = useLocalStore(() => ({
    status: null as string | null,
    get currentCardTitle() {
      const item = cards.list.find((card) => card && card.id === wallets.operation.cardId);
      return item ? `${item.payment_system.toUpperCase()} ${item.card_number.slice(-5)}` : '';
    },
    getRateData(name: 'fee' | 'subtotal' | 'total', currency: string) {
      const amount = wallets.operation.rate?.[name]?.[currency];
      const prettyAmount = removeTrailingZeros(amount || '0');
      return `${prettyAmount} ${currency}`;
    },
  }));

  const getStatusPolling = () => {
    if (['pending', null].includes(store.status) && search.id && search.type) {
      wallets
        .getStatus(search.type, search.id)
        .then((data) => {
          store.status = data.status;
        })
        .catch(() => {
          store.status = 'not_found';
        });
      timeout = window.setTimeout(getStatusPolling, CONST.getStatusInterval);
    }
  };

  useEffect(() => {
    getStatusPolling();
    return () => {
      window.clearTimeout(timeout);
    };
  }, []);

  const statusTitles = {
    pending: t('operations.status.pending'),
    paid: t('operations.status.paid'),
    succeeded: t('operations.status.succeeded'),
    order_failed: t('operations.status.order_failed'),
    not_found: t('operations.status.not_found'),
  };

  return useObserver(() =>
    store.status ? (
      <div className={cn(null, [className])}>
        <div className={cn('title', { status: store.status })}>
          {statusTitles[store.status] || statusTitles.order_failed}
        </div>
        <div className={cn('subtitle')}>
          {store.status === 'pending'
            ? t('status.subtitles.pending')
            : store.status === 'paid'
            ? `${t('status.subtitles.paid')} ${user.data.email}`
            : // TODO: Error message
              ''}
        </div>
        {!!Object.keys(wallets.operation).length && (
          <div className={cn('table')}>
            {store.currentCardTitle && (
              <div>
                <div>{t('cards.card')}&nbsp;</div>
                <div>{store.currentCardTitle}</div>
              </div>
            )}
            {wallets.operation.rate &&
              wallets.operation.currency &&
              wallets.operation.fiat_currency && (
                <>
                  <div>
                    <div>{t('converter.rate')}</div>
                    <div>
                      1 {wallets.operation.currency} ={' '}
                      {removeTrailingZeros(wallets.operation.rate.rate)}{' '}
                      {wallets.operation.fiat_currency}
                    </div>
                  </div>
                  {['pending', 'paid', 'complete', 'succeeded'].includes(store.status)}
                  <div>
                    <div>{t('converter.fee')}</div>
                    <div>
                      {store.getRateData(
                        'fee',
                        wallets.operation.type === 'buy'
                          ? wallets.operation.fiat_currency
                          : wallets.operation.currency
                      )}
                    </div>
                  </div>
                  <div>
                    <div>
                      {wallets.operation.type === 'buy'
                        ? t('converter.charge')
                        : t('converter.deposit')}
                    </div>
                    <div>{store.getRateData('total', wallets.operation.fiat_currency)}</div>
                  </div>
                </>
              )}
            {wallets.operation.rate && (
              <>
                {/* <div>
                <div>Address&nbsp;</div>
                <div />
              </div> */}
                {/* TODO: Details */}
                {/* <div>
                <div>Details&nbsp;</div>
                <div />
              </div> */}
              </>
            )}
          </div>
        )}
      </div>
    ) : (
      <div className={cn('loader')}>
        <Loader />
      </div>
    )
  );
};
