import { Construct, Stack, StackProps } from '@aws-cdk/core';
import s3 = require('@aws-cdk/aws-s3');
import s3deploy = require('@aws-cdk/aws-s3-deployment');

export class MTAClientStack extends Stack {
  constructor(scope: Construct | undefined, id: string | undefined, props?: StackProps | undefined) {
    super(scope, id, props);

    const webS3Bucket = '%%CLIENT_APP_BUCKET%%';

    const resourceName = (name: string) => `${id}${name}`;

    const webAppS3Bucket = s3.Bucket.fromBucketName(this, 'webAppS3Bucket', webS3Bucket);

    // eslint-disable-next-line no-unused-vars
    const s3WebDeployment = new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset('build')],
      destinationBucket: webAppS3Bucket,
      destinationKeyPrefix: '', // optional prefix in destination bucket
    });
  }
}
