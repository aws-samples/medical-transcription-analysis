import React, { useMemo } from 'react';

import s from './ExportPane.module.css';
import cs from 'clsx';
import { Divider, Heading } from '@chakra-ui/react';

function conceptScoreSort(conceptArray) {
  conceptArray.sort(function (concept1, concept2) {
    return concept2.Score - concept1.Score;
  });
  return conceptArray;
}

function CategorySummary({ results, category }) {
  const filteredResults = useMemo(() => results.filter((r) => r.Category === category), [results, category]);
  let formattedResult = '';
  if (category === 'MEDICAL_CONDITION') {
    for (let i = 0; i < filteredResults.length; i++) {
      formattedResult = filteredResults[i].Text;
      if (filteredResults[i].ICD10CMConcepts) {
        let concept = conceptScoreSort(filteredResults[i].ICD10CMConcepts);
        formattedResult += '|' + concept[0].Code + '|' + concept[0].Description + '\n';
      }
    }
  } else if (category === 'MEDICATION') {
    for (let i = 0; i < filteredResults.length; i++) {
      formattedResult = filteredResults[i].Text;
      if (filteredResults[i].RxNormConcepts) {
        let concept = conceptScoreSort(filteredResults[i].RxNormConcepts);
        formattedResult += '|' + concept[0].Code + '|' + concept[0].Description + '\n';
      }
    }
  } else {
    formattedResult =
      filteredResults.length > 0
        ? filteredResults.map(
            (result) => result.Text + (result.Attributes ? result.Attributes.map((key) => '|' + key.Text) : '') + '\n',
          )
        : 'N/A\n';
  }

  return (
    <div>
      <p>{formattedResult}</p>
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
          <Heading as='h2' size='lg'>
            Summary
          </Heading>
          <p>
            Thank you for visitng the clinic today, {new Date().toISOString().slice(0, 10)}. Please take a moment to
            review the following important information from today's consultation and reach out to us at +12345678910 if
            you have any questions.
          </p>
          <p>{soapSummary}</p>

          <Heading marginTop='1%' as='h4' size='md'>
            Medications
          </Heading>
          <div>
            <CategorySummary results={filteredResults} category='MEDICATION' />
          </div>

          <Heading marginTop='1%' as='h4' size='md'>
            Anatomy
          </Heading>
          <div>
            <CategorySummary results={filteredResults} category='ANATOMY' />
          </div>

          <Heading marginTop='1%' as='h4' size='md'>
            Medical Conditions
          </Heading>
          <div>
            <CategorySummary results={filteredResults} category='MEDICAL_CONDITION' />
          </div>

          <Heading marginTop='1%' as='h4' size='md'>
            Tests, Treatments, Procedures
          </Heading>
          <div>
            <CategorySummary results={filteredResults} category='TEST_TREATMENT_PROCEDURE' />
          </div>

          <Heading marginTop='1%' as='h2' size='lg'>
            Visit Transcription
          </Heading>

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
