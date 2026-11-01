const $=s=>document.querySelector(s);
let db={areas:[],stops:[],buses:[],routes:[],fares:[],aliases:[],emergency:[],sources:[]};
let lang="bn";
const readJSON=async path=>{try{const r=await fetch(path);if(!r.ok)throw Error(path);return await r.json()}catch(e){return null}};
async function loadData(){
  const names=["areas","stops","buses","routes","fares","aliases","emergency","sources"];
  for(const n of names){db[n]=await readJSON(`data/${n}.json`)||[]}
  populatePlaces();
}
function populatePlaces(){
  const list=$("#placesList");list.innerHTML="";
  const names=new Set();
  [...db.areas,...db.stops].forEach(x=>{if(x.name_bn)names.add(x.name_bn);if(x.name_en)names.add(x.name_en)});
  [...names].forEach(n=>{const o=document.createElement("option");o.value=n;list.append(o)});
}
function norm(s){return s.toLocaleLowerCase("bn").trim().replace(/[।,.-]/g,"").replace(/\s+/g," ")}
function resolvePlace(q){
  const all=[...db.areas,...db.stops];
  const qn=norm(q);
  let exact=all.find(x=>[x.name_bn,x.name_en,...(x.aliases||[])].filter(Boolean).some(n=>norm(n)===qn));
  if(exact)return exact;
  return all.find(x=>[x.name_bn,x.name_en,...(x.aliases||[])].filter(Boolean).some(n=>norm(n).includes(qn)||qn.includes(norm(n))))||null;
}
function findRoutes(from,to){
  const a=resolvePlace(from),b=resolvePlace(to);
  if(!a||!b)return {error:"place"};
  const start=a.stop_ids||[a.id],end=new Set(b.stop_ids||[b.id]);
  const routes=db.routes.filter(r=>r.status==="verified"&&Array.isArray(r.stops));
  const found=[];
  for(const r of routes){
    const ids=r.stops;
    const i=ids.findIndex(x=>start.includes(x));
    if(i<0)continue;
    const j=ids.findIndex((x,k)=>k>i&&end.has(x));
    if(j>i)found.push({route:r,fromStop:ids[i],toStop:ids[j],changes:0});
  }
  return {from:a,to:b,routes:found};
}
function renderSearch(from,to){
  const result=findRoutes(from,to),box=$("#results");
  if(result.error){box.className="results";box.innerHTML=`<h3>জায়গাটি ডেটাবেসে পাওয়া যায়নি</h3><p>নাম বা বানান যাচাই করুন, অথবা ডেটাবেসে জায়গাটি যোগ করুন।</p>`;$("#resultCount").textContent="০টি রুট";return}
  saveRecent(from,to);
  if(!result.routes.length){box.className="results empty";box.innerHTML=`<div class="empty-icon">🔎</div><h3>যাচাইকৃত রুট পাওয়া যায়নি</h3><p>এই যাত্রার জন্য ডেটাবেসে এখনো যাচাইকৃত সরাসরি রুট নেই। এটি বাস নেই—এমন প্রমাণ নয়। যাচাইকৃত সংযোগ যোগ হলে বিকল্প রুটও খোঁজা যাবে।</p>`;$("#resultCount").textContent="০টি যাচাইকৃত রুট";return}
  box.className="results";
  $("#resultCount").textContent=`${result.routes.length}টি যাচাইকৃত রুট`;
  box.innerHTML=result.routes.slice(0,10).map(x=>`<article class="route-card"><strong>${escapeHTML(x.route.route_name_bn||x.route.route_name_en||x.route.route_id)}</strong><p>${escapeHTML(x.fromStop)} → ${escapeHTML(x.toStop)}</p><small>ভাড়া: ${x.route.fare?.amount??"অজানা"} ${x.route.fare?.currency||"BDT"} · ${x.route.fare?.status||"unverified"}</small></article>`).join("");
}
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function saveRecent(from,to){let a=JSON.parse(localStorage.getItem("dbjp_recent")||"[]");a=[{from,to,date:new Date().toISOString()},...a.filter(x=>x.from!==from||x.to!==to)].slice(0,8);localStorage.setItem("dbjp_recent",JSON.stringify(a));renderSideLists()}
function renderSideLists(){
 const recent=JSON.parse(localStorage.getItem("dbjp_recent")||"[]"),fav=JSON.parse(localStorage.getItem("dbjp_fav")||"[]");
 $("#recents").innerHTML=recent.length?recent.map(x=>`<button class="list-button" data-from="${escapeHTML(x.from)}" data-to="${escapeHTML(x.to)}">${escapeHTML(x.from)} → ${escapeHTML(x.to)}</button>`).join(""):"কোনো সাম্প্রতিক সার্চ নেই।";
 $("#favourites").innerHTML=fav.length?fav.map(x=>`<button class="list-button" data-from="${escapeHTML(x.from)}" data-to="${escapeHTML(x.to)}">${escapeHTML(x.from)} → ${escapeHTML(x.to)}</button>`).join(""):"এখনও কিছু সংরক্ষণ করা হয়নি।";
}
$("#searchForm").addEventListener("submit",e=>{e.preventDefault();renderSearch($("#fromInput").value,$("#toInput").value)});
$("#swapBtn").addEventListener("click",()=>{const a=$("#fromInput").value;$("#fromInput").value=$("#toInput").value;$("#toInput").value=a});
document.querySelectorAll(".chip").forEach(b=>b.addEventListener("click",()=>{$("#fromInput").value=b.dataset.from;$("#toInput").value=b.dataset.to;renderSearch(b.dataset.from,b.dataset.to)}));
document.addEventListener("click",e=>{const b=e.target.closest(".list-button");if(b){$("#fromInput").value=b.dataset.from;$("#toInput").value=b.dataset.to;renderSearch(b.dataset.from,b.dataset.to)}});
$("#languageBtn").addEventListener("click",()=>{lang=lang==="bn"?"en":"bn";$("#languageBtn").textContent=lang==="bn"?"English":"বাংলা";document.querySelectorAll("[data-bn][data-en]").forEach(el=>el.textContent=el.dataset[lang])});
$("#reportBtn").addEventListener("click",()=>$("#reportDialog").showModal());
$("#reportForm").addEventListener("submit",e=>{if(e.submitter?.id==="saveReport"){e.preventDefault();let a=JSON.parse(localStorage.getItem("dbjp_reports")||"[]");a.push({text:$("#reportText").value,created_at:new Date().toISOString(),status:"pending"});localStorage.setItem("dbjp_reports",JSON.stringify(a));$("#reportDialog").close();$("#reportText").value="";alert("রিপোর্ট এই ডিভাইসে সংরক্ষিত হয়েছে।")}});
$("#exportBtn").addEventListener("click",()=>{const payload={...db,exported_at:new Date().toISOString()};download("dhaka-bus-data-export.json",JSON.stringify(payload,null,2))});
$("#importInput").addEventListener("change",async e=>{const f=e.target.files[0];if(!f)return;try{const data=JSON.parse(await f.text());const allowed=["areas","stops","buses","routes","fares","aliases","emergency","sources"];if(!allowed.every(k=>Array.isArray(data[k])))throw Error("প্রয়োজনীয় JSON তালিকা অনুপস্থিত");localStorage.setItem("dbjp_imported_data",JSON.stringify(data));alert("JSON ফাইল যাচাই হয়েছে এবং এই ডিভাইসে সংরক্ষিত হয়েছে। ডেভেলপার ডেটা ফোল্ডারে মার্জ করে প্রকাশ করবেন।")}catch(err){alert("JSON ফাইলটি সঠিক নয়: "+err.message)}e.target.value=""});
function download(name,content){const a=document.createElement("a"),url=URL.createObjectURL(new Blob([content],{type:"application/json"}));a.href=url;a.download=name;a.click();URL.revokeObjectURL(url)}
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./service-worker.js").then(()=>$("#offlineStatus").textContent="PWA প্রস্তুত").catch(()=>$("#offlineStatus").textContent="PWA চালু হয়নি"));
loadData().then(renderSideLists);
