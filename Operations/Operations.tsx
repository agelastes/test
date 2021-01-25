import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import CONST from '@src/const';
import { bemCssModules } from '@src/utils';

import { BuySell } from './BuySell';
import { Deposit } from './Deposit';
// import { Withdraw } from './Withdraw';
import { Transfer } from './Transfer';
import { Descriptor } from './Descriptor';
import { Status } from './Status';
import { VerifyPhone } from './VerifyPhone';
import { Verify3DS } from './Verify3DS';
import style from './Operations.scss';

const cn = bemCssModules(style, 'Operations');
const { nav } = CONST;

export interface Operations {
  className?: string;
}

export const Operations: React.FC<Operations> = ({ className }) => {
  return (
    <div className={cn(null, [className])}>
      <div className={cn('content')}>
        <Switch>
          <Route path={nav.buySell} component={BuySell} />
          <Route path={nav.deposit} component={Deposit} />
          <Route path={nav.verify3ds} component={Verify3DS} />
          <Route path={nav.transfer} component={Transfer} />
          <Route path={nav['verify-descriptor']} component={Descriptor} />
          <Route path={nav.status} component={Status} />
          {/* <Route path={nav.withdraw} component={Withdraw} /> */}
          <Route path={nav.operationVerifyPhone} component={VerifyPhone} />
          <Redirect exact to={nav.buySell} />
        </Switch>
      </div>
    </div>
  );
};
