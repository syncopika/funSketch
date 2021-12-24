/***
    FISHEYE DISTORTION FILTER
    this function creates fisheye distortion!
    source: http://popscan.blogspot.com/2012/04/fisheye-lens-equation-simple-fisheye.html
    http://paulbourke.net/dome/fisheye/
***/

import { FilterTemplate } from './FilterTemplate.js';

class Fisheye extends FilterTemplate {
    
    constructor(){
        super(null);
    }
    
    fisheye(imgData, xPos, yPos, rad, width, height){
        let data = imgData.data;
        let oldData = new Uint8ClampedArray(data);
        let pixelCounter = 0;
        
        //rows
        for(let y = 0; y < height; y++){
            //normalize y coordinate to -1...+1
            let normY = (2 * y) / (height) - 1;
            //calculate normY squared
            let normY2 = normY * normY;
            //columns
            for(let x = 0; x < width; x++){
                //this counter will make sure that 
                //the right index for each pixel's color is
                //being looked at 
                let start = pixelCounter * 4;
                //normalize x coordinate to -1...+1
                let normX = (2 * x) / (width) - 1;
                //calculate normX squared
                let normX2 = normX * normX;
                //calculate distance from center (the center is always 0,0)
                let dist = Math.sqrt(normX2 + normY2);
                //only alter pixels inside of radius
                //changing the dist range affects the scope of the lens. i.e. less range (.5 => .6) gives you a 'telescoping' lens. 
                //a larger range (0 => 1) gives you a full circle.
                if((0 <= dist) && (dist <= 1)){
                    let newR = Math.sqrt(1 - dist * dist);
                    //new distance between 0 and 1
                    newR = (dist + (1 - newR)) / 2;
                    //discard any radius greater than 1
                    if(newR <= 1){
                        //calculate angle for polar coordinates
                        let theta = Math.atan2(normY, normX);
                        //calculate new X position with new distance in same angle
                        let newX = newR * Math.cos(theta);
                        //calculate new Y position with new distance in same angle
                        let newY = newR * Math.sin(theta);
                        //get the location of where the pixels should be moved FROM.
                        let x2 = Math.floor(((newX + 1) * (width)) / 2);
                        let y2 = Math.floor(((newY + 1) * (height)) / 2);
                        let srcPos = ((width) * (y2)) + x2;
                        srcPos *= 4;
                        data[start] = oldData[srcPos];
                        data[start + 1] = oldData[srcPos + 1];
                        data[start + 2] = oldData[srcPos + 2];
                        data[start + 3] = oldData[srcPos + 3];
                    }
                }
                pixelCounter++;
            }
        }
        
        return imgData;
    }
    
    filter(pixels){
        return this.fisheye(pixels, 0, 0, 0, pixels.width, pixels.height);
    }
}

export {
    Fisheye
}