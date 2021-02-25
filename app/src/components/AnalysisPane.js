import React, { useMemo, useState, useCallback } from 'react';

import s from './AnalysisPane.module.css';
import cs from 'clsx';

import displayNames from '../displayNames';
import { Collapse, useDisclosure, Select } from '@chakra-ui/react';

const CATEGORIES = [
  'PROTECTED_HEALTH_INFORMATION',
  'MEDICAL_CONDITION',
  'ANATOMY',
  'MEDICATION',
  'TEST_TREATMENT_PROCEDURE',
];

function ConceptTable({ rows }) {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <>
      <span className={cs(s.toggleLink, isOpen ? s.expanded : s.contracted)} onClick={onToggle}>
        {rows.length} detected
      </span>
      <Collapse in={isOpen}>
        <dl>
          {rows.map((c, i) => (
            <React.Fragment key={i}>
              <dt>{c.Code}</dt>
              <dd>{c.Description}</dd>
            </React.Fragment>
          ))}
        </dl>
      </Collapse>
    </>
  );
}

function ResultRow({ result, onToggleItem, excludedItems }) {
  if (!result.ICD10CMConcepts && !result.RxNormConcepts) {
    return <div>{result.Text}</div>;
  }
  const concepts = [...(result.ICD10CMConcepts ? result.ICD10CMConcepts : result.RxNormConcepts)];
  concepts.sort(function (concept1, concept2) {
    return concept1.Score - concept2.Score;
  });
  console.log(result);
  return (
    <Select bg='white'>
      {concepts.map((concept) => (
        <option key={concept.Code} value={concept.Code}>
          {result.Text} | {concept.Code} | {concept.Description}
        </option>
      ))}
    </Select>
  );
}

function ResultTable({ results, category, onToggleItem, excludedItems }) {
  const filteredResults = useMemo(() => results.filter((r) => r.Category === category), [results, category]);
  const { isOpen, onToggle } = useDisclosure();

  return (
    <div className={s.resultTable}>
      <h3 className={isOpen ? s.expanded : s.contracted} onClick={onToggle}>
        {displayNames[category]}
      </h3>

      <Collapse in={isOpen}>
        <div>
          {filteredResults.map((r, i) => (
            <ResultRow result={r} key={r.id} onToggleItem={onToggleItem} excludedItems={excludedItems} />
          ))}
        </div>
      </Collapse>
    </div>
  );
}

export default function AnalysisPane({ resultChunks, visible, excludedItems, onToggleItem }) {
  const allResults = useMemo(() => [].concat(...resultChunks), [resultChunks]);

  return (
    <div className={cs(s.base, visible && s.visible)}>
      {CATEGORIES.map((cat) => (
        <ResultTable results={allResults} category={cat} onToggleItem={onToggleItem} excludedItems={excludedItems} />
      ))}
    </div>
  );
}
