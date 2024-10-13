import { Result } from 'antd';
import React from 'react';

interface IPage500 {
    errmess: string
}

const NoFoundPage: React.FC<IPage500> = (props) => (
    <Result
        status="500"
        title="Coś jest źle"
        subTitle={`Nie udało się wystartować aplikacji, prawdopodobnie jest problem z komunikacją sieciową: ${props.errmess}`}
    />
)

export default NoFoundPage;