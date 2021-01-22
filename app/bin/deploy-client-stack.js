const cdk = require('@aws-cdk/core');
const MTAClientStack = require('../lib/medical-transcription-analysis-client-stack');

const app = new cdk.App();
const stackName = `${process.env.STACKNAME}ClientStack`;

// eslint-disable-next-line no-new
new MTAClientStack.MTAClientStack(app, stackName);
