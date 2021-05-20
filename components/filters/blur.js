/***
	BLUR FILTER
	this function causes a blurring effect. It takes the pixel itself and
	its left, right, above and below neighbors (if it has them)
	and calculates the average of their total R, G, B, and A channels respectively.
	source: http://blog.ivank.net/fastest-gaussian-blur.html
***/
import { FilterTemplate } from './FilterTemplate.js';

class Blur extends FilterTemplate {
	
	constructor(){
		super(null);
	}
	
	generateGaussBoxes(stdDev, numBoxes){
		// I honestly don't know how this works :/ TODO: understand how/why this works
		const wIdeal = Math.sqrt((12*stdDev*stdDev/numBoxes) + 1); // ideal averaging filter width
		const wl = Math.floor(wIdeal);
		const wu = wl+2;
		
		if(wl%2 == 0){
			wl--;
		}
		
		const mIdeal = (12*stdDev*stdDev - numBoxes*wl*wl - 4*numBoxes*wl - 3*numBoxes)/(-4*wl);
		const m = Math.round(mIdeal);
		
		const sizes = [];
		
		for(let i = 0; i < numBoxes; i++){
			sizes.push(i < m ? wl : wu);
		}
		
		return sizes;
	}
	
	boxBlurHorz(src, trgt, width, height, stdDev){
		const iarr = 1 / (stdDev+stdDev+1);
		for(let i = 0; i < height; i++){
			let ti = i*w;
			let li = ti;
			let ri = ti+stdDev;
			
			let fv = src[ti];
			let lv = src[ti+w-1];
			let val = (stdDev+1)*fv;
			
			for(let j = 0; j < stdDev; j++){
				val += src[ti+j];
			}
			
			for(let j = 0; j <= stdDev; j++){
				val += src[ri++] - fv;
				trgt[ti++] = Math.round(val*iarr);
			}
			
			for(let j = stdDev+1; j < width-stdDev; j++){
				val += src[ri++] - src[li++];
				trgt[ti++] = Math.round(val*iarr);
			}
			
			for(let j = width-stdDev; j < width; j++){
				val += lv - src[li++];
				trgt[ti++] = Math.round(val*iarr);
			}
		}
	}
	
	boxBlurTotal(src, trgt, width, height, stdDev){
		
	}
	
	boxBlur(src, trgt, width, height, stdDev){
		for(let i = 0; i < src.legth; i++){
			trgt[i] = src[i];
		}
		this.boxBlurHorz();
		this.boxBlurTotal();
	}
	
	// source channel, target channel, width, height, stdDev
	gaussBlur(src, trgt, width, height, stdDev){
		const boxes = generateGaussBoxes(stdDev, 3);
		this.boxBlur(src, trgt, width, height, (boxes[0]-1)/2);
		this.boxBlur(src, trgt, width, height, (boxes[1]-1)/2);
		this.boxBlur(src, trgt, width, height, (boxes[2]-1)/2);
	}
	
	filter(pixels){
/*         let d = pixels.data;
        let width = pixels.width;
        let maximum = 4 * width;
        for(let i = 0; i < d.length; i += 4){
            //right pixel (check if 4 pixel radius ok)
            let cond1 = (d[i + 4] == undefined);
			
            //left pixel
            let cond2 = (d[i - 4] == undefined);
			
            //pixel below
            let cond3 = (d[i + maximum] == undefined);
			
            //pixel above
            let cond4 = (d[i - maximum] == undefined);
			
            if(!cond1 && !cond2 && !cond3 && !cond4){
                let newR = (d[i + 4] * .2 + d[i - 4] * .2 + d[i + maximum] * .2 + d[i - maximum] * .2 + d[i] * .2);
                let newG = (d[i + 5] * .2 + d[i - 3] * .2 + d[i + (maximum + 1)] * .2 + d[i - (maximum - 1)] * .2 + d[i + 1] * .2);
                let newB = (d[i + 6] * .2 + d[i - 2] * .2 + d[i + (maximum + 2)] * .2 + d[i - (maximum - 2)] * .2 + d[i + 2] * .2);
                let newA = (d[i + 7] * .2 + d[i - 1] * .2 + d[i + (maximum + 3)] * .2 + d[i - (maximum - 3)] * .2 + d[i + 3] * .2);
                d[i] = newR;
                d[i + 1] = newG;
                d[i + 2] = newB;
                d[i + 3] = newA;
            }
        }
        return pixels; */
    }

}

export {
	Blur
};