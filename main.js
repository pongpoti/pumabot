import express from "express"
import axios from "axios"
import * as line from "@line/bot-sdk"
import { createClient } from '@supabase/supabase-js'

/*
Ue1dfcb3859e9e726d1839fcbd40ac8ac
U9cde6d2edaf30e56479c95ee8618c9cd
*/

const app = express()
const port = process.env.PORT || 3030
const headers = {
  "Content-Type": "application/json",
  "Authorization": "Bearer uWCHXalmoUA95FiGl298LqCvCiMrRyebRez/hbfEUiV1Xilk4ZdULAImv2vAdJRmc+v9GNyL2HXQ0gNCFBNAD3aNZpWyhAxK16sIGB/BrQ7oaSLdHjClBUFk8CgXLClQlyeRngref8TbpfBZN0JuEgdB04t89/1O/w1cDnyilFU=",
}
const config = { channelSecret: "c5cefb180914e47e06498b342b77582c" }
const client = new line.messagingApi.MessagingApiClient({
  channelAccessToken: "uWCHXalmoUA95FiGl298LqCvCiMrRyebRez/hbfEUiV1Xilk4ZdULAImv2vAdJRmc+v9GNyL2HXQ0gNCFBNAD3aNZpWyhAxK16sIGB/BrQ7oaSLdHjClBUFk8CgXLClQlyeRngref8TbpfBZN0JuEgdB04t89/1O/w1cDnyilFU=",
})
const supabase = createClient("https://lbgaqfzogwnvssnmcdxo.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxiZ2FxZnpvZ3dudnNzbm1jZHhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0NTU1NjcsImV4cCI6MjA4MzAzMTU2N30.MD5gKKP7jhAVyW7bd4tscxTPZllvWM1OGIe9l8hFxuU")
axios.defaults.headers.delete["Content-Type"] = "application/json"
axios.defaults.headers.delete["Authorization"] = "Bearer tly-ASqvEMi4UuCizMUvSXDMTaH8L2Fqe7Ax"
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
//
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
//
app.use("/display", express.static("display"))
app.use("/insert", express.static("insert"))
app.use("/submit", express.static("submit"))
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
    console.log("REQ DATA")
    body += chunk.toString()
  })
  req.on("end", async () => {
    console.log("REQ END")
    try {
      const parsedData = JSON.parse(body)
      const workplace = parsedData.data.fields[0].value.trim()
      let link = parsedData.data.fields[1].value.trim().toLowerCase()
      if (!(/^https?:\/\//).test(link)) {
        link = "https://" + link
      }
      const header = parsedData.data.fields[2].value
      const id = parsedData.data.fields[3].value
      await notifyBot(header, workplace, link, id)
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
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null)
  }
  try {
    await axios.post("https://api.line.me/v2/bot/chat/loading/start",
      { "chatId": event.source.userId },
      { headers: headers }
    )
  } catch (error) {
    console.error(error)
  }
  //
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
