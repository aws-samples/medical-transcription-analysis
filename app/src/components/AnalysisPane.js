import React, { useMemo } from 'react';

import s from './AnalysisPane.module.css';
import cs from 'clsx';

import displayNames from '../displayNames';
import { VStack, Box, Flex, IconButton, Select, Input } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';

const CATEGORIES = [
  'MEDICAL_CONDITION',
  'ANATOMY',
  'MEDICATION',
  'TEST_TREATMENT_PROCEDURE',
  'PROTECTED_HEALTH_INFORMATION',
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

  const attrs = useMemo(() => {
    const a = [];

    (result.Attributes || []).forEach((attr) => {
      a.push([displayNames[attr.Type], attr.Text]);
    });
    return a;
  }, [result]);

  if (!result.ICD10CMConcepts && !result.RxNormConcepts && !result.Attributes) {
    return (
      <Flex width='100%' alignItems='center'>
        <Flex
          flex='1'
          mr={2}
          height='2.5rem'
          border={result.Score > 0.5 ? '1px solid green' : '1px solid red'}
          bg='white'
          px={4}
          alignItems='center'
        >
          {result.Text} {result.Type ? '|' : null} {displayNames[result.Type]}
        </Flex>
        {closeIcon}
      </Flex>
    );
  }

  if (!result.ICD10CMConcepts && !result.RxNormConcepts && result.Attributes) {
    return (
      <Flex width='100%' alignItems='center'>
        <Flex
          flex='1'
          mr={2}
          height='2.5rem'
          border={result.Score > 0.5 ? '1px solid green' : '1px solid red'}
          bg='white'
          px={4}
          alignItems='center'
        >
          {attrs.map(([key, value]) => (
            <React.Fragment>
              {result.Text} {value ? '|' : null} {value}
            </React.Fragment>
          ))}
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
        borderColor={concepts[0].Score > 0.5 ? 'green' : 'red'}
        borderRadius='0'
        bg='white'
        _hover={{ borderColor: concepts[0].Score > 0.5 ? 'green' : 'red', boxShadow: 'none' }}
      >
        {concepts.map((concept) => (
          <option key={concept.Code} value={concept.Code}>
            {result.Text} {concept.Code ? ' | ' : null} {concept.Code} {concept.Description ? ' | ' : null}{' '}
            {concept.Description} &nbsp;&nbsp; {(concept.Score * 100).toPrecision(4)}%
          </option>
        ))}
      </Select>

      {closeIcon}
    </Flex>
  );
}

function ResultTable({ results, category, onToggleItem, excludedItems, onResultDelete, onResultAdd }) {
  const filteredResults = useMemo(() => results.filter((r) => r.Category === category), [results, category]);
  const [inputValue, setInputValue] = React.useState('');
  const handleInputChange = (event) => setInputValue(event.target.value);

  const addIcon = (
    <IconButton
      aria-label='Add'
      icon={<AddIcon />}
      onClick={() => [onResultAdd(inputValue, category), setInputValue('')]}
      size='sm'
      borderRadius='0'
      color='grey'
    />
  );

  return (
    <Box className={s.resultTable} mb={4}>
      <Box as='h1' mb={4} textAlign='left' fontWeight='bold' fontSize='1.2rem'>
        {displayNames[category]}
      </Box>

      <VStack spacing={2}>
        <Flex width='100%' alignItems='center'>
          <Input
            mr={2}
            border='1px solid'
            borderColor='grey'
            borderRadius='0'
            bg='white'
            placeholder={'Add ' + displayNames[category]}
            value={inputValue}
            onChange={handleInputChange}
          ></Input>
          {addIcon}
        </Flex>

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

export default function AnalysisPane({
  resultChunks,
  visible,
  excludedItems,
  onToggleItem,
  onResultDelete,
  onResultAdd,
}) {
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
          onResultAdd={onResultAdd}
        />
      ))}
    </div>
  );
}
