# Alarms

Because a failure in the oncall-spoke service is easily remedied by making a manual change to Spoke team settings, errors are handled by sending Slack messages to the team channel that is specified in the on-call [production teams json templates](https://github.com/mapbox/on-call/tree/master/lib/teams). The message lets the team know that their Spoke team settings were not updated when there was an on-call handoff, and provides them with a link to change those settings manually.

![image](https://user-images.githubusercontent.com/29611310/89346640-690af700-d677-11ea-81e9-c1c43e6c022d.png)


Error messages are also sent to IT's private alert Slack channel.

![image](https://user-images.githubusercontent.com/29611310/89346774-9e174980-d677-11ea-9a1f-53a80d4f2af0.png)



Following are the conditions that result in a Slack error message sent to IT and the relevant team:

## CloudWatch Event errors

- The `Team.spoke` key exists but does not have a value, meaning there is a potential problem with the configuration in the teams json files
- The `OnCallEmail` key is missing, indicating a malformed event
- The `OnCallEmail` key exists but does not have a value, indicating a malformed event

## Spoke lookup errors

- Spoke API list teams call fails
- Spoke API list teams call does not find the specified team
- Spoke API list users call fails
- Spoke API list users call does not find the specified user
- Specified user is not a member of the specified team
- Spoke API update team settings call fails