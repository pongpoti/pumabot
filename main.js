const express = require("express")
const path = require("path")
const axios = require("axios")
const line = require("@line/bot-sdk")
const { createClient } = require("@supabase/supabase-js")
const dotenv = require("dotenv")
dotenv.config()

/*
Ue1dfcb3859e9e726d1839fcbd40ac8ac
U9cde6d2edaf30e56479c95ee8618c9cd
*/

const app = express()
const port = process.env.PORT || 3030
const LINE_ACCESS_TOKEN = process.env.LINE_ACCESS_TOKEN
const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID
const headers = {
  "Content-Type": "application/json",
  "Authorization": "Bearer " + LINE_ACCESS_TOKEN,
}
const config = { channelSecret: LINE_CHANNEL_SECRET }
const client = new line.messagingApi.MessagingApiClient({
  channelAccessToken: LINE_ACCESS_TOKEN,
})
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
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
app.use("/display", express.static(path.join(__dirname, "display")))
app.use("/insert", express.static(path.join(__dirname, "insert")))
app.use("/submit", express.static(path.join(__dirname, "submit")))
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
    await axios.post("https://api.telegram.org/bot" + TELEGRAM_BOT_TOKEN + "/sendMessage", {
      chat_id: TELEGRAM_CHAT_ID,
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
    await axios.post("https://api.telegram.org/bot" + TELEGRAM_BOT_TOKEN + "/sendMessage", {
      chat_id: TELEGRAM_CHAT_ID,
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
