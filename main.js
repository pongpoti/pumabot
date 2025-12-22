import express from "express";
import process from "node:process";
import * as line from "@line/bot-sdk";

const app = express();
const port = process.env.PORT || 3030;

app.listen(port, () => {
  console.log("server on..");
});

const config = {
  channelSecret: "c5cefb180914e47e06498b342b77582c",
};
const client = new line.messagingApi.MessagingApiClient({
  channelAccessToken: "uWCHXalmoUA95FiGl298LqCvCiMrRyebRez/hbfEUiV1Xilk4ZdULAImv2vAdJRmc+v9GNyL2HXQ0gNCFBNAD3aNZpWyhAxK16sIGB/BrQ7oaSLdHjClBUFk8CgXLClQlyeRngref8TbpfBZN0JuEgdB04t89/1O/w1cDnyilFU=",
});

