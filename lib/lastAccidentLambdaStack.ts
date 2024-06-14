import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as iam from 'aws-cdk-lib/aws-iam'

export class LastAccidentLambdaStack extends cdk.Stack {
  public readonly accidentsApiEndpoint: string;
  public readonly accidentsApiKey: string;
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

    const accidentApi = new apigateway.RestApi(this, 'AccidentApi', {
      restApiName: 'AccidentApi',
      apiKeySourceType: apigateway.ApiKeySourceType.HEADER
    })

    const accidents = accidentApi.root.addResource('accidents')
    const lastAccidentIntegration = new apigateway.LambdaIntegration(lastAccidentFunction)
    const newAccidentIntegration = new apigateway.LambdaIntegration(newAccidentFunction)

    accidents.addMethod('GET', lastAccidentIntegration, {
      apiKeyRequired: true
    })
    accidents.addMethod('POST', newAccidentIntegration, {
      apiKeyRequired: true
    })
    const accidentApiKey = new apigateway.ApiKey(this, 'AccidentApiKey', {
      apiKeyName: 'accidentsKey',
    })
    const usagePlan = accidentApi.addUsagePlan('UsagePlan', {
      name: 'Accidents Usage Plan',
    })
    usagePlan.addApiStage({
      stage: accidentApi.deploymentStage
    })
    usagePlan.addApiKey(accidentApiKey)

    const accidentTable = new dynamodb.TableV2(this, 'AccidentTable', {
      tableName: 'AccidentLog',
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      sortKey: {name: 'date', type: dynamodb.AttributeType.NUMBER},

    })
    new cdk.CfnOutput(this, 'ApiEndpoint', {
      value: accidentApi.url,
      exportName: 'MyApiEndpoint'
    });

    new cdk.CfnOutput(this, 'ApiKey', {
      value: accidentApiKey.keyId,
      exportName: 'MyApiKey'
    });

    this.accidentsApiEndpoint = accidentApi.url;
    this.accidentsApiKey = accidentApiKey.keyId;
  }
}