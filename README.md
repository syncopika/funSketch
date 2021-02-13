# funSketch    
An experimental application made with React that has simple drawing features, as well as some interesting filter and brush options.    
but more importantly, you can also make some quick, simple animations!    
    
current look:    
![current look of funSketch](notes/screenshot.png)    
    
animation demo:    
![animation demo](notes/animation_demo.gif)    
    
try it here: https://syncopika.github.io/funSketch/    
also, I tried out the floodfill feature using web workers <a href='https://syncopika.github.io/funSketch/floodfillExperiment/floodfillExperiment.html'>here</a>! It looks like they generally help speed up performance.     
    
### installation:    
You'll need node.js and npm. `cd` into this repo and run `npm install` to install all the dependencies. Then run `node server.js` to serve the application. To run the tests, run `npm test`.    
    
### acknowledgements:    
thanks to William Malone's <a href='http://www.williammalone.com/articles/create-html5-canvas-javascript-drawing-app/'>fantastic tutorial</a>, which much of this work is based on.    
thanks to Johan Nordberg's <a href='https://jnordberg.github.io/gif.js/'>gif.js library</a>, which I use to generate the output for an animation.    
thanks to mr.doob's <a href='https://github.com/mrdoob/harmony'>harmony project</a> for some brush ideas.    
    
please note: this application is not meant to be supported on mobile devices.    
