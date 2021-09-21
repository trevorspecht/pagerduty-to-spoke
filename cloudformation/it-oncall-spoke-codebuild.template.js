'use strict';

const cf = require('@mapbox/cloudfriend');

/** Cloudformation template to create AWS CodeBuild project
 * uses the codebuild-helper shortcut in secret-cloudfriend
 */
const CodeBuildProject = require('@mapbox/secret-cloudfriend').shortcuts.CodeBuildProject;

module.exports = new CodeBuildProject({
  LogicalName: 'CodeBuildProject',
  Source: {
    Location: 'https://github.com/mapbox/oncall-spoke'
  },
  ServiceRoleStatement: [
    {
      Effect: 'Allow',
      Action: 'cloudformation:ValidateTemplate',
      Resource: '*'
    },
    {
      Effect: 'Allow',
      Action: 'secretsmanager:GetSecretValue',
      Resource: cf.arn('secretsmanager', 'secret:general/IT/xxx/*')
    }
  ],
  BadgeEnabled: true
});
