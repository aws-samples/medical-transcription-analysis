#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { MedicalTranscriptionAnalysisStack } from '../lib/medical-transcription-analysis-stack';
const readlineSync = require('readline-sync');

const stackName = `${process.env.STACKNAME}Stack`;
const userEmail =
  process.env.USER_EMAIL == '%%USER_EMAIL%%'
    ? readlineSync.question('Please enter your email address: ')
    : process.env.USER_EMAIL;

const app = new cdk.App();
new MedicalTranscriptionAnalysisStack(app, stackName, {
  email: userEmail,
  description: 'MLSLD-S0002. Medical Transcription Analysis. This stack deploys the backend for MTA',
});
