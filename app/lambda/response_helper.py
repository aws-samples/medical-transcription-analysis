import json

def sendResponse(code, data):
    return {
    "isBase64Encoded": False,
    "statusCode": code,
    'body': json.dumps(data),
    "headers": {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
        }
    }
