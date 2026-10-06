const http=require('http');
const {WebSocketServer}=require('ws');
const port=process.env.PORT||3000;
const server=http.createServer((req,res)=>{
  res.writeHead(200,{'Content-Type':'text/plain'});
  res.end('Carrion Spider signaling server is running.\n');
});
const wss=new WebSocketServer({server});
const rooms=new Map();
function send(ws,obj){if(ws.readyState===1)ws.send(JSON.stringify(obj))}
wss.on('connection',ws=>{
  ws.on('message',raw=>{
    let m;try{m=JSON.parse(raw)}catch{return}
    if(m.type==='join'){
      const room=String(m.room||'').toUpperCase().slice(0,12);
      const role=m.role==='host'?'host':'join';
      if(!room)return send(ws,{type:'error',message:'Missing room code'});
      let r=rooms.get(room)||{};
      if(r[role]&&r[role]!==ws)return send(ws,{type:'error',message:role==='host'?'Room already has a host':'Room already has Player 2'});
      r[role]=ws;rooms.set(room,r);ws.room=room;ws.role=role;
      if(r.host&&r.join){send(r.host,{type:'peer-ready'});send(r.join,{type:'peer-ready'})}
      return;
    }
    const r=rooms.get(ws.room);if(!r)return;
    const other=ws.role==='host'?r.join:r.host;
    if(other&&['offer','answer'].includes(m.type))send(other,m);
  });
  ws.on('close',()=>{
    const r=rooms.get(ws.room);if(!r)return;
    if(r[ws.role]===ws)delete r[ws.role];
    if(!r.host&&!r.join)rooms.delete(ws.room);
  });
});
server.listen(port,()=>console.log('Signaling server on port '+port));
