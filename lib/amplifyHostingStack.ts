import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as codebuild from 'aws-cdk-lib/aws-codebuild'
import * as iam from 'aws-cdk-lib/aws-iam'
import {
	App,
	GitHubSourceCodeProvider,
  RedirectStatus
} from '@aws-cdk/aws-amplify-alpha'
import * as amplify from 'aws-cdk-lib/aws-amplify'
import { StackProps } from 'aws-cdk-lib'

interface HostingStackProps extends StackProps {
  appName: string
  owner: string
  repository: string
  githubOauthTokenName: string
  environmentVariables?: { [name: string]: string }
}

export class AmplifyHostingStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: HostingStackProps) {
    super(scope, id, props);

    const role = new iam.Role(this, 'AmplifyDeploymentRole', {
      assumedBy: new iam.ServicePrincipal('amplify.amazonaws.com'),
      description: 'Role permitting resources creation from Amplify',
      managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess-Amplify')]
    })

    const amplifyApp = new App(this, `${props.appName}-hosting`, {
      appName: props.appName,
      sourceCodeProvider: new GitHubSourceCodeProvider({
        owner: props.owner,
        repository: props.repository,
        oauthToken: cdk.SecretValue.secretsManager(props.githubOauthTokenName)
      }),
      role: role,
      autoBranchDeletion: true,
      customRules: [
        {
          source: '/<*>',
          target: '/index.html',
          status: RedirectStatus.NOT_FOUND_REWRITE
        }
      ],
      buildSpec: codebuild.BuildSpec.fromObjectToYaml({
				version: 1,
				frontend: {
					phases: {
						preBuild: {
							commands: ['npm ci'],
						},
						build: {
							commands: ['npm run build'],
						},
					},
					artifacts: {
						baseDirectory: '.next',
						files: ['**/*'],
					},
					cache: {
						paths: ['node_modules/**/*'],
					},
				},
			}),
    })

    const cfnAmplifyApp = amplifyApp.node.defaultChild as amplify.CfnApp
		cfnAmplifyApp.platform = 'WEB_COMPUTE'

    const mainBranch = amplifyApp.addBranch('main', {
      stage: 'PRODUCTION'
    })

    const cfnBranch = mainBranch.node.defaultChild as amplify.CfnBranch;
    cfnBranch.framework = 'Next.js - SSR';

		new cdk.CfnOutput(this, 'appId', {
			value: amplifyApp.appId,
		})    
  }
}
