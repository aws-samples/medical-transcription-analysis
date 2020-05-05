
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
* jq

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
