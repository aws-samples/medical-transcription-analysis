
## Medical Transcription Analysis

Medical Transcription Analysis (MTA) is a simple solution that leverages the powers of Amazon Transcribe Medical and Amazon Comprehend Medical to provide medical notes transcription and comprehension. The solution opens a WebSocket between the client (browser) and Amazon Transcribe Medical. This WebSocket is used to send the audio from the client to Amazon Transcribe Medical and retrieve real time transcription which is then rendered on the UI. The transcribed results are then sent to Amazon Comprehend Medical which returns an analysis of the transcription.

To run the solution, clone/download the project. To deploy the solution follow the steps below:

### Development Deploy

This deploy allows for running the client-side code on a local server. If you have not already, configure the aws cli to interact with AWS services using ```aws configure ```.

#### Requirements
* yarn
* node 10+
* aws cli
* tsc
* Google Chrome web browser


To deploy using this approach, you must first set several values inside the package.json file in the source folder.

* Set your deployment region in the stack->region property, replacing "%%REGION%%". Unlike the regular CICD deploy, this approach will not pull the AWS region from your current AWS profile.
* Enter your email into the email property, replacing "%%USER_EMAIL%%"

Now switch to the app directory, and use yarn to deploy the solution:
```
cd ./app
```
```
yarn && yarn deploy
```
#### Note:

This deployment creates 2 S3 buckets that will have to be deleted manually when the stack is destroyed. (Cloudformation does not delete them, in order to avoid data loss).
* 1 for the client bucket
* 1 for CDK toolkit (if this is your first time using CDK)

### Development Deploy Commands

* ```yarn deploy:backend```: deploys the backend app
* ```yarn deploy:client```: deploys or updates the client web app
* ```yarn build-app```: builds the react app    
* ```yarn start```: allows development of the web app locally. Changes can be viewed at http://localhost:3000
* ```yarn destroy```: destroys the backend and client stacks

### Additional Notes

## Sample Data

MTA has pre-loaded audio sample files. These samples were synthesized using data from [MTSamples.com](https://www.mtsamples.com/)
