import express from "express";
import process from "node:process";
import path from "node:path";
import axios from "axios";
import * as line from "@line/bot-sdk";

/*
purple_200 : #e9d4ff
rose_200 : #ffccd3
amber_200 : #fee685
green_200 : #b9f8cf
*/

const app = express();
const port = process.env.PORT || 3030;
const config = {
  channelSecret: "c5cefb180914e47e06498b342b77582c",
};
const client = new line.messagingApi.MessagingApiClient({
  channelAccessToken: "uWCHXalmoUA95FiGl298LqCvCiMrRyebRez/hbfEUiV1Xilk4ZdULAImv2vAdJRmc+v9GNyL2HXQ0gNCFBNAD3aNZpWyhAxK16sIGB/BrQ7oaSLdHjClBUFk8CgXLClQlyeRngref8TbpfBZN0JuEgdB04t89/1O/w1cDnyilFU=",
});
axios.defaults.headers.post["Content-Type"] = "application/json";

app.use(express.static(path.join(import.meta.dirname, 'public')));
app.get("/callback", (req, res) => {
  axios.post("https://api.telegram.org/bot8526164438:AAE73090HiNtPx5LFOGa6l3uTB40wnx7pCU/sendMessage", {
    chat_id: "1228757332",
    text: req.data
  })
})

app.listen(port, () => {
  console.log("server on..");
});




