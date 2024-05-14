#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AmplifyHostingStack } from '../lib/amplifyHostingStack';

const app = new cdk.App();
new AmplifyHostingStack(app, 'CygcBackendStack', {
  owner: 'Ross-White',
  repository: 'cygc-clock',
  githubOauthTokenName: 'github-token',
});