import React from 'react';
import { Heading } from '@chakra-ui/react';

export default function ExportPaneHeader({ type, content }) {
  const isSection = type === 'SECTION';
  const isSubSection = type === 'SUB_SECTION';

  const headingType = isSection ? 'h2' : isSubSection ? 'h3' : 'h4';
  const headingSize = isSection ? 'lg' : isSubSection ? 'md' : 'sm';

  return (
    <Heading marginTop='1%' as={headingType} size={headingSize}>
      {content}
    </Heading>
  );
}
