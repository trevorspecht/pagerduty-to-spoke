# Usage


### How do I configure oncall-spoke for my team?

1. Open a request using @help. This is important because IT needs to take some steps to configure your Spoke team for this service.
2. Make a PR to the mapbox/on-call repository to add/update your team in the highest numbered [production-x.js template](https://github.com/mapbox/on-call/blob/master/lib/teams/). oncall-spoke is an extension of and has dependency on the mapbox/on-call service. To use oncall-spoke, teams must be added to mapbox/on-call with the inclusion of a ‘spoke’ key/value pair in the team object that specifies the Spoke team name:

    ```
     'it': {
        'service': 'xxxx',
        'slack': '#it-team',
        'spoke': 'IT'
      },

    ```


Use the Spoke team name as displayed on the left side of the window when signed in to [https://mapbox.askspoke.com/](https://mapbox.askspoke.com/):

<img width="144" alt="Screen Shot 2020-12-09 at 5 58 37 PM" src="https://user-images.githubusercontent.com/29611310/101698948-5f8c0400-3a48-11eb-8ef2-0ca085b66f70.png">


3. Your PR will be approved, merged and deployed by the Release Engineering team.

### How can I remove my team from oncall-spoke?
To remove a team, follow the instructions for adding a team, including filing a ticket with IT, but make a PR to remove the `'spoke:'` key/value pair from the team object.

### When are Spoke team settings changes applied?

PagerDuty will be polled in 5 minute intervals for on-call changes and any changes will be applied in Spoke at the time of the poll.


### What if my team doesn't use PagerDuty?

If your team would like to use this oncall-spoke but does not have a PagerDuty schedule, you may open a request using @help and IT will assist with setting up PagerDuty for your team.


### Is PagerDuty the only method my team can use to automatically change team assignment settings?

Yes. At this time this service supports only PagerDuty schedules as a method to automate Spoke team request assignment settings.


### What if my Spoke team is a private queue? Will any private information be compromised?

No. This service does not have access to information included in any Spoke requests, private or public. It has visibility into PagerDuty services and Schedules and Spoke team settings only, nothing more.


### What if my team uses the "Round Robin" method for assigning Spoke requests?

At this time oncall-spoke supports the "Specific User" method only for assigning requests for a team.


### How can I be sure the Spoke team changes are happening as expected?

Teams will be notified in the specified Slack channel on failure to modify Spoke team settings, letting them know the request assignment setting will have to be changed manually. IT will be alerted on any failures in the it-oncall-spoke stack. Release Engineering will be alerted on any failure of the on-call stack to write the event.
