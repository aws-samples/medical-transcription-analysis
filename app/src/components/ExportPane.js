import React from 'react';
import { API, Auth } from 'aws-amplify';

import s from './ExportPane.module.css';
import cs from 'clsx';
import ExportPaneHeader from './ExportPaneHeader/ExportPaneHeader';
import { getSelectedConcept } from '../utils/conceptUtils';
import { SupportedLanguagesMenu } from './SupportedLanguagesMenu/SupportedLanguagesMenu';
import { Flex, Heading, Spinner } from '@chakra-ui/react';

const getFormattedCategorySummary = (category, filteredResults) => {
  const isMedicalCondition = category === 'MEDICAL_CONDITION';
  const isMedication = category === 'MEDICATION';

  if (isMedicalCondition || isMedication) {
    const conceptProperty = isMedicalCondition ? 'ICD10CMConcepts' : 'RxNormConcepts';

    return filteredResults
      .map((result) => {
        const text = result.Text;

        const concepts = result[conceptProperty];

        if (!concepts) return text;
        const selectedConcept = getSelectedConcept(result);
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

const SUMMARY_CATEGORIES = ['MEDICATION', 'ANATOMY', 'MEDICAL_CONDITION', 'TEST_TREATMENT_PROCEDURE'];
const SUMMARY_CATEGORIES_SET = new Set(SUMMARY_CATEGORIES);

const getFormattedCategorySummaries = (results) => {
  const resultsByCategory = {};

  SUMMARY_CATEGORIES.forEach((category) => {
    resultsByCategory[category] = [];
  });

  results.forEach((result) => {
    const category = result.Category;

    if (SUMMARY_CATEGORIES_SET.has(category)) resultsByCategory[category].push(result);
  });

  return SUMMARY_CATEGORIES.map((category) => ({
    category,
    summary: getFormattedCategorySummary(category, resultsByCategory[category]),
  }));
};

const SUMMARY_CATEGORY_HEADERS = {
  MEDICATION: 'Medications',
  ANATOMY: 'Anatomy',
  MEDICAL_CONDITION: 'Medical Conditions',
  TEST_TREATMENT_PROCEDURE: 'Tests, Treatments, Procedures',
};

const getFilteredResults = (resultChunks, excludedItems) =>
  [].concat(...resultChunks).filter((x) => !excludedItems.includes(x.id));

const getExportSections = ({ resultChunks, excludedItems, soapSummary, transcriptChunks }) => {
  const filteredResults = getFilteredResults(resultChunks, excludedItems);

  const formattedCategorySummaries = getFormattedCategorySummaries(filteredResults);

  return [
    {
      header: {
        type: 'SECTION',
        content: 'Summary',
      },
      content: [
        `Thank you for visiting the clinic today, ${new Date()
          .toISOString()
          .slice(
            0,
            10,
          )}. Please take a moment to review the following important information from today's consultation and reach out to us at +12345678910 if you have any questions.`,
        soapSummary,
      ],
    },
    ...formattedCategorySummaries.map(({ category, summary }) => ({
      header: {
        type: 'SUB_SECTION',
        content: SUMMARY_CATEGORY_HEADERS[category],
      },
      content: [summary],
    })),
    {
      header: {
        type: 'SECTION',
        content: 'Visit Transcription',
      },
      content: [
        'Below is the transcription for your visit',
        ...(transcriptChunks ? transcriptChunks : []).map((chunk) => chunk.text),
      ],
    },
  ];
};

const translateSection = (section, lang, jwtToken) => {
  const translationPromises = [section.header.content, ...section.content].map((text) =>
    text.trim() === ''
      ? Promise.resolve(text)
      : API.get('MTADemoAPI', 'getTranscriptionTranslation', {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
          response: true,
          queryStringParameters: {
            TargetLanguageCode: lang,
            TranslationSourceText: text,
          },
        }).then((response) => response.data.translate.TranslatedText),
  );

  return Promise.all(translationPromises).then(([headerContent, ...content]) => ({
    header: {
      ...section.header,
      content: headerContent,
    },
    content,
  }));
};

const translateSections = (sections, lang, jwtToken) => {
  return Promise.all(sections.map((section) => translateSection(section, lang, jwtToken)));
};

export default function ExportPane({ transcriptChunks, resultChunks, visible, excludedItems, soapSummary }) {
  const [sections, setSections] = React.useState(() =>
    getExportSections({ excludedItems, resultChunks, soapSummary, transcriptChunks }),
  );
  const [lang, setLang] = React.useState('en');
  const [isLoadingTranslation, setIsLoadingTranslation] = React.useState(false);

  React.useEffect(() => {
    if (!visible) return;

    const englishSections = getExportSections({ excludedItems, resultChunks, soapSummary, transcriptChunks });

    if (lang === 'en') {
      setSections(englishSections);
      return;
    }

    setIsLoadingTranslation(true);

    Auth.currentSession()
      .then((session) => session.getIdToken().getJwtToken())
      .then((token) => translateSections(englishSections, lang, token))
      .then(setSections)
      .finally(() => setIsLoadingTranslation(false));
  }, [visible, excludedItems, resultChunks, soapSummary, transcriptChunks, lang]);

  return (
    <div className={cs(s.base, visible && s.visible)}>
      <div className={s.pageContainer}>
        <Flex justifyContent='space-between' alignItems='center' bg='#ececec' px={4} py={2}>
          <Heading as='div' size='md'>
            Translate Summary
          </Heading>
          <SupportedLanguagesMenu currentLang={lang} onLangClick={setLang} disabled={isLoadingTranslation} />
        </Flex>
        <div className={s.page}>
          {isLoadingTranslation ? (
            <Flex width='100%' height='100%' justifyContent='center' alignItems='center'>
              <Spinner size='xl' />
            </Flex>
          ) : (
            <>
              <header>
                <div className={s.logo} />
              </header>

              <main>
                {sections.map(({ header, content }) => (
                  <React.Fragment key={header.content}>
                    <ExportPaneHeader content={header.content} type={header.type} />
                    {content.map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                  </React.Fragment>
                ))}
              </main>
            </>
          )}
        </div>
      </div>

      <div className={s.actions}>
        <button className={s.pdf} onClick={() => window.print()}>
          Export to PDF
        </button>
      </div>
    </div>
  );
}
