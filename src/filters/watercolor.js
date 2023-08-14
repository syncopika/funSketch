import { FilterTemplate } from './FilterTemplate.js';

class Watercolor extends FilterTemplate {
    
    // https://grail.cs.washington.edu/projects/watercolor/paper_small.pdf
    // https://www.reddit.com/r/proceduralgeneration/comments/6mta0f/watercolor_simple_noise_algorithm/ -> cool and maybe related?
    // maybe helpful for a new approach: https://stackoverflow.com/questions/62671209/how-to-spread-out-blur-filter-radius-in-html5-canvas 
    
    constructor(){
        const params = {};
        super(params);
        
        // fluid capacity min and max
        this.c_min = 0;
        this.c_max = 0.5;
        
        // the parameters of each pixel of the image
        this.pixelParameters = [];
    }
    
    generateMask(pixelData, width, height, startX, startY){
        for(let i = startY; i < height; i++){
            for(let j = startX; j < width; j++){
                const height = Math.floor(Math.random() * (5 - 0)) / 5;
                const fluidCapacity = height * (this.c_max - this.c_min) + this.c_min;
                const waterAmount = Math.floor(Math.random() * (3 - 0)) / 3;
                const currR = pixelData[(4 * i * width) + (4 * j)];
                const currG = pixelData[(4 * i * width) + (4 * j) + 1];
                const currB = pixelData[(4 * i * width) + (4 * j) + 2];
                
                this.pixelParameters.push({
                    height,
                    fluidCapacity,
                    waterAmount,
                    col: j,
                    row: i,
                    r: currR,
                    g: currG,
                    b: currB,
                });
            }
        }
    }
    
    distributeColorToNeighboringCells(pixelData, width, row, col){
        
        /*
        if(row * col < 0 || row * col >= this.pixelParameters.length){
            return;
        }*/
        
        const currParams = this.pixelParameters[row * col];
        
        if(currParams.fluidCapacity <= 0 || currParams.waterAmount === 0 || currParams.waterAmount <= currParams.fluidCapacity){
            return;
        }
        
        if(currParams.height === 0){
            return;
        }
        
        const topPixelIdx = (4 * (row - 1) * width) + (4 * col);
        const bottomPixelIdx = (4 * (row + 1) * width) + (4 * col);
        const rightPixelIdx = (4 * row * width) + (4 * (col + 1));
        const leftPixelIdx = (4 * row * width) + (4 * (col - 1));
        
        const topIdx = (row-1) * col;
        const bottomIdx = (row+1) * col;
        const leftIdx = row * (col-1);
        const rightIdx = row * (col+1);
        
        const fluidDistAmount = currParams.waterAmount / 4;
        
        if(topIdx >= 0 && topIdx < this.pixelParameters.length && currParams.fluidCapacity > 0){
            const topParams = this.pixelParameters[topIdx];
            if(topParams.height < currParams.height && topParams.fluidCapacity > topParams.waterAmount + fluidDistAmount){
                // we "move" water and consequently pigment to the lower cell and so need to change color of this and top cell accordingly
                this.moveColors(pixelData, currParams, topParams, width, topPixelIdx, fluidDistAmount);
                topParams.fluidCapacity -= fluidDistAmount;
                topParams.waterAmount += fluidDistAmount;
                currParams.waterAmount -= fluidDistAmount;
            }
        }
        
        if(bottomIdx >= 0 && bottomIdx < this.pixelParameters.length && currParams.fluidCapacity > 0){
            const bottomParams = this.pixelParameters[bottomIdx];
            if(bottomParams.height < currParams.height && bottomParams.fluidCapacity > bottomParams.waterAmount + fluidDistAmount){
                this.moveColors(pixelData, currParams, bottomParams, width, bottomPixelIdx, fluidDistAmount);
                bottomParams.fluidCapacity -= fluidDistAmount;
                bottomParams.waterAmount += fluidDistAmount;
                currParams.waterAmount -= fluidDistAmount;
            }
        }
        
        if(leftIdx >= 0 && leftIdx < this.pixelParameters.length && currParams.fluidCapacity > 0){
            const leftParams = this.pixelParameters[leftIdx];
            if(leftParams.height < currParams.height && leftParams.fluidCapacity > leftParams.waterAmount + fluidDistAmount){
                this.moveColors(pixelData, currParams, leftParams, width, leftPixelIdx, fluidDistAmount);
                leftParams.fluidCapacity -= fluidDistAmount;
                leftParams.waterAmount += fluidDistAmount;
                currParams.waterAmount -= fluidDistAmount;
            }
        }
        
        if(rightIdx >= 0 && rightPixelIdx < pixelData.length && currParams.fluidCapacity > 0){
            const rightParams = this.pixelParameters[rightIdx];
            if(rightParams.height < currParams.height && rightParams.fluidCapacity > rightParams.waterAmount + fluidDistAmount){
                this.moveColors(pixelData, currParams, rightParams, width, rightPixelIdx, fluidDistAmount);
                rightParams.fluidCapacity -= fluidDistAmount;
                rightParams.waterAmount += fluidDistAmount;
                currParams.waterAmount -= fluidDistAmount;
            }
        }
    }
    
    moveColors(pixelData, currParams, targetParams, width, targetPixelIdx, amount){
        // https://stackoverflow.com/questions/726549/algorithm-for-additive-color-mixing-for-rgb-values
        // https://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
        
        // here we attempt to subtract some pigment from one place and add some pigment to another.
        // r1, g1, and b1 form a color that should become lighter and r2,g2,b2 form a color that should blend r1,g1,b1 by some amount.
        const r1 = currParams.r;
        const g1 = currParams.g;
        const b1 = currParams.b;
        
        const r2 = pixelData[targetPixelIdx];
        const g2 = pixelData[targetPixelIdx + 1];
        const b2 = pixelData[targetPixelIdx + 2];
        
        const newR = Math.floor((r1 + r2) / 2);
        const newG = Math.floor((g1 + g2) / 2);
        const newB = Math.floor((b1 + b2) / 2);
        
        // we want the current cell to become lighter in color
        const subR = r1 + (r1 * amount);
        const subG = g1 + (g1 * amount);
        const subB = b1 + (b1 * amount);
        
        pixelData[targetPixelIdx] = newR;
        pixelData[targetPixelIdx + 1] = newG;
        pixelData[targetPixelIdx + 2] = newB;
        
        const currPixelIdx = (4 * width * currParams.row) + (4 * currParams.col);
        pixelData[currPixelIdx] = subR;
        pixelData[currPixelIdx + 1] = subG;
        pixelData[currPixelIdx + 2] = subB;
        
        currParams.r = subR;
        currParams.g = subG;
        currParams.b = subB;
        
        targetParams.r = newR;
        targetParams.g = newG;
        targetParams.b = newB;
    }
    
    generateHeightMap(width, height){
        // return an array where each index represents a pixel and the height at that pixel
    }
    
    updateVelocities(){
    }
    
    relaxDivergence(){
    }
    
    flowOutward(){
    }
    
    moveWater(){
    }
    
    movePigment(){
    }
    
    transferPigment(){
    }
    
    simulateCapillaryFlow(){
    }
    
    watercolor(pixels, width, height){
        const numSteps = 10; // let this be a parameter
        for(let i = 0; i < numSteps; i++){
            this.moveWater();
            this.movePigment();
            this.transferPigment();
            this.simulateCapillaryFlow();
        }
    }
    
    filter(pixels){
        const width = pixels.width;
        const height = pixels.height;
        
        const data = pixels.data;
        //const copy = new Uint8ClampedArray(data);
        
        const startX = 100;
        const startY = 100;
        this.generateMask(data, width, height, startX, startY);
        //console.log("generated mask for watercolor");
        //console.log(this.pixelParameters);
        
        const steps = 1;
        for(let i = 0; i < steps; i++){
            console.log("on step " + i);
            for(let row = startY; row < height - startY; row++){
                for(let col = startX; col < width - startX; col++){
                    this.distributeColorToNeighboringCells(data, width, row, col);
                }
            }        
        }
        
        this.pixelParameters = [];
        
        return pixels;
    }
}

export {
    Watercolor
}