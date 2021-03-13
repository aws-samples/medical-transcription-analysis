import React from 'react';
import { API, Auth } from 'aws-amplify';

import s from './ExportPane.module.css';
import cs from 'clsx';
import ExportPaneHeader from './ExportPaneHeader/ExportPaneHeader';
import { getSelectedConcept } from '../utils/conceptUtils';
import { SupportedLanguagesMenu } from './SupportedLanguagesMenu/SupportedLanguagesMenu';
import { Flex, Heading, Spinner } from '@chakra-ui/react';
import displayNames from '../displayNames';

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
        content: displayNames[category],
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
        ...(transcriptChunks ? transcriptChunks : []).map(({ speaker, text }) =>
          speaker ? `${speaker}\n${text}` : text,
        ),
      ],
    },
  ];
};

const SPACE_CHARACTER_CODE = 32;

// https://stackoverflow.com/questions/57068850/how-to-split-a-string-into-chunks-of-a-particular-byte-size
const chunkByByteLimit = (s, limit) => {
  const result = [];

  const decoder = new TextDecoder('utf-8');
  let buf = new TextEncoder('utf-8').encode(s);

  while (buf.length) {
    let i = buf.lastIndexOf(SPACE_CHARACTER_CODE, limit + 1);
    // If no space found, try forward search
    if (i < 0) i = buf.indexOf(SPACE_CHARACTER_CODE, limit);
    // If there's no space at all, take all
    if (i < 0) i = buf.length;
    // This is a safe cut-off point; never half-way a multi-byte
    result.push(decoder.decode(buf.slice(0, i)));
    buf = buf.slice(i + 1); // Skip space (if any)
  }

  return result;
};

const MAX_TRANSLATION_BYTES = 5000;

const translateSection = (section, lang, jwtToken) => {
  const translationPromises = [section.header.content, ...section.content].map((text) => {
    if (text.trim() === '') return Promise.resolve(text);

    // break into chunks by Amazon Translate byte limit and combine responses
    const chunks = chunkByByteLimit(text, MAX_TRANSLATION_BYTES);

    const translatedChunkPromises = chunks.map((chunk) =>
      API.get('MTADemoAPI', 'getTranscriptionTranslation', {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
        response: true,
        queryStringParameters: {
          TargetLanguageCode: lang,
          TranslationSourceText: chunk,
        },
      }).then((response) => response.data.translate.TranslatedText),
    );

    return Promise.all(translatedChunkPromises).then((translatedChunks) => translatedChunks.join(' '));
  });

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
        <Flex alignItems='center' p={4}>
          <Heading as='div' size='md' mr={4}>
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
        <button
          className={s.ehr}
          onClick={() =>
            alert(
              'You can take the transcription, detected entities, and generated summaries and integrate them into your EHR system, where you can continue editing or commit it to the patient record.',
            )
          }
        >
          Export to EHR system
        </button>
        <button className={s.pdf} onClick={() => window.print()}>
          Export to PDF
        </button>
      </div>
    </div>
  );
}
