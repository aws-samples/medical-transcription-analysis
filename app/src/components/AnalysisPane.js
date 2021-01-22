import React, { useMemo, useState, useCallback } from 'react';

import s from './AnalysisPane.module.css';
import cs from 'clsx';

import displayNames from '../displayNames';
import HeightSlider from './HeightSlider';

const CATEGORIES = [
  'PROTECTED_HEALTH_INFORMATION',
  'MEDICAL_CONDITION',
  'ANATOMY',
  'MEDICATION',
  'TEST_TREATMENT_PROCEDURE'
];

function ConceptTable({rows}) {
  const [ open, setOpen ] = useState(false);

  return (
    <HeightSlider>
      {open ?
        <>
          <span className={cs(s.toggleLink, s.expanded)} onClick={() => setOpen(false)}>{rows.length} detected</span>
          <dl>
            {rows.map((c, i) => <>
              <dt>{c.Code}</dt>
              <dd>{c.Description}</dd>
            </>)}
          </dl>
        </>
      :
        <span className={cs(s.toggleLink, s.contracted)} onClick={() => setOpen(true)}>{rows.length} detected</span>
      }
    </HeightSlider>
  )
}


function ResultRow({
  result,
  onToggleItem,
  excludedItems
}) {

  const onHide = useCallback(() => {
    onToggleItem(result.id)
  }, [ onToggleItem, result.id ]);

  const isExcluded = useMemo(() => excludedItems.includes(result.id), [ excludedItems, result.id ]);

  const attrs = useMemo(() => {
    const a = [ [ 'Type', displayNames[result.Type] ] ];

    (result.Attributes || []).forEach(attr => {
      a.push([
        displayNames[attr.Type],
        attr.Text
      ]);
    });

    if (result.ICD10CMConcepts) {
      a.push([
        'ICD-10-CM Concepts',
        <ConceptTable rows={result.ICD10CMConcepts} />
      ]);
      // Code, Description, Score
    }

    if (result.RxNormConcepts) {
      // Code, Descroption, Score
      a.push([
        'RxNorm Concepts',
        <ConceptTable rows={result.RxNormConcepts} />
      ]);
    }

    return a;
  }, [ result ]);


  return (
    <div className={cs(s.result, isExcluded && s.excluded)}>
      <button className={s.removeButton} onClick={onHide} aria-label="Exclude this item from the export" />
      <h4>{result.Text}</h4>

      <dl>
        {attrs.map(([ key, value ]) => (
          <>
            <dt>{key}</dt>
            <dd>{value}</dd>
          </>
        ))}
      </dl>
    </div>
  )
}

function ResultTable({
  results,
  category,
  onToggleItem,
  excludedItems
}) {
  const filteredResults = useMemo(() => results.filter(r => r.Category === category), [ results, category ]);
  const [ open, setOpen ] = useState(false);


  return <div className={s.resultTable}>
    <h3 className={open ? s.expanded : s.contracted} onClick={() => setOpen(x => !x)}>{displayNames[category]}</h3>

    <HeightSlider>
      {open ?
        <div>
          {filteredResults.map((r, i) => (
            <ResultRow
              result={r}
              key={r.id}
              onToggleItem={onToggleItem}
              excludedItems={excludedItems}
            />
          ))}
        </div>
      : null }
    </HeightSlider>
  </div>
}




export default function AnalysisPane({
  resultChunks,
  visible,
  excludedItems,
  onToggleItem
}) {
  const allResults = useMemo(() => [].concat(...resultChunks), [resultChunks]);

  return (
    <div className={cs(s.base, visible && s.visible)}>
      { CATEGORIES.map(cat => (
        <ResultTable results={allResults} category={cat} onToggleItem={onToggleItem} excludedItems={excludedItems} />
      ))}
    </div>
  )
}
