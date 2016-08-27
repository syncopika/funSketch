# funSketch    
an application that has simple drawing features, as well as some interesting filter and brush options.    
more importantly, you can also make some quick, simple animations! 
<br>    
try it here: https://syncopika.github.io/funSketch/
<br>    
problems to fix:    
-every time the user draws a line (i.e. 1 mouseup event), a 'snapshot' of the canvas is supposed to be taken and stored. sometimes it
stores more 'snapshots' than the number of strokes, thus causing duplicate frames to add up, which in turn makes my undo function 
defective. 
