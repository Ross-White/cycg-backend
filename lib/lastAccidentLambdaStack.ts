import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as iam from 'aws-cdk-lib/aws-iam'

export class LastAccidentLambdaStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
      super(scope, id, props)

      const lastAccidentFunction = new lambda.Function(this, 'LastAccidentFunction', {
        functionName: 'lastAccident',
        runtime: lambda.Runtime.NODEJS_20_X,
        code: lambda.Code.fromAsset('src'),
        handler: 'lastAccident.handler'
      })

      const newAccidentFunction = new lambda.Function(this, 'NewAccidentFunction', {
        functionName: 'newAccident',
        runtime: lambda.Runtime.NODEJS_20_X,
        code: lambda.Code.fromAsset('src'),
        handler: 'newAccident.handler'
      })
      newAccidentFunction.addToRolePolicy(
        new iam.PolicyStatement({
          actions: ['dynamodb:PutItem', 'dynamodb:UpdateItem'],
          resources: ['*']
        })
      )

      const lastAccidentApi = new apigateway.LambdaRestApi(this, 'LastAccidentApi', {
        handler: lastAccidentFunction,
        proxy: false,
      })
        
      const lastAccidentResource = lastAccidentApi.root.addResource('lastAccident');
      lastAccidentResource.addMethod('GET')

      const newAccidentApi = new apigateway.LambdaRestApi(this, 'NewAccidentApi', {
        handler: newAccidentFunction,
        proxy: false,
      })
        
      const newAccidentResource = newAccidentApi.root.addResource('newAccident');
      newAccidentResource.addMethod('POST')

      const accidentTable = new dynamodb.TableV2(this, 'AccidentTable', {
        tableName: 'AccidentLog',
        partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
        sortKey: {name: 'date', type: dynamodb.AttributeType.NUMBER},

      })
    }
}