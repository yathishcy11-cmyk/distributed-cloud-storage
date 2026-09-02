const state={
  section:"overview",
  nodes:[
    {id:"node-a",name:"Storage Node A",host:"10.0.0.11",status:"healthy",used:41,latency:12,chunks:128},
    {id:"node-b",name:"Storage Node B",host:"10.0.0.12",status:"healthy",used:57,latency:15,chunks:121},
    {id:"node-c",name:"Storage Node C",host:"10.0.0.13",status:"healthy",used:33,latency:11,chunks:119}
  ],
  files:[
    {id:"obj-001",name:"architecture-diagram.pdf",size:1840000,chunks:1,replicas:2,version:3,status:"STORED"},
    {id:"obj-002",name:"portfolio-demo.mp4",size:48600000,chunks:10,replicas:2,version:2,status:"STORED"},
    {id:"obj-003",name:"system-design-notes.pdf",size:12600000,chunks:3,replicas:2,version:5,status:"STORED"}
  ],
  events:[
    {type:"ok",msg:"Metadata cache warmed for recent objects.",detail:"Redis metadata lookup completed.",time:new Date()},
    {type:"ok",msg:"Storage cluster health check passed.",detail:"3/3 storage nodes responding.",time:new Date(Date.now()-34000)},
    {type:"ok",msg:"Replica consistency verified.",detail:"All active objects have replication factor 2.",time:new Date(Date.now()-76000)}
  ]
};

const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const fmtBytes=n=>{if(n<1024)return n+" B";const u=["KB","MB","GB"];let i=-1;do{n/=1024;i++}while(n>=1024&&i<u.length-1);return n.toFixed(n<10?1:0)+" "+u[i]};
const nowTime=()=>new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit",second:"2-digit"});
function toast(title,msg){const el=document.createElement("div");el.className="toast";el.innerHTML=`<b>${esc(title)}</b><span>${esc(msg)}</span>`;$("#toasts").appendChild(el);setTimeout(()=>el.remove(),3200)}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function addEvent(type,msg,detail){state.events.unshift({type,msg,detail,time:new Date()});renderEvents()}
function setSection(id){
  state.section=id; $$(".page-section").forEach(x=>x.classList.toggle("active-section",x.id===id));
  $$(".nav-item").forEach(x=>x.classList.toggle("active",x.dataset.section===id));
  if(window.innerWidth<700)$("#sidebar").classList.remove("open");
  window.scrollTo({top:0,behavior:"smooth"});
  if(id==="files")renderFiles(); if(id==="nodes")renderNodes(); if(id==="events")renderEvents();
}
$$(".nav-item").forEach(b=>b.addEventListener("click",()=>setSection(b.dataset.section)));
$$("[data-jump]").forEach(b=>b.addEventListener("click",()=>setSection(b.dataset.jump)));
$("#mobileMenu").addEventListener("click",()=>$("#sidebar").classList.toggle("open"));
$("#themeBtn").addEventListener("click",()=>document.body.classList.toggle("light"));

function renderOverviewNodes(){
  $("#overviewNodes").innerHTML=state.nodes.map(n=>`
    <div class="node-row">
      <div class="node-symbol">${n.name.slice(-1)}</div>
      <div><b>${n.name}</b><small>${n.host} · ${n.chunks} chunks</small></div>
      <span class="node-status">${n.status==="healthy"?"● HEALTHY":"● OFFLINE"}</span>
    </div>`).join("");
  $("#nodeCount").textContent=state.nodes.filter(n=>n.status==="healthy").length;
}
function renderSpark(){
  const vals=Array.from({length:30},()=>Math.floor(25+Math.random()*75));
  $("#sparkline").innerHTML=vals.map(v=>`<i style="height:${v}%"></i>`).join("");
  $("#reqRate").textContent=Math.floor(160+Math.random()*80);
}
function renderFiles(){
  const q=$("#fileSearch").value.toLowerCase();
  const files=state.files.filter(f=>f.name.toLowerCase().includes(q));
  $("#fileCount").textContent=`${files.length} object${files.length===1?"":"s"}`;
  $("#fileRows").innerHTML=files.length?files.map(f=>`
    <div class="file-row">
      <div class="file-name"><b>${esc(f.name)}</b><small>${f.id}</small></div>
      <div><small>${fmtBytes(f.size)}</small></div>
      <div><small>${f.chunks} chunks</small></div>
      <div><small>${f.replicas}×</small></div>
      <div class="status-text">● ${f.status}</div>
      <button class="row-menu" data-file="${f.id}">⋯</button>
    </div>`).join(""):`<div style="padding:30px;color:var(--muted);text-align:center">No objects match your search.</div>`;
  $$("[data-file]").forEach(b=>b.addEventListener("click",()=>showFile(b.dataset.file)));
}
function showFile(id){
  const f=state.files.find(x=>x.id===id); if(!f)return;
  $("#modalTitle").textContent=f.name;
  $("#modalBody").innerHTML=`<div class="detail-grid">
    <div class="detail"><span>Object ID</span><b>${f.id}</b></div>
    <div class="detail"><span>Size</span><b>${fmtBytes(f.size)}</b></div>
    <div class="detail"><span>Chunks</span><b>${f.chunks}</b></div>
    <div class="detail"><span>Replication</span><b>${f.replicas}×</b></div>
    <div class="detail"><span>Version</span><b>v${f.version}</b></div>
    <div class="detail"><span>Integrity</span><b>SHA-256 verified</b></div>
  </div>`;
  $("#fileModal").classList.remove("hidden");
}
$("#modalClose").addEventListener("click",()=>$("#fileModal").classList.add("hidden"));
$("#fileModal").addEventListener("click",e=>{if(e.target.id==="fileModal")e.currentTarget.classList.add("hidden")});
$("#fileSearch").addEventListener("input",renderFiles);

function renderNodes(){
  $("#nodeCards").innerHTML=state.nodes.map(n=>`
    <article class="node-card ${n.status==="offline"?"offline":""}">
      <div class="node-card-top"><div class="big-node">${n.name.slice(-1)}</div><span class="pill ${n.status==="healthy"?"green":""}" style="${n.status==="offline"?'color:#ff9a9c;background:#30181a;border:1px solid #5b292c':''}">${n.status.toUpperCase()}</span></div>
      <h3>${n.name}</h3><p>${n.host} · ${n.status==="healthy"?"accepting replicas":"not accepting writes"}</p>
      <div class="node-meter"><div class="meter-line"><span>Storage utilization</span><b>${n.used}%</b></div><div class="meter"><i style="width:${n.used}%"></i></div></div>
      <div class="node-meter"><div class="meter-line"><span>Chunks</span><b>${n.chunks}</b></div><div class="meter"><i style="width:${Math.min(100,n.chunks/1.6)}%"></i></div></div>
      <small style="color:var(--muted)">Median latency: ${n.latency} ms</small>
    </article>`).join("");
}
$$("[data-fail]").forEach(b=>b.addEventListener("click",()=>{
  const n=state.nodes.find(x=>x.id===b.dataset.fail); if(!n)return;
  n.status="offline"; addEvent("error",`${n.name} marked offline.`,`${n.host} stopped responding to health checks.`);
  toast("Node failure simulated",`${n.name} is now offline.`);
  renderNodes();renderOverviewNodes();
}));
$("#recoverAll").addEventListener("click",()=>{
  const offline=state.nodes.filter(n=>n.status==="offline");
  if(!offline.length){toast("Cluster healthy","No recovery was required.");return}
  offline.forEach(n=>{n.status="healthy";n.chunks+=3;n.used=Math.min(90,n.used+2)});
  addEvent("ok","Replica recovery completed.","Missing replicas were redistributed across healthy nodes.");
  toast("Recovery completed","Replica sets are healthy again.");renderNodes();renderOverviewNodes();
});

function renderEvents(){
  $("#eventsList").innerHTML=state.events.slice(0,40).map(e=>`
    <div class="event ${e.type==="error"?"error":e.type==="warn"?"warn":""}">
      <time>${e.time.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit",second:"2-digit"})}</time>
      <i class="event-dot"></i><div><b>${esc(e.msg)}</b><p>${esc(e.detail)}</p></div>
    </div>`).join("");
}
$("#clearEvents").addEventListener("click",()=>{state.events=[];renderEvents();toast("Events cleared","The demo event stream is empty.");});

const drop=$("#dropzone"), input=$("#fileInput");
$("#chooseBtn").addEventListener("click",()=>input.click());
$("#uploadBtn").addEventListener("click",()=>input.click());
drop.addEventListener("click",e=>{if(!e.target.closest("button"))input.click()});
["dragenter","dragover"].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.style.borderColor="var(--accent)"}));
["dragleave","drop"].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.style.borderColor="";if(ev==="drop"&&e.dataTransfer.files[0])simulateUpload(e.dataTransfer.files[0])}));
input.addEventListener("change",()=>input.files[0]&&simulateUpload(input.files[0]));

function simulateUpload(file){
  const size=file.size, chunks=Math.max(1,Math.ceil(size/(5*1024*1024)));
  if(size>500*1024*1024){toast("File too large","The frontend demo accepts files up to 500 MB.");return}
  $("#uploadProgress").classList.remove("hidden");$("#uploadName").textContent=file.name;$("#uploadPercent").textContent="0%";$("#progressBar").style.width="0%";
  let done=0;
  addEvent("ok","Upload session created.",`${file.name} will be split into ${chunks} chunk${chunks>1?"s":""}.`);
  const tick=setInterval(()=>{
    done++; const pct=Math.min(100,Math.round(done/chunks*100));
    $("#uploadPercent").textContent=pct+"%";$("#progressBar").style.width=pct+"%";
    $("#uploadStatus").textContent=done<chunks?`Uploaded chunk ${done}/${chunks} · replicated to 2 nodes`:"Finalizing metadata and verifying SHA-256…";
    if(done>=chunks){
      clearInterval(tick);
      setTimeout(()=>{
        const f={id:"obj-"+String(Date.now()).slice(-6),name:file.name,size,chunks,replicas:2,version:1,status:"STORED"};
        state.files.unshift(f);addEvent("ok","Object committed successfully.",`${file.name} stored with ${chunks} chunks and replication factor 2.`);
        $("#uploadStatus").textContent="Upload complete · SHA-256 verified · 2 replicas";
        toast("Upload complete",`${file.name} is now distributed across the cluster.`);
        renderFiles();
      },450);
    }
  },Math.max(100,700/chunks));
}

function boot(){
  renderOverviewNodes();renderSpark();renderFiles();renderNodes();renderEvents();
  $("#clock").textContent=nowTime();
  setInterval(()=>{$("#clock").textContent=nowTime();renderSpark()},5000);
  setInterval(()=>{if(Math.random()<.22){state.nodes.forEach(n=>{if(n.status==="healthy")n.latency=Math.max(8,Math.round(9+Math.random()*10))})}},4000);
}
boot();
