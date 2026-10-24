document.querySelectorAll<HTMLElement>('[data-unit-profile]').forEach(profile=>{
  const tabs=Array.from(profile.querySelectorAll<HTMLButtonElement>('[data-unit-tab]'));
  const panels=Array.from(profile.querySelectorAll<HTMLElement>('[data-unit-panel]'));
  function activate(name:string,focus=false){
    const next=tabs.find(tab=>tab.dataset.unitTab===name);if(!next)return;
    tabs.forEach(tab=>{const active=tab===next;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;});
    panels.forEach(panel=>panel.hidden=panel.dataset.unitPanel!==name);
    if(focus)next.focus();
  }
  tabs.forEach((tab,index)=>{
    tab.addEventListener('click',()=>activate(tab.dataset.unitTab!));
    tab.addEventListener('keydown',event=>{
      let next=index;
      if(event.key==='ArrowRight')next=(index+1)%tabs.length;
      else if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;
      else if(event.key==='Home')next=0;
      else if(event.key==='End')next=tabs.length-1;
      else return;
      event.preventDefault();activate(tabs[next].dataset.unitTab!,true);
    });
  });
  profile.querySelectorAll<HTMLButtonElement>('[data-unit-jump]').forEach(button=>button.addEventListener('click',()=>activate(button.dataset.unitJump!,true)));
  profile.dataset.ready='true';
});
