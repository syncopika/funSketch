// thinning filter via Hilditch's algorithm
// http://cgm.cs.mcgill.ca/~godfried/teaching/projects97/azar/skeleton.html#algorithm
// https://nayefreza.wordpress.com/2013/05/11/hilditchs-thinning-algorithm-java-implementation/
// https://www.mathworks.com/matlabcentral/answers/169129-hilditch-algorithm-some-minor-problems

import { FilterTemplate } from './FilterTemplate.js';

class Thinning extends FilterTemplate {
    
    constructor(){
        const params = {
            "iterations": {
                "value": 1,
                "min": 1,
                "max": 60,
                "step": 1,
            }
        }
        super(params);
    }
    
    grayscale(data, width, height, threshold){
        for(let i = 0; i < height; i++){
            for(let j = 0; j < width; j++){
                const r = data[(i * width * 4) + (j * 4)];
                const g = data[(i * width * 4) + (j * 4) + 1];
                const b = data[(i * width * 4) + (j * 4) + 2];
                const avg = (r + g + b) / 3;
                if((avg / 255) >= threshold){
                    // if resulting grayscale color of this pixel is >= threshold,
                    // set it to white (255)
                    data[(i * width * 4) + (j * 4)]     = 255;
                    data[(i * width * 4) + (j * 4) + 1] = 255;
                    data[(i * width * 4) + (j * 4) + 2] = 255;
                }else{
                    // make pixel black (0)
                    data[(i * width * 4) + (j * 4)]     = 0;
                    data[(i * width * 4) + (j * 4) + 1] = 0;
                    data[(i * width * 4) + (j * 4) + 2] = 0;
                }
            }
        }
    }
    
    // this assumes the pixel at i,j is black
    checkBlackNeighbors(data, i, j, width){
        let left = (4 * i * width) + ((j - 1) * 4);
        let right = (4 * i * width) + ((j + 1) * 4);
        let top = (4 * (i - 1) * width) + (j * 4);
        let bottom = (4 * (i + 1) * width) + (j * 4);
        let topLeft = (4 * (i - 1) * width) + ((j - 1) * 4);
        let topRight = (4 * (i - 1) * width) + ((j + 1) * 4);
        let bottomLeft = (4 * (i + 1) * width) + ((j - 1) * 4);
        let bottomRight = (4 * (i + 1) * width) + ((j + 1) * 4);
        
        // assume rgb channel values should be the same
        // so we don't need to look at g and b
        let numBlackNeighbors = 0;
        if(left >= 0){
            if(data[left] == 0){
                numBlackNeighbors++;
            }
        }
        if(right < data.length){
            if(data[right] == 0){
                numBlackNeighbors++;
            }
        }
        if(top >= 0){
            if(data[top] == 0){
                numBlackNeighbors++;
            }
        }
        if(bottom < data.length){
            if(data[bottom] == 0){
                numBlackNeighbors++;
            }
        }
        if(topLeft >= 0){
            if(data[topLeft] == 0){
                numBlackNeighbors++;
            }
        }
        if(topRight >= 0){
            if(data[topRight] == 0){
                numBlackNeighbors++;
            }
        }
        if(bottomLeft < data.length){
            if(data[bottomLeft] == 0){
                numBlackNeighbors++;
            }
        }
        if(bottomRight < data.length){
            if(data[bottomRight] == 0){
                numBlackNeighbors++;
            }
        }
        
        return numBlackNeighbors >= 2 && numBlackNeighbors <= 6;
    }

    // this assumes the pixel at i,j is black
    // follows: A(p1) = number of 0,1 patterns in the sequence p2,p3,p4,p5,p6,p7,p8,p9,p2
    testConnectivity(data, i, j, width){
        let left = (4 * i * width) + ((j - 1) * 4);
        let right = (4 * i * width) + ((j + 1) * 4);
        let top = (4 * (i - 1) * width) + (j * 4);
        let bottom = (4 * (i + 1) * width) + (j * 4);
        let topLeft = (4 * (i - 1) * width) + ((j - 1) * 4);
        let topRight = (4 * (i - 1) * width) + ((j + 1) * 4);
        let bottomLeft = (4 * (i + 1) * width) + ((j - 1) * 4);
        let bottomRight = (4 * (i + 1) * width) + ((j + 1) * 4);
        
        let numConnectedNeighbors = 0;
        let sequence = "";
        
        let currPixel = (4 * i * width) + (j * 4);
        
        // don't operate on non-black pixels
        if(data[currPixel] != 0){
            return false;
        }
        
        // note there is a specific sequence in which to evaluate the cells
        // e.g. top -> top-right -> right -> bottom-right -> ... -> top in clockwise-fashion
        if(top >= 0){
            if(data[top] == 255){
                sequence += "0";
            }else{
                sequence += "1";
            }
        }
        if(topRight >= 0){
            if(data[topRight] == 255){
                sequence += "0";
            }else{
                sequence += "1";
            }
        }
        if(right < data.length){
            if(data[right] == 255){
                sequence += "0";
            }else{
                sequence += "1";
            }
        }
        if(bottomRight < data.length){
            if(data[bottomRight] == 255){
                sequence += "0";
            }else{
                sequence += "1";
            }
        }
        if(bottom < data.length){
            if(data[bottom] == 255){
                sequence += "0";
            }else{
                sequence += "1";
            }
        }
        if(bottomLeft < data.length){
            if(data[bottomLeft] == 255){
                sequence += "0";
            }else{
                sequence += "1";
            }
        }
        if(left >= 0){
            if(data[left] == 255){
                sequence += "0";
            }else{
                sequence += "1";
            }
        }
        if(topLeft >= 0){
            if(data[topLeft] == 255){
                sequence += "0";
            }else{
                sequence += "1";
            }
        }
        if(top >= 0){
            if(data[top] == 255){
                sequence += "0";
            }else{
                sequence += "1";
            }
        }
        
        // evaluate sequence generated
        // we're looking for susbtrings with "01"
        for(let i = 0; i < sequence.length - 1; i++){
            if(sequence[i] === "0" && sequence[i+1] === "1"){
                numConnectedNeighbors++;
            }
        }
        
        return numConnectedNeighbors == 1;
    }
    
    verticalLineCheck(data, i, j, width){
        let left = (4 * i * width) + (j - 1) * 4;
        let right = (4 * i * width) + (j + 1) * 4;
        let top = (4 * (i - 1) * width) + (j * 4);
        
        let numConnectedNeighbors = 0;
        if(left >= 0){
            if(data[left] != 0){
                numConnectedNeighbors++;
            }
        }
        if(right < data.length){
            if(data[right] != 0){
                numConnectedNeighbors++;
            }
        }
        if(top >= 0){
            if(data[top] != 0){
                numConnectedNeighbors++;
            }
        }
        
        return numConnectedNeighbors == 3 || !this.testConnectivity(data, i-1, j, width);
    }
    
    horizontalLineCheck(data, i, j, width){
        let bottom = (4 * (i + 1) * width) + (j * 4);
        let right = (4 * i * width) + ((j + 1) * 4);
        let top = (4 * (i - 1) * width) + (j * 4);
        
        let numConnectedNeighbors = 0;
        if(bottom < data.length){
            if(data[bottom] != 0){
                numConnectedNeighbors++;
            }
        }
        if(right < data.length){
            if(data[right] != 0){
                numConnectedNeighbors++;
            }
        }
        if(top >= 0){
            if(data[top] != 0){
                numConnectedNeighbors++;
            }
        }
        
        return numConnectedNeighbors == 3 || !this.testConnectivity(data, i, j+1, width);
    }
    
    hasEightNeighbors(data, i, j, width){
        const left = (4 * i * width) + ((j - 1) * 4);
        const right = (4 * i * width) + ((j + 1) * 4);
        const top = (4 * (i - 1) * width) + (j * 4);
        const bottom = (4 * (i + 1) * width) + (j * 4);
        const topLeft = (4 * (i - 1) * width) + ((j - 1) * 4);
        const topRight = (4 * (i - 1) * width) + ((j + 1) * 4);
        const bottomLeft = (4 * (i + 1) * width) + ((j - 1) * 4);
        const bottomRight = (4 * (i + 1) * width) + ((j + 1) * 4);
        
        return (
            (left >= 0 && left < data.length) &&
            (right >= 0 && right < data.length) &&
            (top >= 0 && top < data.length) &&
            (bottom >= 0 && bottom < data.length) &&
            (topLeft >= 0 && topLeft < data.length) &&
            (topRight >= 0 && topRight < data.length) &&
            (bottomLeft >= 0 && bottomLeft < data.length) &&
            (bottomRight >= 0 && bottomRight < data.length)
        );
    }
    
    isBlackPixel(data, i, j, width){
        const idx = (4 * i * width) + (j * 4);
        return data[idx] == 0;
    }
    
    filter(pixels){
        let numIterations = this.params.iterations.value;
        
        while(numIterations > 0){
            const width = pixels.width;
            const height = pixels.height;
            const data = pixels.data;
            
            // get a grayscale copy and convert to black/white based on a threshold
            const threshold = 0.5;
            const grayscale = new Uint8ClampedArray(data);
            this.grayscale(grayscale, width, height, threshold);
            
            const grayscaleCopy = new Uint8ClampedArray(grayscale);
            
            //let numPixelsErased = 0;
            
            for(let i = 0; i < height; i++){
                for(let j = 0; j < width; j++){
                    if(
                        this.isBlackPixel(grayscale, i, j, width) &&
                        //this.hasEightNeighbors(grayscale, i, j, width) &&
                        this.checkBlackNeighbors(grayscale, i, j, width) &&
                        this.testConnectivity(grayscale, i, j, width) &&
                        this.verticalLineCheck(grayscale, i, j, width) &&
                        this.horizontalLineCheck(grayscale, i, j, width)
                    ){
                        // this pixel should be erased
                        grayscaleCopy[(4 * width * i) + (4 * j)] = 255;
                        grayscaleCopy[(4 * width * i) + (4 * j) + 1] = 255;
                        grayscaleCopy[(4 * width * i) + (4 * j) + 2] = 255;
                        
                        //numPixelsErased++;
                    }
                }
            }
         
            for(let i = 0; i < data.length; i++){
                pixels.data[i] = grayscaleCopy[i];
            }
        
            numIterations--;
        }
    
        return pixels;
    }
}

export {
    Thinning
};