import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import MedicalTranscriptionAnalysis = require('../lib/medical-transcription-analysis-stack');

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new MedicalTranscriptionAnalysis.MedicalTranscriptionAnalysisStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
