"use strict";for(var scrollTrigger=document.querySelectorAll('a[href^="#"]'),_loop=function(r){scrollTrigger[r].addEventListener("click",function(e){e.preventDefault();e=scrollTrigger[r].getAttribute("href"),e=+(document.getElementById(e.replace("#","")).getBoundingClientRect().top+window.pageYOffset);window.scrollTo({top:e,behavior:"smooth"})})},i=0;i<scrollTrigger.length;i++)_loop(i);