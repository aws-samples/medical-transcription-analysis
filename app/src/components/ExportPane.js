import React, { useMemo } from 'react';

import s from './ExportPane.module.css';
import cs from 'clsx';
import ExportPaneHeader from './ExportPaneHeader/ExportPaneHeader';

const getFormattedResult = (category, filteredResults) => {
  const isMedicalCondition = category === 'MEDICAL_CONDITION';
  const isMedication = category === 'MEDICATION';

  if (isMedicalCondition || isMedication) {
    const conceptProperty = isMedicalCondition ? 'ICD10CMConcepts' : 'RxNormConcepts';

    return filteredResults
      .map((result) => {
        const text = result.Text;

        const concepts = result[conceptProperty];

        if (!concepts) return text;

        const selectedConcept = concepts.find((concept) => concept.Code === result.selectedConceptCode);

        return `${text}|${selectedConcept.Code}|${selectedConcept.Description}`;
      })
      .join('\n');
  }

  return filteredResults.length > 0
    ? filteredResults
        .map(({ Text, Attributes }) => `${Text}${Attributes?.map((key) => `|${key.Text}`).join('') ?? ''}`)
        .join('\n')
    : 'N/A';
};

function CategorySummary({ results, category }) {
  const filteredResults = useMemo(() => results.filter((r) => r.Category === category), [results, category]);

  return <p>{getFormattedResult(category, filteredResults)}</p>;
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
          <ExportPaneHeader content='Summary' type='SECTION' />
          <p>
            Thank you for visiting the clinic today, {new Date().toISOString().slice(0, 10)}. Please take a moment to
            review the following important information from today's consultation and reach out to us at +12345678910 if
            you have any questions.
          </p>
          <p>{soapSummary}</p>

          <ExportPaneHeader content='Medications' type='SUB_SECTION' />

          <CategorySummary results={filteredResults} category='MEDICATION' />

          <ExportPaneHeader content='Anatomy' type='SUB_SECTION' />
          <CategorySummary results={filteredResults} category='ANATOMY' />

          <ExportPaneHeader content='Medical Conditions' type='SUB_SECTION' />
          <CategorySummary results={filteredResults} category='MEDICAL_CONDITION' />

          <ExportPaneHeader content='Tests, Treatments, Procedures' type='SUB_SECTION' />
          <CategorySummary results={filteredResults} category='TEST_TREATMENT_PROCEDURE' />

          <ExportPaneHeader content='Visit Transcription' type='SECTION' />
          <div className={s.transcript}>
            <p>Below is the transcription for your visit -</p>
            {(transcriptChunks ? transcriptChunks : []).map((t, i) => (
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
