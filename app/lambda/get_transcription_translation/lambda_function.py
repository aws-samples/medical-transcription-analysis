import json
import sys
import os
sys.path.append("../")
import boto3
from lambda_base import LambdaBase
from constant_variables import *
from response_helper import sendResponse

class GetTranscriptionTranslationLambda(LambdaBase):
    def __init__(self): 
        pass

    def handle(self, event, context):
        try:
            targetLanguageCode = event['queryStringParameters'][TRANSLATION_TARGET_LANGUAGE_CODE].strip() if TRANSLATION_TARGET_LANGUAGE_CODE in event['queryStringParameters'] else ''
            translationSourceText = event['queryStringParameters'][TRANSLATION_SOURCE_TEXT].strip() if TRANSLATION_SOURCE_TEXT in event['queryStringParameters'] else ''
            if  len(targetLanguageCode)==0 or len(translationSourceText)==0:
                return sendResponse(400, {'message':  TRANSLATION_SOURCE_TEXT +","+ TRANSLATION_TARGET_LANGUAGE_CODE + " parameters cannot be empty"})
            if len(translationSourceText.encode('utf-8')) > TRANSLATION_TEXT_MAX_UTF8_BYTES_SIZE:
                return sendResponse(400, {'message':  "Translation is supported for translationSourceText <"+ TRANSLATION_MAX_UTF8_BYTES_SIZE + "bytes. Please split the payload or try in smaller chunks." }) 
            client = boto3.client('translate', region_name=os.environ['AWS_REGION'])
            translate_result = client.translate_text(Text=translationSourceText, SourceLanguageCode='en',TargetLanguageCode=targetLanguageCode)
            result = {'translate': translate_result}
            return sendResponse(200, result)
        except Exception as e:
            print(str(e))
            if e.response['Error']['Code'] == 'UnsupportedLanguagePairException':
                return sendResponse(400, {'message':  "Unsupported Language Pair Translation. Please try with one of supported target language."}) 
            if e.response['Error']['Code'] == 'InvalidRequestException':
                return sendResponse(400, {'message':  "Invalid request provided. Please ensure try with English input text and supported target language."})               
            return sendResponse(500, {'message':  "An unknown error has occurred. Please try again."})

lambda_handler = GetTranscriptionTranslationLambda.get_handler()
 