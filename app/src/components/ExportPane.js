import React, { useMemo } from 'react';

import s from './ExportPane.module.css';
import cs from 'clsx';


import displayNames from '../displayNames';

function ResultRow({
  result
}) {

  const attrs = useMemo(() => {
    const a = [ ];

    (result.Attributes || []).forEach(attr => {
      a.push([
        displayNames[attr.Type],
        attr.Text
      ]);
    });

    return a;
  }, [ result ]);


  return (
    <div className={s.result}>
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
  category
}) {
  const filteredResults = useMemo(() => results.filter(r => r.Category === category), [ results, category ]);
  return <div className={s.resultTable}>
    {filteredResults.map((r, i) => (
      <ResultRow result={r} key={i} />
    ))}
  </div>
}




export default function ExportPane({
  transcriptChunks,
  resultChunks,
  visible,
  excludedItems
}) {


  const allResults = useMemo(() => [].concat(...resultChunks), [resultChunks]);
  const filteredResults = useMemo(() => allResults.filter(x => !excludedItems.includes(x.id)), [ allResults, excludedItems ]);

  return (
    <div className={cs(s.base, visible && s.visible)}>

      <div className={s.page}>
        <header>
          <div className={s.logo} />
        </header>

        <main>
          <h2>Visit Transcription</h2>
          <div className={s.transcript}>
            {(transcriptChunks || []).map((t, i) => (
              <p key={i}>{t.text}</p>
            ))}
          </div>

          <h2>Medications</h2>
          <div className={s.meds}>
            <ResultTable results={filteredResults} category="MEDICATION" />
          </div>

          <h2>Medical Conditions</h2>
          <div className={s.conds}>
            <ResultTable results={filteredResults} category="MEDICAL_CONDITION" />
          </div>

          <h2>Tests, Treatments, Procedures</h2>
          <div className={s.tests}>
            <ResultTable results={filteredResults} category="TEST_TREATMENT_PROCEDURE" />
          </div>

        </main>
      </div>

      <div className={s.actions}>
        <button className={s.ehr} onClick={()=> alert("Please add in the components for your EHR support")} >Export to EHR system</button>
        <button className={s.pdf} onClick={() => window.print()}>Export to PDF</button>
      </div>

    </div>
  )
}
