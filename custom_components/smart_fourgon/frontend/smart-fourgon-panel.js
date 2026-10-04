const SF_T={
fr:{overview:"Vue générale",settings:"Réglages",daily:"Compteurs journaliers",quick:"État rapide",solar:"Solaire",vanConsumption:"Conso fourgon",battery:"Batterie",water:"Eau propre",heating:"Chauffage",waterHeater:"Chauffe-eau",inverter:"Convertisseur 12 / 230 V",ventilation:"Clim / Ventilation",power:"Puissance",voltage:"Tension",current:"Courant",frequency:"Fréquence",soc:"SOC",liters:"Litres restants",target:"Consigne",temperature:"Température",currentTemp:"Température actuelle",speed:"Vitesse",today:"Aujourd’hui",month:"Ce mois",year:"Cette année",general:"Général",base:"Sections de base",tabs:"Onglets personnalisés",language:"Langue",theme:"Mode jour / nuit",auto:"Automatique",day:"Jour",night:"Nuit",title:"Titre du dashboard",dayImage:"Image de jour",nightImage:"Image de nuit",save:"Enregistrer",addTab:"Ajouter un onglet",tabName:"Nom de l’onglet",icon:"Icône",image:"Image",entity:"Entité",statusEntity:"Entité d’état",type:"Type",label:"Nom",addEntity:"Ajouter une entité",del:"Supprimer",history:"Historique",min:"Min",max:"Max",now:"Actuel",loading:"Chargement…",noData:"Pas de données",noConfig:"Aucune entité configurée",hint:"Les sections et valeurs ne s’affichent que lorsqu’une entité Home Assistant est renseignée.",saved:"Configuration enregistrée",reset:"Réinitialiser",section:"Section active",activeColor:"Couleur actif",inactiveColor:"Couleur inactif",unit:"Unité forcée",read:"Lecture seule",sensor:"Capteur",binary:"Binaire",switch:"Switch",number:"Nombre",select:"Liste",button:"Bouton",climate:"Thermostat",light:"Lumière",state:"État"},
en:{overview:"Overview",settings:"Settings",daily:"Daily counters",quick:"Quick status",solar:"Solar",vanConsumption:"Van consumption",battery:"Battery",water:"Fresh water",heating:"Heating",waterHeater:"Water heater",inverter:"12 / 230 V inverter",ventilation:"A/C / Ventilation",power:"Power",voltage:"Voltage",current:"Current",frequency:"Frequency",soc:"SOC",liters:"Liters remaining",target:"Target",temperature:"Temperature",currentTemp:"Current temperature",speed:"Speed",today:"Today",month:"This month",year:"This year",general:"General",base:"Base sections",tabs:"Custom tabs",language:"Language",theme:"Day / night mode",auto:"Automatic",day:"Day",night:"Night",title:"Dashboard title",dayImage:"Day image",nightImage:"Night image",save:"Save",addTab:"Add tab",tabName:"Tab name",icon:"Icon",image:"Image",entity:"Entity",statusEntity:"Status entity",type:"Type",label:"Label",addEntity:"Add entity",del:"Delete",history:"History",min:"Min",max:"Max",now:"Current",loading:"Loading…",noData:"No data",noConfig:"No entity configured",hint:"Sections and values are shown only when a Home Assistant entity is configured.",saved:"Configuration saved",reset:"Reset",section:"Section enabled",activeColor:"Active color",inactiveColor:"Inactive color",unit:"Unit override",read:"Read only",sensor:"Sensor",binary:"Binary",switch:"Switch",number:"Number",select:"Select",button:"Button",climate:"Climate",light:"Light",state:"State"}
};
const SF_TYPES=["auto","read","sensor","binary_sensor","switch","number","select","button","climate","light","fan","visual"];
const SF_ICONS=[
["mdi:folder-outline","📁 Dossier"],["mdi:home","🏠 Maison"],["mdi:lightning-bolt","⚡ Énergie"],
["mdi:solar-panel-large","☀️ Panneaux solaires"],["mdi:battery-charging","⚡ MPPT"],["mdi:battery-high","🔋 Batterie"],
["mdi:power-plug","🔌 Convertisseur / prise"],["mdi:water","💧 Eau"],["mdi:water-boiler","🚿 Chauffe-eau"],
["mdi:radiator","♨️ Chauffage"],["mdi:fire","🔥 Chaleur"],["mdi:fan","🌀 Ventilation"],["mdi:air-conditioner","❄️ Climatisation"],
["mdi:thermometer","🌡️ Température"],["mdi:water-percent","💧 Humidité"],["mdi:pump","⚙️ Pompe"],
["mdi:engine","🚐 Alternateur / moteur"],["mdi:fridge-outline","🧊 Réfrigérateur"],["mdi:lightbulb","💡 Éclairage"],
["mdi:usb-port","🔌 USB"],["mdi:television","📺 Télévision"],["mdi:cctv","📷 Caméra"],["mdi:door","🚪 Porte"],
["mdi:gas-cylinder","🧯 Gaz"],["mdi:shower","🚿 Douche"],["mdi:faucet","🚰 Robinet"],["mdi:gauge","📟 Jauge"],
["mdi:chart-line","📈 Statistiques"],["mdi:counter","🔢 Compteur"],["mdi:cog","⚙️ Réglages"],["mdi:car-electric","🚗 Véhicule"],
["mdi:weather-sunny","☀️ Soleil"],["mdi:weather-night","🌙 Nuit"],["mdi:snowflake","❄️ Froid"],["mdi:alert","⚠️ Alerte"],
["mdi:shield-check","🛡️ Sécurité"],["mdi:information-outline","ℹ️ Information"],["mdi:toggle-switch","🔘 Commande"]
];
const ACTIVE=new Set(["on","open","opening","active","heat","heating","cool","cooling","fan_only","dry","true","home"]);

class SmartFourgonPanel extends HTMLElement{
constructor(){super();this.attachShadow({mode:"open"});this._hass=null;this._config=null;this._page="overview";this._category="energy";this._loaded=false;this._editing=false;this._hist=null;this._hours=24;this._heroDay="";this._heroNight="";this._renderQueued=false;}
set hass(v){this._hass=v;if(!this._loaded)this._load();else if(!this._editing)this._refreshLive();}
get hass(){return this._hass}
set panel(v){this._panel=v}
set narrow(v){this._narrow=!!v}
connectedCallback(){
if(this._hass&&!this._loaded)this._load();
if(!this._clockTimer)this._clockTimer=setInterval(()=>this._refreshClock(),30000)
}
disconnectedCallback(){if(this._clockTimer){clearInterval(this._clockTimer);this._clockTimer=null}}
_t(k){const l=this._config&&this._config.general&&this._config.general.language==="en"?"en":"fr";return SF_T[l][k]||k}
_state(e){return e&&this._hass&&this._hass.states?this._hass.states[e]||null:null}
_attr(e,k){const s=this._state(e);return s&&s.attributes?s.attributes[k]:undefined}
_num(e){const s=this._state(e);if(!s)return null;const n=Number(String(s.state).replace(",","."));return Number.isFinite(n)?n:null}
_fmt(e,u){const s=this._state(e);if(!s)return "—";const n=this._num(e);const unit=u||this._attr(e,"unit_of_measurement")||"";if(n!==null){const d=Math.abs(n)>=100?0:Math.abs(n)>=10?1:2;return n.toLocaleString(this._lang(),{maximumFractionDigits:d})+(unit?" "+unit:"")}return String(s.state)}
_lang(){return this._config&&this._config.general&&this._config.general.language==="en"?"en-US":"fr-FR"}
_active(e){const s=this._state(e);if(!s)return false;const a=String((s.attributes||{}).hvac_action||"").toLowerCase();return ["heating","cooling","drying","fan"].includes(a)||ACTIVE.has(String(s.state||"").toLowerCase())}
_has(){return Array.from(arguments).some(Boolean)}
_icon(i,img){if(img)return '<img src="'+this._ea(img)+'" style="width:28px;height:28px;object-fit:contain;border-radius:5px">';return '<ha-icon icon="'+this._ea(i||"mdi:circle")+'"></ha-icon>'}
_e(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
_ea(v){return this._e(v).replace(/\n/g," ")}
_uid(){return Math.random().toString(36).slice(2,10)}
async _ws(m){if(this._hass.callWS)return this._hass.callWS(m);const r=await this._hass.connection.sendMessagePromise(m);return r&&r.result!==undefined?r.result:r}
async _load(){try{this._config=await this._ws({type:"smart_fourgon/config/get"});await this._loadHeroAssets();this._loaded=true;this._render()}catch(e){this.shadowRoot.innerHTML='<div style="padding:30px;background:#30151a;color:#fff">Smart Fourgon: '+this._e(e.message||e)+'</div>'}}
async _loadHeroAssets(){
const load=async(path)=>{
  try{
    const r=await fetch(path+"?v=0.6.1",{cache:"no-store"});
    if(!r.ok)return "";
    const b64=(await r.text()).replace(/\s+/g,"");
    return b64?"data:image/webp;base64,"+b64:"";
  }catch(e){return ""}
};
[this._heroDay,this._heroNight]=await Promise.all([
  load("/smart_fourgon/assets/hero-day.b64"),
  load("/smart_fourgon/assets/hero-night.b64")
]);
}
_night(){const m=(this._config.general||{}).theme_mode||"auto";if(m==="night")return true;if(m==="day")return false;return (this._state("sun.sun")||{}).state==="below_horizon"}
_pageTitle(){if(this._page==="overview")return this._t("overview");if(this._page==="settings")return this._t("settings");const id=this._page.replace("tab:","");const t=(this._config.tabs||[]).find(x=>x.id===id);return t?t.name:""}
_refreshClock(){
const now=new Date();
const cb=this.shadowRoot.querySelector(".clock b");
if(cb)cb.textContent=now.toLocaleTimeString(this._lang(),{hour:"2-digit",minute:"2-digit"});
const db=this.shadowRoot.querySelector(".date-box span");
if(db)db.textContent=now.toLocaleDateString(this._lang(),{weekday:"short",day:"2-digit",month:"long",year:"numeric"})
}
_refreshLive(){
if(!this._loaded||this._editing)return;
this.shadowRoot.querySelectorAll("[data-live]").forEach(el=>{
  const ent=el.dataset.live;
  if(ent)el.textContent=this._fmt(ent,el.dataset.unit||"")
});
this.shadowRoot.querySelectorAll("[data-live-active]").forEach(el=>{
  const ent=el.dataset.liveActive;
  el.classList.toggle("on",!!ent&&this._active(ent))
});
this.shadowRoot.querySelectorAll("[data-live-toggle]").forEach(el=>{
  const ent=el.dataset.liveToggle,active=!!ent&&this._active(ent);
  el.textContent=active?"ON":"OFF";
  el.classList.toggle("on",active)
});
this.shadowRoot.querySelectorAll("[data-status-dot]").forEach(el=>{
  const ent=el.dataset.statusDot;
  el.classList.toggle("off",!this._state(ent))
});
this._refreshClock()
}
_scheduleRender(){
if(this._renderQueued)return;
this._renderQueued=true;
requestAnimationFrame(()=>{
  this._renderQueued=false;
  this._render(true)
})
}
_render(preserveScroll=false){
if(!this._loaded)return;
const oldPage=this.shadowRoot.querySelector(".page");
const oldTop=preserveScroll&&oldPage?oldPage.scrollTop:0;
const oldLeft=preserveScroll&&oldPage?oldPage.scrollLeft:0;
const night=this._night(),g=this._config.general||{},title=this._e(g.title||"SMART FOURGON");
const customTabs=this._customSidebar();
let body=this._page==="settings"?this._settings():this._page.indexOf("tab:")===0?this._tab(this._page.slice(4)):this._overview(night);
const themeIcon=night?"mdi:weather-night":"mdi:white-balance-sunny";
this.shadowRoot.innerHTML='<link rel="stylesheet" href="/smart_fourgon/styles.css?v=0.6.1">'
+'<div class="app">'
+'<aside class="sidebar">'
+'<div class="brand-mark"><div class="brand-logo">'+this._icon("mdi:van-utility")+'</div><div><b>SMART FOURGON</b><small>TABLEAU DE BORD<br>HOME ASSISTANT</small></div></div>'
+'<nav class="nav">'
+'<button data-page="overview" class="nav-main '+(this._page==="overview"?"active":"")+'">'+this._icon("mdi:home")+'<span>'+this._t("overview")+'</span></button>'
+customTabs
+'<div class="spacer"></div>'
+'<button data-page="settings" class="nav-main '+(this._page==="settings"?"active":"")+'">'+this._icon("mdi:cog")+'<span>'+this._t("settings")+'</span></button>'
+'</nav></aside>'
+'<main class="main">'
+'<header class="topbar">'
+'<div class="top-left">'
+'<div class="weather-box">'+this._icon(night?"mdi:weather-night":"mdi:weather-partly-cloudy")+'<div><b>'+this._e(night?this._t("night"):this._t("day"))+'</b><small>'+this._e(this._pageTitle())+'</small></div></div>'
+'<div class="location-box">'+this._icon("mdi:map-marker")+'<span>'+title+'</span></div>'
+'</div>'
+'<div class="top-actions">'
+'<button class="square-chip" data-page="overview" title="'+this._t("overview")+'">'+this._icon("mdi:home")+'</button>'
+'<button class="square-chip" id="theme-cycle">'+this._icon(themeIcon)+'</button>'
+'<div class="date-box">'+this._icon("mdi:calendar-month")+'<span>'+new Date().toLocaleDateString(this._lang(),{weekday:"short",day:"2-digit",month:"long",year:"numeric"})+'</span></div>'
+'<div class="clock"><b>'+new Date().toLocaleTimeString(this._lang(),{hour:"2-digit",minute:"2-digit"})+'</b></div>'
+'</div></header>'
+'<section class="page">'+body+'</section>'
+'</main>'+this._historyModal()+'<div id="toast" class="toast"></div></div>';
this._bind();
if(preserveScroll){
  requestAnimationFrame(()=>{
    const p=this.shadowRoot.querySelector(".page");
    if(p){p.scrollTop=oldTop;p.scrollLeft=oldLeft}
  })
}
}
_customSidebar(){
return (this._config.tabs||[]).filter(t=>t.enabled!==false).map(t=>{
  const items=(t.items||[]).filter(i=>i.enabled!==false&&i.entity);
  return '<section class="nav-group custom-nav-group">'
    +'<button data-page="tab:'+this._ea(t.id)+'" class="nav-main custom-parent '+(this._page==="tab:"+t.id?"active":"")+'">'
      +this._icon(t.icon||"mdi:folder-outline",t.image||"")
      +'<span>'+this._e(t.name)+'</span><ha-icon icon="mdi:chevron-down"></ha-icon>'
    +'</button>'
    +items.map(i=>'<button class="nav-sub" data-history="'+this._ea(i.entity)+'">'
      +this._icon(i.icon||this._attr(i.entity,"icon")||"mdi:circle-small",i.image||"")
      +'<span>'+this._e(i.label||this._attr(i.entity,"friendly_name")||i.entity)+'</span>'
      +'<i class="status-dot '+(this._state(i.entity)?"":"off")+'" data-status-dot="'+this._ea(i.entity)+'"></i>'
    +'</button>').join("")
  +'</section>'
}).join("")
}
_overview(night){
const o=this._config.overview||{},g=this._config.general||{};
const customImg=(night?g.night_image:g.day_image)||"";
const img=customImg||(night?this._heroNight:this._heroDay)||"/smart_fourgon/assets/default-van.svg";
const s=o.solar||{},b=o.battery||{},i=o.inverter||{},cn=o.consumption||{};
const callouts=[
  s.enabled!==false?this._callout("solar",this._t("solar"),s.icon,s.power,[],"solar"):"",
  cn.enabled!==false?this._callout("consumption",this._t("vanConsumption"),cn.icon,cn.power,[],"consumption"):"",
  i.enabled!==false?this._callout("inverter",this._t("inverter"),i.icon,i.power||i.status,[
    [this._t("voltage"),i.voltage],
    [this._t("frequency"),i.frequency]
  ],"inverter"):"",
  b.enabled!==false?this._callout("battery",this._t("battery"),b.icon,b.soc,[
    [this._t("voltage"),b.voltage],
    [this._t("power"),b.power]
  ],"battery"):""
].filter(Boolean);
const counters=this._resolvedDailyCounters(o);
const rightContent=this._dailyCounters(counters);
const bottom=this._bottomPanels(o);
return '<div class="dash-layout '+(rightContent?"":"no-right")+'">'
  +'<div class="dash-center">'
    +'<section class="hero-photo '+(night?"night-scene":"day-scene")+'" style="background-image:url(&quot;'+this._ea(img)+'&quot;)">'
      +(callouts.length?'<div class="callout-layer">'+callouts.join("")+'</div>':'')
    +'</section>'
    +(callouts.length?'<div class="mobile-callouts">'+callouts.join("")+'</div>':'')
    +bottom
  +'</div>'
  +(rightContent?'<aside class="dash-right">'+rightContent+'</aside>':'')
+'</div>'
}
_callout(cls,title,icon,primary,rows,key){
if(!primary&&!rows.some(x=>x[1]))return "";
const p=primary
  ?'<button class="call-primary" data-history="'+this._ea(primary)+'" data-live="'+this._ea(primary)+'">'+this._e(this._fmt(primary))+'</button>'
  :"";
const r=rows.filter(x=>x[1]).map(x=>
  '<button class="call-row" data-history="'+this._ea(x[1])+'"><span>'+this._e(x[0])+'</span><b data-live="'+this._ea(x[1])+'">'+this._e(this._fmt(x[1]))+'</b></button>'
).join("");
const cfgKey=key==="waterheater"?"water_heater":key;
const active=(key==="heating"||key==="waterheater"||key==="vent")
  ?this._active((this._config.overview[cfgKey]||{}).status)
  :false;
const activeEnt=(key==="heating"||key==="waterheater"||key==="vent")?((this._config.overview[cfgKey]||{}).status||""):"";
return '<article class="callout '+cls+' '+(active?"on":"")+'" '+(activeEnt?'data-live-active="'+this._ea(activeEnt)+'"':"")+'>'
  +'<div class="call-head">'+this._icon(icon||"mdi:circle")+'<span>'+this._e(title)+'</span><i></i></div>'
  +p+r
+'</article>'
}
_resolvedDailyCounters(o){
const list=(this._config.daily_counters||[]).map(x=>Object.assign({},x));
const fallback={
  solar_day:o.solar&&o.solar.energy_today,
  consumption_day:o.consumption&&o.consumption.energy_today,
  battery_charge_day:o.battery&&o.battery.charge_today,
  battery_discharge_day:o.battery&&o.battery.discharge_today,
  water_day:o.water&&o.water.consumed_today,
  alternator_day:o.alternator&&o.alternator.energy_today
};
for(const x of list){
  if(!x.entity&&fallback[x.id])x.entity=fallback[x.id]
}
return list.filter(x=>x.enabled!==false&&x.entity)
}
_dailyCounters(counters){
if(!counters.length)return "";
return '<section class="side-card counters-card daily-only"><h3>'+this._icon("mdi:counter")+'<span>'+this._t("daily")+'</span></h3>'
  +'<div class="counter-grid">'
  +counters.map(x=>'<button class="counter" data-history="'+this._ea(x.entity)+'">'
    +this._icon(x.icon||"mdi:counter")
    +'<span>'+this._e(this._config.general.language==="en"?(x.label_en||x.label_fr):(x.label_fr||x.label_en))+'</span>'
    +'<b data-live="'+this._ea(x.entity)+'">'+this._e(this._fmt(x.entity))+'</b>'
  +'</button>').join("")
  +'</div></section>'
}
_bottomPanels(o){
const items=[];
const push=(cfg,title,icon,vals,active=false)=>{
  if(!cfg||cfg.enabled===false)return;
  const rows=vals.filter(x=>x[1]);
  if(!rows.length)return;
  items.push('<section class="bottom-card '+(active?"active":"")+'"><h3>'+this._icon(icon||"mdi:circle")+'<span>'+this._e(title)+'</span></h3><div class="bottom-values">'
    +rows.map(x=>'<button data-history="'+this._ea(x[1])+'"><span>'+this._e(x[0])+'</span><b data-live="'+this._ea(x[1])+'">'+this._e(this._fmt(x[1]))+'</b></button>').join("")
    +'</div></section>');
};
const s=o.solar||{},m=Object.assign({},o.mppt||{}),w=o.water||{},h=o.heating||{},wh=o.water_heater||{},v=o.ventilation||{};
const t=Object.assign({},o.temperature||{});
if(!m.power)m.power=s.power||"";
if(!m.voltage)m.voltage=s.voltage||"";
if(!m.current)m.current=s.current||"";
if(!t.current_temp)t.current_temp=h.current_temp||"";
if(!t.target_temp)t.target_temp=h.target_temp||"";
push(m,"MPPT",m.icon||"mdi:battery-charging",[
  [this._t("power"),m.power],[this._t("voltage"),m.voltage],[this._t("current"),m.current]
]);
push(h,this._t("heating"),h.icon||"mdi:radiator",[
  [this._t("state"),h.status],[this._t("currentTemp"),h.current_temp],[this._t("target"),h.target_temp]
],this._active(h.status));
push(wh,this._t("waterHeater"),wh.icon||"mdi:water-boiler",[
  [this._t("state"),wh.status],[this._t("temperature"),wh.temperature]
],this._active(wh.status));
push(w,this._t("water"),w.icon||"mdi:water",[
  [this._t("liters"),w.liters],["%",w.percent]
]);
push(t,this._t("currentTemp"),t.icon||"mdi:thermometer",[
  [this._t("currentTemp"),t.current_temp],[this._t("target"),t.target_temp]
]);
push(v,this._t("ventilation"),v.icon||"mdi:fan",[
  [this._t("state"),v.status],[this._t("currentTemp"),v.current_temp],[this._t("target"),v.target_temp],[this._t("speed"),v.speed],[this._t("power"),v.power]
],this._active(v.status)||(this._num(v.speed)||0)>0||(this._num(v.power)||0)>0);
return items.length?'<div class="bottom-strip secondary-strip">'+items.join("")+'</div>':""
}
_mod(title,icon,active,primary,rows){const r=rows.filter(x=>x[1]).map(x=>'<button class="metric" data-history="'+this._ea(x[1])+'"><span>'+this._e(x[0])+'</span><b>'+this._e(this._fmt(x[1]))+'</b></button>').join("");return '<article class="module '+(active?"active":"")+'"><div class="module-head">'+this._icon(icon)+'<span>'+this._e(title)+'</span></div><div class="primary">'+(primary?this._e(this._fmt(primary)):"—")+'</div>'+r+'</article>'}
_solar(c={}){if(c.enabled===false||!this._has(c.power,c.voltage,c.current))return "";return this._mod(this._t("solar"),c.icon,false,c.power,[[this._t("power"),c.power],[this._t("voltage"),c.voltage],[this._t("current"),c.current]])}
_battery(c={}){if(c.enabled===false||!this._has(c.soc,c.power,c.voltage,c.current))return "";return this._mod(this._t("battery"),c.icon,false,c.soc||c.voltage,[[this._t("soc"),c.soc],[this._t("power"),c.power],[this._t("voltage"),c.voltage],[this._t("current"),c.current]])}
_water(c={}){if(c.enabled===false||!this._has(c.percent,c.liters))return "";return this._mod(this._t("water"),c.icon,false,c.percent||c.liters,[["%",c.percent],[this._t("liters"),c.liters]])}
_heating(c={}){if(c.enabled===false||!this._has(c.status,c.target_temp,c.current_temp))return "";return this._mod(this._t("heating"),c.icon,this._active(c.status),c.current_temp||c.target_temp,[[this._t("state"),c.status],[this._t("target"),c.target_temp],[this._t("currentTemp"),c.current_temp]])}
_heater(c={}){if(c.enabled===false||!this._has(c.status,c.temperature))return "";return this._mod(this._t("waterHeater"),c.icon,this._active(c.status),c.temperature||c.status,[[this._t("state"),c.status],[this._t("temperature"),c.temperature]])}
_inverter(c={}){if(c.enabled===false||!this._has(c.status,c.power,c.voltage,c.frequency,c.current))return "";const a=c.status?this._active(c.status):(this._num(c.power)||0)>1;return this._mod(this._t("inverter"),c.icon,a,c.power||c.voltage,[[this._t("state"),c.status],[this._t("power"),c.power],[this._t("voltage"),c.voltage],[this._t("frequency"),c.frequency],[this._t("current"),c.current]])}
_vent(c={}){if(c.enabled===false||!this._has(c.status,c.current_temp,c.target_temp,c.power,c.speed))return "";const a=this._active(c.status)||(this._num(c.power)||0)>1||(this._num(c.speed)||0)>0;return this._mod(this._t("ventilation"),c.icon,a,c.current_temp||c.speed||c.power,[[this._t("state"),c.status],[this._t("currentTemp"),c.current_temp],[this._t("target"),c.target_temp],[this._t("power"),c.power],[this._t("speed"),c.speed]])}
_kv(l,e){return e?'<button class="metric" data-history="'+this._ea(e)+'"><span>'+this._e(l)+'</span><b>'+this._e(this._fmt(e))+'</b></button>':""}
_quick(o){const a=[];const p=(l,i,e,ac)=>{if(e)a.push('<button data-history="'+this._ea(e)+'">'+this._icon(i)+'<span>'+this._e(l)+'</span><b>'+this._e(this._fmt(e))+'</b></button>')};p(this._t("battery"),o.battery&&o.battery.icon,o.battery&&(o.battery.soc||o.battery.voltage));p(this._t("solar"),o.solar&&o.solar.icon,o.solar&&o.solar.power);p(this._t("water"),o.water&&o.water.icon,o.water&&(o.water.percent||o.water.liters));p(this._t("heating"),o.heating&&o.heating.icon,o.heating&&(o.heating.current_temp||o.heating.target_temp));p(this._t("waterHeater"),o.water_heater&&o.water_heater.icon,o.water_heater&&o.water_heater.temperature);return a.length?'<section class="card quick"><h3>'+this._t("quick")+'</h3><div class="quick-grid">'+a.join("")+'</div></section>':""}
_tab(id){const t=(this._config.tabs||[]).find(x=>x.id===id&&x.enabled!==false);if(!t)return '<div class="empty">'+this._t("noConfig")+'</div>';const items=(t.items||[]).filter(i=>i.enabled!==false&&i.entity);return '<div><div class="tab-head">'+this._icon(t.icon||"mdi:folder-outline",t.image||"")+'<h2>'+this._e(t.name)+'</h2></div>'+(items.length?'<div class="entity-grid">'+items.map(i=>this._entityCard(i)).join("")+'</div>':'<div class="empty">'+this._t("noConfig")+'</div>')+'</div>'}
_type(i){if(i.type&&i.type!=="auto")return i.type;const d=String(i.entity||"").split(".")[0];return SF_TYPES.includes(d)?d:"read"}
_entityCard(i){const s=this._state(i.entity),type=this._type(i),active=this._active(i.status_entity||i.entity),color=active?(i.color_on||"#ff654c"):(i.color_off||"#26d8ff"),label=i.label||this._attr(i.entity,"friendly_name")||i.entity,val=this._fmt(i.entity,i.unit_override||"");let ctrl="";if(type==="switch"||type==="light")ctrl='<div class="control"><button data-toggle="'+this._ea(i.entity)+'" data-domain="'+type+'" data-live-toggle="'+this._ea(i.entity)+'" class="'+(active?"on":"")+'">'+(active?"ON":"OFF")+'</button></div>';else if(type==="button")ctrl='<div class="control"><button data-press="'+this._ea(i.entity)+'">'+this._t("button")+'</button></div>';else if(type==="number"){const min=s&&s.attributes?s.attributes.min:0,max=s&&s.attributes?s.attributes.max:100,step=s&&s.attributes?s.attributes.step:1;ctrl='<div class="control"><input type="number" data-number="'+this._ea(i.entity)+'" value="'+this._ea(this._num(i.entity)??min)+'" min="'+this._ea(min)+'" max="'+this._ea(max)+'" step="'+this._ea(step)+'"><button data-number-set="'+this._ea(i.entity)+'">OK</button></div>'}else if(type==="select"){const opts=s&&s.attributes&&Array.isArray(s.attributes.options)?s.attributes.options:[];ctrl='<div class="control"><select data-select="'+this._ea(i.entity)+'">'+opts.map(o=>'<option '+(String(o)===String(s.state)?"selected":"")+'>'+this._e(o)+'</option>').join("")+'</select></div>'}else if(type==="climate"){const at=s&&s.attributes?s.attributes:{},min=at.min_temp??5,max=at.max_temp??35,step=at.target_temp_step??.5;ctrl='<div class="control"><input type="number" data-climate="'+this._ea(i.entity)+'" value="'+this._ea(at.temperature??"")+'" min="'+min+'" max="'+max+'" step="'+step+'"><button data-climate-set="'+this._ea(i.entity)+'">OK</button></div>'}return '<article class="entity-card" style="--c:'+this._ea(color)+'"><div class="entity-head">'+this._icon(i.icon||this._attr(i.entity,"icon")||"mdi:circle",i.image||"")+'<div><b>'+this._e(label)+'</b></div></div><button class="entity-value" data-history="'+this._ea(i.entity)+'" data-live="'+this._ea(i.entity)+'" '+(i.unit_override?'data-unit="'+this._ea(i.unit_override)+'"':"")+'>'+this._e(val)+'</button>'+(i.status_entity?'<div class="metric"><span>'+this._t("state")+'</span><b data-live="'+this._ea(i.status_entity)+'">'+this._e((this._state(i.status_entity)||{}).state||"—")+'</b></div>':"")+ctrl+'</article>'}
_field(id,l,v,p){return '<label class="field"><span>'+this._e(l)+'</span><input id="'+id+'" value="'+this._ea(v||"")+'" placeholder="'+this._ea(p||"")+'"></label>'}
_settings(){
this._editing=true;
const g=this._config.general||{},o=this._config.overview||{};
const mp=Object.assign({},o.mppt||{}),tp=Object.assign({},o.temperature||{});
if(!mp.power)mp.power=(o.solar||{}).power||"";
if(!mp.voltage)mp.voltage=(o.solar||{}).voltage||"";
if(!mp.current)mp.current=(o.solar||{}).current||"";
if(!tp.current_temp)tp.current_temp=(o.heating||{}).current_temp||"";
if(!tp.target_temp)tp.target_temp=(o.heating||{}).target_temp||"";

const defs=[
  ["solar",this._t("solar"),["power","energy_today","energy_month","energy_year"],o.solar||{}],
  ["consumption",this._t("vanConsumption"),["power","energy_today"],o.consumption||{}],
  ["battery",this._t("battery"),["soc","power","voltage","current"],o.battery||{}],
  ["inverter",this._t("inverter"),["status","power","voltage","frequency","current"],o.inverter||{}],
  ["mppt","MPPT",["power","voltage","current"],mp],
  ["water",this._t("water"),["percent","liters"],o.water||{}],
  ["heating",this._t("heating"),["status","target_temp","current_temp"],o.heating||{}],
  ["water_heater",this._t("waterHeater"),["status","temperature"],o.water_heater||{}],
  ["temperature",this._t("currentTemp"),["current_temp","target_temp"],tp],
  ["ventilation",this._t("ventilation"),["status","current_temp","target_temp","power","speed"],o.ventilation||{}]
];
const sections=defs.map(d=>this._sectionEditor(d[0],d[1],d[3],d[2])).join("");

const counters=(this._config.daily_counters||[]).map((x,i)=>
  '<div class="item-editor"><div class="item-top"><b>#'+(i+1)+'</b></div><div class="grid">'
  +'<label class="field check-field"><span>'+this._t("section")+'</span><input type="checkbox" id="counter-'+i+'-enabled" '+(x.enabled!==false?"checked":"")+'></label>'
  +this._field("counter-"+i+"-fr","Nom FR",x.label_fr||x.id)
  +this._field("counter-"+i+"-en","Name EN",x.label_en||x.label_fr||x.id)
  +this._iconSelect("counter-"+i+"-icon",this._t("icon"),x.icon||"mdi:counter")
  +'<label class="field"><span>'+this._t("entity")+'</span><input list="sf-entities" id="counter-'+i+'" value="'+this._ea(x.entity||"")+'" placeholder="sensor..."></label>'
  +'</div></div>'
).join("");

const tabs=(this._config.tabs||[]).map((t,i)=>this._tabEditor(t,i)).join("");
return '<div class="settings">'
  +'<section class="settings-card"><h2>'+this._t("general")+'</h2><div class="grid">'
    +this._field("sf-title",this._t("title"),g.title)
    +this._select("sf-lang",this._t("language"),[["fr","Français"],["en","English"]],g.language||"fr")
    +this._select("sf-theme",this._t("theme"),[["auto",this._t("auto")],["day",this._t("day")],["night",this._t("night")]],g.theme_mode||"auto")
    +this._field("sf-day",this._t("dayImage"),g.day_image,"/local/...")
    +this._field("sf-night",this._t("nightImage"),g.night_image,"/local/...")
  +'</div><p class="hint">'+this._t("hint")+'</p></section>'
  +'<section class="settings-card"><h2>'+this._t("base")+'</h2><p class="hint">'
    +this._e(this._config.general.language==="en"
      ?"Solar, van consumption, inverter and battery are displayed on the van picture. MPPT, heating, water heater, water, interior temperature and ventilation are displayed in the blocks below. Uncheck any section to hide it."
      :"Solaire, Conso fourgon, Convertisseur et Batterie sont affichés sur l’image du fourgon. MPPT, Chauffage, Chauffe-eau, Eau propre, Température et Clim/Ventilation sont affichés dans les blocs en dessous. Décoche une section pour la masquer.")
    +'</p>'+sections+'</section>'
  +'<section class="settings-card"><h2>'+this._t("daily")+'</h2><p class="hint">'
    +this._e(this._config.general.language==="en"?"Only enabled counters with an entity are shown in the right column.":"Seuls les compteurs cochés avec une entité renseignée apparaissent dans la colonne de droite.")
    +'</p><div class="grid">'+counters+'</div></section>'
  +'<section class="settings-card"><h2>'+this._t("tabs")+'</h2><p class="hint">'
    +this._e(this._config.general.language==="en"
      ?"Create the menus displayed directly under Overview. Each menu can contain any Home Assistant entities. Choose the entity type, icon, label, optional status entity and colours for each item."
      :"Crée ici les menus affichés directement sous Vue générale. Chaque menu peut contenir les entités Home Assistant de ton choix. Pour chaque élément, choisis le type d’entité, l’icône, le nom, une entité d’état optionnelle et les couleurs.")
    +'</p><div class="grid">'+this._field("new-tab-name",this._t("tabName"),"")+this._iconSelect("new-tab-icon",this._t("icon"),"mdi:radiator")+'</div>'
    +'<p><button class="btn" id="add-tab">'+this._t("addTab")+'</button></p>'+tabs+'</section>'
  +'<div class="actions"><button class="btn danger" id="reset">'+this._t("reset")+'</button><button class="btn" id="save">'+this._t("save")+'</button></div>'
  +this._datalist()
+'</div>'
}
_select(id,l,opts,v){return '<label class="field"><span>'+this._e(l)+'</span><select id="'+id+'">'+opts.map(o=>'<option value="'+this._ea(o[0])+'" '+(String(o[0])===String(v)?"selected":"")+'>'+this._e(o[1])+'</option>').join("")+'</select></label>'}
_iconSelect(id,l,v){
const value=v||"mdi:folder-outline";
const opts=SF_ICONS.slice();
if(value&&!opts.some(x=>x[0]===value))opts.unshift([value,"★ "+value]);
return this._select(id,l,opts,value)
}
_sectionEditor(k,title,c,fields){const labels={power:this._t("power"),voltage:this._t("voltage"),current:this._t("current"),soc:this._t("soc"),percent:"%",liters:this._t("liters"),status:this._t("state"),target_temp:this._t("target"),current_temp:this._t("currentTemp"),temperature:this._t("temperature"),frequency:this._t("frequency"),speed:this._t("speed"),energy_today:this._t("today"),energy_month:this._t("month"),energy_year:this._t("year")};return '<details class="section-editor" open><summary>'+this._icon(c.icon||"mdi:circle")+' '+this._e(title)+'</summary><div class="editor-body"><div class="grid"><label class="field"><span>'+this._t("section")+'</span><input type="checkbox" id="base-'+k+'-enabled" '+(c.enabled!==false?"checked":"")+'></label>'+this._iconSelect("base-"+k+"-icon",this._t("icon"),c.icon)+fields.map(f=>'<label class="field"><span>'+this._e(labels[f]||f)+'</span><input list="sf-entities" id="base-'+k+'-'+f+'" value="'+this._ea(c[f]||"")+'" placeholder="sensor..."></label>').join("")+'</div></div></details>'}
_tabEditor(t,ti){
const items=(t.items||[]).map((it,ii)=>this._itemEditor(ti,ii,it)).join("");
return '<details class="tab-editor" open><summary>'+this._icon(t.icon||"mdi:folder-outline",t.image||"")+' '+this._e(t.name)+'</summary><div class="editor-body"><div class="grid">'
  +'<label class="field check-field"><span>'+this._t("section")+'</span><input type="checkbox" id="tab-'+ti+'-enabled" '+(t.enabled!==false?"checked":"")+'></label>'
  +this._field("tab-"+ti+"-name",this._t("tabName"),t.name)
  +this._iconSelect("tab-"+ti+"-icon",this._t("icon"),t.icon)
  +this._field("tab-"+ti+"-image",this._t("image"),t.image)
  +'</div>'+items+'<p><button class="btn" data-add-item="'+ti+'">'+this._t("addEntity")+'</button> <button class="btn danger" data-del-tab="'+ti+'">'+this._t("del")+'</button></p></div></details>'
}
_itemEditor(ti,ii,it){
return '<div class="item-editor"><div class="item-top"><b>#'+(ii+1)+'</b><button class="btn tiny danger" data-del-item="'+ti+":"+ii+'">×</button></div><div class="grid">'
  +'<label class="field check-field"><span>'+this._t("section")+'</span><input type="checkbox" id="it-'+ti+'-'+ii+'-enabled" '+(it.enabled!==false?"checked":"")+'></label>'
  +this._field("it-"+ti+"-"+ii+"-label",this._t("label"),it.label)
  +'<label class="field"><span>'+this._t("entity")+'</span><input list="sf-entities" id="it-'+ti+'-'+ii+'-entity" value="'+this._ea(it.entity||"")+'"></label>'
  +'<label class="field"><span>'+this._t("statusEntity")+'</span><input list="sf-entities" id="it-'+ti+'-'+ii+'-status" value="'+this._ea(it.status_entity||"")+'"></label>'
  +this._select("it-"+ti+"-"+ii+"-type",this._t("type"),SF_TYPES.map(x=>[x,this._typeLabel(x)]),it.type||"auto")
  +this._iconSelect("it-"+ti+"-"+ii+"-icon",this._t("icon"),it.icon||this._attr(it.entity,"icon")||"mdi:circle")
  +this._field("it-"+ti+"-"+ii+"-image",this._t("image"),it.image)
  +this._field("it-"+ti+"-"+ii+"-unit",this._t("unit"),it.unit_override)
  +this._field("it-"+ti+"-"+ii+"-on",this._t("activeColor"),it.color_on||"#ff654c")
  +this._field("it-"+ti+"-"+ii+"-off",this._t("inactiveColor"),it.color_off||"#26d8ff")
  +'</div></div>'
}
_typeLabel(x){const m={auto:"auto",read:"read",sensor:"sensor",binary_sensor:"binary",switch:"switch",number:"number",select:"select",button:"button",climate:"climate",light:"light",fan:"Ventilateur",visual:"Visuel / couleur"};return this._t(m[x]||x)}
_datalist(){return '<datalist id="sf-entities">'+Object.keys((this._hass&&this._hass.states)||{}).sort().map(x=>'<option value="'+this._ea(x)+'"></option>').join("")+'</datalist>'}
_sync(){const q=id=>this.shadowRoot.getElementById(id),g=this._config.general||{};g.title=(q("sf-title")||{}).value||"SMART FOURGON";g.language=(q("sf-lang")||{}).value||"fr";g.theme_mode=(q("sf-theme")||{}).value||"auto";g.day_image=(q("sf-day")||{}).value||"";g.night_image=(q("sf-night")||{}).value||"";this._config.general=g;const defs={solar:["power","voltage","current","energy_today","energy_month","energy_year"],battery:["soc","power","voltage","current"],water:["percent","liters"],heating:["status","target_temp","current_temp"],water_heater:["status","temperature"],inverter:["status","power","voltage","frequency","current"],ventilation:["status","current_temp","target_temp","power","speed"]};Object.entries(defs).forEach(([k,fs])=>{const c=this._config.overview[k];c.enabled=!!(q("base-"+k+"-enabled")||{}).checked;c.icon=(q("base-"+k+"-icon")||{}).value||c.icon;fs.forEach(f=>c[f]=(q("base-"+k+"-"+f)||{}).value||"")});(this._config.daily_counters||[]).forEach((x,i)=>{
x.entity=(q("counter-"+i)||{}).value||"";
x.label_fr=(q("counter-"+i+"-fr")||{}).value||x.label_fr||x.id;
x.label_en=(q("counter-"+i+"-en")||{}).value||x.label_en||x.label_fr||x.id;
x.icon=(q("counter-"+i+"-icon")||{}).value||x.icon||"mdi:counter"
});(this._config.tabs||[]).forEach((t,ti)=>{t.name=(q("tab-"+ti+"-name")||{}).value||t.name;t.icon=(q("tab-"+ti+"-icon")||{}).value||"mdi:folder-outline";t.image=(q("tab-"+ti+"-image")||{}).value||"";(t.items||[]).forEach((it,ii)=>{it.label=(q("it-"+ti+"-"+ii+"-label")||{}).value||"";it.entity=(q("it-"+ti+"-"+ii+"-entity")||{}).value||"";it.status_entity=(q("it-"+ti+"-"+ii+"-status")||{}).value||"";it.type=(q("it-"+ti+"-"+ii+"-type")||{}).value||"auto";it.icon=(q("it-"+ti+"-"+ii+"-icon")||{}).value||"";it.image=(q("it-"+ti+"-"+ii+"-image")||{}).value||"";it.unit_override=(q("it-"+ti+"-"+ii+"-unit")||{}).value||"";it.color_on=(q("it-"+ti+"-"+ii+"-on")||{}).value||"#ff654c";it.color_off=(q("it-"+ti+"-"+ii+"-off")||{}).value||"#26d8ff"})})}
_historyModal(){if(!this._hist)return '<div class="modal" id="hist"></div>';return '<div class="modal open" id="hist"><div class="modal-card"><div class="modal-head"><div><h2>'+this._t("history")+'</h2><small>'+this._e(this._attr(this._hist.entity,"friendly_name")||this._hist.entity)+'</small></div><button id="hist-close">×</button></div><div class="periods">'+[6,24,168,720].map(h=>'<button data-hours="'+h+'" class="'+(this._hours===h?"active":"")+'">'+(h===168?"7j":h===720?"30j":h+"h")+'</button>').join("")+'</div><div id="hist-body">'+(this._hist.html||'<div class="empty">'+this._t("loading")+'</div>')+'</div></div></div>'}
_openMoreInfo(e){
if(!e)return;
this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:e},bubbles:true,composed:true}))
}
_mountHistory(){
const current=this.shadowRoot.getElementById("hist");
if(!current)return;
const box=document.createElement("div");
box.innerHTML=this._historyModal();
const fresh=box.firstElementChild;
if(!fresh)return;
current.replaceWith(fresh);
this._bindHistoryControls()
}
_bindHistoryControls(){
const hc=this.shadowRoot.getElementById("hist-close");
if(hc)hc.onclick=()=>{this._hist=null;this._mountHistory()};
const hm=this.shadowRoot.getElementById("hist");
if(hm)hm.onclick=e=>{if(e.target===hm){this._hist=null;this._mountHistory()}};
this.shadowRoot.querySelectorAll("[data-hours]").forEach(b=>b.onclick=()=>{
  this._hours=Number(b.dataset.hours);
  if(this._hist){
    this._hist.html='<div class="empty">'+this._t("loading")+'</div>';
    this._mountHistory();
    this._loadHistory(this._hist.entity,this._hours)
  }
})
}
async _openHistory(e){
if(!e)return;
if(this._num(e)===null){this._openMoreInfo(e);return}
this._hist={entity:e,html:'<div class="empty">'+this._t("loading")+'</div>'};
this._mountHistory();
await this._loadHistory(e,this._hours)
}
async _loadHistory(e,h){
const end=new Date(),start=new Date(end.getTime()-h*3600000);
let d={};
try{
  d=await this._ws({
    type:"history/history_during_period",
    start_time:start.toISOString(),
    end_time:end.toISOString(),
    entity_ids:[e],
    minimal_response:false,
    no_attributes:true,
    significant_changes_only:false
  })
}catch(x){
  if(this._hist&&this._hist.entity===e){
    this._hist.html='<div class="empty">'+this._e(String(x&&x.message?x.message:x))+'</div>';
    this._mountHistory()
  }
  return
}
const raw=Array.isArray(d)
  ?(Array.isArray(d[0])?d[0]:d)
  :((d&&Array.isArray(d[e]))?d[e]:[]);
let s=raw.map(x=>{
  const v=x&&("state" in x)?x.state:(x&&(x.s??x.value));
  const tr=x&&(x.last_changed||x.last_updated||x.lc||x.lu);
  const ts=typeof tr==="number"?(tr<1e12?tr*1000:tr):new Date(tr).getTime();
  return[ts,Number(String(v).replace(",", "."))]
}).filter(x=>Number.isFinite(x[0])&&Number.isFinite(x[1])).sort((a,b)=>a[0]-b[0]);

const dedup=[];
for(const p of s){
  if(dedup.length&&dedup[dedup.length-1][0]===p[0])dedup[dedup.length-1]=p;
  else dedup.push(p)
}
s=dedup;

if(!this._hist||this._hist.entity!==e)return;
this._hist.html=s.length>1?this._chart(e,s):'<div class="empty">'+this._t("noData")+'</div>';
this._mountHistory()
}
_chart(e,s){
const vals=s.map(x=>x[1]);
const attrs=(this._state(e)||{}).attributes||{};
const num=v=>{const n=Number(v);return Number.isFinite(n)?n:null};
const dataMin=Math.min(...vals),dataMax=Math.max(...vals);
const sensorMin=num(attrs.min)??num(attrs.min_value)??num(attrs.native_min_value);
const sensorMax=num(attrs.max)??num(attrs.max_value)??num(attrs.native_max_value);

let axisMin=sensorMin!==null?sensorMin:dataMin;
let axisMax=sensorMax!==null?sensorMax:dataMax;
if(axisMin===axisMax){
  const pad=Math.max(Math.abs(axisMax)*.1,1);
  axisMin-=pad;axisMax+=pad
}
if(sensorMin===null)axisMin-=Math.max((axisMax-axisMin)*.08,.1);
if(sensorMax===null)axisMax+=Math.max((axisMax-axisMin)*.08,.1);

const maxPts=900;
let src=s;
if(s.length>maxPts){
  const step=Math.ceil(s.length/maxPts);
  src=s.filter((_,i)=>i%step===0||i===s.length-1)
}

const w=1040,h=430,pl=92,pr=28,pt=28,pb=66;
const span=Math.max(.000001,axisMax-axisMin);
const t0=src[0][0],t1=src[src.length-1][0],tspan=Math.max(1,t1-t0);
const pts=src.map(x=>[
  pl+(x[0]-t0)/tspan*(w-pl-pr),
  pt+(axisMax-x[1])/span*(h-pt-pb)
]);
const path=pts.map((p,i)=>(i?"L":"M")+p[0].toFixed(1)+" "+p[1].toFixed(1)).join(" ");

const unit=this._attr(e,"unit_of_measurement")||"";
const friendly=this._attr(e,"friendly_name")||e;
const valFmt=v=>Number(v).toLocaleString(this._lang(),{maximumFractionDigits:2})+(unit?" "+unit:"");
const tickFmt=v=>Number(v).toLocaleString(this._lang(),{maximumFractionDigits:Math.abs(v)<10?2:1});

let grid="";
const yTicks=6;
for(let i=0;i<yTicks;i++){
  const frac=i/(yTicks-1),v=axisMax-frac*(axisMax-axisMin),y=pt+frac*(h-pt-pb);
  grid+='<line x1="'+pl+'" y1="'+y.toFixed(1)+'" x2="'+(w-pr)+'" y2="'+y.toFixed(1)+'" class="chart-grid"/>'
    +'<text x="'+(pl-12)+'" y="'+(y+4).toFixed(1)+'" text-anchor="end" class="chart-axis">'+this._e(tickFmt(v))+'</text>'
}
const xTicks=7;
for(let i=0;i<xTicks;i++){
  const frac=i/(xTicks-1),ts=t0+frac*(t1-t0),x=pl+frac*(w-pl-pr),d=new Date(ts);
  const lbl=this._hours<=24
    ?d.toLocaleTimeString(this._lang(),{hour:"2-digit",minute:"2-digit"})
    :this._hours<=168
      ?d.toLocaleString(this._lang(),{weekday:"short",hour:"2-digit"})
      :d.toLocaleDateString(this._lang(),{day:"2-digit",month:"2-digit"});
  grid+='<line x1="'+x.toFixed(1)+'" y1="'+pt+'" x2="'+x.toFixed(1)+'" y2="'+(h-pb)+'" class="chart-grid chart-grid-x"/>'
    +'<text x="'+x.toFixed(1)+'" y="'+(h-26)+'" text-anchor="middle" class="chart-axis">'+this._e(lbl)+'</text>'
}

const scale=(sensorMin!==null||sensorMax!==null)
  ?'<div class="history-scale">'+this._e(this._config.general.language==="en"?"Sensor scale":"Échelle capteur")
    +' : '+this._e(tickFmt(axisMin))+(unit?" "+this._e(unit):"")
    +' → '+this._e(tickFmt(axisMax))+(unit?" "+this._e(unit):"")+'</div>'
  :"";

return '<div class="history-name">'+this._e(friendly)+'</div>'
  +'<div class="stats">'
    +'<div><span>'+this._t("now")+'</span><b>'+valFmt(vals[vals.length-1])+'</b></div>'
    +'<div><span>'+this._t("min")+'</span><b>'+valFmt(dataMin)+'</b></div>'
    +'<div><span>'+this._t("max")+'</span><b>'+valFmt(dataMax)+'</b></div>'
  +'</div>'+scale
  +'<div class="chart"><svg viewBox="0 0 '+w+' '+h+'" role="img">'
    +grid
    +'<line x1="'+pl+'" y1="'+(h-pb)+'" x2="'+(w-pr)+'" y2="'+(h-pb)+'" class="chart-axis-line"/>'
    +'<line x1="'+pl+'" y1="'+pt+'" x2="'+pl+'" y2="'+(h-pb)+'" class="chart-axis-line"/>'
    +'<path d="'+path+'" class="chart-line"/>'
    +'<text x="25" y="'+((pt+h-pb)/2)+'" transform="rotate(-90 25 '+((pt+h-pb)/2)+')" text-anchor="middle" class="chart-unit">'+this._e(unit||this._t("state"))+'</text>'
  +'</svg></div>'
}
async _service(domain,service,e,data){const d=Object.assign({},data||{}, {entity_id:e});try{await this._hass.callService(domain,service,d)}catch(x){this._toast(String(x),true)}}
_bind(){
this.shadowRoot.querySelectorAll("[data-page]").forEach(b=>b.onclick=()=>{
  this._editing=false;this._page=b.dataset.page;this._render()
});
this.shadowRoot.querySelectorAll("[data-history]").forEach(b=>b.onclick=()=>this._openHistory(b.dataset.history));
const tc=this.shadowRoot.getElementById("theme-cycle");
if(tc)tc.onclick=async()=>{
  const g=this._config.general,m=g.theme_mode||"auto";
  g.theme_mode=m==="auto"?"day":m==="day"?"night":"auto";
  try{this._config=await this._ws({type:"smart_fourgon/config/save",config:this._config})}catch(x){}
  this._render()
};
this._bindHistoryControls();
this.shadowRoot.querySelectorAll("[data-toggle]").forEach(b=>b.onclick=()=>this._service(b.dataset.domain,this._active(b.dataset.toggle)?"turn_off":"turn_on",b.dataset.toggle));
this.shadowRoot.querySelectorAll("[data-press]").forEach(b=>b.onclick=()=>this._service("button","press",b.dataset.press));
this.shadowRoot.querySelectorAll("[data-select]").forEach(s=>s.onchange=()=>this._service("select","select_option",s.dataset.select,{option:s.value}));
this.shadowRoot.querySelectorAll("[data-number-set]").forEach(b=>b.onclick=()=>{
  const i=this.shadowRoot.querySelector('[data-number="'+CSS.escape(b.dataset.numberSet)+'"]');
  this._service("number","set_value",b.dataset.numberSet,{value:Number(i.value)})
});
this.shadowRoot.querySelectorAll("[data-climate-set]").forEach(b=>b.onclick=()=>{
  const i=this.shadowRoot.querySelector('[data-climate="'+CSS.escape(b.dataset.climateSet)+'"]');
  this._service("climate","set_temperature",b.dataset.climateSet,{temperature:Number(i.value)})
});
if(this._page==="settings")this._bindSettings()
}
_bindSettings(){const add=this.shadowRoot.getElementById("add-tab");if(add)add.onclick=()=>{this._sync();const n=this.shadowRoot.getElementById("new-tab-name").value.trim();if(!n)return;this._config.tabs.push({id:this._uid(),name:n,icon:this.shadowRoot.getElementById("new-tab-icon").value.trim()||"mdi:folder-outline",image:"",items:[]});this._render()};this.shadowRoot.querySelectorAll("[data-add-item]").forEach(b=>b.onclick=()=>{this._sync();const t=this._config.tabs[Number(b.dataset.addItem)];t.items=t.items||[];t.items.push({id:this._uid(),label:"",entity:"",status_entity:"",type:"auto",icon:"",image:"",unit_override:"",color_on:"#ff654c",color_off:"#26d8ff"});this._render(true)});this.shadowRoot.querySelectorAll("[data-del-tab]").forEach(b=>b.onclick=()=>{this._sync();this._config.tabs.splice(Number(b.dataset.delTab),1);this._render(true)});this.shadowRoot.querySelectorAll("[data-del-item]").forEach(b=>b.onclick=()=>{this._sync();const p=b.dataset.delItem.split(":").map(Number);this._config.tabs[p[0]].items.splice(p[1],1);this._render(true)});const save=this.shadowRoot.getElementById("save");if(save)save.onclick=async()=>{this._sync();try{this._config=await this._ws({type:"smart_fourgon/config/save",config:this._config});this._editing=false;this._render();this._toast(this._t("saved"))}catch(x){this._toast(String(x),true)}};const reset=this.shadowRoot.getElementById("reset");if(reset)reset.onclick=async()=>{if(!confirm(this._t("reset")+" ?"))return;this._config=await this._ws({type:"smart_fourgon/config/reset"});this._editing=false;this._render()}}
_toast(m,err){const t=this.shadowRoot.getElementById("toast");if(!t)return;t.textContent=m;t.style.background=err?"#672834":"#154e37";t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2200)}
}
if(!customElements.get("smart-fourgon-panel"))customElements.define("smart-fourgon-panel",SmartFourgonPanel);
