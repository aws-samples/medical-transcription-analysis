import s from './SOAPReviewPane.module.css';
import cs from 'clsx';

import { Heading, Textarea } from '@chakra-ui/react';
import ResizeTextarea from 'react-textarea-autosize';

export default function SOAPReviewPane({ visible, onInputChange, inputText }) {
  return (
    <div className={cs(s.base, visible && s.visible)}>
      <div className={s.page}>
        <header>
          <div className={s.logo} />
        </header>

        <main>
          <Heading m='1%' as='h4' size='lg'>
            Provider Notes
          </Heading>

          <Textarea
            value={inputText}
            resize='none'
            minRows={1}
            maxRows={35}
            minH='unset'
            overflow='hidden'
            as={ResizeTextarea}
            onChange={onInputChange}
            backgroundColor='#FFFFFF'
          />
        </main>
      </div>
    </div>
  );
}
