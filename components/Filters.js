//library for filters
//reference: http://www.storminthecastle.com/2013/04/06/how-you-can-do-cool-image-effects-using-html5-canvas/
// pass it an instance of super canvas and an instance of Brush
function Filters(canvas, brush){
    let tempImage; // only push current image to snapshots if a tempImage exists already.
    // this way when undo is called the image being looked at by the user won't already be saved in snapshots,
    // and so undo wouldn't need to be clicked twice to see the last saved image. a bit confusing. :/
    
	let self = this;
	
    //general filtering function. pass any kind of filter through this function.
    this.filterCanvas = function(filter){
        let context = canvas.currentCanvas.getContext("2d");
        let width = canvas.currentCanvas.getAttribute('width');
        let height = canvas.currentCanvas.getAttribute('height');
        let imgData = context.getImageData(0, 0, width, height);
        // save current image to snapshots stack
        if (tempImage) {
            brush.currentCanvasSnapshots.push(tempImage);
        }
        filter(imgData);
        context.putImageData(imgData, 0, 0);
        tempImage = imgData;
    };
	
    // use this for select/option elements when picking a filter
    this.filterCanvasOption = function (option) {
        this.filterCanvas(this[option]);
    };
	
    /***
        GRAYSCALE FILTER
    ***/
    //grayscale filter using an arithmetic average of the color components
    //the 'pixels' parameter will be the imgData letiable. 
    this.grayscale = function(pixels){
        let d = pixels.data;
        for(let i = 0; i < d.length; i += 4){
            let r = d[i];
            let g = d[i + 1];
            let b = d[i + 2];
            //the value obtained by (r+g+b)/3 will be the value assigned to d[i], d[i+1], and d[i+2].  
            d[i] = d[i + 1] = d[i + 2] = (r + g + b) / 3;
        }
        return pixels;
    };
	
    /***
        sepia filter
    this.sepia = function (pixels) {
        let d = pixels.data;
        for (let i = 0; i < d.length; i += 4) {
            let r = d[i];
            let g = d[i + 1];
            let b = d[i + 2];
            d[i] = (r * .5) + (g * .2) + (b * .3); //red
            d[i + 1] = (r * .2) + (g * .3) + (b * .5); //green
            d[i + 2] = (r * .6) + (g * .3) + (b * .4); //blue
        }
        return pixels;
    };
	***/
	
    /***
        SATURATION FILTER
        source: http://www.qoncious.com/questions/changing-saturation-image-html5-canvas-using-javascript
    ***/
    this.saturate = function(pixels){
        let saturationValue = 2.5;
        let d = pixels.data;
        let lumR = .3086; //constant for determining luminance of red
        let lumG = .6094; //constant for determining luminance of green
        let lumB = .0820; //constant for determining luminance of blue
        //one of these equations per r,g,b
        let r1 = (1 - saturationValue) * lumR + saturationValue;
        let g1 = (1 - saturationValue) * lumG + saturationValue;
        let b1 = (1 - saturationValue) * lumB + saturationValue;
        //then one of these for each
        let r2 = (1 - saturationValue) * lumR;
        let g2 = (1 - saturationValue) * lumG;
        let b2 = (1 - saturationValue) * lumB;
        for(let i = 0; i < d.length; i += 4){
            let r = d[i];
            let g = d[i + 1];
            let b = d[i + 2];
            d[i] = r * r1 + g * g2 + b * b2;
            d[i + 1] = r * r2 + g * g1 + b * b2;
            d[i + 2] = r * r2 + g * g2 + b * b1;
        }
        return pixels;
    };
	
    /***
        COLOR SWAP FILTER
        this function swaps colors
    this.swap = function (pixels) {
        let d = pixels.data;
        for (let i = 0; i < d.length; i += 4) {
            let r = d[i];
            let g = d[i + 1];
            let b = d[i + 2];
            d[i] = b;
            d[i + 1] = r;
            d[i + 2] = g;
        }
        return pixels;
    };
	***/
    /***
        BANDED FILTER
        this function creates bands
    this.banded = function (pixels) {
        let d = pixels.data;
        for (let i = 0; i < d.length; i += 12) {
            let r = d[i];
            let g = d[i + 1];
            let b = d[i + 2];
            d[i] = "#FFFFFF";
            d[i + 1] = "#FFFFFF";
            d[i + 2] = "#FFFFFF";
        }
    };
	***/
	
    /***
        PURPLE CHROME FILTER
        this function creates a light purplish 'chrome' effect
        hmm, seemed to stop working after adjusting canvas to 800x800 from 700x700
    this.purpleChrome = function(pixels){
        let d = pixels.data;
        for(let i = 0; i < d.length; i++){
            let r = d[i];
            let g = d[i + 1];
            let b = d[i + 2];
            d[i + 1] = b;
            d[i + 2] = g;
            d[i] = r;
        }
        return pixels;
    };
	***/
	
    /***
        PURPLIZER
        this filter turns any white spots purple
    this.purplizer = function (pixels) {
        //aka purplefier - all pixels with green=red or green>red become purple
        let d = pixels.data;
        for (let i = 0; i < d.length; i += 4) {
            let r = d[i];
            let g = d[i + 1];
            let b = d[i + 2];
            let a = d[i + 3];
            if (g >= r) {
                d[i + 2] = d[i + 2] * 2;
                d[i + 1] = d[i + 2] / 2;
            }
        }
        return pixels;
    };
	***/
	
    /***
        SCARY(?) FILTER
        this filter turns everything dark
    this.scary = function(pixels){
        let saturationValue = 2.5;
        let d = pixels.data;
        //making the lumR,G,andB values nearly the same is equivalent to blacking out the picture i.e. 255,255,255 = black
        let lumR = .6020; //constant for determining luminance of red
        let lumG = .6094; //constant for determining luminance of green
        let lumB = .6086; ////constant for determining luminance of blue
        //one of these equations per r,g,b
        let r1 = (1 - saturationValue) * lumR + saturationValue;
        let g1 = (1 - saturationValue) * lumG + saturationValue;
        let b1 = (1 - saturationValue) * lumB + saturationValue;
        //then one of these for each
        let r2 = (1 - saturationValue) * lumR;
        let g2 = (1 - saturationValue) * lumG;
        let b2 = (1 - saturationValue) * lumB;
        for(let i = 0; i < d.length; i += 4){
            let r = d[i];
            let g = d[i + 1];
            let b = d[i + 2];
            d[i] = r * r1 + g * g2 + b * b2;
            d[i + 1] = r * r2 + g * g1 + b * b2;
            d[i + 2] = r * r2 + g * g2 + b * b1;
        }
        return pixels;
    };
	***/
	
    /***
        'HEATWAVE' FILTER
        this filter saturates and darkens some colors and produces an interesting palette
    this.heatwave = function(pixels){
        let d = pixels.data;
        for(let i = 0; i < d.length; i++){
            let r = d[i];
            let g = d[i + 1];
            let b = d[i + 2];
            if (g > 100 && g < 200) {
                d[i + 1] = 0;
            }
            if (r < 100) {
                d[i] = d[i] * 2;
            }
        }
        return pixels;
    };
	 ***/
	
    /***
        NOISE FILTER
        it pretty much just shifts all the pixels around.
    this.noise = function(pixels){
        let d = pixels.data;
        for(let i = 0; i < d.length; i += 4){
            let rand = Math.floor(Math.random() * 5 + 1); //random from 1 to 5
            let r = d[i];
            let g = d[i + 1];
            let b = d[i + 2];
            let a = d[i + 3];
            //if there is a pixel that is not white (not 255,255,255)
            if (r !== 255 || g !== 255 || b !== 255) {
                //then move the pixel in a random direction (up, down, left, or right)
                //depending on the random number
                //1 = up, 2 = down, 3 = left, 4 = right, 5 = no movement
                switch (rand) {
                    case 1:
                        if (i <= 2400) {
                            //move down
                            d[i + 2400] = r;
                            d[i + 2401] = g;
                            d[i + 2402] = b;
                            d[i + 2403] = a;
                        }
                        else {
                            d[i - 2403] = r;
                            d[i - 2402] = g;
                            d[i - 2401] = b;
                            d[i - 2400] = a;
                        }
                        break;
                    case 2:
                        //move down 
                        d[i + 2400] = r;
                        d[i + 2401] = g;
                        d[i + 2402] = b;
                        d[i + 2403] = a;
                        break;
                    case 3:
                        d[i - 4] = r;
                        d[i - 3] = g;
                        d[i - 2] = b;
                        d[i - 1] = a;
                        break;
                    case 4:
                        d[i + 4] = r;
                        d[i + 5] = g;
                        d[i + 6] = b;
                        d[i + 7] = a;
                        break;
                    case 5:
                        //do nothing
                        break;
                }
            }
        }
        return pixels;
    };
	***/
	
    /***
        COLOR INVERTER
        this function inverts colors
    ***/
    this.invert = function(pixels){
        let d = pixels.data;
        let r, g, b, x, y, z;
        for(let i = 0; i < d.length; i += 4){
            r = d[i];
            g = d[i + 1];
            b = d[i + 2];
            d[i] = 255 - r;
            d[i + 1] = 255 - g;
            d[i + 2] = 255 - b;
        }
        return pixels;
    };
    /***
        BLUR FILTER
        this function causes a blurring effect. It takes the pixel itself and
        its left, right, above and below neighbors (if it has them)
        and calculates the average of their total R, G, B, and A channels respectively.
        http://blog.ivank.net/fastest-gaussian-blur.html
    ***/
    this.blurry = function(pixels){
        let d = pixels.data;
        let width = pixels.width;
        let maximum = 4 * width;
        for(let i = 0; i < d.length; i += 4){
            //if these conditions are not undefined, then that pixel must exist.
            //right pixel (check if 4 pixel radius ok)
            //also, the 2800 comes from the width and height of my canvas being 700, multiplied by 4.
            let cond1 = (d[i + 4] == undefined);
            //left pixel
            let cond2 = (d[i - 4] == undefined);
            //pixel below
            let cond3 = (d[i + (maximum)] == undefined);
            //pixel above
            let cond4 = (d[i - (maximum)] == undefined);
            if(!cond1 && !cond2 && !cond3 && !cond4){
                let newR = (d[i + 4] * .2 + d[i - 4] * .2 + d[i + (maximum)] * .2 + d[i - (maximum)] * .2 + d[i] * .2);
                let newG = (d[i + 5] * .2 + d[i - 3] * .2 + d[i + (maximum + 1)] * .2 + d[i - (maximum - 1)] * .2 + d[i + 1] * .2);
                let newB = (d[i + 6] * .2 + d[i - 2] * .2 + d[i + (maximum + 2)] * .2 + d[i - (maximum - 2)] * .2 + d[i + 2] * .2);
                let newA = (d[i + 7] * .2 + d[i - 1] * .2 + d[i + (maximum + 3)] * .2 + d[i - (maximum - 3)] * .2 + d[i + 3] * .2);
                d[i] = newR;
                d[i + 1] = newG;
                d[i + 2] = newB;
                d[i + 3] = newA;
            }
        }
        return pixels;
    };
    /***
        OUTLINE FILTER
        gets the 'outline' of the main parts of the picture
        it finds the pixels whose above neighbor is a different color/
        then a line is drawn from the location of that pixel to the above pixel,
        forming a small, slightly angled line. all these lines then make up an outline.
    ***/
    this.outline = function(){
        let width = canvas.currentCanvas.getAttribute('width');
        let height = canvas.currentCanvas.getAttribute('height');
        let context = canvas.currentCanvas.getContext("2d");
        let imgData = context.getImageData(0, 0, width, height);
        let d = imgData.data;
        let colCounter = 0;
        let rowCounter = 0;
        let count = 0;
        let maximum = 4 * width;
        context.clearRect(0, 0, width, height);
        context.fillStyle = "#FFF";
        context.fillRect(0, 0, width, height);
        for(let i = 0; i < d.length; i += 4){
            let r = d[i];
            let g = d[i + 1];
            let b = d[i + 2];
            context.lineJoin = 'round';
            context.lineWidth = 2;
            let tnr = d[i - (maximum)];
            let tng = d[i - (maximum - 1)];
            let tnb = d[i - (maximum - 2)];
            //withinRange function is defined with the FISHEYE function
            if(d[i - (maximum)] !== undefined && !withinRange(r, g, b, tnr, tng, tnb, 5)){
                if(count < 100){
                    count++;
                }
                makePath(colCounter, rowCounter);
            }
            if(i % (maximum) == 0){
                rowCounter++;
            }
            if(colCounter >= width){
                colCounter = 0;
            }
            colCounter++;
        }
    };
    function makePath(col, row) {
        let context = canvas.currentCanvas.getContext("2d");
        context.lineJoin = 'round';
        context.lineWidth = 5;
        context.beginPath();
        context.moveTo(col, row);
        context.lineTo(col + 2, row + 1);
        context.closePath();
        context.strokeStyle = '#000';
        context.stroke();
    }
	
    /***
        FISHEYE DISTORTION FILTER
        this function creates fisheye distortion!
        source: http://popscan.blogspot.com/2012/04/fisheye-lens-equation-simple-fisheye.html
        http://paulbourke.net/dome/fisheye/
    ***/
    function fisheye(imgData, xPos, yPos, rad, width, height){
        //this is the array you edit with the translated pixels
        let data = imgData.data;
        //let height = Math.sqrt(data.length / 4);
        //let width = Math.sqrt(data.length / 4);
        //this is the original data set you want to refer to
        //to put the correctly colored pixels in the right place
        //remember to make a deep copy so that any editing to 'data' will not
        //alter the elements in this array!
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
            } //end inner for loop
        } //end outer for loop
        let curContext = canvas.currentCanvas.getContext("2d");
        //yPos and xPos are the coordinates of the center of the area of interest
        curContext.putImageData(imgData, xPos - rad, yPos - rad);
    }
	
    //the above function can be used like so below:
    //first, a default fisheye that encompasses the canvas:
    this.defaultFisheye = function(){
        let width = canvas.currentCanvas.getAttribute('width');
        let height = canvas.currentCanvas.getAttribute('height');
        let context = canvas.currentCanvas.getContext("2d");
        let data = context.getImageData(0, 0, width, height);
        fisheye(data, 0, 0, 0, width, height);
    };
	
    //this one is a mobile one, in which the user should be able to specify a 
    //a radius and can click anywhere on the canvas to generate a fisheye distortion within the 
    //specified radius.
    //It works by making a new image data array with only the pixels from the area specified by the user (after an image has been imported),
    //doing the distortion function on that array, and then putting the results in the same location it came from onto the canvas.
    function mobileFisheye(radius, xPos, yPos){
        //xPos and yPos are the coordinates of the center of the area of interest
        let diameter = radius * 2;
        //xPos-radius = the x coordinate of the upper left corner of the area of interest!
        let data = context.getImageData(xPos - radius, yPos - radius, diameter, diameter);
        fisheye(data, xPos, yPos, radius);
    }
    /**** END FISHEYE *****/
	
    /***
        AREA COLOR (more like 'painter?')

        the idea is to find an area of pixels that are similarly colored,
        and then making that area one solid color
        it also tends to remove dark outlines so that there aren't any
        distinct boundaries
        it is supposed to give a sort of 'painted' look to it.
        still not perfect right now, but it's definitely in the right direction

    ***/
    //helper function
    //this function is also used for the OUTLINE filter
    function withinRange(r, g, b, or, og, ob, rangeVal){
        let red = Math.abs(r - or) <= rangeVal;
        let green = Math.abs(g - og) <= rangeVal;
        let blue = Math.abs(b - ob) <= rangeVal;
        if(red && green && blue){
            return true;
        }
        return false;
    }
    //the idea is to find an area of pixels that are similarly colored, 
    //and then making that area one solid color
    this.areaColor = function(pixels){
        let width = pixels.width;
        let d = pixels.data;
        let copy = new Uint8ClampedArray(d);
        let maximum = 4 * width;
        for (let i = 0; i < d.length; i += 4) {
            //current pixel
            let r = d[i];
            let g = d[i + 1];
            let b = d[i + 2];
            //left neighbor's color
            let lnr = copy[i - 4];
            let lng = copy[i - 3];
            let lnb = copy[i - 2];
            //right neighbor's color
            let rnr = copy[i + 4];
            let rng = copy[i + 5];
            let rnb = copy[i + 6];
            //top neighbor's color
            let tnr = copy[i - (maximum)];
            let tng = copy[i - (maximum - 1)];
            let tnb = copy[i - (maximum - 2)];
            //bottom neighbor's color
            let bnr = copy[i + (maximum)];
            let bng = copy[i + (maximum + 1)];
            let bnb = copy[i + (maximum + 2)];
            //top right
            let trr = copy[i - (maximum - 4)];
            let trg = copy[i - (maximum - 5)];
            let trb = copy[i - (maximum - 6)];
            //top left
            let tlr = copy[i - (maximum + 4)];
            let tlg = copy[i - (maximum + 3)];
            let tlb = copy[i - (maximum + 2)];
            //below left
            let blr = copy[i + (maximum - 4)];
            let blg = copy[i + (maximum - 3)];
            let blb = copy[i + (maximum - 2)];
            //below right
            let brr = copy[i + (maximum + 4)];
            let brg = copy[i + (maximum + 5)];
            let brb = copy[i + (maximum + 6)];
            //right pixel
            let cond1 = (d[i + 4] === undefined);
            //left pixel
            let cond2 = (d[i - 4] === undefined);
            //pixel below
            let cond3 = (d[i + (maximum)] === undefined);
            //pixel above
            let cond4 = (d[i - (maximum)] === undefined);
            //top left
            let cond5 = (d[i - (maximum + 4)] === undefined);
            //top right
            let cond6 = (d[i - (maximum - 4)] === undefined);
            //below right
            let cond7 = (d[i + (maximum + 4)] === undefined);
            //below left
            let cond8 = (d[i + (maximum - 4)] === undefined);
            if(!cond1 && !cond2 && !cond3 && !cond4 && !cond5 && !cond6 && !cond7 && !cond8){
                //if next neighbor over is a completely different color, stop and move on
                let nnr = copy[i + 8];
                let nng = copy[i + 9];
                let nnb = copy[i + 10];
                //next neighbor over (top right)
                //using the current data, instead of the copy which holds the original color data,
                //seems to provide closer to my desired effect
                let trrr = d[i - (maximum - 8)];
                let trrg = d[i - (maximum - 9)];
                let trrb = d[i - (maximum - 10)];
                /*
                //next neighbor over (bottom right)
                let brrr = d[i+2808];
                let brrg = d[i+2809];
                let brrb = d[i+2810];
                */
                if(!withinRange(r, g, b, nnr, nng, nnb, 18) ||
                    !withinRange(r, g, b, trrr, trrg, trrb, 16) ||
                    //!withinRange(r, g, b, brrr, brrg, brrb, 15)||
                    (rnr >= 210 && rng >= 210 && rnb >= 200)){
                    continue;
                }
                let range = 50;
                //check neighbors' colors
                if(withinRange(r, g, b, lnr, lng, lnb, range) &&
                    withinRange(r, g, b, rnr, rng, rnb, range) &&
                    withinRange(r, g, b, tnr, tng, tnb, range) &&
                    withinRange(r, g, b, bnr, bng, bnb, range) &&
                    withinRange(r, g, b, trr, trg, trb, range) &&
                    withinRange(r, g, b, tlr, tlg, tlb, range) &&
                    withinRange(r, g, b, blr, blg, blb, range) &&
                    withinRange(r, g, b, brr, brg, brb, range)){
                    //make all the neighbors the same color
                    //right
                    d[i + 4] = r;
                    d[i + 5] = g;
                    d[i + 6] = b;
                    //left
                    d[i - 4] = r;
                    d[i - 3] = g;
                    d[i - 2] = b;
                    //above
                    d[i - (maximum)] = r;
                    d[i - (maximum - 1)] = g;
                    d[i - (maximum - 2)] = b;
                    //below
                    d[i + (maximum)] = r;
                    d[i + (maximum + 1)] = g;
                    d[i + (maximum + 2)] = b;
                    //above left
                    d[i - (maximum - 4)] = r;
                    d[i - (maximum - 5)] = g;
                    d[i - (maximum - 6)] = b;
                    //above right
                    d[i - (maximum + 4)] = r;
                    d[i - (maximum + 3)] = g;
                    d[i - (maximum + 2)] = b;
                    //below right
                    d[i + (maximum + 4)] = r;
                    d[i + (maximum + 5)] = g;
                    d[i + (maximum + 6)] = b;
                    //below left
                    d[i + (maximum - 4)] = r;
                    d[i + (maximum - 3)] = g;
                    d[i + (maximum - 2)] = b;
                }
            }
        }
        return pixels;
    };
	
    /***
    
        mosaic filter
        breaks image into chunks, takes a pixel from each chunk, set all pixels for that chunk
        to that pixel's color
    
    ***/
    this.mosaic = function(pixels){
        let d = pixels.data;
        let copy = new Uint8ClampedArray(d);
        // get dimensions 
        let width = canvas.currentCanvas.getAttribute('width');
        let height = canvas.currentCanvas.getAttribute('height');
        // change sampling size here. lower for higher detail preservation, higher for less detail (because larger chunks)
        let chunkWidth = 40;
        let chunkHeight = 40;
        // make sure chunkWidth can completely divide the image width * 4 
        while (width % chunkWidth != 0) {
            chunkWidth--;
            chunkHeight--;
        }
        // when looking at each chunk of the image, for these 2 outer for loops, 
        // focus on looking at each chunk as if looking at a single pixel first (think bigger picture; abstraction!) 
        // don't think about selecting single channels yet 
        for (let i = 0; i < width; i += chunkWidth) {
            for (let j = 0; j < height; j += chunkHeight) {
                // 4*i + 4*j*width = index of first pixel in chunk 
                // get the color of the first pixel in this chunk
                // multiply by 4 because 4 channels per pixel
                // multiply by width because all the image data is in a single array and a row is dependent on width
                let r = copy[4 * i + 4 * j * width];
                let g = copy[4 * i + 4 * j * width + 1];
                let b = copy[4 * i + 4 * j * width + 2];
                // now for all the other pixels in this chunk, set them to this color 
                for (let k = i; k < i + chunkWidth; k++) {
                    for (let l = j; l < j + chunkHeight; l++) {
                        d[4 * k + 4 * l * width] = r;
                        d[4 * k + 4 * l * width + 1] = g;
                        d[4 * k + 4 * l * width + 2] = b;
                    }
                }
            }
        }
        return pixels;
    };
	
    /***
        this function seems to pixelate an image
        it was my first attempt at the mosaic filter
        and I was getting confused how to traverse chunks of an array
        and ended up with this. the time complexity is very bad
        because my traversal of the chunks in the array is completely wrong
        but sometimes this filter yields interesting results
    this.pixelate = function(pixels){
        let d = pixels.data;
        let copy = new Uint8ClampedArray(d);
        // get dimensions 
        let width = canvas.currentCanvas.getAttribute('width');
        let height = canvas.currentCanvas.getAttribute('height');
        let chunkWidth = 100;
        let chunkHeight = 100;
        // make sure chunkWidth can completely divide the image width * 4 
        while (width % chunkWidth != 0) {
            chunkWidth--;
            chunkHeight--;
        }
        for (let i = 0; i < d.length; i += chunkWidth * 2) {
            for (let j = 0; j < height; j += chunkHeight) {
                // 4i + j = index of first pixel in chunk 
                let r = copy[4 * i + j];
                let g = copy[4 * i + j + 1];
                let b = copy[4 * i + j + 2];
                for (let k = 4 * i; k < (4 * i) + (4 * chunkWidth); k += 4) {
                    for (let l = j; l < j + chunkHeight; l++) {
                        d[k + l] = r;
                        d[k + l + 1] = g;
                        d[k + l + 2] = b;
                    }
                }
            }
        }
        return pixels;
    };
	***/
	
    /***
        control brightness - increase
    ***/
    function incBright(pixels){
        let d = pixels.data;
        for(let i = 0; i < d.length; i += 4){
            d[i] += 5;
            d[i + 1] += 5;
            d[i + 2] += 5;
            //d[i+3] += 5;
        }
        return pixels;
    }
    //control brightness - decrease
    function decBright(pixels){
        let d = pixels.data;
        for(let i = 0; i < d.length; i += 4){
            d[i] -= 5;
            d[i + 1] -= 5;
            d[i + 2] -= 5;
            //d[i+3] -= 5;
        }
        return pixels;
    }
    /***
        change contrast
        set range -128 to 128 for now
        I don't think it's working quite right...
        basically, all dark colors should get darker, and light colors should get lighter right?
    ***/
    //this let is reset when importing a new picture
    let contrastVal = 0;
    function inContrast(pixels){
        let d = pixels.data;
        if(contrastVal < 128){
            contrastVal++;
        }
        let contrastFactor = Math.max(((128 + contrastVal) / 128), 0);
        for(let i = 0; i < d.length; i += 4){
            d[i] = d[i] * contrastFactor;
            d[i + 1] = d[i + 1] * contrastFactor;
            d[i + 2] = d[i + 2] * contrastFactor;
            d[i + 3] = d[i + 3] * contrastFactor;
        }
        return pixels;
    }
    function deContrast(pixels){
        let d = pixels.data;
        if(contrastVal > -128){
            contrastVal--;
        }
        let contrastFactor = Math.max(((128 + contrastVal) / 128), 0);
        for (let i = 0; i < d.length; i += 4) {
            d[i] = d[i] * contrastFactor;
            d[i + 1] = d[i + 1] * contrastFactor;
            d[i + 2] = d[i + 2] * contrastFactor;
            d[i + 3] = d[i + 3] * contrastFactor;
        }
        return pixels;
    }
    /***

        voronoi filter
        https://softwarebydefault.com/tag/voronoi-diagrams/
        https://www.codeproject.com/Articles/882739/Simple-approach-to-Voronoi-diagrams
        
        - nearest neighbor automatically creates 'boundaries'.
        - for each pixel, find the nearest neighbor (a collection of pre-selected pixels)
        - color that pixel whatever the nearest neighbor's color is
        - evenly spaced neighbors will yield a mosaic! awesome!
        
    ***/
    // kd tree to be used in Voronoi function 
    // https://blog.krum.io/k-d-trees/
    // https://github.com/z2oh/chromatic_confinement/blob/master/src/main.rs
    // https://stackoverflow.com/questions/1627305/nearest-neighbor-k-d-tree-wikipedia-proof/37107030#37107030
    // each node takes Point info (x, y, rgb) and a dimension
    function Point(x, y, r, g, b){
        this.x = x;
        this.y = y;
        this.r = r;
        this.g = g;
        this.b = b;
    }
    function Node(point, dim){
        this.data = [point.x, point.y];
        this.point = point;
        this.dim = dim;
        this.left = null;
        this.right = null;
    }
    function getPixelCoords(index, width, height){
        // assuming index represents the r channel of a pixel 
        // index therefore represents the index of a pixel, since the pixel data 
        // is laid out like r,g,b,a,r,g,b,a,... in the image data 
        // so to figure out the x and y coords, take the index and divide by 4,
        // which gives us the pixel's number. then we need to know its position 
        // on the canvas.
        if((width * 4) * height < index){
            // if index is out of bounds 
            return {};
        }
        let pixelNum = Math.floor(index / 4);
        let yCoord = Math.floor(pixelNum / width); // find what row this pixel belongs in
        let xCoord = pixelNum - (yCoord * width); // find the difference between the pixel number of the pixel at the start of the row and this pixel 
        return { 'x': xCoord, 'y': yCoord };
    }
    function getDist(x1, x2, y1, y2){
        // removing Math.sqrt from the equation seemed to be the fix in producing 
        // the correct output (with sqrt it looks like you get the wrong neighbor choices for some points going along a diagonal in the image)
        // not sure why? however, with Math.sqrt it's considerably faster...
        return Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2);
    }
    // in this use case our dimensions will be x and y (since each pixel has an x,y coordinate)
    // so only 2 dimensions 
    function build2dTree(pointsList, currDim){
        let maxDim = 2;
        // sort the current list in ascending order depending on the current dimension
        let dim = currDim === 0 ? 'x' : 'y';
        pointsList.sort(function(a, b){
            if (a[dim] < b[dim]) {
                return -1;
            }else if (a[dim] > b[dim]){
                return 1;
            }else{
                return 0;
            }
        });
        // base case: if pointsList is size 0, return null. otherwise if size 1, place the point and return 
        if(pointsList.length === 0){
            return null;
        }
        if(pointsList.length === 1){
            return new Node(pointsList[0], currDim);
        }
        if(pointsList.length === 2){
            // since it's a BST, the 2nd element (at index 1) will be larger and thus the parent of 
            // the 1st element, which will go to the left of the parent
            let newParent = new Node(pointsList[1], currDim);
            let newChild = new Node(pointsList[0], (currDim + 1) % maxDim);
            newParent.left = newChild;
            return newParent;
        }
        // take the median point, place it, and recurse on left and right 
        let midIndex = Math.floor((pointsList.length - 1) / 2);
        let newNode = new Node(pointsList[midIndex], currDim);
        newNode.left = build2dTree(pointsList.slice(0, midIndex), (currDim + 1) % maxDim);
        newNode.right = build2dTree(pointsList.slice(midIndex + 1, pointsList.length), (currDim + 1) % maxDim);
        return newNode;
    }
    function getTreeSize(tree){
        if(tree === null){
            return 0;
        }else{
            return 1 + getTreeSize(tree.left) + getTreeSize(tree.right);
        }
    }
    function isLeaf(node){
        return node.left === null && node.right === null;
    }
    /* find nearest neighbor in 2d tree given a point's x and y coords and the tree's root
    // incorrect version... doesn't find the most nearest neighbor (but does the job almost correctly)
    function findNearestNeighbor(root, x, y){
        if(root === null){
            return null;
        }
        
        let minDist = getDist(root.data[0], x, root.data[1], y);
        let nearestNeighbor = root;
        let curr = root;
        
        while(!isLeaf(curr)){
            
            // if a node has one child, it will always be the left child
            if(curr.left && !curr.right){
                curr = curr.left;
                continue;
            }
            
            // compare current dist with min dist
            currDist = getDist(curr.data[0], x, curr.data[1], y);
            if(currDist < minDist){
                minDist = currDist;
                nearestNeighbor = curr;
            }
            
            // find the right direction to go in the tree based on dimension //distance
            let currDimToCompare = (curr.dim === 0) ? x : y;
            
            if(currDimToCompare === x){
                // is x greater than the current node's x? if so, we want to go right. else left.
                if(x > curr.data[0]){
                    curr = curr.right;
                }else{
                    curr = curr.left;
                }
            }else{
                if(y > curr.data[1]){
                    curr = curr.right;
                }else{
                    curr = curr.left;
                }
            }
            
        }
        
        return nearestNeighbor.point;

    }*/
    // find nearest neighbor in 2d tree given a point's x and y coords and the tree's root 
    function findNearestNeighbor(root, x, y){
        let record = {};
        // set default values 
        record.nearestNeighbor = root.point;
        record.minDist = getDist(root.data[0], x, root.data[1], y);
        // pass record to the recursive nearest-neighbor helper function so that it gets updated
        findNearestNeighborHelper(root, record, x, y);
        return record.nearestNeighbor;
    }
    function findNearestNeighborHelper(root, record, x, y){
        if(isLeaf(root)){
            let dist = getDist(root.data[0], x, root.data[1], y);
            if (dist < record.minDist) {
                record.nearestNeighbor = root.point;
                record.minDist = dist;
            }
        }else{
            // compare current dist with min dist 
            let currDist = getDist(root.data[0], x, root.data[1], y);
            if(currDist < record.minDist){
                record.nearestNeighbor = root.point;
                record.minDist = currDist;
            }
            if(root.left && !root.right){
                // if a node has one child, it will always be the left child 
                findNearestNeighborHelper(root.left, record, x, y);
            }else{
                // find the right direction to go in the tree based on dimension //distance
                let currDimToCompare = (root.dim === 0) ? x : y;
                if(currDimToCompare === x){
                    // is x greater than the current node's x? if so, we want to go right. else left.
                    if(x > root.data[0]){
                        findNearestNeighborHelper(root.right, record, x, y);
                        // then, we check if the other subtree might actually have an even closer neighbor!
                        if(x - record.minDist < root.data[0]){
                            findNearestNeighborHelper(root.left, record, x, y);
                        }
                    }else{
                        findNearestNeighborHelper(root.left, record, x, y);
                        if(x + record.minDist > root.data[0]){
                            // x + record.minDist forms a circle. the circle in this case
                            // encompasses this current node's coordinates, so we can get closer to the query node 
                            // by checking the right subtree 
                            findNearestNeighborHelper(root.right, record, x, y);
                        }
                    }
                }else{
                    if(y > root.data[1]){
                        findNearestNeighborHelper(root.right, record, x, y);
                        if (y - record.minDist < root.data[1]) {
                            findNearestNeighborHelper(root.left, record, x, y);
                        }
                    }else{
                        findNearestNeighborHelper(root.left, record, x, y);
                        if (y + record.minDist > root.data[1]) {
                            findNearestNeighborHelper(root.right, record, x, y);
                        }
                    }
                }
            }
        }
    }
	
    this.voronoi = function(pixels){
        let context = canvas.currentCanvas.getContext("2d");
        let width = canvas.currentCanvas.getAttribute('width');
        let height = canvas.currentCanvas.getAttribute('height');
        let imgData = context.getImageData(0, 0, width, height);
        let data = pixels.data; //imgData.data;
        let neighborList = []; // array of Points 
        for(let i = 0; i < data.length; i += 4){
            // get neighbors.
            // add some offset to each neighbor for randomness (we don't really want evenly spaced neighbors)
            let offset = Math.floor(Math.random() * 10); // to be applied in x or y direction
            let sign = Math.random() > .5 ? 1 : -1;
            let c1 = getPixelCoords(i, width, height);
            if(c1.x % Math.floor(width / 30) === 0 && c1.y % Math.floor(height / 30) === 0 && c1.x !== 0){
                let x = (sign * offset) + c1.x;
                let y = (sign * offset) + c1.y;
                let p1 = new Point(x, y, data[i], data[i + 1], data[i + 2]);
                neighborList.push(p1);
            }
        }
        let kdtree = build2dTree(neighborList, 0);
        //console.log(kdtree);
        for(let i = 0; i < data.length; i += 4){
            let currCoords = getPixelCoords(i, width, height);
            let nearestNeighbor = findNearestNeighbor(kdtree, currCoords.x, currCoords.y);
            /* naive way of finding nearest neighbor...
            let nearestNeighbor = neighborList[0];
            let minDist = getDist(nearestNeighbor.x, currCoords.x, nearestNeighbor.y, currCoords.y);
            
            // find the nearest neighbor for this pixel
            for(let j = 0; j < neighborList.length; j++){
                let neighbor = neighborList[j];
                let dist = getDist(neighbor.x, currCoords.x, neighbor.y, currCoords.y);
                if(dist < minDist){
                    minDist = dist;
                    nearestNeighbor = neighborList[j];
                }
            }*/
            // found nearest neighbor. color the current pixel the color of the nearest neighbor. 
            data[i] = nearestNeighbor.r;
            data[i + 1] = nearestNeighbor.g;
            data[i + 2] = nearestNeighbor.b;
        }
        return pixels;
    };
	
    // edge detection
    this.edgeDetect = function(pixels){
        let context = canvas.currentCanvas.getContext("2d");
        let width = canvas.currentCanvas.getAttribute('width');
        let height = canvas.currentCanvas.getAttribute('height');
        let imgData = context.getImageData(0, 0, width, height);
        let data = pixels.data;
        let sourceImageCopy = new Uint8ClampedArray(data);
        pixels = self.grayscale(pixels);
        let xKernel = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];
        let yKernel = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];
        for(let i = 1; i < height - 1; i++){
            for(let j = 4; j < 4 * width - 4; j += 4){
                let left = (4 * i * width) + (j - 4);
                let right = (4 * i * width) + (j + 4);
                let top = (4 * (i - 1) * width) + j;
                let bottom = (4 * (i + 1) * width) + j;
                let topLeft = (4 * (i - 1) * width) + (j - 4);
                let topRight = (4 * (i - 1) * width) + (j + 4);
                let bottomLeft = (4 * (i + 1) * width) + (j - 4);
                let bottomRight = (4 * (i + 1) * width) + (j + 4);
                let center = (4 * width * i) + j;
                // use the xKernel to detect edges horizontally 
                let pX = (xKernel[0][0] * sourceImageCopy[topLeft]) + (xKernel[0][1] * sourceImageCopy[top]) + (xKernel[0][2] * sourceImageCopy[topRight]) +
                    (xKernel[1][0] * sourceImageCopy[left]) + (xKernel[1][1] * sourceImageCopy[center]) + (xKernel[1][2] * sourceImageCopy[right]) +
                    (xKernel[2][0] * sourceImageCopy[bottomLeft]) + (xKernel[2][1] * sourceImageCopy[bottom]) + (xKernel[2][2] * sourceImageCopy[bottomRight]);
                // use the yKernel to detect edges vertically 
                let pY = (yKernel[0][0] * sourceImageCopy[topLeft]) + (yKernel[0][1] * sourceImageCopy[top]) + (yKernel[0][2] * sourceImageCopy[topRight]) +
                    (yKernel[1][0] * sourceImageCopy[left]) + (yKernel[1][1] * sourceImageCopy[center]) + (yKernel[1][2] * sourceImageCopy[right]) +
                    (yKernel[2][0] * sourceImageCopy[bottomLeft]) + (yKernel[2][1] * sourceImageCopy[bottom]) + (yKernel[2][2] * sourceImageCopy[bottomRight]);
                // finally set the current pixel to the new value based on the formula 
                let newVal = (Math.ceil(Math.sqrt((pX * pX) + (pY * pY))));
                data[center] = newVal;
                data[center + 1] = newVal;
                data[center + 2] = newVal;
                data[center + 3] = 255;
            }
        }
        return pixels;
    };
	
} // end filter object

export {
	Filters
};