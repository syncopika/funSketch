import { FilterTemplate } from './FilterTemplate.js';

// lines based on unique colors (like dots3 but with lines)

class Lines extends FilterTemplate {
    
    constructor(){
        const params = {
            "distThreshold": {
                "value": 5.0,
                "min": 0.0,
                "max": 12.0,
                "step": 0.1,
            },
            "dotSize": {
                "value": 3.0,
                "min": 1.0,
                "max": 25.0,
                "step": 1.0,
            },
            "neighborDistance": {
                "value": 4.0,
                "min": 1.0,
                "max": 20.0,
                "step": 1.0,
            },
        }
        super(params);
    }
    
    rgbToXyz(r, g, b){
        // https://www.easyrgb.com/en/math.php
        let vR = (r / 255);
        let vG = (g / 255);
        let vB = (b / 255);

        if(vR > 0.04045){
            vR = ((vR + 0.055) / 1.055) ** 2.4;
        }else{
            vR = vR / 12.92;
        }
        
        if(vG > 0.04045 ){
            vG = ((vG + 0.055) / 1.055) ** 2.4;
        }else{
            vG = vG / 12.92;
        }
        
        if(vB > 0.04045){
            vB = ((vB + 0.055) / 1.055) ** 2.4
        }else{
            vB = vB / 12.92;
        }

        vR = vR * 100;
        vG = vG * 100;
        vB = vB * 100;

        const x = vR * 0.4124 + vG * 0.3576 + vB * 0.1805;
        const y = vR * 0.2126 + vG * 0.7152 + vB * 0.0722;
        const z = vR * 0.0193 + vG * 0.1192 + vB * 0.9505;
        
        return [x, y, z];
    }
    
    xyzToLab(xyzArr){
        // https://www.easyrgb.com/en/math.php
        // https://en.wikipedia.org/wiki/Standard_illuminant#Illuminant_series_D
        const D65 = [95.047, 100, 108.883];
        
        let vX = xyzArr[0] / D65[0]
        let vY = xyzArr[1] / D65[1];
        let vZ = xyzArr[2] / D65[2];

        if(vX > 0.008856){
            vX = vX ** (1/3);
        }else{
            vX = (7.787 * vX) + (16 / 116);
        }
        
        if(vY > 0.008856){
            vY = vY ** (1/3);
        }else{
            vY = (7.787 * vY) + (16 / 116);
        }
        
        if(vZ > 0.008856){
            vZ = vZ ** (1/3);
        }else{
            vZ = (7.787 * vZ) + (16 / 116);
        }
        
        const CIE_L = (116 * vY) - 16;
        const CIE_a = 500 * (vX - vY);
        const CIE_b = 200 * (vY - vZ);
        
        return [CIE_L, CIE_a, CIE_b];
    }
    
    // difference between 2 CIELAB colors
    deltaE(labA, labB){
        // https://gist.github.com/ryancat/9972419b2a78f329ce3aebb7f1a09152
        const deltaL = labA[0] - labB[0];
        const deltaA = labA[1] - labB[1];
        const deltaB = labA[2] - labB[2];
        const c1 = Math.sqrt(labA[1] * labA[1] + labA[2] * labA[2]);
        const c2 = Math.sqrt(labB[1] * labB[1] + labB[2] * labB[2]);
        const deltaC = c1 - c2;
        let deltaH = deltaA * deltaA + deltaB * deltaB - deltaC * deltaC;
        deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH);
        const sc = 1.0 + 0.045 * c1;
        const sh = 1.0 + 0.015 * c1;
        const deltaLKlsl = deltaL / (1.0);
        const deltaCkcsc = deltaC / (sc);
        const deltaHkhsh = deltaH / (sh);
        const i = deltaLKlsl * deltaLKlsl + deltaCkcsc * deltaCkcsc + deltaHkhsh * deltaHkhsh;
        return i < 0 ? 0 : Math.sqrt(i);
    }
    
    filter(pixels){
        const width = pixels.width;
        const height = pixels.height;
        
        const data = pixels.data;
        const neighborList = []; // array of Points 
        
        const drawDot = (x, y, color, context) => {
            context.lineJoin = "round";
            context.strokeStyle = color;
            
            const dotWidth = this.params.dotSize.value; //3;
            context.lineWidth = dotWidth;
            
            context.beginPath();
            context.moveTo(x, y + 1);
            context.lineTo(x, y);
            context.closePath();
            context.stroke();
        }
        
        // make a temp canvas and set it to white
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.fillStyle = '#fff';
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        
        // collect neighbors based on color "uniqueness" given a threshold distance
        for(let i = 0; i < width; i += this.params.neighborDistance.value){
            for(let j = 0; j < height; j += this.params.neighborDistance.value){                
                // check neighbor pixel color.
                // if significantly different from this color, take average and add to list of points
                if(i+1 < width){
                    const r = data[4 * i + 4 * j * width];
                    const g = data[4 * i + 4 * j * width + 1];
                    const b = data[4 * i + 4 * j * width + 2];
                    const a = data[4 * i + 4 * j * width + 3];
                    
                    const neighborR = data[(4 * (i + 1)) + 4 * j * width];
                    const neighborG = data[(4 * (i + 1)) + 4 * j * width + 1];
                    const neighborB = data[(4 * (i + 1)) + 4 * j * width + 2];
                    
                    const lab1 = this.xyzToLab(this.rgbToXyz(r, g, b));
                    const lab2 = this.xyzToLab(this.rgbToXyz(neighborR, neighborG, neighborB));
                    
                    const dist = this.deltaE(lab1, lab2);
                    //console.log(`dist: ${dist}`);
                    
                    if(dist > this.params.distThreshold.value){
                        // if colors are "different" enough
                        drawDot(i, j, `rgba(${(r+neighborR)/2},${(g+neighborG)/2},${(b+neighborB)/2},${a})`, tempCtx);
                    }
                }
            }
        }
        
        // copy temp canvas pixel data over to pixels
        const tempPixelData = tempCtx.getImageData(0, 0, width, height).data;
        for(let i = 0; i < width; i++){
            for(let j = 0; j < height; j++){
                if(j + 1 < height){
                  const currR = tempPixelData[(4 * j * width) + 4 * i];
                  const currG = tempPixelData[(4 * j * width) + 4 * i + 1];
                  const currB = tempPixelData[(4 * j * width) + 4 * i + 2];
                  
                  const belowPixelR = tempPixelData[(4 * (j + 1) * width) + 4 * i];
                  const belowPixelG = tempPixelData[(4 * (j + 1) * width) + 4 * i + 1];
                  const belowPixelB = tempPixelData[(4 * (j + 1) * width) + 4 * i + 2];
                  
                  if(belowPixelR === 255 && belowPixelG === 255 && belowPixelB === 255){
                      tempPixelData[(4 * (j + 1) * width) + 4 * i] = currR;
                      tempPixelData[(4 * (j + 1) * width) + 4 * i + 1] = currG;
                      tempPixelData[(4 * (j + 1) * width) + 4 * i + 2] = currB;
                  }
                }
            }
        }
        
        for(let i = 0; i < pixels.data.length; i++){
            pixels.data[i] = tempPixelData[i];
        }
        
        return pixels;
    }
}

export {
    Lines
}