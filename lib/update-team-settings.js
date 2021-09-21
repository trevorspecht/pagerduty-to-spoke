'use strict';

const slack = require('./send-slack-alert');
const Spoke = require('@mapbox/node-spoke');
const bots = require('./bot-accounts');

let errMsg;

const updateSpokeOnCall = async (secretPrefix, event, handoff) => {
  const spoke = new Spoke(secretPrefix);

  const spokeTeam = event.detail.Team.spoke;
  const oncallEmail = event.detail.OnCallEmail;

  // check for SpokeTeam key in event object

  if (!('spoke' in event.detail.Team)) {
    // expected when a team has not opted in to this service
    console.log('Spoke team not specified.');
    return -1;
  } else if (!spokeTeam) {
    // if Team.spoke is present, it should have a value
    await slack.sendAlertMessage(event);
    console.log('Spoke team name missing in event details.');
    return 1;
  }

  // check for malformed event object

  if (!('OnCallEmail' in event.detail)) {
    await slack.sendAlertMessage(event);
    throw new Error('Malformed event. OnCallEmail key missing in details');
  } else if (!oncallEmail) {
    await slack.sendAlertMessage(event);
    throw new Error('Malformed event. OnCallEmail value undefined');
  }

  // ignore handoff if a bot user is involved
  for (const bot of Object.values(bots)) {
    if (bot.email === oncallEmail || bot.email === event.detail.PreviouslyOnCall) {
      console.log(`bot account ${bot.email} is involved in the handoff. No changes made to team settings.`);
      return -1;
    }
  }
  console.log('No bot user involved in the handoff. Proceeding.');

  // get team ID

  const listTeamParams = {
    limit: 500
  };
  const oncallFullname = handoff.goingOn.summary;
  let teamId = undefined;
  let teamName;

  const listTeamsResponse = await spoke.listTeams(listTeamParams);
  if (listTeamsResponse.body.results.length === 0) {
    console.log(`listTeamsResponse: ${JSON.stringify(listTeamsResponse.body)}`);
    await slack.sendAlertMessage(event);
    throw new Error('listTeams returned an empty response.');
  }
  for (const team of listTeamsResponse.body.results) {
    if ((team.name).toLowerCase() === spokeTeam.toLowerCase()) {
      console.log(`Found team: ${team.name}`);
      teamName = team.name;
      teamId = team.id;
      break;
    }
  }
  if (!teamId) {
    await slack.sendAlertMessage(event);
    console.log(`Spoke team ${spokeTeam} not found.`);
    return 1;
  }

  // get user ID

  const listUsersParams = {
    q: oncallEmail
  };
  const listUsersResponse = await spoke.listUsers(listUsersParams);
  // throw error if Spoke user not found
  if (listUsersResponse.body.results.length === 0) {
    console.log(`listUsersResponse: ${JSON.stringify(listUsersResponse.body)}`);
    await slack.sendAlertMessage(event);
    errMsg = `Spoke user ${oncallFullname} : ${oncallEmail} not found.`;
    throw new Error(errMsg);
  }
  const userId = listUsersResponse.body.results[0].id;
  console.log(`found Spoke user ID: ${userId}`);

  // make sure user is a member of the team

  let foundUserId = undefined;
  for (const team of listTeamsResponse.body.results) {
    if ((team.name).toLowerCase() === spokeTeam.toLowerCase()) {
      console.log(`team object: ${JSON.stringify(team)}`);
      for (const member of team.agentList) {
        if (member.user._id === userId) {
          console.log(`user object: ${JSON.stringify(member)}`);
          foundUserId = member.user._id;
          console.log(`Found user ID ${foundUserId} in ${team.name} team.`);
          break;
        }
      }
    }
  }

  if (foundUserId) {
    const updateTeamParams = {
      'settings': {
        'delegation': {
          'strategy': 'SPECIFIC_USER',
          'specificUser': foundUserId, // ignored when strategy is ROUND_ROBIN
          'excludedUsers': [ // ignored when strategy is SPECIFIC_USER
            '{user ID}'
          ]
        }
      }
    };

    // update Spoke team settings for request assignment
    console.log(`Making changes to ${spokeTeam} team settings.`);
    const updateTeamResponse = await spoke.updateTeam(teamId, updateTeamParams);
    console.log('updateTeamResponse:', updateTeamResponse.body);
    return 0;
  } else {
    await slack.sendAlertMessage(event);
    console.log(`${oncallFullname} is not a member of the ${teamName} team.`);
    return 1;
  }
};


exports.lambda = async (event) => {

  // log incoming event
  console.log('EVENT:', JSON.stringify(event));

  const secretPrefix = process.env.SpokeSecretLocation;
  let result;

  // TODO: how to keep processing array elements if an error causes execution to go to the catch block
  try {
    // for each element in the handoffs array, process only if the handoff occurred at the top level of the escalation policy
    for (const handoff of event.detail.PagerdutyHandoffs) {
      if (handoff.escalationLevel !== 1) {
        console.log(`The ${handoff.scheduleName} schedule is at level ${handoff.escalationLevel} of the escalation policy. No Spoke changes required.`);
      } else {
        console.log(`The ${handoff.scheduleName} schedule is at level ${handoff.escalationLevel} of the escalation policy. Continuing to process handoff.`);
        result = await updateSpokeOnCall(secretPrefix, event, handoff);
        if (result === -1) {
          console.log('No Spoke changes required.');
        } else if (result === 1) {
          console.error(`Error updating Spoke request assignment settings for ${event.detail.Team.spoke} team.`);
        } else if (result === 0) {
          console.log(`Success! ${event.detail.Team.spoke} Team request assignment changed to ${handoff.goingOn.summary}.`);
        }
      }
    }
  } catch (err) {
    console.error(`Error updating Spoke request assignment settings for ${event.detail.Team.spoke} team.`);
    console.error(err);
    await slack.sendAlertMessage(event, errMsg);
  }
};
