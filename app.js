/* menu */
(function(){
  const h=document.querySelector('.ham'),p=document.getElementById('panel');if(!h||!p)return;
  const u=o=>{h.setAttribute('aria-expanded',o);p.classList.toggle('otwarte',o)};
  h.addEventListener('click',()=>u(h.getAttribute('aria-expanded')!=='true'));
  p.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>u(false)));
})();

const pl=v=>String(Math.round(v*10)/10).replace('.',',');
const zl=v=>Math.round(v).toLocaleString('pl-PL').replace(/ | /g,' ')+' zł';

/* kalkulator / konfigurator */
const KALK=(function(){
  const svg=document.getElementById('rys');if(!svg)return null;
  const st={typ:'biuro',dl:6,sz:3,pietra:1,dach:'plaski',elew:'plyta',szklo:'okna',km:'100',dod:[]};
  /* STAWKA BAZOWA ze strony firmy: "od 2150 zl netto za m2". Reszta ponizej PRZYKLADOWA - do uzupelnienia cennikiem firmy */
  const BAZA=2150;
  const TYP={biuro:['Biuro',1],handel:['Handel / usługi',1.05],gastro:['Gastronomia',1.15],portiernia:['Portiernia',1.1],socjal:['Socjalny / budowa',.95],dom:['Dom modułowy',1.2]};
  const ELEW={plyta:['płyta warstwowa',0,'#3d434a','#2f3439'],kaseton:['kasetony stalowe',260,'#e6e6e2','#bdbdb8'],drewno:['termodrewno',320,'#9a6538','#7a4f2b'],alu:['kompozyt (Alucobond)',450,'#59626d','#454c55']};
  const SZKLO={okna:['okna standard',0],witryny:['witryny',.08],pelne:['pełne przeszklenie',.18]};
  const DOD={wc:['WC / węzeł sanitarny',9500],klima:['klimatyzacja',6500],rolety:['rolety zewnętrzne',4800],daszek:['daszek ESG/VSG',3900],markiza:['markiza elektryczna',5500],podloze:['przygotowanie podłoża',2500]};
  const KM={'100':['do 100 km',1500],'300':['100-300 km',3500],'600':['300-600 km',6000],'eu':['Europa',0]};
  const PIETRO=14000; /* schody i podest na kazda kolejna kondygnacje - przyklad */
  const DACH2=350;    /* zl/m2 rzutu za dach dwuspadowy - przyklad */

  function licz(){
    const pow=st.dl*st.sz, calk=pow*st.pietra;
    const baza=BAZA*calk;
    let k=baza*(TYP[st.typ][1]-1);
    const scian=2*(st.dl+st.sz)*2.8*st.pietra;
    k+=ELEW[st.elew][1]*scian;
    k+=baza*SZKLO[st.szklo][1];
    if(st.dach==='dwu')k+=DACH2*pow;
    k+=(st.pietra-1)*PIETRO;
    st.dod.forEach(d=>k+=DOD[d][1]);
    k+=KM[st.km][1];
    return {pow,calk,baza,suma:baza+k};
  }

  function rysuj(){
    const L=st.dl,W=st.sz,F=st.pietra,fh=2.9,gable=st.dach==='dwu';
    const ox=.55,oy=.32; /* rzut ukosny */
    const rh=gable?Math.min(2.4,W*.36):.35;
    const s=Math.min(370/(L+W*ox),205/(F*fh+W*oy+rh));
    const wF=L*s,dx=W*s*ox,dy=W*s*oy,H=F*fh*s;
    const x0=(440-(wF+dx))/2,yb=238;
    const e=ELEW[st.elew];
    let o='';
    o+='<ellipse cx="'+(x0+wF/2+dx/2)+'" cy="'+(yb+4)+'" rx="'+((wF+dx)/2+16)+'" ry="9" fill="rgba(0,0,0,.35)"/>';
    // bok
    o+='<polygon points="'+(x0+wF)+','+yb+' '+(x0+wF+dx)+','+(yb-dy)+' '+(x0+wF+dx)+','+(yb-dy-H)+' '+(x0+wF)+','+(yb-H)+'" fill="'+e[3]+'"/>';
    // front
    o+='<rect x="'+x0+'" y="'+(yb-H)+'" width="'+wF+'" height="'+H+'" fill="'+e[2]+'"/>';
    // faktura elewacji
    const fs=[];
    if(st.elew==='plyta'){for(let y=yb-H+s*.5;y<yb;y+=s*.5)fs.push('<line x1="'+x0+'" y1="'+y+'" x2="'+(x0+wF)+'" y2="'+y+'" stroke="rgba(255,255,255,.07)"/>')}
    if(st.elew==='kaseton'||st.elew==='alu'){const kw=s*(st.elew==='alu'?1.5:1),kh=s*(st.elew==='alu'?1.45:.97);for(let x=x0+kw;x<x0+wF-1;x+=kw)fs.push('<line x1="'+x+'" y1="'+(yb-H)+'" x2="'+x+'" y2="'+yb+'" stroke="rgba(0,0,0,.18)"/>');for(let y=yb-kh;y>yb-H+1;y-=kh)fs.push('<line x1="'+x0+'" y1="'+y+'" x2="'+(x0+wF)+'" y2="'+y+'" stroke="rgba(0,0,0,.18)"/>')}
    if(st.elew==='drewno'){for(let x=x0+s*.18;x<x0+wF;x+=s*.18)fs.push('<line x1="'+x+'" y1="'+(yb-H)+'" x2="'+x+'" y2="'+yb+'" stroke="rgba(40,20,5,.28)"/>')}
    o+=fs.join('');
    // przeszklenia na kazdej kondygnacji
    const mod=3,n=Math.max(1,Math.round(L/mod)),seg=wF/n;
    for(let f=0;f<F;f++){
      const yt=yb-(f+1)*fh*s,hF=fh*s;
      for(let i=0;i<n;i++){
        const sx=x0+i*seg;
        const drzwi=(f===0&&i===Math.floor(n/2));
        let gx,gw,gy,gh;
        if(st.szklo==='okna'){gw=Math.min(seg*.45,1.2*s);gx=sx+(seg-gw)/2;gy=yt+hF*.28;gh=hF*.38}
        else if(st.szklo==='witryny'){gw=seg*.8;gx=sx+seg*.1;gy=yt+hF*.14;gh=hF*.72}
        else{gw=seg-4;gx=sx+2;gy=yt+hF*.06;gh=hF*.9}
        if(drzwi&&st.szklo==='okna'){gw=Math.min(seg*.4,1*s);gx=sx+(seg-gw)/2;gy=yt+hF*.18;gh=hF*.82}
        o+='<rect x="'+gx+'" y="'+gy+'" width="'+gw+'" height="'+gh+'" fill="url(#szk)" stroke="#1a1c1f" stroke-width="2"/>';
        if(st.szklo!=='okna'){const sl=Math.max(1,Math.round(gw/(s*1.2)));for(let j=1;j<sl;j++){const lx=gx+j*gw/sl;o+='<line x1="'+lx+'" y1="'+gy+'" x2="'+lx+'" y2="'+(gy+gh)+'" stroke="#1a1c1f" stroke-width="2"/>'}}
        if(drzwi)o+='<rect x="'+(gx+gw*.5-1)+'" y="'+(gy+gh*.45)+'" width="2" height="'+(gh*.18)+'" fill="#e3bf6c"/>';
      }
      if(f>0)o+='<line x1="'+x0+'" y1="'+(yb-f*fh*s)+'" x2="'+(x0+wF)+'" y2="'+(yb-f*fh*s)+'" stroke="#1a1c1f" stroke-width="3"/>';
    }
    // rama stalowa
    o+='<rect x="'+x0+'" y="'+(yb-H)+'" width="'+wF+'" height="'+H+'" fill="none" stroke="#1a1c1f" stroke-width="3"/>';
    const yt=yb-H;
    if(!gable){
      o+='<polygon points="'+x0+','+yt+' '+(x0+wF)+','+yt+' '+(x0+wF+dx)+','+(yt-dy)+' '+(x0+dx)+','+(yt-dy)+'" fill="#5b616a"/>';
      o+='<rect x="'+(x0-2)+'" y="'+(yt-rh*s)+'" width="'+(wF+4)+'" height="'+(rh*s)+'" fill="#202327"/>';
      o+='<polygon points="'+(x0+wF+2)+','+yt+' '+(x0+wF+2)+','+(yt-rh*s)+' '+(x0+wF+dx)+','+(yt-dy-rh*s)+' '+(x0+wF+dx)+','+(yt-dy)+'" fill="#17191c"/>';
    }else{
      const R=rh*s,mx=dx/2,my=dy/2,ov=5;
      const rx=x0+mx,ry=yt-my-R; /* kalenica */
      // tylna polac (widoczna nad kalenica)
      o+='<polygon points="'+(rx-ov)+','+ry+' '+(rx+wF+ov)+','+ry+' '+(x0+wF+dx+ov)+','+(yt-dy)+' '+(x0+dx-ov)+','+(yt-dy)+'" fill="#24282d"/>';
      // szczyt na boku
      o+='<polygon points="'+(x0+wF)+','+yt+' '+(x0+wF+dx)+','+(yt-dy)+' '+(rx+wF)+','+ry+'" fill="'+e[3]+'"/>';
      o+='<polyline points="'+(x0+wF+ov*.6)+','+(yt+2)+' '+(rx+wF+ov*.3)+','+(ry-1)+' '+(x0+wF+dx+ov)+','+(yt-dy+1)+'" fill="none" stroke="#1a1c1f" stroke-width="3" stroke-linejoin="round"/>';
      // przednia polac
      o+='<polygon points="'+(x0-ov)+','+(yt+2)+' '+(x0+wF+ov)+','+(yt+2)+' '+(rx+wF+ov)+','+ry+' '+(rx-ov)+','+ry+'" fill="#3a3f46"/>';
      for(let x=x0+s*.6;x<x0+wF;x+=s*.6)o+='<line x1="'+x+'" y1="'+(yt+2)+'" x2="'+(x+mx)+'" y2="'+ry+'" stroke="rgba(0,0,0,.22)"/>';
      o+='<line x1="'+(rx-ov)+'" y1="'+ry+'" x2="'+(rx+wF+ov)+'" y2="'+ry+'" stroke="#1a1c1f" stroke-width="3"/>';
    }
    // sylwetka 1,8 m dla skali
    {const hx=x0-Math.max(10,s*.5),hh=1.8*s,hw=.42*s;
     if(hx-hw>4)o+='<g fill="#8b9096" opacity=".85"><circle cx="'+hx+'" cy="'+(yb-hh+hw*.42)+'" r="'+(hw*.42)+'"/><rect x="'+(hx-hw/2)+'" y="'+(yb-hh+hw*.95)+'" width="'+hw+'" height="'+(hh*.42)+'" rx="'+(hw*.3)+'"/><rect x="'+(hx-hw/2+1)+'" y="'+(yb-hh*.5)+'" width="'+(hw*.42)+'" height="'+(hh*.5)+'"/><rect x="'+(hx+hw*.08-1)+'" y="'+(yb-hh*.5)+'" width="'+(hw*.42)+'" height="'+(hh*.5)+'"/></g>';}
    // wymiary
    o+='<g font-family="Barlow,sans-serif" font-size="13" font-weight="600" fill="#e9e7e2"><line x1="'+x0+'" y1="'+(yb+16)+'" x2="'+(x0+wF)+'" y2="'+(yb+16)+'" stroke="#c9a04a"/><rect x="'+(x0+wF/2-24)+'" y="'+(yb+8)+'" width="48" height="16" fill="#24272b"/><text x="'+(x0+wF/2)+'" y="'+(yb+20)+'" text-anchor="middle">'+pl(L)+' m</text>';
    o+='<text x="'+(x0+wF+dx/2+6)+'" y="'+(yb-dy/2+14)+'" fill="#a3a7ab">'+pl(W)+' m</text></g>';
    svg.innerHTML='<defs><linearGradient id="szk" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9fb8c8"/><stop offset=".55" stop-color="#5d7383"/><stop offset="1" stop-color="#34424d"/></linearGradient></defs>'+o;

    const r=licz();
    document.getElementById('podsum').innerHTML=
      '<li><span>Przeznaczenie</span>'+TYP[st.typ][0]+'</li>'+
      '<li><span>Wymiary</span>'+pl(L)+' × '+pl(W)+' m · '+pl(r.pow)+' m²'+(F>1?' × '+F+' kond.':'')+'</li>'+
      '<li><span>Wykończenie</span>'+ELEW[st.elew][0]+', '+SZKLO[st.szklo][0]+'</li>'+
      '<li><span>Dach</span>'+(gable?'dwuspadowy':'płaski')+'</li>'+
      '<li><span>Dodatki</span>'+(st.dod.length?st.dod.map(d=>DOD[d][0]).join(', '):'brak')+'</li>'+
      '<li><span>Transport HDS</span>'+KM[st.km][0]+'</li>';
    const od=Math.round(r.suma/500)*500,doo=Math.round(r.suma*1.2/500)*500;
    document.getElementById('cena').textContent=zl(od)+' - '+zl(doo);
    const mc=document.getElementById('mobCena');if(mc)mc.textContent=zl(od)+' - '+zl(doo);
    document.getElementById('cenaP').textContent='baza: 2150 zł × '+pl(r.calk)+' m² = '+zl(r.baza)+(st.km==='eu'?' · transport do Europy wyceniany osobno':'');
  }
  function tekst(){
    const r=licz();
    return 'Konfiguracja z kalkulatora: '+TYP[st.typ][0]+', '+pl(st.dl)+' × '+pl(st.sz)+' m ('+pl(r.pow)+' m²'+(st.pietra>1?', '+st.pietra+' kondygnacje':'')+'), elewacja: '+ELEW[st.elew][0]+', '+SZKLO[st.szklo][0]+', dach '+(st.dach==='dwu'?'dwuspadowy':'płaski')+(st.dod.length?', dodatki: '+st.dod.map(d=>DOD[d][0]).join(', '):'')+', transport: '+KM[st.km][0]+'.';
  }
  document.querySelectorAll('#kalkulator .chipy[data-p]').forEach(g=>g.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;g.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x===b));const p=g.dataset.p;st[p]=p==='pietra'?+b.dataset.v:b.dataset.v;rysuj()}));
  const dl=document.getElementById('dl'),sz=document.getElementById('sz');
  const setW=()=>{document.getElementById('dlO').textContent=pl(st.dl)+(Number.isInteger(st.dl)?',0':'')+' m';document.getElementById('szO').textContent=pl(st.sz)+(Number.isInteger(st.sz)?',0':'')+' m'};
  dl.addEventListener('input',()=>{st.dl=+dl.value;setW();rysuj()});
  sz.addEventListener('input',()=>{st.sz=+sz.value;setW();rysuj()});
  document.getElementById('presety').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;st.dl=+b.dataset.d;st.sz=+b.dataset.s;dl.value=st.dl;sz.value=st.sz;setW();rysuj()});
  document.querySelectorAll('.dodatki input').forEach(c=>c.addEventListener('change',()=>{st.dod=[...document.querySelectorAll('.dodatki input:checked')].map(x=>x.value);rysuj()}));
  document.querySelectorAll('.karta[data-typ]').forEach(a=>a.addEventListener('click',()=>{const b=document.querySelector('#kalkulator .chipy[data-p="typ"] button[data-v="'+a.dataset.typ+'"]');if(b)b.click()}));
  document.getElementById('doZap').addEventListener('click',()=>{const o=document.getElementById('opis');if(o)o.value=tekst()+(o.value&&!o.value.startsWith('Konfiguracja')?'\n\n'+o.value:'\n\n')});
  rysuj();
  return {tekst};
})();

/* mapa realizacji - tylko lokalizacje z materialow firmy */
(function(){
  const R=[
    {m:'Bydgoszcz',h:'Biurowiec modułowy 185 m²',p:'Przestronne biuro modułowe z elewacją z białych kasetonów stalowych.',ll:[53.1235,18.0084],f:['bydg1','bydg2']},
    {m:'Lubicz',h:'Biuro modułowe 54 m²',p:'Rozbudowa istniejącego budynku murowanego. Aluminium i szkło selektywne.',ll:[53.0186,18.7486],f:['lubicz1','lubicz2']},
    {m:'Toruń',h:'Biuro Premium w ogrodzie',p:'Stolarka aluminiowa Ponzio, szyby typu lustro weneckie. Montaż w elementach, bez dojazdu ciężkiego sprzętu.',ll:[53.0138,18.5984],f:['torun1','torun2']},
    {m:'Łódź',h:'Portiernia Pelion',p:'Portiernia modułowa z elewacją z termodrewna (thermo sosna) przy siedzibie firmy.',ll:[51.7592,19.456],f:['lodz1','lodz2']},
    {m:'Komorniki',h:'Obudowa tunelu Maxfly',p:'Ocynkowana konstrukcja stalowa, płyta warstwowa i stolarka aluminiowa.',ll:[52.3382,16.8103],f:['komorniki1','komorniki2']},
    {m:'Rabowice',h:'Dom modułowy',p:'Dom modułowy z płyty warstwowej z dachem dwuspadowym.',ll:[52.3927,17.0951],f:['rabowice1','rabowice2']},
    {m:'Częstochowa',h:'Portiernia elektrociepłowni Fortum',p:'Przeszklona portiernia wejściowa z pełną kontrolą dostępu.',ll:[50.8118,19.1203],f:['czest1','czest2']},
    {m:'Poznań',h:'Portiernia kontenerowa (Unilever)',p:'Portiernia z płyty Kingspan QuadCore 120 mm.',ll:[52.4064,16.9252]},
    {m:'Koło',h:'Portiernia Wood-Mizer',p:'Montaż portierni z kasetonami w kolorze firmowym.',ll:[52.2003,18.6381]},
    {m:'Swarzędz',h:'Portiernia i wiata rowerowa CLIP Group',p:'Przeszklona portiernia i wielostanowiskowa wiata rowerowa.',ll:[52.4122,17.0767]},
    {m:'Koźmin Wielkopolski',h:'Sklep firmowy Mlekovita',p:'Obiekt handlowy przy zakładzie produkcyjnym.',ll:[51.8267,17.4547]},
    {m:'Wrocław',h:'Portiernia i wiata WABCO',p:'Przeszklona portiernia wejściowa i wiata dla pracowników.',ll:[51.1079,17.0385]},
    {m:'Warszawa',h:'Biuro modułowe Instytutu Lotnictwa',p:'Jednostka dla Sieci Badawczej Łukasiewicz.',ll:[52.1797,20.9583]},
    {m:'Janki k. Warszawy',h:'Salon Wadowscy Campery',p:'Salon sprzedaży z serwisem przyczep i kamperów.',ll:[52.1189,20.8969]},
    {m:'Kraków',h:'Obiekty dealerskie Volvo i Kia',p:'Realizacje dla Wadowscy, zgodnie ze standardami marek.',ll:[50.0647,19.945]},
    {m:'Leutkirch (Niemcy)',h:'Salon Mercedes-Benz',p:'Kontenerowy salon sprzedaży Autohaus Riess.',ll:[47.8259,10.0218]},
    {m:'Korbach (Niemcy)',h:'Siedziba biurowa Energiezentrum',p:'Biuro w standardzie energooszczędnym dla firmy z branży OZE.',ll:[51.2742,8.8729]},
    {m:'Stuttgart (Niemcy)',h:'Biuro modułowe Caravans Winkler',p:'Przestrzeń sprzedaży kamperów.',ll:[48.8306,9.1092]},
    {m:'Ettlingen (Niemcy)',h:'Pawilon wystawienniczy Škoda',p:'Przeszklony showroom modułowy.',ll:[48.9408,8.4075]},
    {m:'Langenhagen (Niemcy)',h:'Hannover Airport',p:'Strefa treningowa dla personelu lotniska.',ll:[52.4611,9.6851]},
    {m:'Hausen (Niemcy)',h:'Biura YT Industries',p:'Kontenery biurowe na terenie Pilatus Campus.',ll:[49.6967,11.0331]}
  ];
  const BAZA={m:'Kowanówko k. Obornik',h:'Siedziba i produkcja',p:'ul. Łąkowa 21, 64-600 Oborniki. Stąd wyjeżdża każdy obiekt.',ll:[52.6585,16.8402]};
  const img=document.getElementById('krImg'),nast=document.getElementById('krNast'),pop=document.getElementById('krPop'),nav=document.getElementById('krNav'),licz=document.getElementById('krI'),lista=document.getElementById('krLista');
  const ustaw=src=>{if(img.getAttribute('src')===src)return;img.classList.add('zm');const n=new Image();n.onload=n.onerror=()=>{img.src=src;requestAnimationFrame(()=>img.classList.remove('zm'))};n.src=src};
  const krok=d=>{if(!akt||!akt.f)return;fi=(fi+d+akt.f.length)%akt.f.length;ustaw('img/'+akt.f[fi]+'.webp');licz.textContent=(fi+1)+' / '+akt.f.length};
  let akt=null,fi=0,mk=[];
  function pokaz(r){
    akt=r;fi=0;
    document.getElementById('krM').textContent=r.m;document.getElementById('krH').textContent=r.h;document.getElementById('krP').textContent=r.p;
    const fo=document.querySelector('.kr-foto');
    if(r.f){fo.hidden=false;ustaw('img/'+r.f[0]+'.webp');img.alt=r.h+', '+r.m;nav.hidden=r.f.length<2;licz.textContent='1 / '+r.f.length}else{fo.hidden=true}
    lista.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.m===r.m));
    mk.forEach(x=>{const el=x.m.getElement&&x.m.getElement();if(el&&el.firstChild&&el.firstChild.classList)el.firstChild.classList.toggle('akt',x.r===r)});
  }
  nast.addEventListener('click',()=>krok(1));pop.addEventListener('click',()=>krok(-1));
  R.filter(r=>r.f).forEach(r=>{const b=document.createElement('button');b.type='button';b.textContent=r.m;b.dataset.m=r.m;b.addEventListener('click',()=>{pokaz(r);if(window._mapa)window._mapa.panTo(r.ll)});lista.appendChild(b)});
  pokaz(R[0]);
  const box=document.getElementById('mapa');if(!box||!window.L)return;
  const m=L.map(box,{scrollWheelZoom:false,tap:false,attributionControl:true});window._mapa=m;
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:17,attribution:'© OpenStreetMap'}).addTo(m);
  R.forEach(r=>{
    let mm;
    if(r.f){mm=L.marker(r.ll,{icon:L.divIcon({className:'',html:'<div class="pkt"></div>',iconSize:[18,18],iconAnchor:[9,9]}),zIndexOffset:500})}
    else{mm=L.circleMarker(r.ll,{radius:6,color:'#c9a04a',weight:2,fillColor:'#c9a04a',fillOpacity:.15})}
    mm.addTo(m).bindTooltip(r.m+': '+r.h,{direction:'top',offset:[0,-8]});
    mm.on('click',()=>pokaz(r));mk.push({m:mm,r});
  });
  const b=L.marker(BAZA.ll,{icon:L.divIcon({className:'',html:'<div class="baza"></div>',iconSize:[22,22],iconAnchor:[11,11]}),zIndexOffset:1000}).addTo(m).bindTooltip('Dick Pawilony · Kowanówko',{direction:'right',offset:[10,0]});
  b.on('click',()=>pokaz(BAZA));
  m.fitBounds(L.latLngBounds(R.map(r=>r.ll).concat([BAZA.ll])),{padding:[24,24]});
  pokaz(R[0]);
})();

/* formularz z zalacznikami (bez serwera: konczy sie gotowym mailem / telefonem) */
(function(){
  const f=document.getElementById('form');if(!f)return;
  const inp=document.getElementById('plik'),strefa=document.getElementById('pliki'),ul=document.getElementById('listaPl');
  let pliki=[];
  const kb=n=>n>1048576?pl(n/1048576)+' MB':Math.max(1,Math.round(n/1024))+' kB';
  function lista(){
    ul.innerHTML='';
    pliki.forEach((p,i)=>{
      const li=document.createElement('li');
      if(p.type.startsWith('image/')){const im=document.createElement('img');im.src=URL.createObjectURL(p);im.alt='';li.appendChild(im)}
      else{const s=document.createElement('span');s.className='ik';s.textContent=(p.name.split('.').pop()||'').toUpperCase().slice(0,4);li.appendChild(s)}
      const n=document.createElement('span');n.className='nz';n.textContent=p.name+' · '+kb(p.size);li.appendChild(n);
      const r=document.createElement('button');r.type='button';r.className='rm';r.setAttribute('aria-label','Usuń '+p.name);r.textContent='×';r.addEventListener('click',()=>{pliki.splice(i,1);lista()});li.appendChild(r);
      ul.appendChild(li);
    });
  }
  function dodaj(fl){[...fl].forEach(p=>{if(pliki.length<10&&!pliki.some(x=>x.name===p.name&&x.size===p.size))pliki.push(p)});lista()}
  inp.addEventListener('change',()=>{dodaj(inp.files);inp.value=''});
  ['dragenter','dragover'].forEach(ev=>strefa.addEventListener(ev,e=>{e.preventDefault();strefa.classList.add('nad')}));
  ['dragleave','drop'].forEach(ev=>strefa.addEventListener(ev,e=>{e.preventDefault();strefa.classList.remove('nad')}));
  strefa.addEventListener('drop',e=>dodaj(e.dataTransfer.files));
  f.addEventListener('submit',e=>{
    e.preventDefault();
    const d=Object.fromEntries(new FormData(f));const bl=document.getElementById('blad');
    if(!d.imie||!d.imie.trim()){bl.textContent='Podaj imię lub nazwę firmy.';return}
    if(!(d.tel||'').trim()&&!(d.mail||'').trim()){bl.textContent='Podaj telefon albo e-mail, żebyśmy mogli odpowiedzieć.';return}
    if(!f.zgoda.checked){bl.textContent='Zaznacz zgodę na przetwarzanie danych.';return}
    bl.textContent='';
    let opis=(d.opis||'').trim();if(!opis&&KALK)opis=KALK.tekst();
    const t='Zapytanie o wycenę\n\nImię / firma: '+d.imie.trim()+(d.tel?'\nTelefon: '+d.tel:'')+(d.mail?'\nE-mail: '+d.mail:'')+(d.miejsce?'\nMiejscowość inwestycji: '+d.miejsce:'')+'\n\n'+opis+(pliki.length?'\n\nZałączniki: '+pliki.map(p=>p.name).join(', '):'');
    document.getElementById('wynikTxt').textContent=t;
    document.getElementById('wynikT').textContent=pliki.length?'W wersji docelowej zapytanie i pliki ('+pliki.length+') trafią od razu do biura. W tej wizualizacji możesz wysłać je e-mailem, pliki dołącz w otwartej wiadomości.':'W wersji docelowej zapytanie trafi od razu do biura. W tej wizualizacji możesz wysłać je e-mailem albo zadzwonić.';
    document.getElementById('wynikMail').href='mailto:kontakt@dickpawilony.pl?subject='+encodeURIComponent('Zapytanie o wycenę - '+d.imie.trim())+'&body='+encodeURIComponent(t);
    f.hidden=true;const w=document.getElementById('wynik');w.hidden=false;w.scrollIntoView({behavior:'smooth',block:'center'});
  });
})();

/* dolny pasek na telefonie dopiero po przewinieciu za przycisk w hero */
(function(){
  const m=document.querySelector('.mob'),t=document.querySelector('.hero-cta');if(!m)return;
  if(!t||!('IntersectionObserver' in window)){m.classList.add('widac');return}
  new IntersectionObserver(w=>w.forEach(x=>m.classList.toggle('widac',!x.isIntersecting&&x.boundingClientRect.top<0)),{threshold:0}).observe(t);
  const kl=document.querySelector('.kalk-l'),kp=document.getElementById('podsumowanie');if(!kl||!kp)return;
  let wL=false,wP=false;const ak=()=>{const on=wL&&!wP;m.classList.toggle('wkalk',on);m.classList.toggle('wpod',wP);m.querySelector('.mob-k').setAttribute('aria-hidden',!on);m.querySelector('.mob-k a').tabIndex=on?0:-1};
  new IntersectionObserver(w=>w.forEach(x=>{if(x.target===kl)wL=x.isIntersecting;else wP=x.isIntersecting;ak()}),{rootMargin:'-64px 0px -80px 0px'}).observe(kl);
  new IntersectionObserver(w=>w.forEach(x=>{wP=x.intersectionRatio>.25;ak()}),{threshold:[0,.25,.5]}).observe(kp);
})();
