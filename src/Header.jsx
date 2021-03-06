import React from 'react';

import { getFullName } from '../utils';

const Header = ({ description, ...rest }) => (
  <header>
    <div>{getFullName(rest)}</div>
    <div className='description'>{`{ ${description} }`}</div>
  </header>
);

export default Header;
