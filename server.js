const http=require('http');
const {WebSocketServer}=require('ws');
const port=process.env.PORT||3000;
const server=http.createServer((req,res)=>{
 res.writeHead(200,{'Content-Type':'text/plain'});
 res.end('Carrion Spider multiplayer signaling server running.\n');
});
const wss=new WebSocketServer({server});
const rooms=new Map();
let nextId=1;
function send(ws,obj){if(ws&&ws.readyState===1)ws.send(JSON.stringify(obj))}
function roomOf(code){let r=rooms.get(code);if(!r){r={host:null,players:new Map()};rooms.set(code,r)}return r}
wss.on('connection',ws=>{
 ws.peerId='p'+(nextId++);
 ws.on('message',raw=>{
  let m;try{m=JSON.parse(raw)}catch{return}
  if(m.type==='join'){
   const code=String(m.room||'').trim().toUpperCase().slice(0,12);
   if(!code)return send(ws,{type:'error',message:'Missing room code'});
   const r=roomOf(code),role=m.role==='host'?'host':'join';
   if(role==='host'){
    if(r.host&&r.host!==ws)return send(ws,{type:'error',message:'Room already has a host'});
    r.host=ws;
   }else{
    if(!r.host)return send(ws,{type:'error',message:'Host has not opened this room yet'});
    r.players.set(ws.peerId,ws);
   }
   ws.room=code;ws.role=role;
   send(ws,{type:'joined',peerId:ws.peerId});
   if(role==='join')send(r.host,{type:'peer-ready',peerId:ws.peerId});
   return;
  }
  const r=rooms.get(ws.room);if(!r)return;
  if(['offer','answer','candidate'].includes(m.type)){
   let target=null;
   if(ws.role==='host')target=r.players.get(m.to);
   else target=r.host;
   if(target)send(target,{...m,from:ws.peerId});
  }
 });
 ws.on('close',()=>{
  const r=rooms.get(ws.room);if(!r)return;
  if(ws.role==='host'&&r.host===ws){
   r.host=null;
   for(const p of r.players.values())send(p,{type:'error',message:'Host disconnected'});
  }else if(ws.role==='join'){
   r.players.delete(ws.peerId);send(r.host,{type:'peer-left',peerId:ws.peerId});
  }
  if(!r.host&&r.players.size===0)rooms.delete(ws.room);
 });
});
server.listen(port,()=>console.log('Carrion Spider signaling server on '+port));
