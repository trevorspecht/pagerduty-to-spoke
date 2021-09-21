# Architecture

An overview of the architecture of the `oncall-spoke` service

## How does the service work?
Each time mapbox/on-call records an on-call handoff on a PagerDuty service, it puts a CloudWatch Event with information relevant to the handoff. This event matches an [Event Rule pattern](https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#rules:name=oncall-spoke-testing-UpdateSpokeTeamSettings) that triggers the oncall-spoke service, which then processes the event data.

Sample CloudWatch event:

```js
{
  version: '0',
  id: 'd8d878b7-a6db-835e-866d-xxxx',
  'detail-type': 'On-call Handoff Event',
  source: 'on-call/handoff',
  account: 'xxxx',
  time: '2020-08-04T20:39:11Z',
  region: 'us-east-1',
  resources: [],
  detail: {
    PagerdutyHandoffs: [
  {
    "escalationLevel": 2,
    "scheduleName": "IT Services",
    "scheduleUrl": "https://mapbox.pagerduty.com/schedules/xxxx",
    "goingOff": {
        "id": "xxxx",
        "type": "user_reference",
        "summary": "xxxx",
        "self": "https://api.pagerduty.com/users/xxxx",
        "html_url": "https://mapbox.pagerduty.com/users/xxxx"
    },
    "goingOn": {
        "id": "xxxx",
        "type": "user_reference",
        "summary": "xxxx",
        "self": "https://api.pagerduty.com/users/xxxx",
        "html_url": "https://mapbox.pagerduty.com/users/xxxxx"
    }
  },
  {
    "escalationLevel": 1,
    "scheduleName": "IT Helpdesk",
    "scheduleUrl": "https://mapbox.pagerduty.com/schedules/xxxx",
    "goingOff": {
        "id": "xxxx",
        "type": "user_reference",
        "summary": "xxxx",
        "self": "https://api.pagerduty.com/users/xxxx",
        "html_url": "https://mapbox.pagerduty.com/users/xxxx"
    },
    "goingOn": {
        "id": "xxxx",
        "type": "user_reference",
        "summary": "xxxx",
        "self": "https://api.pagerduty.com/users/xxxx",
        "html_url": "https://mapbox.pagerduty.com/users/xxxx"
    }
  }
],
    Team: {
      name: 'it',
      service: 'xxxx',
      slack: '#it-team',
      spoke: 'IT'
    },
    OnCallEmail: 'xxxx',
    PreviouslyOnCall: 'xxxx'
  }
}
```
Certain conditions indicate that no change is required to Spoke team settings:
- If the value for `Team.spoke` is null, indicating that a team has not opted in to the oncall-spoke service
- If the `escalationLevel` value for a handoff is not `1`, it is not the top level of the escalation policy and will not be processed

See the [alarms doc](./docs/alarms.md) for conditions that will cause the service to log an error and/or send a Slack error message.

## Flowchart of oncall-spoke operations

![oncall-spoke service flowchart](https://user-images.githubusercontent.com/29611310/90172048-6fccf480-dd70-11ea-9e1b-6b9a2da0cbf9.png)


## Dependencies

- mapbox/on-call: `oncall-spoke` functions like an extension of the `on-call` service by providing a PagerDuty integration to `on-call`. As such, `oncall-spoke` is dependent on `on-call` to put a properly formatted CloudWatch Event when there is an on-call handoff. In addition, in order for teams to opt in to `oncall-spoke` they must add their Spoke team name to the [production teams json template](https://github.com/mapbox/on-call/tree/main/lib/teams) in the /on-call repository.
- node-spoke: `oncall-spoke` makes use of the @mapbox/node-spoke npm module that simplifies using Node.js to make requests to the Spoke REST API
- cloudfriend and secret-cloudfriend: `oncall-spoke` uses the Event Lambda shortcut and the CodeBuild Project shortcut
- AWS: `oncall-spoke` uses several AWS services
  - Lambda: a Lambda function does most of the work
  - CloudFormation: creates the stack that includes the Lambda
  - Secrets Manager: stores secrets needed by the Lambda
  - CodeBuild: runs unit tests
- Slack: for sending error messages to IT and teams using the service
- PagerDuty: it all starts with an on-call handoff in a PagerDuty schedule

## Service Accounts and Tokens

oncall-spoke uses a [configuration in the Incoming Webhooks Slack app](https://mapbox.slack.com/services/xxxx) to send Slack alert messages to IT and teams registered for the service. The webhook URL is stored in AWS Secrets Manager.

oncall-spoke uses the following Okta/Spoke service account:

Name: `oncall-spoke api-user`
Email: `xxxx@mapbox.com`

The API token associated with this account is used in all Spoke API calls made by oncall-spoke. Spoke API tokens must be associated with a user, only one token per user is possible, and the token has the same permissions as the associated user. The only way to generate or regenerate an API token is to log in to Spoke and go to the user profile [API settings](https://mapbox.askspoke.com/profile/api). 

`oncall-spoke api-user` is a non-admin account that has the same permissions as any regular Spoke user, which means that most permissions are read-only by default. When the service account is added to a Spoke team, the associated token gains write access to that team's settings. As with any regular user, the token has the ability to read and write to any Spoke request in the system that is not marked as private.

The process used to create the Spoke API token used for this service is as follows. This process requires admin access to Okta and Spoke.
- create Okta service account
- assign Spoke Okta tile to the service account
- sign in to Spoke with the service account
- generate an API token for the service account in user profile settings
- add the token to AWS Secrets Manager, to be referenced by oncall-spoke's Lambda function
- add the service account as a member of each Spoke team that is using oncall-spoke (this gives the token permissions to modify team settings)
- rotating the token requires signing in to the service account in Spoke and regenerating the token, then changing the secret value in Secrets Manager