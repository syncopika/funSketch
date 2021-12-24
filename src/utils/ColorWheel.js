// catch-all file for functions that might be better suited being in this file

export function makeColorWheel(elementId, size){
    const location = document.getElementById(elementId);
    if(location === undefined){
        console.log(`could not find element with id ${elementId}!`);
        return null;
    }
    
    const colorWheel = document.createElement('canvas');
    colorWheel.id = "colorWheel";
    colorWheel.setAttribute('width', size);
    colorWheel.setAttribute('height', size);
    
    const colorWheelContext = colorWheel.getContext('2d');
    const x = colorWheel.width / 2;
    const y = colorWheel.height / 2;
    const radius = 60;
   
   // why 5600??
    for(let angle = 0; angle <= 5600; angle++) {
        const startAngle = (angle - 2) * Math.PI / 180; //convert angles to radians
        const endAngle = (angle) * Math.PI / 180;
        colorWheelContext.beginPath();
        colorWheelContext.moveTo(x, y);
        //.arc(x, y, radius, startAngle, endAngle, anticlockwise)
        colorWheelContext.arc(x, y, radius, startAngle, endAngle, false);
        colorWheelContext.closePath();
        //use .createRadialGradient to get a different color for each angle
        //createRadialGradient(x0, y0, r0, x1, y1, r1)
        const gradient = colorWheelContext.createRadialGradient(x, y, 0, startAngle, endAngle, radius);
        gradient.addColorStop(0, 'hsla(' + angle + ', 10%, 100%, 1)');
        gradient.addColorStop(1, 'hsla(' + angle + ', 100%, 50%, 1)');
        colorWheelContext.fillStyle = gradient;
        colorWheelContext.fill();
    }
    
    // make black a pickable color 
    colorWheelContext.fillStyle = "rgba(0,0,0,1)";
    colorWheelContext.beginPath();
    colorWheelContext.arc(10, 10, 8, 0, 2*Math.PI);
    colorWheelContext.fill();
    
    // make white pickable too (and add a black outline)
    colorWheelContext.beginPath();
    colorWheelContext.arc(30, 10, 8, 0, 2*Math.PI); // border around the white 
    colorWheelContext.stroke();
    
    // make sure circle is filled with #fff
    colorWheelContext.fillStyle = "rgba(255,255,255,1)";
    colorWheelContext.arc(30, 10, 8, 0, 2*Math.PI);
    colorWheelContext.fill();
    
    // make transparent white pickable too (and add a black outline)
    colorWheelContext.beginPath();
    colorWheelContext.arc(50, 10, 8, 0, 2*Math.PI); // border around the white 
    colorWheelContext.stroke();
    
    // make sure circle is filled with transparent white
    colorWheelContext.fillStyle = "rgba(255,255,255,0.5)";
    colorWheelContext.arc(50, 10, 8, 0, 2*Math.PI);
    colorWheelContext.fill();
    
    location.appendChild(colorWheel);
    
    // make the color wheel interactive and show picked color 
    const showColor = document.createElement('p'); // this element will show the color picked 
    showColor.style.textAlign = 'center';
    showColor.id = 'colorPicked';
    showColor.textContent = "pick a color!";
    location.appendChild(showColor);
    
    return colorWheel;
}