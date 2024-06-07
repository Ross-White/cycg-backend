import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

export class LastAccidentLambdaStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
      super(scope, id, props);

      const lastAccidentFunction = new lambda.Function(this, 'LastAccidentFunction', {
        runtime: lambda.Runtime.NODEJS_20_X,
        code: lambda.Code.fromAsset('src'),
        handler: 'lastAccidentLambda.handler'
      })
      // Define the API Gateway resource
      const api = new apigateway.LambdaRestApi(this, 'LastAccidentApi', {
        handler: lastAccidentFunction,
        proxy: false,
      });
        
      // Define the '/hello' resource with a GET method
      const helloResource = api.root.addResource('lastAccident');
      helloResource.addMethod('GET');
    }
}