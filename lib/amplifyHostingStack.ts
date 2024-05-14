import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as codebuild from 'aws-cdk-lib/aws-codebuild'
import {
	App,
	GitHubSourceCodeProvider,
} from '@aws-cdk/aws-amplify-alpha'
import { CfnApp } from 'aws-cdk-lib/aws-amplify'
import { StackProps } from 'aws-cdk-lib'

interface HostingStackProps extends StackProps {
  readonly owner: string
  readonly repository: string
  readonly githubOauthTokenName: string
  readonly environmentVariables?: { [name: string]: string }
}

export class AmplifyHostingStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: HostingStackProps) {
    super(scope, id, props);

    const amplifyApp = new App(this, 'Clock', {
      appName: 'Clock',
      sourceCodeProvider: new GitHubSourceCodeProvider({
        owner: props.owner,
        repository: props.repository,
        oauthToken: cdk.SecretValue.secretsManager(props.githubOauthTokenName)
      }),
      autoBranchDeletion: true,
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

    amplifyApp.addBranch('master', {
      stage: 'PRODUCTION'
    })

		const cfnAmplifyApp = amplifyApp.node.defaultChild as CfnApp
		cfnAmplifyApp.platform = 'WEB_COMPUTE'

		new cdk.CfnOutput(this, 'appId', {
			value: amplifyApp.appId,
		})    

  }
}
