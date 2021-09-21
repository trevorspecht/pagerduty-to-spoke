'use strict';

const cf = require('@mapbox/cloudfriend');

const templateParams = {
  Parameters: {
    GitSha: {
      Type: 'String',
      Description: 'GitSha to deploy'
    },
    SpokeSecretLocation: {
      Type: 'String',
      Description: 'Path to the Spoke service account token in AWS Secrets Manager',
      Default: 'general/IT/xxxxxx'
    },
    AtHelpFriendToken: {
      Type: 'String',
      Description: 'Path to Spoke service account token in AWS Secrets Manager',
      Default: 'general/IT/xxxxxx'
    },
    SlackWebhookUrl: {
      Type: 'String',
      Description: 'Path to Slack app Incoming-Webhooks URL config for the #alerts-it channel in AWS Secrets Manager',
      Default: 'general/IT/xxxxxxx'
    }
  }
};

/* test Lambda subscribed to SNS topic
 * puts a CloudWatch event with SNS message body contents
 * for manually testing the response of the updateSpokeTeamSettings Lambda
 * TODO: put SNS topic into this template
 */
const testEventLambda = new cf.shortcuts.Lambda({
  LogicalName: 'testEvent',
  Runtime: 'nodejs12.x',
  Code: {
    S3Bucket: cf.join('-', ['utility', cf.accountId, cf.region]),
    S3Key: cf.join(['bundles/oncall-spoke/', cf.ref('GitSha'), '.zip'])
  },
  FunctionName: cf.sub('${AWS::StackName}-test-event'),
  Handler: 'lib/test-event.lambda',
  Statement: [
    {
      Effect: 'Allow',
      Action: 'events:PutEvents',
      Resource: '*'
    }
  ]
});

const updateSpokeTeamSettings = new cf.shortcuts.EventLambda({
  LogicalName: 'updateTeamSettings',
  Runtime: 'nodejs12.x',
  Code: {
    S3Bucket: cf.join('-', ['utility', cf.accountId, cf.region]),
    S3Key: cf.join(['bundles/oncall-spoke/', cf.ref('GitSha'), '.zip'])
  },
  Environment: {
    Variables: {
      SpokeSecretLocation: cf.ref('SpokeSecretLocation'),
      SlackWebhookUrl: cf.ref('SlackWebhookUrl')
    }
  },
  FunctionName: cf.sub('${AWS::StackName}-update-team-settings'),
  Handler: 'lib/update-team-settings.lambda',
  EventPattern: {
    'source': ['on-call/handoff'],
    'detail-type': ['On-call Handoff Event']
  },
  Statement: [
    {
      Effect: 'Allow',
      Action: 'secretsmanager:GetSecretValue',
      Resource: cf.arn('secretsmanager', 'secret:general/IT/xxxxx*')
    },
    {
      Effect: 'Allow',
      Action: 'secretsmanager:GetSecretValue',
      Resource: cf.arn('secretsmanager', 'secret:general/IT/xxxxx*')
    },
    {
      Effect: 'Allow',
      Action: 'secretsmanager:GetSecretValue',
      Resource: cf.arn('secretsmanager', 'secret:general/IT/xxxxx*')
    },
    {
      Action: ['execute-api:invoke'],
      Effect: 'Allow',
      Resource: [cf.join(['arn:aws:execute-api:*:', cf.accountId,':*/*/GET/*'])]
    }
  ]
});

module.exports = cf.merge(templateParams, updateSpokeTeamSettings, testEventLambda);
