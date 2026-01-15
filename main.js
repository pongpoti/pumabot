import express from "express"
import process from "node:process"
import path, { parse } from "node:path"
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
axios.defaults.headers.delete["Content-Type"] = "application/json"
axios.defaults.headers.delete["Authorization"] = "Bearer tly-ASqvEMi4UuCizMUvSXDMTaH8L2Fqe7Ax"
//
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
//
app.use("/display", express.static("display"))
app.use("/insert/activate", express.static("insert"))
app.use("/submit", express.static("submit"))
//
app.get("/insert/initiate", (req, res) => {
  console.log(req.query)
  console.log(req.query.lift.state)
  //const header = req.query.liff.state.replace("%3Fheader%3D", "")
  form(req.query.header).then(id => res.redirect("https://liff.line.me/2008812156-MigabOZT?header=" + req.query.header + "&id=" + id))
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
  let body = ""
  req.on("data", chunk => {
    body += chunk.toString()
  })
  req.on("end", async () => {
    try {
      const parsedData = JSON.parse(body)
      const workplace = parsedData.data.fields[0].value.trim()
      const link = parsedData.data.fields[1].value.trim().toLowerCase()
      const header = parsedData.data.fields[2].value
      const id = parsedData.data.fields[3].value
      await notifyBot(header, workplace, link, id)
      //check repeated submission
      const { data, error } = await supabase
        .from("src")
        .select()
        .ilike("workplace", "%" + workplace + "%")
      if (error) {
        console.error(error)
        res.sendStatus(500)
      } else {
        const filteredData = data
        if (filteredData.length === 0) {
          //insert
          const { error } = await supabase
            .from("src")
            .insert({ header: header, workplace: workplace, link: link })
          if (error) {
            console.error(error)
            res.sendStatus(500)
          } else {
            await deleteForm(id)
            res.sendStatus(200)
          }
        } else {
          //update
          const { error } = await supabase
            .from("src")
            .update({ header: header, workplace: workplace, link: link })
            .eq("id", filteredData[0].id)
          if (error) {
            console.error(error)
            res.sendStatus(500)
          } else {
            await deleteForm(id)
            res.sendStatus(200)
          }
        }
      }
    } catch (error) {
      console.error(error)
      res.sendStatus(500)
    }
  })
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
//
const form = async (header) => {
  const form_name = header_object[header][0] + " - " + header_object[header][1]
  const form_color_hex = color_object[header.charAt(0)][0]
  const id = await createForm(form_name, form_color_hex)
  await addWebhook(id, header)
  return id
}
//
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
        },
        redirectOnCompletion: {
          html: "https://liff.line.me/2008812156-K37Qep7m"
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
        },
        {
          uuid: uuid(),
          type: "HIDDEN_FIELDS",
          groupUuid: uuid(),
          groupType: "HIDDEN_FIELDS",
          payload: {
            hiddenFields: [
              {
                "uuid": uuid(),
                "name": "header"
              }
            ]
          }
        },
        {
          uuid: uuid(),
          type: "HIDDEN_FIELDS",
          groupUuid: uuid(),
          groupType: "HIDDEN_FIELDS",
          payload: {
            hiddenFields: [
              {
                "uuid": uuid(),
                "name": "id"
              }
            ]
          }
        }
      ]
    })
    return data.id
  } catch (error) {
    console.error(error)
  }
}
//
const addWebhook = async (id, header) => {
  try {
    await axios.post("https://api.tally.so/webhooks", {
      formId: id,
      url: "https://pumabot.pongpoti.deno.net/callback",
      eventTypes: ["FORM_RESPONSE"]
    })
  } catch (error) {
    console.error(error)
  }
}
//
const notifyBot = async (header, workplace, link, id) => {
  try {
    await axios.post("https://api.telegram.org/bot8304418735:AAEzik9XwKKWOt5c2Ya0p72WKloJjj-_zaM/sendMessage", {
      chat_id: "1228757332",
      text: "[ form submit ]\n" + header_object[header][0] + " - " + header_object[header][1] +
        "\nheader : " + header + "\nworkplace : " + workplace + "\nlink : " + link + "\nid : " + id
    })
  } catch (error) {
    console.error(error)
  }
}
//
const deleteForm = async (id) => {
  try {
    await axios.delete("https://api.tally.so/forms/" + id)
  } catch (error) {
    console.error(error)
  }
}
