import express from "express"
import process from "node:process"
import path from "node:path"
import axios from "axios"
import * as line from "@line/bot-sdk"
import { v4 as uuid } from "uuid"

/*
sky_900 : #024a70
purple_200 : #e9d4ff
rose_200 : #ffccd3
amber_200 : #fee685
green_200 : #b9f8cf
*/

const app = express()
app.use(express.json())
//
const port = process.env.PORT || 3030
const headers = {
  "Content-Type": "application/json",
  "Authorization": "Bearer uWCHXalmoUA95FiGl298LqCvCiMrRyebRez/hbfEUiV1Xilk4ZdULAImv2vAdJRmc+v9GNyL2HXQ0gNCFBNAD3aNZpWyhAxK16sIGB/BrQ7oaSLdHjClBUFk8CgXLClQlyeRngref8TbpfBZN0JuEgdB04t89/1O/w1cDnyilFU=",
}
const config = { channelSecret: "c5cefb180914e47e06498b342b77582c" }
const client = new line.messagingApi.MessagingApiClient({
  channelAccessToken: "uWCHXalmoUA95FiGl298LqCvCiMrRyebRez/hbfEUiV1Xilk4ZdULAImv2vAdJRmc+v9GNyL2HXQ0gNCFBNAD3aNZpWyhAxK16sIGB/BrQ7oaSLdHjClBUFk8CgXLClQlyeRngref8TbpfBZN0JuEgdB04t89/1O/w1cDnyilFU=",
})
const header_object = {
  M1: ["MATERIAL", "hard finishes", "https://tally.so/r/Y50Z15"],
  M2: ["MATERIAL", "sanitary", "https://tally.so/r/ja6M4Q"],
  M3: ["MATERIAL", "hardware", "https://tally.so/r/QKer9Y"],
  M4: ["MATERIAL", "soft finishes", "https://tally.so/r/b5jkR6"],
  F1: ["FURNITURE", "indoor"],
  F2: ["FURNITURE", "outdoor"],
  F3: ["FURNITURE", "customized furniture"],
  L1: ["LIGHTING", "general"],
  L2: ["LIGHTING", "decorative lamp"],
  A1: ["ACCESSORIES", "artwork"],
  A2: ["ACCESSORIES", "decorating object"],
  A3: ["ACCESSORIES", "carpet"],
  A4: ["ACCESSORIES", "amenity"]
}
//
axios.defaults.headers.post["Content-Type"] = "application/json"
axios.defaults.headers.post["Authorization"] = "Bearer tly-ASqvEMi4UuCizMUvSXDMTaH8L2Fqe7Ax"
//  
app.use(express.static(path.join(import.meta.dirname, "public")))
app.use("/tally", express.static("tally"))
//
app.post("/telegram_form", (req, res) => {
  const query = req.query.header
  const workplace = req.body.data.fields[0].value
  const link = req.body.data.fields[1].value
  axios.post("https://api.telegram.org/bot8304418735:AAEzik9XwKKWOt5c2Ya0p72WKloJjj-_zaM/sendMessage", {
    chat_id: "1228757332",
    text: "[ form submit ]\n" + header_object[query][0] + " - " + header_object[query][1] +
      "\nquery : " + query + "\nworkplace : " + workplace + "\nlink : " + link
  }).then(() => res.sendStatus(200)).catch(() => res.sendStatus(400))
})

app.post('/line', line.middleware(config), (req, res) => {
  const event = req.body.events[0]
  res.json(event)
});

/*
function handleEvent(event) {
  axios.post(
    "https://api.line.me/v2/bot/chat/loading/start",
    {
      "chatId": event.source.userId,
    },
    {
      headers: headers,
    },
  )
  if (event.type !== "message" || event.message.type !== "text") {
    return Promise.resolve(null)
  }
  const message = event.message.text.toLowerCase().trim()

  axios.post("https://api.telegram.org/bot8304418735:AAEzik9XwKKWOt5c2Ya0p72WKloJjj-_zaM/sendMessage", {
    chat_id: "1228757332",
    text: "[ line chat ]\nuserId : " + event.source.userId + "\nmessage : " + message
  })

  return client.replyMessage({
    replyToken: event.replyToken,
    messages: [
      {
        type: "text",
        text: message,
      },
    ],
  })

}
  */


const form = async () => {
  //create form
  let form_id = ""
  const create_form = await axios.post("https://api.tally.so/forms", {
    name: "//",
    status: "PUBLISHED",
    settings: {
      styles: {
        theme: "LIGHT",
        color: {
          background: "#e9d4ff",
          text: "#024a70",
          buttonBackground: "#024a70"
        }
      },
      redirectOnCompletion: {
        html: "https://pumabot.pongpoti.deno.net/callback?header=M1"
      }
    },
    blocks: [
      {
        uuid: uuid(),
        type: "TITLE",
        groupUuid: uuid(),
        groupType: "QUESTION",
        payload: {
          html: "workplace :"
        }
      },
      {
        uuid: uuid(),
        type: "INPUT_TEXT",
        groupUuid: uuid(),
        groupType: "INPUT_TEXT",
        payload: {
          isRequired: true,
          placeholder: ""
        }
      },
      {
        uuid: uuid(),
        type: "TITLE",
        groupUuid: uuid(),
        groupType: "QUESTION",
        payload: {
          html: "link :"
        }
      },
      {
        uuid: uuid(),
        type: "INPUT_LINK",
        groupUuid: uuid(),
        groupType: "INPUT_LINK",
        payload: {
          isRequired: true,
          placeholder: ""
        }
      }
    ]
  })
  if (create_form.status === 201) {
    form_id = create_form.data.id
  }
  //create webhook
  const create_webhook = await axios.post("https://api.tally.so/webhooks", {
    formId: form_id,
    url: "https://pumabot.pongpoti.deno.net/callback?header=M1",
    eventTypes: ["FORM_RESPONSE"]
  })
  if (create_webhook.status === 201) {
    console.log("SUCCESS : " + form_id)
  }
}

//form()

app.listen(port, () => {
  console.log("server on..")
})