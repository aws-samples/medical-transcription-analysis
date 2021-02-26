import React, { useMemo } from 'react';

import s from './AnalysisPane.module.css';
import cs from 'clsx';

import displayNames from '../displayNames';
import { Select, VStack, Box, Flex, IconButton } from '@chakra-ui/react';

const CATEGORIES = [
  'PROTECTED_HEALTH_INFORMATION',
  'MEDICAL_CONDITION',
  'ANATOMY',
  'MEDICATION',
  'TEST_TREATMENT_PROCEDURE',
];

function ResultRow({ result, onToggleItem, excludedItems, onDeleteClick }) {
  const closeIcon = (
    <IconButton
      aria-label='Delete'
      icon={<span>x</span>}
      onClick={onDeleteClick}
      size='sm'
      border='1px solid black'
      borderRadius='50%'
      background='grey'
      color='white'
    />
  );

  if (!result.ICD10CMConcepts && !result.RxNormConcepts) {
    return (
      <Flex width='100%' alignItems='center'>
        <Flex flex='1' mr={2} height='2.5rem' border='1px solid grey' bg='white' px={4} alignItems='center'>
          {result.Text}
        </Flex>

        {closeIcon}
      </Flex>
    );
  }

  const concepts = [...(result.ICD10CMConcepts ? result.ICD10CMConcepts : result.RxNormConcepts)];
  concepts.sort(function (concept1, concept2) {
    return concept2.Score - concept1.Score;
  });

  return (
    <Flex width='100%' alignItems='center'>
      <Select
        mr={2}
        border='1px solid'
        borderColor='grey'
        borderRadius='0'
        bg='white'
        _hover={{ borderColor: 'grey', boxShadow: 'none' }}
      >
        {concepts.map((concept) => (
          <option key={concept.Code} value={concept.Code}>
            {result.Text} | {concept.Code} | {concept.Description}
          </option>
        ))}
      </Select>

      {closeIcon}
    </Flex>
  );
}

function ResultTable({ results, category, onToggleItem, excludedItems, onResultDelete }) {
  const filteredResults = useMemo(() => results.filter((r) => r.Category === category), [results, category]);

  return (
    <Box className={s.resultTable} mb={4}>
      <Box as='h1' mb={4} textAlign='left' fontWeight='bold' fontSize='1.2rem'>
        {displayNames[category]}
      </Box>

      <VStack spacing={2}>
        {filteredResults.map((r) => (
          <ResultRow
            result={r}
            key={r.id}
            onToggleItem={onToggleItem}
            excludedItems={excludedItems}
            onDeleteClick={() => onResultDelete(r)}
          />
        ))}
      </VStack>
    </Box>
  );
}

export default function AnalysisPane({ resultChunks, visible, excludedItems, onToggleItem, onResultDelete }) {
  const allResults = useMemo(() => [].concat(...resultChunks), [resultChunks]);

  return (
    <div className={cs(s.base, visible && s.visible)}>
      {CATEGORIES.map((cat) => (
        <ResultTable
          key={cat}
          results={allResults}
          category={cat}
          onToggleItem={onToggleItem}
          excludedItems={excludedItems}
          onResultDelete={onResultDelete}
        />
      ))}
    </div>
  );
}
