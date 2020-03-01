!function(t){var e={};function r(n){if(e[n])return e[n].exports;var a=e[n]={i:n,l:!1,exports:{}};return t[n].call(a.exports,a,a.exports,r),a.l=!0,a.exports}r.m=t,r.c=e,r.d=function(t,e,n){r.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:n})},r.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},r.t=function(t,e){if(1&e&&(t=r(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var a in t)r.d(n,a,function(e){return t[e]}.bind(null,a));return n},r.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return r.d(e,"a",e),e},r.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},r.p="/",r(r.s=0)}([function(t,e,r){"use strict";function n(t,e){this.width=800,this.height=800,this.currentIndex=0,this.canvasList=[],this.currentCanvas,this.container=t,this.tainted=!1,this.number=e,this.count=0,this.getMetadata=function(){return{width:this.width,height:this.height,currentIndex:this.currentIndex,number:this.number}},this.getCurrCanvas=function(){return this.canvasList[this.currentIndex]},this.setupNewLayer=function(){var t=document.createElement("canvas");if(t.id="frame"+this.number+"canvas"+this.count,a(t,this.width,this.height),0===this.count&&(t.style.opacity=.97,t.style.zIndex=1),document.getElementById(this.container).appendChild(t),0===this.count&&(this.currentCanvas=t),this.count>=1){var e=document.getElementById(this.canvasList[0].id),r=e.offsetTop,n=e.offsetLeft;t.style.top=r,t.style.left=n}this.canvasList.push(t),this.count++},this.hide=function(){this.canvasList.forEach((function(t){t.style.zIndex=-1,t.style.visibility="hidden"}))},this.show=function(){this.canvasList.forEach((function(t){t.style.zIndex=1,t.style.visibility=""}))},this.copyCanvas=function(){var e=document.createElement("canvas");e.id="frame"+this.number+"canvas"+this.count,a(e,this.width,this.height),this.canvasList[this.count-1].style.opacity=.92,document.getElementById(t).appendChild(e);var r=document.getElementById(this.canvasList[0].id),n=r.offsetTop,i=r.offsetLeft;e.style.top=n,e.style.left=i,e.getContext("2d").drawImage(this.currentCanvas,0,0),this.canvasList.push(e),this.count++},this.clearCurrentLayer=function(){var t=this.getCurrCanvas(),e=t.getContext("2d");e.clearRect(0,0,t.getAttribute("width"),t.getAttribute("height")),e.fillStyle="#FFFFFF",e.fillRect(0,0,t.getAttribute("width"),t.getAttribute("height"))},this.resetFrame=function(){}}function a(t,e,r){t.style.position="absolute",t.style.border="1px #000 solid",t.style.zIndex=0,t.style.opacity=0,t.setAttribute("width",e),t.setAttribute("height",r),t.getContext("2d").fillStyle="rgba(255,255,255,255)",t.getContext("2d").fillRect(0,0,e,r)}r.r(e),document.addEventListener("DOMContentLoaded",(function(){$("html").css("display","block")}));let o=new function(t){this.name="",this.currentFrame=0,this.speed=100,this.frameList=[],this.mode=0,this.onionSkinFrame=function(t){var e=document.createElement("canvas");return e.id="onionSkinCanvas",a(e,800,800),e.style.opacity=.97,e.style.zIndex=-1,document.getElementById(t).appendChild(e),e}(t),this.onionSkinFrame.style.display="none",this.container=t,this.resetProject=function(){this.frameList.forEach((function(t,e){var r=document.getElementById(t.container);t.canvasList.forEach((function(t,e){e>0&&r.removeChild(t)})),t.canvasList=[t.canvasList[0]],0===e&&(t.currentIndex=0,t.currentCanvas=t.canvasList[0])})),this.frameList=[this.frameList[0]],this.frameList[0].clearCurrentLayer(),this.currentFrame=0,this.mode=0,this.speed=100},this.addNewFrame=function(t){var e=new n(this.container,this.frameList.length);e.setupNewLayer(),this.frameList.push(e),t||e.hide()},this.nextFrame=function(){return this.frameList.length===this.currentFrame+1?null:(this.currentFrame+=1,this.frameList[this.currentFrame])},this.prevFrame=function(){return this.currentFrame-1<0?null:(this.currentFrame-=1,this.frameList[this.currentFrame])},this.getCurrFrame=function(){return this.frameList[this.currentFrame]},this.updateOnionSkin=function(){if(!(this.currentFrame-1<0)){this.onionSkinFrame.style.display="";var t=this.onionSkinFrame.getContext("2d");t.clearRect(0,0,this.onionSkinFrame.width,this.onionSkinFrame.height);var e=t.getImageData(0,0,this.onionSkinFrame.width,this.onionSkinFrame.height);this.frameList[this.currentFrame-1].canvasList.forEach((function(r){for(var n=r.getContext("2d").getImageData(0,0,r.width,r.height).data,a=0;a<n.length;a+=4)255===n[a]&&255===n[a+1]&&255===n[a+2]||(e.data[a]=n[a],e.data[a+1]=n[a+1],e.data[a+2]=n[a+2],e.data[a+3]=255);t.putImageData(e,0,0)})),this.onionSkinFrame.style.zIndex=0,this.onionSkinFrame.style.opacity=.92}}}("canvasArea");o.addNewFrame(!0);let s=o.getCurrFrame(),u=new function(t){this.previousCanvas=void 0,this.currentCanvasSnapshots=[],this.selectedBrush="default",this.currColor="#000",this.currColorArray=Uint8Array.from([0,0,0,0]),this.currSize=2;var e,r=[],n=[],a=[],i=[],o=[],s=this;function u(e,r){var n=t.getCurrFrame().currentCanvas.getContext("2d"),a=n.createRadialGradient(e,r,s.currSize,e,r,1.5*s.currSize),i=s.currColorArray;a.addColorStop(0,s.currColor),void 0!==i?(a.addColorStop(.5,"rgba("+i[0]+","+i[1]+","+i[2]+",.5)"),a.addColorStop(1,"rgba("+i[0]+","+i[1]+","+i[2]+",0)")):(a.addColorStop(.5,"rgba(0,0,0,.5)"),a.addColorStop(1,"rgba(0,0,0,0)")),n.fillStyle=a,n.fillRect(e-20,r-20,40,40)}function c(){var e=t.getCurrFrame().getCurrCanvas().id;$("#"+e).off("mousedown"),$("#"+e).off("mouseup"),$("#"+e).off("mousemove")}function l(t,e,u){r.push(t),n.push(e),a.push(u),i.push(s.currColor),o.push(s.currSize)}function h(e){var s=t.getCurrFrame().currentCanvas.getContext("2d");s.lineJoin="round";for(var u=0;u<r.length;u++)s.beginPath(),a[u]&&u?s.moveTo(r[u-1],n[u-1]):s.moveTo(r[u],n[u]+1),s.lineTo(r[u],n[u]),s.closePath(),s.strokeStyle=i[u],s.lineWidth=o[u],s.stroke()}this.changeBrushSize=function(t){this.currSize=t},this.defaultBrush=function(){c();var u,d=t.getCurrFrame();$("#"+d.currentCanvas.id).on("mousedown touchstart",(function(t){if(1===t.which&&"mousedown"===t.type||"touchstart"===t.type){if(s.previousCanvas!==d.currentCanvas&&(s.previousCanvas=d.currentCanvas,s.currentCanvasSnapshots=[]),e&&s.currentCanvasSnapshots.push(e),u=!0,"touchstart"===t.type){var r=t.target.getBoundingClientRect();t.offsetX=t.originalEvent.touches[0].pageX-r.left,t.offsetY=t.originalEvent.touches[0].pageY-r.top}l(t.offsetX,t.offsetY,!0),h(d)}})),$("#"+d.currentCanvas.id).on("mousemove touchmove",(function(t){if(u){if("touchmove"===t.type){var e=t.target.getBoundingClientRect();t.offsetX=t.originalEvent.touches[0].pageX-e.left,t.offsetY=t.originalEvent.touches[0].pageY-e.top,t.preventDefault()}l(t.offsetX,t.offsetY,!0),h(d)}})),$("#"+d.currentCanvas.id).on("mouseup touchend",(function(t){if(s.previousCanvas===d.currentCanvas){var c=d.currentCanvas,l=c.width,h=c.height;e=d.currentCanvas.getContext("2d").getImageData(0,0,l,h)}r=[],n=[],a=[],i=[],o=[],u=!1})),$("#"+d.currentCanvas.id).mouseleave((function(t){u=!1}))},this.radialGradBrush=function(){c();var e,r=t.getCurrFrame(),n=r.currentCanvas.id,a=r.currentCanvas.getContext("2d");a.lineJoin=a.lineCap="round",$("#"+n).mousedown((function(t){1===t.which&&(e=!0,u(t.offsetX,t.offsetY))})),$("#"+n).mousemove((function(t){e&&u(t.offsetX,t.offsetY)})),$("#"+n).mouseup((function(t){if(e=!1,s.previousCanvas===r.currentCanvas){var n=r.currentCanvas,a=n.width,i=n.height;s.currentCanvasSnapshots.push(r.currentCanvas.getContext("2d").getImageData(0,0,a,i))}})),$("#"+n).mouseleave((function(t){e=!1}))}}(o);u.defaultBrush();let c=new function(t,e,r){var n,a=null;this.timePerFrame=200,this.layerMode=!0,this.htmlCounter="",this.setCounter=function(t){this.htmlCounter=document.getElementById(t)},this.up=function(){var t=r.getCurrFrame();return t.currentIndex+1<t.canvasList.length&&(t.currentCanvas.style.opacity=.92,t.currentCanvas.style.zIndex=0,t.currentIndex>0&&(t.canvasList[t.currentIndex-1].style.opacity=0,t.canvasList[t.currentIndex-1].style.zIndex=0),t.canvasList[t.currentIndex+1].style.opacity=.97,t.canvasList[t.currentIndex+1].style.zIndex=1,t.currentCanvas=t.canvasList[t.currentIndex+1],t.currentIndex++,e.defaultBrush(),!0)},this.down=function(){var t=r.getCurrFrame();return t.currentIndex-1>=0&&(t.currentCanvas.style.opacity=0,t.currentCanvas.style.zIndex=0,t.canvasList[t.currentIndex-1].style.opacity=.97,t.canvasList[t.currentIndex-1].style.zIndex=1,t.currentIndex-2>=0&&(t.canvasList[t.currentIndex-2].style.opacity=.92),t.currentCanvas=t.canvasList[t.currentIndex-1],t.currentIndex--,e.defaultBrush(),!0)},this.nextFrame=function(){var t=r.getCurrFrame(),n=r.nextFrame();return null!==n&&(t.hide(),n.show(),r.updateOnionSkin(),e.defaultBrush(),!0)},this.prevFrame=function(){var t=r.getCurrFrame(),n=r.prevFrame();return null!==n&&(t.hide(),n.show(),r.updateOnionSkin(),e.defaultBrush(),!0)},this.addPage=function(){r.getCurrFrame().setupNewLayer()},this.setKeyDown=function(t){var e=this,n=this.htmlCounter;$(t).keydown((function(t){var a="";switch(t.which){case 37:if(e.down()){var i=r.getCurrFrame();a="frame: "+(r.currentFrame+1)+", layer: "+(i.currentIndex+1)}break;case 39:if(e.up()){i=r.getCurrFrame();a="frame: "+(r.currentFrame+1)+", layer: "+(i.currentIndex+1)}break;case 32:e.layerMode?e.addPage():r.addNewFrame();break;case 65:if(e.prevFrame()){i=r.getCurrFrame();a="frame: "+(r.currentFrame+1)+", layer: "+(i.currentIndex+1)}break;case 68:if(e.nextFrame()){i=r.getCurrFrame();a="frame: "+(r.currentFrame+1)+", layer: "+(i.currentIndex+1)}}e.htmlCounter&&a&&(n.textContent=a),t.preventDefault()}))},this.insertLayer=function(t){$("#"+t).click((function(){var t=r.getCurrFrame();t.setupNewLayer();var e=t.canvasList.pop();t.canvasList.splice(t.currentIndex+1,0,e)}))},this.deleteLayer=function(t){var e=this;$("#"+t).click((function(){var t=r.getCurrFrame(),n=t.currentIndex,a=t.currentCanvas.id,i=document.getElementById(a).parentNode;if(t.currentIndex+1<t.canvasList.length)e.up(),t.canvasList.splice(n,1),i.removeChild(document.getElementById(a)),t.currentIndex-=1;else if(t.currentIndex-1>=0)e.down(),t.canvasList.splice(n,1),i.removeChild(document.getElementById(a)),e.htmlCounter&&(e.htmlCounter.textContent="frame: "+(r.currentFrame+1)+", layer:"+(t.currentIndex+1));else{var o=t.currentCanvas.getContext("2d");o.clearRect(0,0,t.currentCanvas.getAttribute("width"),t.currentCanvas.getAttribute("height")),o.fillStyle="#fff",o.fillRect(0,0,t.currentCanvas.getAttribute("width"),t.currentCanvas.getAttribute("height"))}}))},this.addNewFrameButton=function(t){$("#"+t).click((function(){r.addNewFrame()}))},this.createColorWheel=function(t,r){var n=document.getElementById(t),a=document.createElement("canvas");a.id="colorWheel",a.setAttribute("width",r),a.setAttribute("height",r);for(var i=a.getContext("2d"),o=a.width/2,s=a.height/2,u=0;u<=5600;u++){var c=(u-2)*Math.PI/180,l=u*Math.PI/180;i.beginPath(),i.moveTo(o,s),i.arc(o,s,90,c,l,!1),i.closePath();var h=i.createRadialGradient(o,s,0,c,l,90);h.addColorStop(0,"hsla("+u+", 10%, 100%, 1)"),h.addColorStop(1,"hsla("+u+", 100%, 50%, 1)"),i.fillStyle=h,i.fill()}i.fillStyle="#000",i.fillRect(0,0,8,8),i.fillRect(10,0,8,8),i.fillStyle="#fff",i.fillRect(11,0,6,7),n.appendChild(a);var d=document.createElement("p");d.style.textAlign="center",d.id="colorPicked",d.textContent="pick a color! :)",n.appendChild(d),$("#"+a.id).mousedown((function(t){var r=t.offsetX,n=t.offsetY,i=document.getElementById(a.id).getContext("2d").getImageData(r,n,1,1).data,o=document.getElementById(d.id);i[0]>10&&i[1]>200?$("#"+d.id).css("color","#000"):$("#"+d.id).css("color","#FFF"),o.textContent="rgb("+i[0]+","+i[1]+","+i[2]+")",$("#"+d.id).css({"background-color":o.textContent}),e.currColorArray=i,e.currColor="rgb("+i[0]+","+i[1]+","+i[2]+")"}))},this.floodFill=function(t){$("#"+t).click((function(){var t=r.getCurrFrame(),n=function(r){var a=e.currColor,i=a.substring(a.indexOf("(")+1,a.length-1).split(",");i=i.map((function(t){return parseInt(t)}));var o=r.pageX-$("#"+t.currentCanvas.id).offset().left,s=r.pageY-$("#"+t.currentCanvas.id).offset().top,u=document.getElementById(t.currentCanvas.id).getContext("2d").getImageData(o,s,1,1).data,c="rgb("+u[0]+","+u[1]+","+u[2]+")";console.log(c);var l={x:Math.floor(o),y:Math.floor(s),color:c};!function(t,e,r){var n=[],a={},i=r.color,o=document.getElementById(t.id).getContext("2d"),s=o.getImageData(0,0,t.width,t.height),u=s.data;n.push(r);for(;0!==n.length;){var c=n.pop();a[c.x+","+c.y]=1;var l,h,d,f=c.x-1,v=c.x+1,g=c.y-1,m=c.y+1;g>=0&&void 0===a[c.x+","+g]&&(l=g*t.width*4+4*(c.x+1),d=(h=l+1)+1,i==="rgb("+u[l]+","+u[h]+","+u[d]+")"&&n.push({x:c.x,y:g,color:c.color})),v<t.width&&void 0===a[v+","+c.y]&&(l=c.y*t.width*4+4*(v+1),d=(h=l+1)+1,i==="rgb("+u[l]+","+u[h]+","+u[d]+")"&&n.push({x:v,y:c.y,color:c.color})),m<t.height&&void 0===a[c.x+","+m]&&(l=m*t.width*4+4*(c.x+1),d=(h=l+1)+1,i==="rgb("+u[l]+","+u[h]+","+u[d]+")"&&n.push({x:c.x,y:m,color:c.color})),f>=0&&void 0===a[f+","+c.y]&&(l=c.y*t.width*4+4*(f+1),d=(h=l+1)+1,i==="rgb("+u[l]+","+u[h]+","+u[d]+")"&&n.push({x:f,y:c.y,color:c.color})),l=c.y*t.width*4+4*(c.x+1),d=(h=l+1)+1,u[l]=e[0],u[h]=e[1],u[d]=e[2]}o.putImageData(s,0,0)}(t.currentCanvas,i,l),t.currentCanvas.removeEventListener("click",n)};t.currentCanvas.addEventListener("click",n)}))},this.rotateImage=function(t){$("#"+t).click((function(){var t=r.getCurrFrame(),e=t.currentCanvas.getAttribute("width"),n=t.currentCanvas.getAttribute("height"),a=t.currentCanvas.getContext("2d");Promise.all([createImageBitmap(t.currentCanvas,0,0,e,n)]).then((function(t){a.clearRect(0,0,e,n),a.translate(e/2,n/2),a.rotate(Math.PI/180),a.translate(-e/2,-n/2),a.drawImage(t[0],0,0)}))}))},this.setClearCanvas=function(t){$("#"+t).click((function(){var t=r.getCurrFrame(),e=t.currentCanvas.getContext("2d");e.clearRect(0,0,t.currentCanvas.getAttribute("width"),t.currentCanvas.getAttribute("height")),e.fillStyle="#FFFFFF",e.fillRect(0,0,t.currentCanvas.getAttribute("width"),t.currentCanvas.getAttribute("height"))}))},this.undo=function(t){$("#"+t).click((function(){var t=r.getCurrFrame(),n=t.currentCanvas.getContext("2d"),a=t.currentCanvas.getAttribute("width"),i=t.currentCanvas.getAttribute("height");if(e.currentCanvasSnapshots.unshift(n.getImageData(0,0,a,i)),n.clearRect(0,0,a,i),e.currentCanvasSnapshots.length>=1){var o=e.currentCanvasSnapshots.pop();n.putImageData(o,0,0)}}))},this.importImage=function(t){$("#"+t).click((function(){var t,a=r.getCurrFrame();function i(t){var r=new Image,i=new FileReader,o=t.target.files[0];o.type.match(/image.*/)?(r.onload=function(){var t=a.currentCanvas,i=t.getContext("2d"),o=r.height,s=r.width;r.width-r.height>=100?(t.setAttribute("height",Math.floor(720)),t.setAttribute("width",Math.floor(800*1.1)),o=t.height,s=t.width):r.height-r.width>=200?(t.setAttribute("width",Math.floor(720)),t.setAttribute("height",Math.floor(800*1.1)),o=t.height,s=t.width):(o=a.height,s=a.width,t.setAttribute("height",o),t.setAttribute("width",s)),i.drawImage(r,0,0,s,o),n=r,e.currentCanvasSnapshots.push(i.getImageData(0,0,s,o))},i.onloadend=function(){r.src=i.result},i.readAsDataURL(o)):console.log("not a valid image")}(t=document.createElement("input")).type="file",t.addEventListener("change",i,!1),t.click()}))},this.resetImage=function(){if(n){var t=r.getCurrFrame(),e=t.currentCanvas.getContext("2d"),a=t.currentCanvas.getAttribute("height"),i=t.currentCanvas.getAttribute("width");e.drawImage(n,0,0,i,a)}},this.download=function(e){$("#"+e).click((function(){document.getElementById(t.currentCanvas.id).toBlob((function(t){var e=URL.createObjectURL(t),r=document.createElement("a");r.href=e;var n=prompt("please enter a name for the file");null!==n&&(r.download=n,r.click())}))}))};var i=this,o=function(){i.nextFrame()&&(i.htmlCounter&&(i.htmlCounter.textContent="frame: "+(r.currentFrame+1)+", layer: "+(t.currentIndex+1)))},s=function(){i.prevFrame()&&(i.htmlCounter&&(i.htmlCounter.textContent="frame: "+(r.currentFrame+1)+", layer: "+(t.currentIndex+1)))};this.playForward=function(){clearInterval(a),a=null,a=setInterval(o,this.timePerFrame)},this.playBackward=function(){clearInterval(a),a=null,a=setInterval(s,this.timePerFrame)},this.stop=function(){clearInterval(a),a=null},this.getGif=function(t){t&&(document.getElementById(t).textContent="now loading...");for(var e=new GIF({workers:2,quality:10}),n=0;n<r.frameList.length;n++){var a=document.createElement("canvas");a.width=800,a.height=800;var i=a.getContext("2d");i.fillStyle="white",i.fillRect(0,0,800,800);for(var o=i.getImageData(0,0,a.width,a.height),s=r.frameList[n],u=0;u<s.canvasList.length;u++){for(var c=s.canvasList[u],l=c.getContext("2d").getImageData(0,0,c.width,c.height).data,h=0;h<l.length;h+=4)255===l[h]&&255===l[h+1]&&255===l[h+2]||(o.data[h]=l[h],o.data[h+1]=l[h+1],o.data[h+2]=l[h+2],o.data[h+3]=255);i.putImageData(o,0,0)}e.addFrame(a,{delay:this.timePerFrame})}e.on("finished",(function(e){document.getElementById(t).textContent="";var r=URL.createObjectURL(e);window.open(r)})),e.render()},this.save=function(t){$("#"+t).click((function(){var t=prompt("name of file: ");if(""===t)t="funSketch_saveFile";else if(null===t)return;var e=[];r.frameList.forEach((function(t){var r=t.getMetadata();r.layers=[],t.canvasList.forEach((function(t){var e={id:t.id,width:t.getAttribute("height"),height:t.getAttribute("width"),zIndex:t.style.zIndex,opacity:t.style.opacity};e.imageData=t.toDataURL(),r.layers.push(e)})),e.push(JSON.stringify(r))}));var n="[\n";n+=e.join(",\n"),n+="\n]";var a=new Blob([n],{type:"application/json"}),i=URL.createObjectURL(a),o=document.createElement("a");o.href=i,o.download=t+".json",o.click()}))},this.importProject=function(e,n){var a=this;$("#"+e).click((function(){var e;function n(e){var n=new FileReader,i=e.target.files[0];n.onload=function(e){var n;try{n=JSON.parse(e.target.result)}catch(e){return}n[0]&&(n[0].name||n[0].height||n[0].width||n[0].data)?(r.resetProject(),a.htmlCounter&&(a.htmlCounter.textContent="frame: "+(r.currentFrame+1)+", layer: "+(t.currentIndex+1)),n.forEach((function(t,e){e>0&&r.addNewFrame();var n=r.frameList[e];console.log("need to add "+t.layers.length+" layers for frame: "+(e+1));var a=t.layers,i=n.canvasList;a.forEach((function(t,n){n+1>i.length&&(console.log("need to add a new layer for frame: "+e),r.frameList[e].setupNewLayer());var a=r.frameList[e].canvasList[n];a.style.opacity=t.opacity,a.style.zIndex=t.zIndex,a.height=t.height,a.width=t.width,function(e,r){r.onload=function(){e.drawImage(r,0,0)},r.src=t.imageData}(a.getContext("2d"),new Image)}))}))):console.log("it appears to not be a valid project! :<")},n.readAsText(i)}(e=document.createElement("input")).type="file",e.addEventListener("change",n,!1),e.click()}))}}(s,u,o);c.setCounter("count"),c.setKeyDown(document),c.createColorWheel("colorPicker",200),c.floodFill("floodfill"),c.insertLayer("insertCanvas"),c.deleteLayer("deleteCanvas","count"),c.setClearCanvas("clearCanvas"),c.rotateImage("rotateCanvasImage"),c.undo("undo"),c.download("download"),c.importImage("importImage"),c.save("saveWork"),c.importProject("importProject","count"),c.addNewFrameButton("addNewFrame"),document.getElementById("goLeft").addEventListener("click",()=>{if(c.down()){let t=o.getCurrFrame();document.getElementById("count").textContent="frame: "+(o.currentFrame+1)+", layer: "+(t.currentIndex+1)}}),document.getElementById("goRight").addEventListener("click",()=>{if(c.up()){let t=o.getCurrFrame();document.getElementById("count").textContent="frame: "+(o.currentFrame+1)+", layer: "+(t.currentIndex+1)}}),document.getElementById("prevFrame").addEventListener("click",()=>{if(c.prevFrame()){let t=o.getCurrFrame();document.getElementById("count").textContent="frame: "+(o.currentFrame+1)+", layer: "+(t.currentIndex+1)}}),document.getElementById("nextFrame").addEventListener("click",()=>{if(c.nextFrame()){let t=o.getCurrFrame();document.getElementById("count").textContent="frame: "+(o.currentFrame+1)+", layer: "+(t.currentIndex+1)}}),document.getElementById("generateGif").addEventListener("click",()=>{c.getGif("loadingScreen")}),document.getElementById("toggleLayerOrFrame").addEventListener("click",()=>{element=document.getElementById("toggleLayerOrFrame"),c.layerMode?(c.layerMode=!1,element.textContent="toggle layer addition on spacebar press"):(c.layerMode=!0,element.textContent="toggle frame addition on spacebar press")});new function(t,e){var r,n=this;function a(e,r){var n=t.currentCanvas.getContext("2d");n.lineJoin="round",n.lineWidth=5,n.beginPath(),n.moveTo(e,r),n.lineTo(e+2,r+1),n.closePath(),n.strokeStyle="#000",n.stroke()}function o(e,r,n,a){for(var i=e.data,o=Math.sqrt(i.length/4),s=Math.sqrt(i.length/4),u=new Uint8ClampedArray(i),c=0,l=0;l<o;l++)for(var h=2*l/o-1,d=h*h,f=0;f<s;f++){var v=4*c,g=2*f/s-1,m=g*g,C=Math.sqrt(m+d);if(0<=C&&C<=1){var y=Math.sqrt(1-C*C);if((y=(C+(1-y))/2)<=1){var p=Math.atan2(h,g),x=y*Math.cos(p),F=y*Math.sin(p),w=Math.floor((x+1)*s/2),I=Math.floor((F+1)*o/2);srcPos=s*I+w,srcPos*=4,i[v]=u[srcPos],i[v+1]=u[srcPos+1],i[v+2]=u[srcPos+2],i[v+3]=u[srcPos+3]}}c++}t.currentCanvas.getContext("2d").putImageData(e,r-a,n-a)}function s(t,e,r,n,a,i,o){var s=Math.abs(t-n)<=o,u=Math.abs(e-a)<=o,c=Math.abs(r-i)<=o;return!!(s&&u&&c)}function u(t,e,r,n,a){this.x=t,this.y=e,this.r=r,this.g=n,this.b=a}function c(t,e){this.data=[t.x,t.y],this.point=t,this.dim=e,this.left=null,this.right=null}function l(t,e,r){if(4*e*r<t)return{};var n=Math.floor(t/4),a=Math.floor(n/e);return{x:n-a*e,y:a}}function h(t,e,r,n){return Math.pow(t-e,2)+Math.pow(r-n,2)}function d(t,e,r){var n={};return n.nearestNeighbor=t.point,n.minDist=h(t.data[0],e,t.data[1],r),function t(e,r,n,a){if(o=e,null===o.left&&null===o.right){var i=h(e.data[0],n,e.data[1],a);i<r.minDist&&(r.nearestNeighbor=e.point,r.minDist=i)}else{if(currDist=h(e.data[0],n,e.data[1],a),currDist<r.minDist&&(r.nearestNeighbor=e.point,r.minDist=currDist),e.left&&!e.right)t(e.left,r,n,a);else(0===e.dim?n:a)===n?n>e.data[0]?(t(e.right,r,n,a),n-r.minDist<e.data[0]&&t(e.left,r,n,a)):(t(e.left,r,n,a),n+r.minDist>e.data[0]&&t(e.right,r,n,a)):a>e.data[1]?(t(e.right,r,n,a),a-r.minDist<e.data[1]&&t(e.left,r,n,a)):(t(e.left,r,n,a),a+r.minDist>e.data[1]&&t(e.right,r,n,a))}var o}(t,n,e,r),n.nearestNeighbor}this.filterCanvas=function(n){var a=t.currentCanvas.getContext("2d"),i=t.currentCanvas.getAttribute("width"),o=t.currentCanvas.getAttribute("height"),s=a.getImageData(0,0,i,o);r&&e.currentCanvasSnapshots.push(r),n(s),a.putImageData(s,0,0),r=s},this.filterCanvasOption=function(t){this.filterCanvas(this[t])},this.grayscale=function(t){for(var e=t.data,r=0;r<e.length;r+=4){var n=e[r],a=e[r+1],i=e[r+2];e[r]=e[r+1]=e[r+2]=(n+a+i)/3}return t},this.sepia=function(t){for(var e=t.data,r=0;r<e.length;r+=4){var n=e[r],a=e[r+1],i=e[r+2];e[r]=.5*n+.2*a+.3*i,e[r+1]=.2*n+.3*a+.5*i,e[r+2]=.6*n+.3*a+.4*i}return t},this.saturate=function(t){for(var e=t.data,r=.6094*-1.5,n=0;n<e.length;n+=4){var a=e[n],i=e[n+1],o=e[n+2];e[n]=2.0371*a+i*r+-.123*o,e[n+1]=-.4629*a+i*(.6094*-1.5+2.5)+-.123*o,e[n+2]=-.4629*a+i*r+2.377*o}return t},this.swap=function(t){for(var e=t.data,r=0;r<e.length;r+=4){var n=e[r],a=e[r+1],i=e[r+2];e[r]=i,e[r+1]=n,e[r+2]=a}return t},this.banded=function(t){for(var e=t.data,r=0;r<e.length;r+=12){e[r],e[r+1],e[r+2];e[r]="#FFFFFF",e[r+1]="#FFFFFF",e[r+2]="#FFFFFF"}},this.purpleChrome=function(t){for(var e=t.data,r=0;r<e.length;r++){var n=e[r],a=e[r+1],i=e[r+2];e[r+1]=i,e[r+2]=a,e[r]=n}return t},this.purplizer=function(t){for(var e=t.data,r=0;r<e.length;r+=4){var n=e[r],a=e[r+1];e[r+2],e[r+3];a>=n&&(e[r+2]=2*e[r+2],e[r+1]=e[r+2]/2)}return t},this.scary=function(t){for(var e=t.data,r=.6094*-1.5,n=0;n<e.length;n+=4){var a=e[n],i=e[n+1],o=e[n+2];e[n]=1.597*a+i*r+-.9129*o,e[n+1]=-.903*a+i*(.6094*-1.5+2.5)+-.9129*o,e[n+2]=-.903*a+i*r+1.5871*o}return t},this.heatwave=function(t){for(var e=t.data,r=0;r<e.length;r++){var n=e[r],a=e[r+1];e[r+2];a>100&&a<200&&(e[r+1]=0),n<100&&(e[r]=2*e[r])}return t},this.randomize=function(t){for(var e=t.data,r=0;r<e.length;r+=4){var n=Math.floor(5*Math.random()+1),a=e[r],i=e[r+1],o=e[r+2],s=e[r+3];if(255!==a||255!==i||255!==o)switch(n){case 1:r<=2400?(e[r+2400]=a,e[r+2401]=i,e[r+2402]=o,e[r+2403]=s):(e[r-2403]=a,e[r-2402]=i,e[r-2401]=o,e[r-2400]=s);break;case 2:e[r+2400]=a,e[r+2401]=i,e[r+2402]=o,e[r+2403]=s;break;case 3:e[r-4]=a,e[r-3]=i,e[r-2]=o,e[r-1]=s;break;case 4:e[r+4]=a,e[r+5]=i,e[r+6]=o,e[r+7]=s}}return t},this.invert=function(t){for(var e,r,n,a=t.data,i=0;i<a.length;i+=4)e=a[i],r=a[i+1],n=a[i+2],a[i]=255-e,a[i+1]=255-r,a[i+2]=255-n;return t},this.blurry=function(e){var r=e.data,n=4*t.currentCanvas.getAttribute("width");for(i=0;i<r.length;i+=4){var a=null==r[i+4],o=null==r[i-4],s=null==r[i+n],u=null==r[i-n];if(!(a||o||s||u)){var c=.2*r[i+4]+.2*r[i-4]+.2*r[i+n]+.2*r[i-n]+.2*r[i],l=.2*r[i+5]+.2*r[i-3]+.2*r[i+(n+1)]+.2*r[i-(n-1)]+.2*r[i+1],h=.2*r[i+6]+.2*r[i-2]+.2*r[i+(n+2)]+.2*r[i-(n-2)]+.2*r[i+2],d=.2*r[i+7]+.2*r[i-1]+.2*r[i+(n+3)]+.2*r[i-(n-3)]+.2*r[i+3];r[i]=c,r[i+1]=l,r[i+2]=h,r[i+3]=d}}return e},this.outline=function(){var e=t.currentCanvas.getAttribute("width"),r=t.currentCanvas.getAttribute("height"),n=t.currentCanvas.getContext("2d"),i=n.getImageData(0,0,e,r).data,o=0,u=0,c=0,l=4*e;n.clearRect(0,0,e,r),n.fillStyle="#FFF",n.fillRect(0,0,e,r);for(var h=0;h<i.length;h+=4){var d=i[h],f=i[h+1],v=i[h+2];n.lineJoin="round",n.lineWidth=2;var g=i[h-l],m=i[h-(l-1)],C=i[h-(l-2)];void 0===i[h-l]||s(d,f,v,g,m,C,5)||(c<100&&c++,a(o,u)),h%l==0&&u++,o>=e&&(o=0),o++}},this.defaultFisheye=function(){var e=t.currentCanvas.getAttribute("width"),r=t.currentCanvas.getAttribute("height");e===r&&o(t.currentCanvas.getContext("2d").getImageData(0,0,e,r),0,0,0)},this.areaColor=function(e){for(var r=t.currentCanvas.getAttribute("width"),n=e.data,a=new Uint8ClampedArray(n),i=4*r,o=0;o<n.length;o+=4){var u=n[o],c=n[o+1],l=n[o+2],h=a[o-4],d=a[o-3],f=a[o-2],v=a[o+4],g=a[o+5],m=a[o+6],C=a[o-i],y=a[o-(i-1)],p=a[o-(i-2)],x=a[o+i],F=a[o+(i+1)],w=a[o+(i+2)],I=a[o-(i-4)],b=a[o-(i-5)],L=a[o-(i-6)],E=a[o-(i+4)],k=a[o-(i+3)],A=a[o-(i+2)],S=a[o+(i-4)],B=a[o+(i-3)],M=a[o+(i-2)],D=a[o+(i+4)],P=a[o+(i+5)],R=a[o+(i+6)],$=void 0===n[o+4],z=void 0===n[o-4],N=void 0===n[o+i],O=void 0===n[o-i],j=void 0===n[o-(i+4)],U=void 0===n[o-(i-4)],T=void 0===n[o+(i+4)],X=void 0===n[o+(i-4)];if(!($||z||N||O||j||U||T||X)){var Y=a[o+8],G=a[o+9],W=a[o+10],_=n[o-(i-8)],q=n[o-(i-9)],J=n[o-(i-10)];if(!s(u,c,l,Y,G,W,18)||!s(u,c,l,_,q,J,16)||//!withinRange(r, g, b, brrr, brrg, brrb, 15)||
v>=210&&g>=210&&m>=200)continue;s(u,c,l,h,d,f,50)&&s(u,c,l,v,g,m,50)&&s(u,c,l,C,y,p,50)&&s(u,c,l,x,F,w,50)&&s(u,c,l,I,b,L,50)&&s(u,c,l,E,k,A,50)&&s(u,c,l,S,B,M,50)&&s(u,c,l,D,P,R,50)&&(n[o+4]=u,n[o+5]=c,n[o+6]=l,n[o-4]=u,n[o-3]=c,n[o-2]=l,n[o-i]=u,n[o-(i-1)]=c,n[o-(i-2)]=l,n[o+i]=u,n[o+(i+1)]=c,n[o+(i+2)]=l,n[o-(i-4)]=u,n[o-(i-5)]=c,n[o-(i-6)]=l,n[o-(i+4)]=u,n[o-(i+3)]=c,n[o-(i+2)]=l,n[o+(i+4)]=u,n[o+(i+5)]=c,n[o+(i+6)]=l,n[o+(i-4)]=u,n[o+(i-3)]=c,n[o+(i-2)]=l)}}return e},this.mosaic=function(e){for(var r=e.data,n=new Uint8ClampedArray(r),a=t.currentCanvas.getAttribute("width"),i=t.currentCanvas.getAttribute("height"),o=40,s=40;a%o!=0;)o--,s--;for(var u=0;u<a;u+=o)for(var c=0;c<i;c+=s)for(var l=n[4*u+4*c*a],h=n[4*u+4*c*a+1],d=n[4*u+4*c*a+2],f=u;f<u+o;f++)for(var v=c;v<c+s;v++)r[4*f+4*v*a]=l,r[4*f+4*v*a+1]=h,r[4*f+4*v*a+2]=d;return e},this.pixelate=function(e){for(var r=e.data,n=new Uint8ClampedArray(r),a=t.currentCanvas.getAttribute("width"),i=t.currentCanvas.getAttribute("height"),o=100,s=100;a%o!=0;)o--,s--;for(var u=0;u<r.length;u+=2*o)for(var c=0;c<i;c+=s)for(var l=n[4*u+c],h=n[4*u+c+1],d=n[4*u+c+2],f=4*u;f<4*u+4*o;f+=4)for(var v=c;v<c+s;v++)r[f+v]=l,r[f+v+1]=h,r[f+v+2]=d;return e},this.voronoi=function(e){for(var r=t.currentCanvas.getContext("2d"),n=t.currentCanvas.getAttribute("width"),a=t.currentCanvas.getAttribute("height"),i=(r.getImageData(0,0,n,a),e.data),o=[],s=0;s<i.length;s+=4){var h=Math.floor(10*Math.random()),f=Math.random()>.5?1:-1,v=l(s,n,a);if(v.x%Math.floor(n/30)==0&&v.y%Math.floor(a/30)==0&&0!==v.x){var g=new u(f*h+v.x,f*h+v.y,i[s],i[s+1],i[s+2]);o.push(g)}}var m=function t(e,r){var n=0===r?"x":"y";if(e.sort((function(t,e){return t[n]<e[n]?-1:t[n]>e[n]?1:0})),0===e.length)return null;if(1===e.length)return new c(e[0],r);if(2===e.length){var a=new c(e[1],r),i=new c(e[0],(r+1)%2);return a.left=i,a}var o=Math.floor((e.length-1)/2),s=new c(e[o],r);return s.left=t(e.slice(0,o),(r+1)%2),s.right=t(e.slice(o+1,e.length),(r+1)%2),s}(o,0);console.log(m);for(s=0;s<i.length;s+=4){var C=l(s,n,a),y=d(m,C.x,C.y);i[s]=y.r,i[s+1]=y.g,i[s+2]=y.b}return e},this.edgeDetect=function(e){var r=t.currentCanvas.getContext("2d"),a=t.currentCanvas.getAttribute("width"),i=t.currentCanvas.getAttribute("height"),o=(r.getImageData(0,0,a,i),e.data),s=new Uint8ClampedArray(o);e=n.grayscale(e);for(var u=[[-1,0,1],[-2,0,2],[-1,0,1]],c=[[-1,-2,-1],[0,0,0],[1,2,1]],l=1;l<i-1;l++)for(var h=4;h<4*a-4;h+=4){var d=4*l*a+(h-4),f=4*l*a+(h+4),v=4*(l-1)*a+h,g=4*(l+1)*a+h,m=4*(l-1)*a+(h-4),C=4*(l-1)*a+(h+4),y=4*(l+1)*a+(h-4),p=4*(l+1)*a+(h+4),x=4*a*l+h,F=u[0][0]*s[m]+u[0][1]*s[v]+u[0][2]*s[C]+u[1][0]*s[d]+u[1][1]*s[x]+u[1][2]*s[f]+u[2][0]*s[y]+u[2][1]*s[g]+u[2][2]*s[p],w=c[0][0]*s[m]+c[0][1]*s[v]+c[0][2]*s[C]+c[1][0]*s[d]+c[1][1]*s[x]+c[1][2]*s[f]+c[2][0]*s[y]+c[2][1]*s[g]+c[2][2]*s[p],I=Math.ceil(Math.sqrt(F*F+w*w));o[x]=I,o[x+1]=I,o[x+2]=I,o[x+3]=255}return e}}(s,u);function l(t){let e=document.getElementById(t),r=e.children[1];"block"!==r.style.display?r.style.display="block":(r.style.display="none",e.style.marginBottom=0)}document.getElementById("filterSelect").addEventListener("click",(function(){l("filters")})),document.getElementById("brushSelect").addEventListener("click",(function(){l("brushes")}))}]);
//# sourceMappingURL=bundle.js.map