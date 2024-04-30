import json
import boto3
import uuid

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb')
polls_table = dynamodb.Table('Polls')  # Replace 'Polls' with your DynamoDB table name

def lambda_handler(event, context):
    # Parse the incoming request body
    body = json.loads(event['body'])
    
    # Validate that the data is not empty
    if not body.get('question') or not body.get('options'):
        response = {
            'statusCode': 400,
            'headers': {
                'Access-Control-Allow-Origin': '*',  # Allow requests from any origin
                'Access-Control-Allow-Headers': 'Content-Type',  # Allow only Content-Type header
                'Access-Control-Allow-Methods': 'OPTIONS, POST'  # Allow OPTIONS and POST methods
            },
            'body': json.dumps({
                'error': 'Question and options cannot be empty'
            })
        }
        return response

    # Generate a unique ID for the new poll
    poll_id = str(uuid.uuid4())
    
    # Extract poll details from the request
    question = body.get('question')
    options = body.get('options')
    
    # Create a new item in the DynamoDB table
    try:
        response = polls_table.put_item(
            Item={
                'PollId': poll_id,
                'Question': question,
                'Options': options,
                'Votes': {option: 0 for option in options}  # Initialize votes count for each option
            }
        )
        
        # Create the response object with CORS headers
        response = {
            'statusCode': 201,
            'headers': {
                'Access-Control-Allow-Origin': '*',  # Allow requests from any origin
                'Access-Control-Allow-Headers': 'Content-Type',  # Allow only Content-Type header
                'Access-Control-Allow-Methods': 'OPTIONS, POST'  # Allow OPTIONS and POST methods
            },
            'body': json.dumps({
                'message': 'Poll created successfully',
                'pollId': poll_id
            })
        }

        return response
    except Exception as e:
        # Return error response if something goes wrong
        response = {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',  # Allow requests from any origin
                'Access-Control-Allow-Headers': 'Content-Type',  # Allow only Content-Type header
                'Access-Control-Allow-Methods': 'OPTIONS, POST'  # Allow OPTIONS and POST methods
            },
            'body': json.dumps({
                'error': str(e)
            })
        }
        return response
