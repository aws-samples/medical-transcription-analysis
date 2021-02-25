import React, { useMemo } from 'react';

import s from './ExportPane.module.css';
import cs from 'clsx';

import displayNames from '../displayNames';

function ResultRow({ result }) {
  const attrs = useMemo(() => {
    const a = [];

    (result.Attributes || []).forEach((attr) => {
      a.push([displayNames[attr.Type], attr.Text]);
    });

    return a;
  }, [result]);

  return (
    <div className={s.result}>
      <h4>{result.Text}</h4>

      <dl>
        {attrs.map(([key, value]) => (
          <>
            <dt>{key}</dt>
            <dd>{value}</dd>
          </>
        ))}
      </dl>
    </div>
  );
}

function ResultTable({ results, category }) {
  const filteredResults = useMemo(() => results.filter((r) => r.Category === category), [results, category]);
  return (
    <div className={s.resultTable}>
      {filteredResults.map((r, i) => (
        <ResultRow result={r} key={i} />
      ))}
    </div>
  );
}

function CategorySummary({ results, category }) {
  const filteredResults = useMemo(() => results.filter((r) => r.Category === category), [results, category]);
  let prefixString,
    resultString,
    suffixString = '';

  if (filteredResults.length === 0) {
    resultString = 'N/A';
  } else {
    if (category === 'ANATOMY') {
      prefixString = "Today's visit mainly focussed on your ";
      suffixString = '.';
    } else if (category === 'MEDICAL_CONDITION') {
      prefixString = 'During the visit we you discussed diagnoses of ';
      suffixString = '.'; 
    } else if (category === 'MEDICATION') {
      prefixString = 'We discussed ';
      suffixString =
        ' during the visit. Taking appropritate medications according to the instructions are important for your recovery and wellness. Please feel free to follow up regarding the them or any other medications.';
    } else if (category === 'TEST_TREATMENT_PROCEDURE') {
      prefixString = 'We discussed ';
      suffixString =
        ' during the visit. Please dont hesitate to reach out with the clinic administrator for questions around the procedures or scheduling them.';
    }
    resultString = prefixString + [...new Set(filteredResults.map((r) => r.Text))].join(', ') + suffixString;
  }

  return (
    <div>
      <p>{resultString}</p>
    </div>
  );
}

export default function ExportPane({ transcriptChunks, resultChunks, visible, excludedItems, soapSummary }) {
  const allResults = useMemo(() => [].concat(...resultChunks), [resultChunks]);
  const filteredResults = useMemo(() => allResults.filter((x) => !excludedItems.includes(x.id)), [
    allResults,
    excludedItems,
  ]);
  
  return (
    <div className={cs(s.base, visible && s.visible)}>
      <div className={s.page}>
        <header>
          <div className={s.logo} />
        </header>

        <main>
          <h2>Apna summary</h2>
          <p>
            {soapSummary}
          </p>
          <h2>Visit Recap</h2>
          
          <p>
            {' '}
            Thank you for visitng the clinic today, {new Date().toISOString().slice(0, 10)}. Please take a moment to
            review the following important information from today's consultation and reach out to us at +12345678910 if
            you have any questions
          </p>

          <h4>Medications</h4>
          <div className={s.meds}>
            <CategorySummary results={filteredResults} category='MEDICATION' />
          </div>

          <h4>Anatomy</h4>
          <div className={s.conds}>
            <CategorySummary results={filteredResults} category='ANATOMY' />
          </div>

          <h4>Medical Conditions</h4>
          <div className={s.conds}>
            <CategorySummary results={filteredResults} category='MEDICAL_CONDITION' />
          </div>

          <h4>Tests, Treatments, Procedures</h4>
          <div className={s.tests}>
            <CategorySummary results={filteredResults} category='TEST_TREATMENT_PROCEDURE' />
          </div>

          <h2>Visit Transcription</h2>
          <div className={s.transcript}>
            <p>Below is the transcription for your visit -</p>
            {(transcriptChunks || []).map((t, i) => (
              <p key={i}>{t.text}</p>
            ))}
          </div>
        </main>
      </div>

      <div className={s.actions}>
        <button className={s.ehr} onClick={() => alert('Please add in the components for your EHR support')}>
          Export to EHR system
        </button>
        <button className={s.pdf} onClick={() => window.print()}>
          Export to PDF
        </button>
      </div>
    </div>
  );
}
