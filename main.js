import express from "express"
import process from "node:process"
import path from "node:path"
import axios from "axios"
import * as line from "@line/bot-sdk"
import { v4 as uuid } from "uuid"
import { createClient } from '@supabase/supabase-js'

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
//
const supabase = createClient("https://lbgaqfzogwnvssnmcdxo.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxiZ2FxZnpvZ3dudnNzbm1jZHhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0NTU1NjcsImV4cCI6MjA4MzAzMTU2N30.MD5gKKP7jhAVyW7bd4tscxTPZllvWM1OGIe9l8hFxuU")
//
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
  M: ["#e9d4ff", "purple-200"],
  F: ["#ffccd3", "rose-200"],
  L: ["#fee685", "amber-200"],
  A: ["#b9f8cf", "green-200"]
}
//
axios.defaults.headers.post["Content-Type"] = "application/json"
axios.defaults.headers.post["Authorization"] = "Bearer tly-ASqvEMi4UuCizMUvSXDMTaH8L2Fqe7Ax"
axios.defaults.headers.patch["Content-Type"] = "application/json"
axios.defaults.headers.patch["Authorization"] = "Bearer tly-ASqvEMi4UuCizMUvSXDMTaH8L2Fqe7Ax"
//
app.use(express.static(path.join(import.meta.dirname, "public")))
app.use("/form/insert/active", express.static("form-insert"))
app.use("/form/submit/active", express.static("form-submit"))
//
app.get("/form/insert/initiate", (req, res) => {
  form(req.query.header).then(id => res.redirect("https://pumabot.pongpoti.deno.net/form/insert/active?id=" + id))
})
app.get("/form/submit/initiate", (req, res) => {
  axios.delete("https://api.tally.so/forms/" + req.query.id, {
    headers: {
      "Authorization": "Bearer tly-ASqvEMi4UuCizMUvSXDMTaH8L2Fqe7Ax",
      "Content-Type": "application/json"
    }
  }).then(() => {
    res.redirect("https://pumabot.pongpoti.deno.net/form/submit/active?color=" + req.query.color)
  }).catch((error) => {
    console.error(error)
  })
})
//
app.post("/line", line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err)
      res.status(500).end()
    })
})
app.post("/callback", (req, res) => {
  const header = req.query.header
  const response = JSON.parse(req.body)
  const workplace = response.data.fields[0].value
  const link = response.data.fields[1].value
  res.json({
    header: header,
    workplace: workplace,
    link: link
  })
  /*
  axios.post("https://api.telegram.org/bot8304418735:AAEzik9XwKKWOt5c2Ya0p72WKloJjj-_zaM/sendMessage", {
    chat_id: "1228757332",
    text: "[ form submit ]\n" + header_object[header][0] + " - " + header_object[header][1] +
      "\nheader : " + header + "\nworkplace : " + workplace + "\nlink : " + link
  }).then(() => res.sendStatus(200)).catch(() => res.sendStatus(400))
  */
})
//


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

const form = async (header) => {
  const form_name = header_object[header][0] + " - " + header_object[header][1]
  const form_color_hex = color_object[header.charAt(0)][0]
  const form_color_tw = color_object[header.charAt(0)][1]
  const id = await createForm(form_name, form_color_hex)
  await patchForm(id, form_color_tw)
  await addWebhook(id, header)
  return id
}

const createForm = async (form_name, form_color_hex) => {
  try {
    const { data } = await axios.post("https://api.tally.so/forms", {
      name: form_name,
      status: "PUBLISHED",
      settings: {
        styles: {
          theme: "LIGHT",
          color: {
            background: form_color_hex,
            text: "#024a70",
            buttonBackground: "#024a70"
          }
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
    return data.id
  } catch (error) {
    console.error(error)
  }
}

const patchForm = async (id, form_color_tw) => {
  try {
    await axios.patch("https://api.tally.so/forms/" + id, {
      settings: {
        redirectOnCompletion: {
          html: "https://pumabot.pongpoti.deno.net/form/submit/initiate?id=" + id + "&color=" + form_color_tw
        }
      }
    })
  } catch (error) {
    console.error(error)
  }
}

const addWebhook = async (id, header) => {
  try {
    await axios.post("https://api.tally.so/webhooks", {
      formId: id,
      url: "https://pumabot.pongpoti.deno.net/callback?header=" + header,
      eventTypes: ["FORM_RESPONSE"]
    })
  } catch (error) {
    console.error(error)
  }
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})