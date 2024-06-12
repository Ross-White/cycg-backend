import { IAccidentPost } from '../types'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
    DynamoDBDocumentClient,
    PutCommand,
  } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

const client = new DynamoDBClient({})
const dynamoDB = DynamoDBDocumentClient.from(client)

export const handler = async (event: any) => {
    const accident: IAccidentPost = JSON.parse(event.body)
    if (!accident) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'missing accident' })
        }
    }
    try {
        await dynamoDB.send(new PutCommand({
            TableName: 'AccidentLog',
            Item: {
                id: randomUUID(),
                ...accident 
            }
        }))
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'successfully logged accident' })
        }    
    } catch (error) {
        return {
            statusCode: 500,
            body: error
        }
    }
};