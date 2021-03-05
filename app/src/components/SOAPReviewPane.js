import React, { useMemo } from 'react';

import s from './SOAPReviewPane.module.css';
import cs from 'clsx';

import displayNames from '../displayNames';
import { Textarea } from '@chakra-ui/react';
import ResizeTextarea from 'react-textarea-autosize';
import { Heading } from '@chakra-ui/react';
import { Divider } from '@chakra-ui/react';

function isAbsentDiagnosis(myArray) {
  return myArray.some((el) => el.Name === 'DIAGNOSIS') && myArray.some((el) => el.Name === 'NEGATION');
}

function isPresentDiagnosis(myArray) {
  return myArray.some((el) => el.Name === 'DIAGNOSIS') && !myArray.some((el) => el.Name === 'NEGATION');
}

function isPresentSymptom(myArray) {
  return myArray.some((el) => el.Name === 'SYMPTOM') && !myArray.some((el) => el.Name === 'NEGATION');
}

function isAbsentSymptom(myArray) {
  return myArray.some((el) => el.Name === 'SYMPTOM') && !myArray.some((el) => el.Name === 'NEGATION');
}

function generateSOAPSummary(results) {
  let presentDiagnosedConditions = [],
    absentDiagnosedConditions = [],
    presentSymptomConditions = [],
    absentSymptomConditions = [];

  let medicalConditions = results.filter((r) => r.Category === 'MEDICAL_CONDITION');

  for (let index = 0; index < medicalConditions.length; index++) {
    if (isPresentDiagnosis(medicalConditions[index].Traits)) {
      presentDiagnosedConditions.push(medicalConditions[index]);
    } else if (isAbsentDiagnosis(medicalConditions[index].Traits)) {
      absentSymptomConditions.push(medicalConditions[index]);
    } else if (isPresentSymptom(medicalConditions[index].Traits)) {
      presentSymptomConditions.push(medicalConditions[index]);
    } else if (isAbsentSymptom(medicalConditions[index].Traits)) {
      absentSymptomConditions.push(medicalConditions[index]);
    }
  }

  let medications = results.filter((r) => r.Category === 'MEDICATION');
  let anatomy = results.filter((r) => r.Category === 'ANATOMY');
  let testTreatmentProcedures = results.filter((r) => r.Category === 'TEST_TREATMENT_PROCEDURE');

  let summary = '\nAssessment:- \n \nDiagnosis: \n';
  if (presentDiagnosedConditions.length > 0)
    summary +=
      'Patient is likely suffering from ' +
      [...new Set(presentDiagnosedConditions.map((r) => r.Text))].join(', ') +
      '. ';
  if (absentDiagnosedConditions.length > 0)
    summary +=
      'It is not likely that the patient is suffering from' +
      [...new Set(absentDiagnosedConditions.map((r) => r.Text))].join(', ') +
      '. ';

  summary += '\n\nPlan:-\n';
  if (medications.length > 0)
    summary +=
      'The suggested plan is to take the following medication(s): ' +
      [...new Set(medications.map((r) => r.Text))].join(', ') +
      '. ';
  if (testTreatmentProcedures.length > 0)
    summary +=
      'The suggested treatment to follow is outlined treatment(s): \n' +
      [...new Set(medications.map((r) => r.Text))].join(', ') +
      '. ';

  summary += '\n\nSubjective:-\n';

  summary += '\nChief Complaint(s):\n';
  if (presentDiagnosedConditions.length > 0)
    summary += 'Patient presents with ' + [...new Set(presentDiagnosedConditions.map((r) => r.Text))].join(', ') + '.';

  summary += '\nHistory of Patient Illness(s):\n';
  if (presentDiagnosedConditions.length > 0)
    summary += 'Patient is here for ' + [...new Set(presentDiagnosedConditions.map((r) => r.Text))].join(', ') + '.';
  if (anatomy.length > 0)
    summary += 'Patient noted issues with: ' + [...new Set(anatomy.map((r) => r.Text))].join(', ');
  if (presentSymptomConditions.length > 0)
    summary += 'with symptoms like ' + [...new Set(presentSymptomConditions.map((r) => r.Text))].join(', ') + '.';
  if (absentSymptomConditions.length > 0)
    summary +=
      'Additionally , noted no occurrences of ' +
      [...new Set(presentSymptomConditions.map((r) => r.Text))].join(', ') +
      '.';
  if (medications.length > 0)
    summary +=
      'Current medications include ' + [...new Set(presentSymptomConditions.map((r) => r.Text))].join(', ') + '.';

  if (absentDiagnosedConditions.length > 0)
    summary +=
      'It is not likely that the patient is sufferring from ' +
      [...new Set(absentDiagnosedConditions.map((r) => r.Text))].join(', ') +
      '.';

  summary += '\n';
  return summary;
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

export default function SOAPReviewPane({ resultChunks, excludedItems, visible, onTextAreaEdit }) {
  const allResults = useMemo(() => [].concat(...resultChunks), [resultChunks]);
  return (
    <div className={cs(s.base, visible && s.visible)}>
      <div className={s.page}>
        <header>
          <div className={s.logo} />
        </header>

        <main>
          <Heading as='h4' size='lg'>
            Provider Notes
          </Heading>
          <Divider orientation='horizontal' />
          <Textarea
            p='1%'
            overflow='hidden'
            w='60%'
            minRows={1}
            maxRows={30}
            as={ResizeTextarea}
            value={generateSOAPSummary(allResults)}
            onInput={onTextAreaEdit}
          />
        </main>
      </div>
    </div>
  );
}
