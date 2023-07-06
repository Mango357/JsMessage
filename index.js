const path = require("path");
const express = require("express");
const request = require("request");
const cors = require("cors");
const morgan = require("morgan");
const { init: initDB, Counter } = require("./db");
const { log } = require("console");

const logger = morgan("tiny");

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(logger);


// 首页
app.get("/", async (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// 更新计数
app.post("/api/count", async (req, res) => {
  const { action } = req.body;
  if (action === "inc") {
    await Counter.create();
  } else if (action === "clear") {
    await Counter.destroy({
      truncate: true,
    });
  }
  res.send({
    code: 0,
    data: await Counter.count(),
  });
});

app.post("/send", async function (req, res) {
  const { openid } = req.query // 通过get参数形式指定openid
  // 在这里直接是触发性发送，也可以自己跟业务做绑定，改成事件性发送
  const info = await sendapi(openid)
  res.send(info)
});


// 获取计数
app.get("/api/count", async (req, res) => {
  const result = await Counter.count();
  res.send({
    code: 0,
    data: result,
  });
});

// 小程序调用，获取微信 Open ID
app.get("/api/wx_openid", async (req, res) => {
  if (req.headers["x-wx-source"]) {
    console.log('测试一下获取的ID对不对', req.headers["x-wx-openid"]["data"]);
    console.log('测试一下获取的ID对不对2', req.headers["x-wx-openid"]);
    // await User.bulkCreate({ openid: req.headers["x-wx-openid"]["data"] })
    res.send(req.headers["x-wx-openid"]);
  }
});


app.get("/send", async function (req, res) {
  const { openid } = req.query // 通过get参数形式指定openid
  console.log('openid', openid);
  if (req.headers["x-wx-source"]) {
    const { openid2 } = req.headers["x-wx-openid"]
    console.log('openid2', openid2);
  }
  console.log('req', req['rawHeaders']);
  console.log('req--x-wx-openid', req['x-wx-openid']);
  // 在这里直接是触发性发送，也可以自己跟业务做绑定，改成事件性发送
  const info = await sendapi(openid)
  res.send(info)
});

async function sendapi(openid) {
  return new Promise((resolve, reject) => {
    request({
      url: "http://api.weixin.qq.com/cgi-bin/message/subscribe/send",
      method: "POST",
      body: JSON.stringify({
        touser: openid,
        template_id: "maOpraeLg90lDuXNiLEbtnQMaesND7yihJMh8g-Fjz0",
        miniprogram_state: "formal",
        data: {
          // 这里替换成自己的模板ID的详细事项，不要擅自添加或更改
          // 按照key前面的类型，对照参数限制填写，否则都会发送不成功
          // 
          thing3: {
            value: "签到奖励",
          },
          phrase1: {
            value: "签到状态"
          },
          thing5: {
            value: "温馨提示",
          },
        },
      }),
    }, function (error, res) {
      if (error) reject(error)
      resolve(res.body)
    });
  });
}

const port = process.env.PORT || 80;

async function bootstrap() {
  await initDB();
  app.listen(port, () => {
    console.log("启动成功", port);
  });
}

function Messageing() {
  let count = 0;
  setInterval(() => {
    console.log('定时器在起作用', count++);
  }, 10 * 1000)
}


bootstrap();
Messageing();
