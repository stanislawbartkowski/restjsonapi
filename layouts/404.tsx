import { Result } from 'antd';
import React from 'react';

const NoFoundPage: React.FC = () => (
  <Result
    status="404"
    title="404"
    subTitle="Niestety, taka strona nie istnieje."
  />
);

export default NoFoundPage;
