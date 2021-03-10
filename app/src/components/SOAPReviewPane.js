import s from './SOAPReviewPane.module.css';
import cs from 'clsx';

import { Heading, Textarea } from '@chakra-ui/react';

export default function SOAPReviewPane({ visible, onInputChange, inputText }) {
  return (
    <div className={cs(s.base, visible && s.visible)}>
      <div className={s.page}>
        <header>
          <div className={s.logo} />
        </header>

        <main>
          <Heading as='h1' mb={4} textAlign='left' fontWeight='bold' fontSize='1.4em'>
            Provider Notes
          </Heading>

          <Textarea value={inputText} rows={35} onChange={onInputChange} backgroundColor='#FFFFFF' />
        </main>
      </div>
    </div>
  );
}
