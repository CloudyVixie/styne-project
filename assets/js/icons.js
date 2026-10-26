function buildIconGrid(containerId, icons, selected, onSelect){
  const el=document.getElementById(containerId); if(!el) return;
  let cur=selected;
  el.innerHTML=icons.map(icon=>
    `<span class="i-opt${icon===cur?' sel':''}" onclick="pickIcon(this,'${containerId}','${icon}')">${icon}</span>`
  ).join('');
  el._cb=onSelect;
}
function pickIcon(el,cid,icon){
  document.querySelectorAll(`#${cid} .i-opt`).forEach(e=>e.classList.remove('sel'));
  el.classList.add('sel');
  const c=document.getElementById(cid); if(c?._cb) c._cb(icon);
}
