import http from "http";
import ws from "websocket"
import redis from "redis";
const APPID = process.env.APPID;
let connections = [];
const WebSocketServer = ws.server;

const subscriber = redis.createClient({
  port      : 6379,              
  host      : 'rds'
});

const publisher = redis.createClient({
  port      : 6379,              
  host      : 'rds'
});

subscriber.on("subscribe", function(channel, count) {

  console.log('subscriber.on subscribe');
  console.log(`Server ${APPID} subscribed successfully to livechat\n channel: ${channel}\n count: ${count}`);
  console.log(`subscriber.on subscribe`);
  publisher.publish("livechat", "a message");
  console.log(`connections count: ${connections.length}`);

});
 
subscriber.on("message", function(channel, message) {

  console.log('subscriber.on message');

  try {
      console.log(`Server ${APPID} received message in channel ${channel} msg: ${message}`);
      connections.forEach(c => c.send(APPID + ":" + message));
      console.log('connections[2]:', connections[2]);
      // console.log(`connections count: ${connections.length}`);
  }
  catch(ex){
    console.log("ERR::" + ex);
  }

});

subscriber.subscribe("livechat");

const httpserver = http.createServer();

const websocket = new WebSocketServer({
    "httpServer": httpserver
});

httpserver.listen(8080, () => console.log("My server is listening on port 8082"));

let connectionMapping = {};

websocket.on("request", request => {
    console.log('websocket.on request');
    // console.log('websocket.on request: ', request);
    const con = request.accept(null, request.origin);
    con.on("open", () => console.log("opened"));
    con.on("close", () => console.log("CLOSED!!!"));
    con.on("message", message => {
        // publish the message to redis
        if (!connectionMapping[APPID]) {
            connectionMapping[APPID] = {};
        }
        connectionMapping[APPID] = message.utf8Data;
        // connectionMapping[APPID][message.utf8Data].push(APPID + ' - ' + message.utf8Data);
        // connectionMapping[APPID.toString()].push(message.utf8Data);
        console.log(`${APPID} Received message ${message.utf8Data}`);
        publisher.publish("livechat", message.utf8Data);
    });

    setTimeout(() => con.send(`Connected successfully to server ${APPID}`), 5000);
    connections.push(con);

    console.log(`APPID: ${APPID} connections count: ${connections.length}`);

    console.log(JSON.stringify(connectionMapping));

});
  
//client code 
//let ws = new WebSocket("ws://localhost:8082");
//ws.onmessage = message => console.log(`Received: ${message.data}`);
//ws.send("Hello! I'm client")


/*

 let ws = [];
 for (let i  = 0; i<50; i++) {
    ws[i] = new WebSocket("ws://localhost:8082");
    ws[i].onmessage = message => console.log(`Received: ${message.data}`);;
 }

 ws.forEach(s => {
    s.send("Hello from a client!");
 });



 */
/*
 */

/*
    //code clean up after closing connection
    subscriber.unsubscribe();
    subscriber.quit();
    publisher.quit();
    */

// function nss(x) {
//     let sock = new WebSocket('ws://localhost:8082');
//     sock.onopen = param => sock.send('msg' + x);
// }