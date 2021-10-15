
## Medical Transcription Analysis

Medical Transcription Analysis (MTA) is a simple solution that leverages the powers of Amazon Transcribe Medical and Amazon Comprehend Medical to provide medical notes transcription and comprehension. The solution opens a WebSocket between the client (browser) and Amazon Transcribe Medical. This WebSocket is used to send the audio from the client to Amazon Transcribe Medical and retrieve real time transcription which is then rendered on the UI. The transcribed results are then sent to Amazon Comprehend Medical which returns an analysis of the transcription.

Checkout our AWS Blog here : https://aws.amazon.com/blogs/machine-learning/performing-medical-transcription-analysis-with-amazon-transcribe-medical-and-amazon-comprehend-medical/

To run the solution, clone/download the project. To deploy the solution follow the steps below:

### Deployment
The instructions below cover installation on Unix-based Operating systems like macOS and Linux. 
You can use an AWS Cloud9 enviornment or EC2 instance (recommended: t3.large or higher on Amazon Linux platform) to deploy the solution

#### Requirements
* yarn (You can install yarn by following instructions [here](https://classic.yarnpkg.com/en/docs/install/))
* node 10+ (You can install nodejs by following the instructions [here](https://nodejs.org/en/download/))
* aws cli (You can install aws cli by following the instructions [here](https://docs.aws.amazon.com/cli/latest/userguide/install-macos.html))
* tsc (npm install typescript)
* Google Chrome web browser


If you have not already, configure the aws cli to interact with AWS services using ```aws configure ```.
To deploy using this approach, you must first set a few values inside the package.json file in the app folder.

* Set your AWS deployment region in the stack->region property, replacing "%%REGION%%". 

 **Note** MTA is supported in AWS Regions where Amazon Transcribe Medical and Amazon Comprehend Medical are available. For more information, check out the [AWS Region Table](https://aws.amazon.com/about-aws/global-infrastructure/regional-product-services/)
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

### Deploy Commands

* ```yarn deploy:backend```: deploys the backend app
* ```yarn deploy:client```: deploys or updates the client web app
* ```yarn build-app```: builds the react app    
* ```yarn start```: allows development of the web app locally.
* ```yarn destroy```: destroys the backend and client stacks



## Additional Notes

### Sample Data

MTA has pre-loaded audio sample files. These samples were synthesized using data from [MTSamples.com](https://www.mtsamples.com/)

### Offline Mode
MTA comes with an offline mode built in. This mode is useful for cases when presenting the capabilities of Amazon Transcribe Medical and Amazon Comprehend Medical in situations with internet connectivity issues. To display offline mode options, press the Shift key thrice while on the webpage.

### Amazon Transcribe Medical Demo
This solution was built over components from the [amazon-transcribe-medical-demo](https://github.com/aws-samples/amazon-transcribe-medical-demo)
