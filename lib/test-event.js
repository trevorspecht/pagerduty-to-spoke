'use strict';

const AWS = require('aws-sdk');

let pagerdutyHandoffs = {};
let team = {};
let onCallEmail;
let previouslyOnCall;

async function putHandoffEvent(event) {
  const message = event.Records[0].Sns.Message;
  const parsedMessage = JSON.parse(message);
  console.log('parsedMessage: ' + parsedMessage);
  pagerdutyHandoffs = parsedMessage.detail.PagerdutyHandoffs;
  team = parsedMessage.detail.Team;
  onCallEmail = parsedMessage.detail.OnCallEmail;
  previouslyOnCall = parsedMessage.detail.PreviouslyOnCall;

  const events = new AWS.CloudWatchEvents();
  await events
    .putEvents({
      Entries: [
        {
          Time: new Date().toISOString(),
          Source: 'on-call/handoff',
          DetailType: 'On-call Handoff Event',
          Detail: JSON.stringify({
            PagerdutyHandoffs: pagerdutyHandoffs,
            Team: team,
            OnCallEmail: onCallEmail,
            PreviouslyOnCall: previouslyOnCall
          })
        }
      ] }).promise();
}

exports.lambda = async (event) => {

  try {
    await putHandoffEvent(event);
    console.log(`Created handoff event for ${team.spoke} team`);
  } catch (err) {
    console.error(`Error creating ${team.spoke} team handoff event`);
    console.error(err);
  }
};
