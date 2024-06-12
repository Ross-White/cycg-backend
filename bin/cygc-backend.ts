#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AmplifyHostingStack } from '../lib/amplifyHostingStack';
import { LastAccidentLambdaStack } from '../lib/lastAccidentLambdaStack';

const app = new cdk.App();
new AmplifyHostingStack(app, 'clock-hosting', {
  appName: 'Clock',
  owner: 'Ross-White',
  repository: 'cygc-clock',
  githubOauthTokenName: 'github-token',
});

new LastAccidentLambdaStack(app, 'clock-backend', {
});