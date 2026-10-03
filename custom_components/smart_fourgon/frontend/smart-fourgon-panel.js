const SF_T={
fr:{overview:"Vue générale",settings:"Réglages",daily:"Compteurs journaliers",quick:"État rapide",solar:"Solaire",battery:"Batterie",water:"Eau propre",heating:"Chauffage",waterHeater:"Chauffe-eau",inverter:"Convertisseur 12 / 230 V",ventilation:"Clim / Ventilation",power:"Puissance",voltage:"Tension",current:"Courant",frequency:"Fréquence",soc:"SOC",liters:"Litres restants",target:"Consigne",temperature:"Température",currentTemp:"Température actuelle",speed:"Vitesse",today:"Aujourd’hui",month:"Ce mois",year:"Cette année",general:"Général",base:"Sections de base",tabs:"Onglets personnalisés",language:"Langue",theme:"Mode jour / nuit",auto:"Automatique",day:"Jour",night:"Nuit",title:"Titre du dashboard",dayImage:"Image de jour",nightImage:"Image de nuit",save:"Enregistrer",addTab:"Ajouter un onglet",tabName:"Nom de l’onglet",icon:"Icône",image:"Image",entity:"Entité",statusEntity:"Entité d’état",type:"Type",label:"Nom",addEntity:"Ajouter une entité",del:"Supprimer",history:"Historique",min:"Min",max:"Max",now:"Actuel",loading:"Chargement…",noData:"Pas de données",noConfig:"Aucune entité configurée",hint:"Les sections et valeurs ne s’affichent que lorsqu’une entité Home Assistant est renseignée.",saved:"Configuration enregistrée",reset:"Réinitialiser",section:"Section active",activeColor:"Couleur actif",inactiveColor:"Couleur inactif",unit:"Unité forcée",read:"Lecture seule",sensor:"Capteur",binary:"Binaire",switch:"Switch",number:"Nombre",select:"Liste",button:"Bouton",climate:"Thermostat",light:"Lumière",state:"État"},
en:{overview:"Overview",settings:"Settings",daily:"Daily counters",quick:"Quick status",solar:"Solar",battery:"Battery",water:"Fresh water",heating:"Heating",waterHeater:"Water heater",inverter:"12 / 230 V inverter",ventilation:"A/C / Ventilation",power:"Power",voltage:"Voltage",current:"Current",frequency:"Frequency",soc:"SOC",liters:"Liters remaining",target:"Target",temperature:"Temperature",currentTemp:"Current temperature",speed:"Speed",today:"Today",month:"This month",year:"This year",general:"General",base:"Base sections",tabs:"Custom tabs",language:"Language",theme:"Day / night mode",auto:"Automatic",day:"Day",night:"Night",title:"Dashboard title",dayImage:"Day image",nightImage:"Night image",save:"Save",addTab:"Add tab",tabName:"Tab name",icon:"Icon",image:"Image",entity:"Entity",statusEntity:"Status entity",type:"Type",label:"Label",addEntity:"Add entity",del:"Delete",history:"History",min:"Min",max:"Max",now:"Current",loading:"Loading…",noData:"No data",noConfig:"No entity configured",hint:"Sections and values are shown only when a Home Assistant entity is configured.",saved:"Configuration saved",reset:"Reset",section:"Section enabled",activeColor:"Active color",inactiveColor:"Inactive color",unit:"Unit override",read:"Read only",sensor:"Sensor",binary:"Binary",switch:"Switch",number:"Number",select:"Select",button:"Button",climate:"Climate",light:"Light",state:"State"}
};
const SF_TYPES=["auto","read","sensor","binary_sensor","switch","number","select","button","climate","light"];
const ACTIVE=new Set(["on","open","opening","active","heat","heating","cool","cooling","fan_only","dry","true","home"]);

class SmartFourgonPanel extends HTMLElement{
constructor(){super();this.attachShadow({mode:"open"});this._hass=null;this._config=null;this._page="overview";this._category="energy";this._loaded=false;this._editing=false;this._hist=null;this._hours=24;this._heroDay="";this._heroNight="";}
set hass(v){this._hass=v;if(!this._loaded)this._load();else if(!this._editing)this._render();}
get hass(){return this._hass}
set panel(v){this._panel=v}
set narrow(v){this._narrow=!!v}
connectedCallback(){if(this._hass&&!this._loaded)this._load()}
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
    const r=await fetch(path+"?v=0.2.4",{cache:"no-store"});
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
_render(){
if(!this._loaded)return;
const night=this._night(),g=this._config.general||{},title=this._e(g.title||"SMART FOURGON");
const customTabs=(this._config.tabs||[]).map(t=>'<button data-page="tab:'+this._ea(t.id)+'" class="nav-main '+(this._page==="tab:"+t.id?"active":"")+'">'+this._icon(t.icon||"mdi:folder-outline",t.image||"")+'<span>'+this._e(t.name)+'</span></button>').join("");
const groups=this._sidebarGroups();
let body=this._page==="settings"?this._settings():this._page.indexOf("tab:")===0?this._tab(this._page.slice(4)):this._overview(night);
const themeIcon=night?"mdi:weather-night":"mdi:white-balance-sunny";
this.shadowRoot.innerHTML='<link rel="stylesheet" href="/smart_fourgon/styles.css?v=0.2.4">'
+'<div class="app">'
+'<aside class="sidebar">'
+'<div class="brand-mark"><div class="brand-logo">'+this._icon("mdi:van-utility")+'</div><div><b>SMART FOURGON</b><small>TABLEAU DE BORD<br>HOME ASSISTANT</small></div></div>'
+'<nav class="nav">'
+'<button data-page="overview" class="nav-main '+(this._page==="overview"?"active":"")+'">'+this._icon("mdi:home")+'<span>'+this._t("overview")+'</span></button>'
+groups
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
+'<button class="square-chip">'+this._icon("mdi:wifi")+'</button>'
+'<button class="square-chip">'+this._icon("mdi:bluetooth")+'</button>'
+'<button class="square-chip" id="theme-cycle">'+this._icon(themeIcon)+'</button>'
+'<div class="date-box">'+this._icon("mdi:calendar-month")+'<span>'+new Date().toLocaleDateString(this._lang(),{weekday:"short",day:"2-digit",month:"long",year:"numeric"})+'</span></div>'
+'<div class="clock"><b>'+new Date().toLocaleTimeString(this._lang(),{hour:"2-digit",minute:"2-digit"})+'</b></div>'
+'</div></header>'
+'<section class="page">'+body+'</section>'
+'</main>'+this._historyModal()+'<div id="toast" class="toast"></div></div>';
this._bind()
}
_sidebarGroups(){
const o=this._config.overview||{};
const mk=(title,icon,rows)=>{
 const valid=rows.filter(x=>x.entity);
 if(!valid.length)return "";
 return '<section class="nav-group"><div class="nav-group-title">'+this._icon(icon)+'<span>'+this._e(title)+'</span><ha-icon icon="mdi:chevron-down"></ha-icon></div>'
 +valid.map(x=>'<button class="nav-sub" data-history="'+this._ea(x.entity)+'">'+this._icon(x.icon||"mdi:circle-small")+'<span>'+this._e(x.label)+'</span><i class="status-dot '+(this._state(x.entity)?"ok":"off")+'"></i></button>').join("")+'</section>'
};
return mk(this._config.general.language==="en"?"ENERGY":"ÉNERGIE","mdi:lightning-bolt",[
 {label:this._t("solar"),icon:o.solar&&o.solar.icon,entity:o.solar&&(o.solar.power||o.solar.voltage)},
 {label:"MPPT",icon:"mdi:battery-charging",entity:o.solar&&o.solar.current},
 {label:this._t("battery"),icon:o.battery&&o.battery.icon,entity:o.battery&&(o.battery.soc||o.battery.voltage)},
 {label:this._t("inverter"),icon:o.inverter&&o.inverter.icon,entity:o.inverter&&(o.inverter.power||o.inverter.voltage)}
])
+mk(this._config.general.language==="en"?"WATER":"EAU","mdi:water",[
 {label:this._t("water"),icon:o.water&&o.water.icon,entity:o.water&&(o.water.liters||o.water.percent)}
])
+mk(this._config.general.language==="en"?"HEATING":"CHAUFFAGE","mdi:radiator",[
 {label:this._t("heating"),icon:o.heating&&o.heating.icon,entity:o.heating&&(o.heating.current_temp||o.heating.target_temp||o.heating.status)},
 {label:this._t("waterHeater"),icon:o.water_heater&&o.water_heater.icon,entity:o.water_heater&&(o.water_heater.temperature||o.water_heater.status)}
])
+mk(this._config.general.language==="en"?"CLIMATE":"CLIMAT","mdi:fan",[
 {label:this._t("ventilation"),icon:o.ventilation&&o.ventilation.icon,entity:o.ventilation&&(o.ventilation.current_temp||o.ventilation.speed||o.ventilation.power)}
]);
}
_overview(night){
const o=this._config.overview||{},g=this._config.general||{};
const customImg=(night?g.night_image:g.day_image)||"";const img=customImg||(night?this._heroNight:this._heroDay)||"/smart_fourgon/assets/default-van.svg";
const callouts=[
  this._callout("solar",this._t("solar"),o.solar&&o.solar.icon,o.solar&&o.solar.power,[
    [this._t("voltage"),o.solar&&o.solar.voltage],
    [this._t("current"),o.solar&&o.solar.current]
  ],"solar"),
  this._callout("waterheater",this._t("waterHeater"),o.water_heater&&o.water_heater.icon,o.water_heater&&o.water_heater.temperature,[
    [this._t("state"),o.water_heater&&o.water_heater.status]
  ],"waterheater"),
  this._callout("heating",this._t("heating"),o.heating&&o.heating.icon,o.heating&&o.heating.current_temp,[
    [this._t("target"),o.heating&&o.heating.target_temp],
    [this._t("state"),o.heating&&o.heating.status]
  ],"heating"),
  this._callout("temp",this._t("currentTemp"),"mdi:thermometer",o.heating&&o.heating.current_temp,[
    [this._t("target"),o.heating&&o.heating.target_temp]
  ],"temp"),
  this._callout("inverter",this._t("inverter"),o.inverter&&o.inverter.icon,o.inverter&&o.inverter.power,[
    [this._t("voltage"),o.inverter&&o.inverter.voltage],
    [this._t("frequency"),o.inverter&&o.inverter.frequency]
  ],"inverter"),
  this._callout("water",this._t("water"),o.water&&o.water.icon,o.water&&o.water.liters,[
    ["%",o.water&&o.water.percent]
  ],"water"),
  this._callout("battery",this._t("battery"),o.battery&&o.battery.icon,o.battery&&o.battery.soc,[
    [this._t("voltage"),o.battery&&o.battery.voltage],
    [this._t("power"),o.battery&&o.battery.power]
  ],"battery"),
  this._callout("vent",this._t("ventilation"),o.ventilation&&o.ventilation.icon,o.ventilation&&o.ventilation.speed,[
    [this._t("power"),o.ventilation&&o.ventilation.power],
    [this._t("currentTemp"),o.ventilation&&o.ventilation.current_temp]
  ],"vent")
].filter(Boolean);

const counters=(this._config.daily_counters||[]).filter(x=>x.entity);
const cat=this._categoryTabs();
const right=this._rightSummary(o,counters)+this._detailPanel();
const rightContent=cat+right;
const bottom=this._bottomPanels(o);

return '<div class="dash-layout '+(rightContent?"":"no-right")+'">'
  +'<div class="dash-center">'
    +'<section class="hero-photo '+(night?"night-scene":"day-scene")+'" style="background-image:url(&quot;'+this._ea(img)+'&quot;)">'
      +(callouts.length?'<div class="callout-layer">'+callouts.join("")+'</div>':'')
    +'</section>'
    +bottom
  +'</div>'
  +(rightContent?'<aside class="dash-right">'+rightContent+'</aside>':'')
+'</div>'
}
_callout(cls,title,icon,primary,rows,key){
if(!primary&&!rows.some(x=>x[1]))return "";
const p=primary
  ?'<button class="call-primary" data-history="'+this._ea(primary)+'">'+this._e(this._fmt(primary))+'</button>'
  :"";
const r=rows.filter(x=>x[1]).map(x=>
  '<button class="call-row" data-history="'+this._ea(x[1])+'"><span>'+this._e(x[0])+'</span><b>'+this._e(this._fmt(x[1]))+'</b></button>'
).join("");
const cfgKey=key==="waterheater"?"water_heater":key;
const active=(key==="heating"||key==="waterheater"||key==="vent")
  ?this._active((this._config.overview[cfgKey]||{}).status)
  :false;
const ref=primary||(rows.find(x=>x[1])||[])[1]||"";
return '<article class="callout '+cls+' '+(active?"on":"")+'">'
  +'<div class="call-head">'+this._icon(icon||"mdi:circle")+'<span>'+this._e(title)+'</span><i></i></div>'
  +p+r
  +'<div class="call-link">'+this._icon("mdi:link-variant")+'<small>'+this._e(ref)+'</small></div>'
+'</article>'
}
_categoryTabs(){
const o=this._config.overview||{};
const hasEnergy=this._has(
  o.solar&&(o.solar.power||o.solar.voltage||o.solar.current||o.solar.energy_today||o.solar.energy_month||o.solar.energy_year),
  o.battery&&(o.battery.soc||o.battery.power||o.battery.voltage||o.battery.current),
  o.inverter&&(o.inverter.status||o.inverter.power||o.inverter.voltage||o.inverter.frequency||o.inverter.current)
);
const hasWater=this._has(
  o.water&&(o.water.percent||o.water.liters)
);
const hasHeating=this._has(
  o.heating&&(o.heating.status||o.heating.target_temp||o.heating.current_temp),
  o.water_heater&&(o.water_heater.status||o.water_heater.temperature)
);
const hasClimate=this._has(
  o.ventilation&&(o.ventilation.status||o.ventilation.current_temp||o.ventilation.target_temp||o.ventilation.power||o.ventilation.speed)
);
const hasEquipment=(this._config.tabs||[]).some(t=>(t.items||[]).some(i=>i.entity));
const all=[
 ["energy",this._config.general.language==="en"?"ENERGY":"ÉNERGIE","mdi:white-balance-sunny",hasEnergy],
 ["water",this._config.general.language==="en"?"WATER":"EAU","mdi:water",hasWater],
 ["heating",this._config.general.language==="en"?"HEATING":"CHAUFFAGE","mdi:radiator",hasHeating],
 ["climate",this._config.general.language==="en"?"CLIMATE":"CLIMAT","mdi:fan",hasClimate],
 ["equipment",this._config.general.language==="en"?"EQUIPMENT":"ÉQUIPEMENTS","mdi:cog",hasEquipment]
];
const cats=all.filter(x=>x[3]);
if(!cats.length)return "";
if(!cats.some(x=>x[0]===this._category))this._category=cats[0][0];
return '<div class="category-tabs">'+cats.map(x=>'<button data-category="'+x[0]+'" class="'+(this._category===x[0]?"active":"")+'">'+this._icon(x[2])+'<span>'+x[1]+'</span></button>').join("")+'</div>'
}
_detailPanel(){
const o=this._config.overview||{},rows=[];
const add=(label,entity,icon)=>{if(entity)rows.push({label,entity,icon})};
if(this._category==="energy"){add(this._t("solar"),o.solar&&(o.solar.power||o.solar.voltage),o.solar&&o.solar.icon);add(this._t("battery"),o.battery&&(o.battery.soc||o.battery.voltage),o.battery&&o.battery.icon);add(this._t("inverter"),o.inverter&&(o.inverter.power||o.inverter.voltage),o.inverter&&o.inverter.icon)}
if(this._category==="water"){add(this._t("water"),o.water&&(o.water.liters||o.water.percent),o.water&&o.water.icon);add(this._t("waterHeater"),o.water_heater&&(o.water_heater.temperature||o.water_heater.status),o.water_heater&&o.water_heater.icon)}
if(this._category==="heating"){add(this._t("heating"),o.heating&&(o.heating.current_temp||o.heating.target_temp||o.heating.status),o.heating&&o.heating.icon);add(this._t("waterHeater"),o.water_heater&&(o.water_heater.temperature||o.water_heater.status),o.water_heater&&o.water_heater.icon)}
if(this._category==="climate"){add(this._t("ventilation"),o.ventilation&&(o.ventilation.current_temp||o.ventilation.speed||o.ventilation.power),o.ventilation&&o.ventilation.icon)}
if(this._category==="equipment"){(this._config.tabs||[]).flatMap(t=>(t.items||[]).map(i=>({t,i}))).filter(x=>x.i.entity).slice(0,8).forEach(x=>add(x.i.label||x.t.name,x.i.entity,x.i.icon||x.t.icon))}
if(!rows.length)return "";
const label=this._category==="heating"?(this._config.general.language==="en"?"HEATING PAGE":"PAGE CHAUFFAGE"):(this._config.general.language==="en"?"DETAIL PAGE":"PAGE DÉTAIL");
return '<section class="detail-panel"><div class="detail-title">'+this._icon(this._category==="heating"?"mdi:radiator":"mdi:format-list-bulleted")+'<b>'+label+'</b><span>‹ &nbsp; '+(this._config.general.language==="en"?"Back":"Retour")+'</span></div>'+rows.map(x=>'<button class="detail-row" data-history="'+this._ea(x.entity)+'">'+this._icon(x.icon||"mdi:circle")+'<span>'+this._e(x.label)+'</span><b>'+this._e(this._fmt(x.entity))+'</b><ha-icon icon="mdi:chevron-right"></ha-icon></button>').join("")+'</section>'
}
_rightSummary(o,counters){
let h="";
const solar=o.solar||{},bat=o.battery||{},water=o.water||{},inv=o.inverter||{},heat=o.heating||{},wh=o.water_heater||{},vent=o.ventilation||{};

if(this._has(solar.energy_today,solar.energy_month,solar.energy_year,solar.power)){
  h+='<section class="side-card solar-card"><h3>'+this._icon(solar.icon||"mdi:white-balance-sunny")+'<span>'+this._t("solar")+'</span></h3>'
  +(solar.power?'<div class="side-primary">'+this._e(this._fmt(solar.power))+'</div>':"")
  +this._kv(this._t("today"),solar.energy_today)
  +this._kv(this._t("month"),solar.energy_month)
  +this._kv(this._t("year"),solar.energy_year)
  +'</section>';
}
if(this._has(bat.soc,bat.power,bat.voltage,bat.current)){
  h+='<section class="side-card battery-card"><h3>'+this._icon(bat.icon||"mdi:battery-high")+'<span>'+this._t("battery")+'</span></h3>'
  +'<div class="side-primary">'+this._e(this._fmt(bat.soc||bat.voltage))+'</div>'
  +this._kv(this._t("voltage"),bat.voltage)
  +this._kv(this._t("current"),bat.current)
  +this._kv(this._t("power"),bat.power)
  +'</section>';
}
if(this._has(water.percent,water.liters)){
  h+='<section class="side-card water-card"><h3>'+this._icon(water.icon||"mdi:water")+'<span>'+this._t("water")+'</span></h3><div class="dual-stat">'
  +(water.liters?'<button data-history="'+this._ea(water.liters)+'"><span>'+this._t("liters")+'</span><b>'+this._e(this._fmt(water.liters))+'</b></button>':"")
  +(water.percent?'<button data-history="'+this._ea(water.percent)+'"><span>%</span><b>'+this._e(this._fmt(water.percent))+'</b></button>':"")
  +'</div></section>';
}
if(this._has(inv.power,inv.voltage,inv.frequency,inv.current)){
  h+='<section class="side-card inverter-card"><h3>'+this._icon(inv.icon||"mdi:power-plug")+'<span>'+this._t("inverter")+'</span></h3>'
  +(inv.power?'<div class="side-primary">'+this._e(this._fmt(inv.power))+'</div>':"")
  +this._kv(this._t("voltage"),inv.voltage)
  +this._kv(this._t("frequency"),inv.frequency)
  +this._kv(this._t("current"),inv.current)
  +'</section>';
}
if(this._has(heat.current_temp,heat.target_temp,wh.temperature)){
  h+='<section class="side-card heat-card"><h3>'+this._icon(heat.icon||"mdi:radiator")+'<span>'+this._t("heating")+' / '+this._t("waterHeater")+'</span></h3><div class="dual-stat">'
  +(heat.current_temp?'<button data-history="'+this._ea(heat.current_temp)+'"><span>'+this._t("heating")+'</span><b>'+this._e(this._fmt(heat.current_temp))+'</b></button>':"")
  +(wh.temperature?'<button data-history="'+this._ea(wh.temperature)+'"><span>'+this._t("waterHeater")+'</span><b>'+this._e(this._fmt(wh.temperature))+'</b></button>':"")
  +'</div></section>';
}
if(this._has(vent.current_temp,vent.target_temp,vent.power,vent.speed)){
  h+='<section class="side-card vent-card"><h3>'+this._icon(vent.icon||"mdi:fan")+'<span>'+this._t("ventilation")+'</span></h3>'
  +this._kv(this._t("currentTemp"),vent.current_temp)
  +this._kv(this._t("target"),vent.target_temp)
  +this._kv(this._t("power"),vent.power)
  +this._kv(this._t("speed"),vent.speed)
  +'</section>';
}
if(counters.length){
  h+='<section class="side-card counters-card"><h3>'+this._icon("mdi:counter")+'<span>'+this._t("daily")+'</span></h3><div class="counter-grid">'
  +counters.map(x=>'<button class="counter" data-history="'+this._ea(x.entity)+'">'+this._icon(x.icon||"mdi:counter")+'<span>'+this._e(this._config.general.language==="en"?(x.label_en||x.label_fr):(x.label_fr||x.label_en))+'</span><b>'+this._e(this._fmt(x.entity))+'</b></button>').join("")
  +'</div></section>';
}
return h
}
_bottomPanels(o){
const items=[];
const push=(title,icon,vals)=>{
  const rows=vals.filter(x=>x[1]);
  if(!rows.length)return;
  items.push('<section class="bottom-card"><h3>'+this._icon(icon)+'<span>'+this._e(title)+'</span></h3><div class="bottom-values">'
  +rows.map(x=>'<button data-history="'+this._ea(x[1])+'"><span>'+this._e(x[0])+'</span><b>'+this._e(this._fmt(x[1]))+'</b></button>').join("")
  +'</div></section>');
};
const s=o.solar||{},b=o.battery||{},i=o.inverter||{},w=o.water||{},h=o.heating||{},v=o.ventilation||{};
push(this._t("quick"),"mdi:view-dashboard-outline",[
  [this._t("battery"),b.soc],
  [this._t("solar"),s.power],
  [this._t("water"),w.percent||w.liters],
  [this._t("heating"),h.current_temp],
  [this._t("ventilation"),v.speed||v.power]
]);
push(this._config.general.language==="en"?"MPPT PRODUCTION":"PRODUCTION MPPT",s.icon||"mdi:solar-panel-large",[
  [this._t("power"),s.power],
  [this._t("voltage"),s.voltage],
  [this._t("current"),s.current]
]);
push(this._t("inverter"),i.icon||"mdi:power-plug",[
  [this._t("power"),i.power],
  [this._t("voltage"),i.voltage],
  [this._t("frequency"),i.frequency],
  [this._t("current"),i.current]
]);
return items.length?'<div class="bottom-strip">'+items.join("")+'</div>':""
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
_tab(id){const t=(this._config.tabs||[]).find(x=>x.id===id);if(!t)return '<div class="empty">'+this._t("noConfig")+'</div>';const items=(t.items||[]).filter(i=>i.entity);return '<div><div class="tab-head">'+this._icon(t.icon||"mdi:folder-outline",t.image||"")+'<h2>'+this._e(t.name)+'</h2></div>'+(items.length?'<div class="entity-grid">'+items.map(i=>this._entityCard(i)).join("")+'</div>':'<div class="empty">'+this._t("noConfig")+'</div>')+'</div>'}
_type(i){if(i.type&&i.type!=="auto")return i.type;const d=String(i.entity||"").split(".")[0];return SF_TYPES.includes(d)?d:"read"}
_entityCard(i){const s=this._state(i.entity),type=this._type(i),active=this._active(i.status_entity||i.entity),color=active?(i.color_on||"#ff654c"):(i.color_off||"#26d8ff"),label=i.label||this._attr(i.entity,"friendly_name")||i.entity,val=this._fmt(i.entity,i.unit_override||"");let ctrl="";if(type==="switch"||type==="light")ctrl='<div class="control"><button data-toggle="'+this._ea(i.entity)+'" data-domain="'+type+'" class="'+(active?"on":"")+'">'+(active?"ON":"OFF")+'</button></div>';else if(type==="button")ctrl='<div class="control"><button data-press="'+this._ea(i.entity)+'">'+this._t("button")+'</button></div>';else if(type==="number"){const min=s&&s.attributes?s.attributes.min:0,max=s&&s.attributes?s.attributes.max:100,step=s&&s.attributes?s.attributes.step:1;ctrl='<div class="control"><input type="number" data-number="'+this._ea(i.entity)+'" value="'+this._ea(this._num(i.entity)??min)+'" min="'+this._ea(min)+'" max="'+this._ea(max)+'" step="'+this._ea(step)+'"><button data-number-set="'+this._ea(i.entity)+'">OK</button></div>'}else if(type==="select"){const opts=s&&s.attributes&&Array.isArray(s.attributes.options)?s.attributes.options:[];ctrl='<div class="control"><select data-select="'+this._ea(i.entity)+'">'+opts.map(o=>'<option '+(String(o)===String(s.state)?"selected":"")+'>'+this._e(o)+'</option>').join("")+'</select></div>'}else if(type==="climate"){const at=s&&s.attributes?s.attributes:{},min=at.min_temp??5,max=at.max_temp??35,step=at.target_temp_step??.5;ctrl='<div class="control"><input type="number" data-climate="'+this._ea(i.entity)+'" value="'+this._ea(at.temperature??"")+'" min="'+min+'" max="'+max+'" step="'+step+'"><button data-climate-set="'+this._ea(i.entity)+'">OK</button></div>'}return '<article class="entity-card" style="--c:'+this._ea(color)+'"><div class="entity-head">'+this._icon(i.icon||this._attr(i.entity,"icon")||"mdi:circle",i.image||"")+'<div><b>'+this._e(label)+'</b><small>'+this._e(i.entity)+'</small></div></div><button class="entity-value" '+(this._num(i.entity)!==null?'data-history="'+this._ea(i.entity)+'"':"")+'>'+this._e(val)+'</button>'+(i.status_entity?'<div class="metric"><span>'+this._t("state")+'</span><b>'+this._e((this._state(i.status_entity)||{}).state||"—")+'</b></div>':"")+ctrl+'</article>'}
_field(id,l,v,p){return '<label class="field"><span>'+this._e(l)+'</span><input id="'+id+'" value="'+this._ea(v||"")+'" placeholder="'+this._ea(p||"")+'"></label>'}
_settings(){this._editing=true;const g=this._config.general||{},o=this._config.overview||{};const defs=[["solar",this._t("solar"),["power","voltage","current","energy_today","energy_month","energy_year"]],["battery",this._t("battery"),["soc","power","voltage","current"]],["water",this._t("water"),["percent","liters"]],["heating",this._t("heating"),["status","target_temp","current_temp"]],["water_heater",this._t("waterHeater"),["status","temperature"]],["inverter",this._t("inverter"),["status","power","voltage","frequency","current"]],["ventilation",this._t("ventilation"),["status","current_temp","target_temp","power","speed"]]];const sections=defs.map(d=>this._sectionEditor(d[0],d[1],o[d[0]]||{},d[2])).join("");const counters=(this._config.daily_counters||[]).map((c,i)=>this._field("counter-"+i,(this._config.general.language==="en"?c.label_en:c.label_fr)||c.id,c.entity,"sensor...")).join("");const tabs=(this._config.tabs||[]).map((t,i)=>this._tabEditor(t,i)).join("");return '<div class="settings"><section class="settings-card"><h2>'+this._t("general")+'</h2><div class="grid">'+this._field("sf-title",this._t("title"),g.title)+this._select("sf-lang",this._t("language"),[["fr","Français"],["en","English"]],g.language||"fr")+this._select("sf-theme",this._t("theme"),[["auto",this._t("auto")],["day",this._t("day")],["night",this._t("night")]],g.theme_mode||"auto")+this._field("sf-day",this._t("dayImage"),g.day_image,"/local/...")+this._field("sf-night",this._t("nightImage"),g.night_image,"/local/...")+'</div><p class="hint">'+this._t("hint")+'</p></section><section class="settings-card"><h2>'+this._t("base")+'</h2>'+sections+'</section><section class="settings-card"><h2>'+this._t("daily")+'</h2><div class="grid">'+counters+'</div></section><section class="settings-card"><h2>'+this._t("tabs")+'</h2><div class="grid">'+this._field("new-tab-name",this._t("tabName"),"")+this._field("new-tab-icon",this._t("icon"),"mdi:radiator")+'</div><p><button class="btn" id="add-tab">'+this._t("addTab")+'</button></p>'+tabs+'</section><div class="actions"><button class="btn danger" id="reset">'+this._t("reset")+'</button><button class="btn" id="save">'+this._t("save")+'</button></div>'+this._datalist()+'</div>'}
_select(id,l,opts,v){return '<label class="field"><span>'+this._e(l)+'</span><select id="'+id+'">'+opts.map(o=>'<option value="'+this._ea(o[0])+'" '+(String(o[0])===String(v)?"selected":"")+'>'+this._e(o[1])+'</option>').join("")+'</select></label>'}
_sectionEditor(k,title,c,fields){const labels={power:this._t("power"),voltage:this._t("voltage"),current:this._t("current"),soc:this._t("soc"),percent:"%",liters:this._t("liters"),status:this._t("state"),target_temp:this._t("target"),current_temp:this._t("currentTemp"),temperature:this._t("temperature"),frequency:this._t("frequency"),speed:this._t("speed"),energy_today:this._t("today"),energy_month:this._t("month"),energy_year:this._t("year")};return '<details class="section-editor" open><summary>'+this._icon(c.icon||"mdi:circle")+' '+this._e(title)+'</summary><div class="editor-body"><div class="grid"><label class="field"><span>'+this._t("section")+'</span><input type="checkbox" id="base-'+k+'-enabled" '+(c.enabled!==false?"checked":"")+'></label>'+this._field("base-"+k+"-icon",this._t("icon"),c.icon)+fields.map(f=>'<label class="field"><span>'+this._e(labels[f]||f)+'</span><input list="sf-entities" id="base-'+k+'-'+f+'" value="'+this._ea(c[f]||"")+'" placeholder="sensor..."></label>').join("")+'</div></div></details>'}
_tabEditor(t,ti){const items=(t.items||[]).map((it,ii)=>this._itemEditor(ti,ii,it)).join("");return '<details class="tab-editor" open><summary>'+this._icon(t.icon||"mdi:folder-outline",t.image||"")+' '+this._e(t.name)+'</summary><div class="editor-body"><div class="grid">'+this._field("tab-"+ti+"-name",this._t("tabName"),t.name)+this._field("tab-"+ti+"-icon",this._t("icon"),t.icon)+this._field("tab-"+ti+"-image",this._t("image"),t.image)+'</div>'+items+'<p><button class="btn" data-add-item="'+ti+'">'+this._t("addEntity")+'</button> <button class="btn danger" data-del-tab="'+ti+'">'+this._t("del")+'</button></p></div></details>'}
_itemEditor(ti,ii,it){return '<div class="item-editor"><div class="item-top"><b>#'+(ii+1)+'</b><button class="btn tiny danger" data-del-item="'+ti+":"+ii+'">×</button></div><div class="grid">'+this._field("it-"+ti+"-"+ii+"-label",this._t("label"),it.label)+'<label class="field"><span>'+this._t("entity")+'</span><input list="sf-entities" id="it-'+ti+'-'+ii+'-entity" value="'+this._ea(it.entity||"")+'"></label><label class="field"><span>'+this._t("statusEntity")+'</span><input list="sf-entities" id="it-'+ti+'-'+ii+'-status" value="'+this._ea(it.status_entity||"")+'"></label>'+this._select("it-"+ti+"-"+ii+"-type",this._t("type"),SF_TYPES.map(x=>[x,this._typeLabel(x)]),it.type||"auto")+this._field("it-"+ti+"-"+ii+"-icon",this._t("icon"),it.icon)+this._field("it-"+ti+"-"+ii+"-image",this._t("image"),it.image)+this._field("it-"+ti+"-"+ii+"-unit",this._t("unit"),it.unit_override)+this._field("it-"+ti+"-"+ii+"-on",this._t("activeColor"),it.color_on||"#ff654c")+this._field("it-"+ti+"-"+ii+"-off",this._t("inactiveColor"),it.color_off||"#26d8ff")+'</div></div>'}
_typeLabel(x){const m={auto:"auto",read:"read",sensor:"sensor",binary_sensor:"binary",switch:"switch",number:"number",select:"select",button:"button",climate:"climate",light:"light"};return this._t(m[x]||x)}
_datalist(){return '<datalist id="sf-entities">'+Object.keys((this._hass&&this._hass.states)||{}).sort().map(x=>'<option value="'+this._ea(x)+'"></option>').join("")+'</datalist>'}
_sync(){const q=id=>this.shadowRoot.getElementById(id),g=this._config.general||{};g.title=(q("sf-title")||{}).value||"SMART FOURGON";g.language=(q("sf-lang")||{}).value||"fr";g.theme_mode=(q("sf-theme")||{}).value||"auto";g.day_image=(q("sf-day")||{}).value||"";g.night_image=(q("sf-night")||{}).value||"";this._config.general=g;const defs={solar:["power","voltage","current","energy_today","energy_month","energy_year"],battery:["soc","power","voltage","current"],water:["percent","liters"],heating:["status","target_temp","current_temp"],water_heater:["status","temperature"],inverter:["status","power","voltage","frequency","current"],ventilation:["status","current_temp","target_temp","power","speed"]};Object.entries(defs).forEach(([k,fs])=>{const c=this._config.overview[k];c.enabled=!!(q("base-"+k+"-enabled")||{}).checked;c.icon=(q("base-"+k+"-icon")||{}).value||c.icon;fs.forEach(f=>c[f]=(q("base-"+k+"-"+f)||{}).value||"")});(this._config.daily_counters||[]).forEach((c,i)=>c.entity=(q("counter-"+i)||{}).value||"");(this._config.tabs||[]).forEach((t,ti)=>{t.name=(q("tab-"+ti+"-name")||{}).value||t.name;t.icon=(q("tab-"+ti+"-icon")||{}).value||"mdi:folder-outline";t.image=(q("tab-"+ti+"-image")||{}).value||"";(t.items||[]).forEach((it,ii)=>{it.label=(q("it-"+ti+"-"+ii+"-label")||{}).value||"";it.entity=(q("it-"+ti+"-"+ii+"-entity")||{}).value||"";it.status_entity=(q("it-"+ti+"-"+ii+"-status")||{}).value||"";it.type=(q("it-"+ti+"-"+ii+"-type")||{}).value||"auto";it.icon=(q("it-"+ti+"-"+ii+"-icon")||{}).value||"";it.image=(q("it-"+ti+"-"+ii+"-image")||{}).value||"";it.unit_override=(q("it-"+ti+"-"+ii+"-unit")||{}).value||"";it.color_on=(q("it-"+ti+"-"+ii+"-on")||{}).value||"#ff654c";it.color_off=(q("it-"+ti+"-"+ii+"-off")||{}).value||"#26d8ff"})})}
_historyModal(){if(!this._hist)return '<div class="modal" id="hist"></div>';return '<div class="modal open" id="hist"><div class="modal-card"><div class="modal-head"><div><h2>'+this._t("history")+'</h2><small>'+this._e(this._hist.entity)+'</small></div><button id="hist-close">×</button></div><div class="periods">'+[6,24,168,720].map(h=>'<button data-hours="'+h+'" class="'+(this._hours===h?"active":"")+'">'+(h===168?"7j":h===720?"30j":h+"h")+'</button>').join("")+'</div><div id="hist-body">'+(this._hist.html||'<div class="empty">'+this._t("loading")+'</div>')+'</div></div></div>'}
async _openHistory(e){if(!e||this._num(e)===null)return;this._hist={entity:e,html:'<div class="empty">'+this._t("loading")+'</div>'};this._render();await this._loadHistory(e,this._hours)}
async _loadHistory(e,h){let d=[];const end=new Date(),start=new Date(end.getTime()-h*3600000);try{d=await this._ws({type:"history/history_during_period",start_time:start.toISOString(),end_time:end.toISOString(),entity_ids:[e],minimal_response:false,no_attributes:true,significant_changes_only:false})}catch(x){}const raw=Array.isArray(d)&&Array.isArray(d[0])?d[0]:Array.isArray(d)?d:[];const s=raw.map(x=>{const v="state" in (x||{})?x.state:(x.s??x.value),tr=x.last_changed||x.last_updated||x.lc||x.lu,ts=typeof tr==="number"?(tr<1e12?tr*1000:tr):new Date(tr).getTime();return[ts,Number(String(v).replace(",","."))]}).filter(x=>Number.isFinite(x[0])&&Number.isFinite(x[1])).sort((a,b)=>a[0]-b[0]);if(!this._hist||this._hist.entity!==e)return;this._hist.html=s.length>1?this._chart(e,s):'<div class="empty">'+this._t("noData")+'</div>';this._render()}
_chart(e,s){const vals=s.map(x=>x[1]),a=(this._state(e)||{}).attributes||{},num=v=>Number.isFinite(Number(v))?Number(v):null;let min=num(a.min)??num(a.min_value)??num(a.native_min_value),max=num(a.max)??num(a.max_value)??num(a.native_max_value);const amin=min,amax=max;if(min===null)min=Math.min(...vals);if(max===null)max=Math.max(...vals);if(min===max){const p=Math.max(Math.abs(max)*.1,1);min-=p;max+=p}if(amin===null){const p=(max-min)*.06;min-=p}if(amax===null){const p=(max-min)*.06;max+=p}const w=900,h=340,pl=60,pr=20,pt=20,pb=42,span=Math.max(.0001,max-min),t0=s[0][0],t1=s[s.length-1][0],ts=Math.max(1,t1-t0),pts=s.map(x=>[pl+(x[0]-t0)/ts*(w-pl-pr),pt+(max-x[1])/span*(h-pt-pb)]),path=pts.map((p,i)=>(i?"L":"M")+p[0].toFixed(1)+" "+p[1].toFixed(1)).join(" "),u=this._attr(e,"unit_of_measurement")||"",f=v=>Number(v).toLocaleString(this._lang(),{maximumFractionDigits:2})+(u?" "+u:"");return '<div class="stats"><div><span>'+this._t("now")+'</span><b>'+f(vals[vals.length-1])+'</b></div><div><span>'+this._t("min")+'</span><b>'+f(min)+'</b></div><div><span>'+this._t("max")+'</span><b>'+f(max)+'</b></div></div><div class="chart"><svg viewBox="0 0 '+w+" "+h+'"><path d="'+path+'" fill="none" stroke="#26d8ff" stroke-width="3"/><line x1="'+pl+'" y1="'+(h-pb)+'" x2="'+(w-pr)+'" y2="'+(h-pb)+'" stroke="#7aa6bc"/></svg></div>'}
async _service(domain,service,e,data){const d=Object.assign({},data||{}, {entity_id:e});try{await this._hass.callService(domain,service,d)}catch(x){this._toast(String(x),true)}}
_bind(){this.shadowRoot.querySelectorAll("[data-page]").forEach(b=>b.onclick=()=>{this._editing=false;this._page=b.dataset.page;this._render()});this.shadowRoot.querySelectorAll("[data-category]").forEach(b=>b.onclick=()=>{this._category=b.dataset.category;this._render()});this.shadowRoot.querySelectorAll("[data-history]").forEach(b=>b.onclick=()=>this._openHistory(b.dataset.history));const tc=this.shadowRoot.getElementById("theme-cycle");if(tc)tc.onclick=async()=>{const g=this._config.general,m=g.theme_mode||"auto";g.theme_mode=m==="auto"?"day":m==="day"?"night":"auto";try{this._config=await this._ws({type:"smart_fourgon/config/save",config:this._config})}catch(x){}this._render()};const hc=this.shadowRoot.getElementById("hist-close");if(hc)hc.onclick=()=>{this._hist=null;this._render()};const hm=this.shadowRoot.getElementById("hist");if(hm)hm.onclick=e=>{if(e.target===hm){this._hist=null;this._render()}};this.shadowRoot.querySelectorAll("[data-hours]").forEach(b=>b.onclick=()=>{this._hours=Number(b.dataset.hours);if(this._hist)this._loadHistory(this._hist.entity,this._hours)});this.shadowRoot.querySelectorAll("[data-toggle]").forEach(b=>b.onclick=()=>this._service(b.dataset.domain,this._active(b.dataset.toggle)?"turn_off":"turn_on",b.dataset.toggle));this.shadowRoot.querySelectorAll("[data-press]").forEach(b=>b.onclick=()=>this._service("button","press",b.dataset.press));this.shadowRoot.querySelectorAll("[data-select]").forEach(s=>s.onchange=()=>this._service("select","select_option",s.dataset.select,{option:s.value}));this.shadowRoot.querySelectorAll("[data-number-set]").forEach(b=>b.onclick=()=>{const i=this.shadowRoot.querySelector('[data-number="'+CSS.escape(b.dataset.numberSet)+'"]');this._service("number","set_value",b.dataset.numberSet,{value:Number(i.value)})});this.shadowRoot.querySelectorAll("[data-climate-set]").forEach(b=>b.onclick=()=>{const i=this.shadowRoot.querySelector('[data-climate="'+CSS.escape(b.dataset.climateSet)+'"]');this._service("climate","set_temperature",b.dataset.climateSet,{temperature:Number(i.value)})});if(this._page==="settings")this._bindSettings()}
_bindSettings(){const add=this.shadowRoot.getElementById("add-tab");if(add)add.onclick=()=>{this._sync();const n=this.shadowRoot.getElementById("new-tab-name").value.trim();if(!n)return;this._config.tabs.push({id:this._uid(),name:n,icon:this.shadowRoot.getElementById("new-tab-icon").value.trim()||"mdi:folder-outline",image:"",items:[]});this._render()};this.shadowRoot.querySelectorAll("[data-add-item]").forEach(b=>b.onclick=()=>{this._sync();const t=this._config.tabs[Number(b.dataset.addItem)];t.items=t.items||[];t.items.push({id:this._uid(),label:"",entity:"",status_entity:"",type:"auto",icon:"",image:"",unit_override:"",color_on:"#ff654c",color_off:"#26d8ff"});this._render()});this.shadowRoot.querySelectorAll("[data-del-tab]").forEach(b=>b.onclick=()=>{this._sync();this._config.tabs.splice(Number(b.dataset.delTab),1);this._render()});this.shadowRoot.querySelectorAll("[data-del-item]").forEach(b=>b.onclick=()=>{this._sync();const p=b.dataset.delItem.split(":").map(Number);this._config.tabs[p[0]].items.splice(p[1],1);this._render()});const save=this.shadowRoot.getElementById("save");if(save)save.onclick=async()=>{this._sync();try{this._config=await this._ws({type:"smart_fourgon/config/save",config:this._config});this._editing=false;this._render();this._toast(this._t("saved"))}catch(x){this._toast(String(x),true)}};const reset=this.shadowRoot.getElementById("reset");if(reset)reset.onclick=async()=>{if(!confirm(this._t("reset")+" ?"))return;this._config=await this._ws({type:"smart_fourgon/config/reset"});this._editing=false;this._render()}}
_toast(m,err){const t=this.shadowRoot.getElementById("toast");if(!t)return;t.textContent=m;t.style.background=err?"#672834":"#154e37";t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2200)}
}
if(!customElements.get("smart-fourgon-panel"))customElements.define("smart-fourgon-panel",SmartFourgonPanel);
