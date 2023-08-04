const axios = require("axios");
require("dotenv").config();

async function getTopTask() {
  const apiKey = process.env.TODOIST_API_KEY;
  let filter = encodeURIComponent("@Top"); // Filter tasks by "Top" label
  const url = `https://api.todoist.com/rest/v2/tasks?filter=${filter}`;
  const headers = {
    Authorization: `Bearer ${apiKey}`,
  };
  let formattedMsg = "";

  const tasks = await axios.get(url, { headers });
  let topTasks = tasks.data;

  // Sort tasks by priority (4 is the highest)
  topTasks.sort((a, b) => {
    if (b.priority !== a.priority) {
      return b.priority - a.priority;
    }
    // If the priorities are equal, sort by 'order'
    return a.order - b.order;
  });

  // Get the content of the highest priority task
  let highestPriorityTaskContent = topTasks[0].content;

  formattedMsg += "Top Task - " + highestPriorityTaskContent;
  console.log(formattedMsg);
  return formattedMsg;
}

async function postToDiscord(content) {
  const webhookUrl = process.env.WEBHOOK_URL;
  const userToMention = process.env.USER_ID;
  const payload = {
    content: `<@${userToMention}> ${content}`,
  };

  try {
    const response = await axios.post(webhookUrl, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log(`status code: ${response.status}`);
    return response.status;
  } catch (error) {
    console.error(error);
  }
}

async function chainRequests() {
  try {
    const topTask = await getTopTask();
    await postToDiscord(topTask);
  } catch (error) {
    console.error(error);
  }
}

chainRequests();
