import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { io } from 'socket.io-client';

const hostUrl = 'http://127.0.0.1:3000';
const secret = process.env.MEETING_AUTH_SECRET;
if (!secret) throw new Error('Missing test secret');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function request(path, opts = {}) {
  const res = await fetch(hostUrl + path, {
    ...opts,
    headers: {'Content-Type':'application/json', ...(opts.token ? {Authorization:'Bearer '+opts.token} : {}) },
    body: opts.payload ? JSON.stringify(opts.payload) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return {status: res.status, data};
}
function sign(role) {
  const body = Buffer.from(JSON.stringify({role,exp:Math.floor(Date.now()/1000)+600,nonce:'ci-' + Date.now()})).toString('base64url');
  return body + '.' + createHmac('sha256',secret).update(body).digest('base64url');
}
function event(client, name, timeoutMs=10000) {
  return new Promise((resolve,reject)=>{
    const timeout=setTimeout(()=>{client.off(name,listener);reject(new Error('Timeout waiting for '+name))},timeoutMs);
    function listener(payload){ clearTimeout(timeout); resolve(payload); }
    client.once(name,listener);
  });
}
async function connect(token) {
  const client=io(hostUrl+'/meetings',{auth:{meetingToken:token},transports:['websocket'],autoConnect:false,reconnection:false});
  const ready=event(client,'connect');
  client.connect(); await ready;
  return client;
}
async function main(){
  // Cold start timeout, then verify initial HTTP reachability.
  let ready=false;
  for(let i=0;i<30;i++){
    try { const r=await fetch(hostUrl+'/'); if(r.ok){ready=true;break;} } catch {}
    await sleep(1000);
  }
  assert.ok(ready,'Backend startup failed');
  for (const unsafe of ['/users', '/chat/rooms', '/notifications/devices']) {
    const closed = await fetch(hostUrl + unsafe);
    assert.equal(closed.status, 404, unsafe + ' legacy unauthenticated endpoint must not be exposed');
  }
  const admin=sign('admin');
  let r=await request('/meetings',{method:'POST',payload:{title:'Unauth',startTime:new Date().toISOString(),roomName:'unauth'}});
  assert.equal(r.status,401,'Visitors must not create meetings');
  r=await request('/meetings',{method:'POST',token:admin,payload:{title:'CI Rehearsal',startTime:new Date().toISOString(),roomName:'test'}});
  assert.equal(r.status,201,JSON.stringify(r.data));
  const { meetingId, passcode }=r.data;
  assert.match(meetingId,/^SSG-/);
  assert.match(passcode,/^\d{6}$/);
  r=await request('/meetings/join',{method:'POST',payload:{meetingId,passcode:'000000'}});
  assert.equal(r.status,401,'Incorrect passcode must fail');
  r=await request('/meetings/join',{method:'POST',payload:{meetingId,passcode}});
  assert.equal(r.status,201);
  const memberToken=r.data.accessToken;
  r=await request('/meetings/waiting-room/request',{method:'POST',token:memberToken,payload:{meetingId,fullName:'Alto Member'}});
  assert.equal(r.status,201,JSON.stringify(r.data));
  assert.equal(r.data.status,'PENDING');
  const id=r.data.id,admission=r.data.accessToken;
  r=await request('/meetings/'+meetingId+'/waiting-room/status',{method:'GET',token:admission});
  assert.equal(r.data.status,'PENDING');
  r=await request('/meetings/'+meetingId+'/waiting-room');
  assert.equal(r.status,401,'Waiting-room roster must not leak');
  // A valid admission token must still be denied before approval.
  const pending=await connect(admission);
  const rejected=event(pending,'meeting-error');
  pending.emit('join-meeting',{meetingId,fullName:'Alto Member'});
  assert.match((await rejected).message,/not been admitted/i);
  pending.disconnect();
  r=await request('/meetings/waiting-room/approve',{method:'PATCH',token:admin,payload:{participantId:id}});
  assert.equal(r.status,200,JSON.stringify(r.data));
  const host=await connect(admin);
  const hJoined=event(host,'existing-participants');
  host.emit('join-meeting',{meetingId,fullName:'Serenade Host'});
  await hJoined;
  const member=await connect(admission);
  const mJoined=event(member,'existing-participants');
  member.emit('join-meeting',{meetingId,fullName:'Alto Member'});
  const peerList=await mJoined;
  assert.equal(peerList.participants.length,1);
  assert.equal(peerList.participants[0].role,'host');
  const gotChat=event(host,'meeting-chat-message');
  member.emit('meeting-chat-message',{meetingId,text:'Ready for rehearsal'});
  const message=await gotChat;
  assert.equal(message.senderName,'Alto Member');
  assert.equal(message.content,'Ready for rehearsal');
  // Chat survives participant reconnect because it is persisted in PostgreSQL.
  member.disconnect();
  const reconnect=await connect(admission);
  const history=event(reconnect,'meeting-chat-history');
  reconnect.emit('join-meeting',{meetingId,fullName:'Alto Member'});
  const log=await history;
  assert.ok(log.messages.some(x=>x.content==='Ready for rehearsal'));
  const ended=event(reconnect,'host-end-meeting');
  host.emit('host-end-meeting',{meetingId});
  await ended;
  r=await request('/meetings/join',{method:'POST',payload:{meetingId,passcode}});
  assert.equal(r.status,403,'Ended meetings must reject new join attempts');
  reconnect.disconnect();host.disconnect();
  process.stdout.write('Serenade Meet integration: all assertions passed.\n');
}
main().catch(err=>{console.error(err);process.exitCode=1;});
