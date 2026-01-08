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

/*
Ue1dfcb3859e9e726d1839fcbd40ac8ac
U9cde6d2edaf30e56479c95ee8618c9cd
*/

const app = express()
const port = process.env.PORT || 3030
//
const headers = {
  "Content-Type": "application/json",
  "Authorization": "Bearer uWCHXalmoUA95FiGl298LqCvCiMrRyebRez/hbfEUiV1Xilk4ZdULAImv2vAdJRmc+v9GNyL2HXQ0gNCFBNAD3aNZpWyhAxK16sIGB/BrQ7oaSLdHjClBUFk8CgXLClQlyeRngref8TbpfBZN0JuEgdB04t89/1O/w1cDnyilFU=",
}
const config = { channelSecret: "c5cefb180914e47e06498b342b77582c" }
const client = new line.messagingApi.MessagingApiClient({
  channelAccessToken: "uWCHXalmoUA95FiGl298LqCvCiMrRyebRez/hbfEUiV1Xilk4ZdULAImv2vAdJRmc+v9GNyL2HXQ0gNCFBNAD3aNZpWyhAxK16sIGB/BrQ7oaSLdHjClBUFk8CgXLClQlyeRngref8TbpfBZN0JuEgdB04t89/1O/w1cDnyilFU=",
})
const header_object = {
  M1: ["MATERIAL", "hard finishes"],
  M2: ["MATERIAL", "soft finishes"],
  M3: ["MATERIAL", "hardware"],
  M4: ["MATERIAL", "sanitary"],
  F1: ["FURNITURE", "indoor"],
  F2: ["FURNITURE", "outdoor"],
  F3: ["FURNITURE", "customized furniture"],
  L1: ["LIGHTING", "general"],
  L2: ["LIGHTING", "decorative lamp"],
  A1: ["ACCESSORIES", "artwork"],
  A2: ["ACCESSORIES", "props"],
  A3: ["ACCESSORIES", "carpet"],
  A4: ["ACCESSORIES", "amenity"]
}
const color_object = {
  M: "#e9d4ff",
  F: "#ffccd3",
  L: "#fee685",
  A: "#b9f8cf"
}
//
axios.defaults.headers.post["Content-Type"] = "application/json"
axios.defaults.headers.post["Authorization"] = "Bearer tly-ASqvEMi4UuCizMUvSXDMTaH8L2Fqe7Ax"
//  
app.use(express.static(path.join(import.meta.dirname, "public")))
app.use("/form", express.static("form"))
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
app.get("/insert", (req,res) => {
  form(req.query.header).then(form_id => res.redirect("https://pumanbot.pongpoti.deno.net/form?id=" + form_id))
})

app.post("/line", line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err)
      res.status(500).end()
    })
})

const handleEvent = async (event) => {
  try {
    await axios.post("https://api.line.me/v2/bot/chat/loading/start",
      { "chatId": event.source.userId },
      { headers: headers }
    )
  } catch (error) {
    console.error(error)
  }
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null)
  }
  const message = event.message.text.trim().toLowerCase()
  try {
    await axios.post("https://api.telegram.org/bot8304418735:AAEzik9XwKKWOt5c2Ya0p72WKloJjj-_zaM/sendMessage", {
      chat_id: "1228757332",
      text: "[ line chat ]\nuserId : " + event.source.userId + "\nmessage : " + message
    })
  } catch (error) {
    console.error(error)
  }
  const echo = { type: 'text', text: message }
  return client.replyMessage({
    replyToken: event.replyToken,
    messages: [echo],
  })
}

const form = async (param) => {
  let form_id = null
  const form_name = header_object[param][0] + " - " + header_object[param][1]
  const form_color = color_object[param.charAt(0)]
  //create form
  try {
    const create_form = await axios.post("https://api.tally.so/forms", {
      name: form_name,
      status: "PUBLISHED",
      settings: {
        styles: {
          theme: "LIGHT",
          color: {
            background: form_color,
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
          type: "FORM_TITLE",
          groupUuid: uuid(),
          groupType: "FORM_TITLE",
          payload: {
            html: form_name,
            title: form_name
          }
        },
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
    form_id = create_form.data.id
  } catch (error) {
    console.error(error)
  }
  //create webhook
  try {
    await axios.post("https://api.tally.so/webhooks", {
      formId: form_id,
      url: "https://pumabot.pongpoti.deno.net/line?header=" + param,
      eventTypes: ["FORM_RESPONSE"]
    })
    return form_id
  } catch (error) {
    console.error(error)
  }
}

//form()

app.listen(port, () => {
  console.log("server on..")
})