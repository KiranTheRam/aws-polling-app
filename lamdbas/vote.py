import json
import boto3

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb')
polls_table = dynamodb.Table('Polls')  # Replace 'Polls' with your DynamoDB table name

def lambda_handler(event, context):
    # Parse the incoming request body
    body = json.loads(event['body'])
    
    # Extract poll ID and selected option from the request
    poll_id = body.get('pollId')
    selected_option = body.get('selectedOption')
    
    # Retrieve the poll from DynamoDB
    try:
        # Parse the incoming request body
        body = json.loads(event['body'])
        
        # Extract poll ID and selected option from the request
        poll_id = body.get('pollId')
        selected_option = body.get('selectedOption')
        
        # Validate that the required data is present
        if not poll_id or not selected_option:
            return {
                'statusCode': 400,
                'body': json.dumps({
                    'error': 'Poll ID and selected option are required'
                }),
                'headers': {
                    'Access-Control-Allow-Origin': '*',  # Allow requests from any origin
                    'Access-Control-Allow-Headers': 'Content-Type',  # Allow only Content-Type header
                    'Access-Control-Allow-Methods': 'OPTIONS, POST'  # Allow OPTIONS and POST methods
                }
            }
        response = polls_table.get_item(
            Key={
                'PollId': poll_id
            }
        )
        
        # Check if the poll exists
        if 'Item' not in response:
            return {
                'statusCode': 404,
                'body': json.dumps({
                    'error': 'Poll not found'
                }),
                'headers': {
                    'Access-Control-Allow-Origin': '*',  # Allow requests from any origin
                    'Access-Control-Allow-Headers': 'Content-Type',  # Allow only Content-Type header
                    'Access-Control-Allow-Methods': 'OPTIONS, POST'  # Allow OPTIONS and POST methods
                }
            }
        
        # Update the vote count for the selected option
        poll_item = response['Item']
        options = poll_item['Options']
        votes = poll_item['Votes']
        
        if selected_option not in options:
            return {
                'statusCode': 400,
                'body': json.dumps({
                    'error': 'Invalid option selected'
                }),
                'headers': {
                    'Access-Control-Allow-Origin': '*',  # Allow requests from any origin
                    'Access-Control-Allow-Headers': 'Content-Type',  # Allow only Content-Type header
                    'Access-Control-Allow-Methods': 'OPTIONS, POST'  # Allow OPTIONS and POST methods
                }
            }
        
        votes[selected_option] += 1
        
        # Update the poll item in DynamoDB
        response = polls_table.update_item(
            Key={
                'PollId': poll_id
            },
            UpdateExpression='SET Votes = :votes',
            ExpressionAttributeValues={
                ':votes': votes
            }
        )
        
        # Create the response object with CORS headers
        response = {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',  # Allow requests from any origin
                'Access-Control-Allow-Headers': 'Content-Type',  # Allow only Content-Type header
                'Access-Control-Allow-Methods': 'OPTIONS, POST'  # Allow OPTIONS and POST methods
            },
            'body': json.dumps({
                'message': 'Vote counted successfully'
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

