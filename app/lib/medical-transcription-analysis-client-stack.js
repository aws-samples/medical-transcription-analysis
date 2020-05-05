"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@aws-cdk/core");
const s3 = require("@aws-cdk/aws-s3");
const s3deploy = require("@aws-cdk/aws-s3-deployment");
class MTAClientStack extends core_1.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const webS3Bucket = "mtastack-mtastackwebapps3bucketfe770b70-ea86se865cwd";
        const resourceName = (name) => `${id}${name}`;
        const webAppS3Bucket = s3.Bucket.fromBucketName(this, "webAppS3Bucket", webS3Bucket);
        // eslint-disable-next-line no-unused-vars
        const s3WebDeployment = new s3deploy.BucketDeployment(this, "DeployWebsite", {
            sources: [s3deploy.Source.asset('build')],
            destinationBucket: webAppS3Bucket,
            destinationKeyPrefix: '' // optional prefix in destination bucket
        });
    }
}
exports.MTAClientStack = MTAClientStack;
