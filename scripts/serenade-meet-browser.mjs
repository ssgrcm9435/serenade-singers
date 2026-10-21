import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { chromium } from 'playwright';

const origin = 'http://localhost:3100';
const backend = 'http://127.0.0.1:3000';
const secret = process.env.MEETING_AUTH_SECRET;

const token = (role) => {
  const content=Buffer.from(JSON.stringify({role,nonce:'browser-test-'+Date.now(),exp:Math.floor(Date.now()/1000)+3600})).toString('base64url');
  return content+'.'+createHmac('sha256',secret).update(content).digest('base64url');
};
async function api(path,method='GET',bearer='',body) {
  const res=await fetch(backend+path,{method,headers:{'Content-Type':'application/json',...(bearer?{Authorization:'Bearer '+bearer}:{})},body:body?JSON.stringify(body):undefined});
  const data=await res.json().catch(()=>({}));
  assert.ok(res.ok,JSON.stringify({path,status:res.status,data}));
  return data;
}
async function waitUi() {
  for(let i=0;i<60;i++){try{if((await fetch(origin+'/meeting')).ok)return;}catch{} await new Promise(r=>setTimeout(r,1000));}
  throw new Error('Frontend failed to start');
}
async function main(){
  await waitUi();
  const admin=token('admin');
  const m=await api('/meetings','POST',admin,{title:'Two-browser rehearsal',startTime:new Date().toISOString(),roomName:'browser-rehearsal'});
  const member=await api('/meetings/join','POST','',{meetingId:m.meetingId,passcode:m.passcode});

  const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});
  try {
    const hostContext=await browser.newContext({permissions:['camera','microphone']});
    const memberContext=await browser.newContext({permissions:['camera','microphone']});
    const host=await hostContext.newPage();
    const guest=await memberContext.newPage();
    host.on('pageerror',e=>console.error('HOST PAGE',e.message));
    guest.on('pageerror',e=>console.error('MEMBER PAGE',e.message));
    for (const [label,page] of [['HOST',host],['GUEST',guest]]) {
      page.on('websocket',ws=>{
        ws.on('framesent',f=>{if(/webrtc-offer|webrtc-answer|ice-candidate/.test(f.payload||''))console.log(label,'SEND',String(f.payload).slice(0,110));});
        ws.on('framereceived',f=>{if(/webrtc-offer|webrtc-answer|ice-candidate/.test(f.payload||''))console.log(label,'RECV',String(f.payload).slice(0,110));});
      });
    }
    await host.addInitScript(v=>sessionStorage.setItem('ss_admin_meeting_token',v),admin);
    await guest.addInitScript(data=>sessionStorage.setItem('ss_meeting_access',JSON.stringify(data)),{
      meetingId:m.meetingId,accessToken:member.accessToken,fullName:'Alto Member',
    });
    await host.goto(origin+'/meeting/'+m.meetingId,{waitUntil:'domcontentloaded'});
    await guest.goto(origin+'/meeting/'+m.meetingId,{waitUntil:'domcontentloaded'});
    // Await visitor request and approve via the authenticated backend.
    let requests=[];
    for(let i=0;i<20;i++){
      requests=await api('/meetings/'+m.meetingId+'/waiting-room','GET',admin);
      if(requests.some(x=>x.status==='PENDING'))break;
      await new Promise(r=>setTimeout(r,500));
    }
    const waiting=requests.find(x=>x.status==='PENDING');
    assert.ok(waiting,'Guest never entered waiting room');
    await api('/meetings/waiting-room/approve','PATCH',admin,{participantId:waiting.id});
    await host.getByRole('button',{name:'Join the meeting'}).click();
    await host.getByText('Connected to rehearsal room.').waitFor({timeout:15000});
    await guest.getByRole('button',{name:'Join the meeting'}).click({timeout:15000});
    await guest.getByText('Connected to rehearsal room.').waitFor({timeout:15000});
    console.log('Host and guest joined signaling namespace.', {
      hostStatus: await host.locator('.ssm-status').innerText(),
      guestStatus: await guest.locator('.ssm-status').innerText(),
      hostVideos: await host.locator('.ssm-video video').count(),
      guestVideos: await guest.locator('.ssm-video video').count(),
    });
    // Each page must have one local tile plus the other participant's remote tile.
    try {
      await host.waitForFunction(()=>document.querySelectorAll('.ssm-video video').length>=2,null,{timeout:12000});
    } catch (err) {
      console.error('Host room state', {
        hostStatus: await host.locator('.ssm-status').innerText(),
        guestStatus: await guest.locator('.ssm-status').innerText(),
        hostTiles: await host.locator('.ssm-video video').count(),
        guestTiles: await guest.locator('.ssm-video video').count(),
        hostRoster: await host.locator('.ssm-tabs').innerText(),
        guestRoster: await guest.locator('.ssm-tabs').innerText(),
      });
      throw err;
    }
    try {
      await guest.waitForFunction(()=>document.querySelectorAll('.ssm-video video').length>=2,null,{timeout:12000});
    } catch(err) {
      console.error('Guest did not receive host media', {
        hostStatus: await host.locator('.ssm-status').innerText(),
        guestStatus: await guest.locator('.ssm-status').innerText(),
        hostTiles: await host.locator('.ssm-video video').count(),
        guestTiles: await guest.locator('.ssm-video video').count(),
        hostRoster: await host.locator('.ssm-tabs').innerText(),
        guestRoster: await guest.locator('.ssm-tabs').innerText(),
      });
      throw err;
    }
    await host.waitForFunction(()=>{
      const vids=[...document.querySelectorAll('.ssm-video video')];
      return vids.some(v=>!v.muted && v.readyState>=2 && v.videoWidth>0);
    },{timeout:30000});
    await guest.waitForFunction(()=>{
      const vids=[...document.querySelectorAll('.ssm-video video')];
      return vids.some(v=>!v.muted && v.readyState>=2 && v.videoWidth>0);
    },{timeout:30000});
    await guest.locator('.ssm-compose input').fill('Browser test choir message');
    await guest.locator('.ssm-compose button[type=submit]').click();
    await host.getByText('Browser test choir message').waitFor({timeout:10000});
    // Mute-all must propagate and disable member microphone.
    await host.getByRole('button',{name:'Mute all'}).click();
    await guest.getByText('The host muted all microphones.').waitFor({timeout:10000});
    host.once('dialog',dialog=>dialog.accept());
    await host.getByRole('button',{name:'End for all'}).click();
    await guest.waitForURL(url=>url.pathname==='/meeting',{timeout:15000});
    console.log('Browser e2e passed: guest admitted; bidirectional video; chat, mute-all and end-for-all verified.');
  } finally { await browser.close(); }
}
main().catch(error=>{console.error(error);process.exitCode=1;});
