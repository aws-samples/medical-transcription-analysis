#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { MedicalTranscriptionAnalysisStack } from '../lib/medical-transcription-analysis-stack';

const app = new cdk.App();
new MedicalTranscriptionAnalysisStack(app, 'MedicalTranscriptionAnalysisStack');
