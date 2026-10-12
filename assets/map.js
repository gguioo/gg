(function(){
var ERAS=[['史前时代','#8a6d3b'],['古代王国','#c0392b'],['伊斯兰与西方东来','#d68910'],['东印度公司时代','#7d6608'],
['殖民扩张与瓜分','#6c3483'],['民族觉醒','#1f8a70'],['日本南侵与独立','#2e86c1'],['冷战与战争','#34495e'],['和平、改革与东盟','#16a085']];
var dark=matchMedia('(prefers-color-scheme: dark)').matches;
var map=L.map('map',{zoomControl:false,attributionControl:true,worldCopyJump:false}).setView([6,112],4);
L.control.zoom({position:'topleft'}).addTo(map);
var E='https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_'+(dark?'Dark':'Light')+'_Gray_';
L.tileLayer(E+'Base/MapServer/tile/{z}/{y}/{x}',{maxZoom:12,attribution:'Tiles &copy; Esri'}).addTo(map);
L.tileLayer(E+'Reference/MapServer/tile/{z}/{y}/{x}',{maxZoom:12,opacity:.8}).addTo(map);
var all=[],list=[],era=-1,idx=0,timer=null,layer=L.layerGroup().addTo(map),markers=[];
var $=function(id){return document.getElementById(id)};
var sl=$('slider');
function icon(e,cur,past){var s=cur?14:(past?10:8);
 return L.divIcon({className:'ev-wrap'+(cur?' ev-cur':''),iconSize:[s,s],
  html:'<div class="ev" style="width:'+s+'px;height:'+s+'px;background:'+ERAS[e.era][1]+';opacity:'+(cur||past?1:.35)+';--pc:'+ERAS[e.era][1]+'"></div>'});}
function eraBar(){var h='<button role="tab" data-e="-1" aria-selected="'+(era<0)+'">全部</button>';
 ERAS.forEach(function(x,i){h+='<button role="tab" data-e="'+i+'" aria-selected="'+(era===i)+'"><i style="background:'+x[1]+'"></i>'+x[0]+'</button>'});
 $('eras').innerHTML=h;}
function setEra(e){era=e;stop();list=all.filter(function(x){return e<0||x.era===e});idx=0;eraBar();
 layer.clearLayers();markers=list.map(function(ev,i){var m=L.marker([ev.lat,ev.lng],{icon:icon(ev,false,false),riseOnHover:true})
  .on('click',function(){go(i,true)}).addTo(layer);return m;});
 sl.max=list.length-1;var b=L.latLngBounds(list.map(function(x){return[x.lat,x.lng]}));
 map.fitBounds(b.pad(.25),{paddingBottomRight:[0,220],maxZoom:6});go(0,false);
 var a=document.querySelector('#eras [aria-selected=true]');a&&a.scrollIntoView({inline:'center',block:'nearest'});}
function go(i,fly){if(!list.length)return;idx=Math.max(0,Math.min(list.length-1,i));var ev=list[idx];
 markers.forEach(function(m,j){m.setIcon(icon(list[j],j===idx,j<idx));m.setZIndexOffset(j===idx?1000:(j<idx?j:0));m.unbindTooltip()});
 markers[idx].bindTooltip(ev.place,{permanent:true,direction:'top',offset:[0,-10],className:'lbl'}).openTooltip();
 $('c-dot').style.background=ERAS[ev.era][1];$('c-year').textContent=ev.label;$('c-place').textContent=ev.place;
 $('c-text').textContent=ev.text;$('c-link').href=window.BASE+ev.url;$('c-count').textContent=(idx+1)+' / '+list.length;sl.value=idx;
 if(fly!==false){var z=Math.max(map.getZoom(),5),p=map.project([ev.lat,ev.lng],z).add([0,90]);map.flyTo(map.unproject(p,z),z,{duration:.8});}}
function stop(){if(timer){clearInterval(timer);timer=null;}$('play').textContent='▶';$('play').setAttribute('aria-label','播放');}
function play(){if(timer)return stop();if(idx>=list.length-1)go(0);$('play').textContent='❚❚';$('play').setAttribute('aria-label','暂停');
 timer=setInterval(function(){if(idx>=list.length-1)return stop();go(idx+1)},2600);}
$('eras').addEventListener('click',function(e){var b=e.target.closest('button');b&&setEra(+b.dataset.e)});
$('prev').onclick=function(){stop();go(idx-1)};$('next').onclick=function(){stop();go(idx+1)};$('play').onclick=play;
sl.addEventListener('input',function(){stop();go(+sl.value)});
document.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){stop();go(idx+1)}else if(e.key==='ArrowLeft'){stop();go(idx-1)}else if(e.key===' '){e.preventDefault();play()}});
fetch(window.MAP_DATA_URL).then(function(r){return r.json()}).then(function(d){all=d;var q=new URLSearchParams(location.search).get('era');setEra(q!==null?+q:-1);});
})();
