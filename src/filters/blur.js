/***
	fast BLUR FILTER
	this function causes a blurring effect.
	source: http://blog.ivank.net/fastest-gaussian-blur.html
***/
import { FilterTemplate } from './FilterTemplate.js';

class Blur extends FilterTemplate {
	constructor(){
		const params = {
			"blurFactor": {
				"value": 3,
				"min": 1,
				"max": 15,
				"step": 1,
			}
		}
		super(params);
	}
	
	generateGaussBoxes(stdDev, numBoxes){
		// I honestly don't know how this works :/ TODO: understand how/why this works
		// wikipedia is a good start: https://en.wikipedia.org/wiki/Gaussian_blur
		let wIdeal = Math.sqrt((12*stdDev*stdDev/numBoxes) + 1); // ideal averaging filter width
		let wl = Math.floor(wIdeal);
		
		if(wl%2 == 0){
			wl--;
		}
		
		let wu = wl+2;
		
		let mIdeal = (12*stdDev*stdDev - numBoxes*wl*wl - 4*numBoxes*wl - 3*numBoxes)/(-4*wl - 4);
		let m = Math.round(mIdeal);
		
		const sizes = [];
		
		for(let i = 0; i < numBoxes; i++){
			sizes.push(i < m ? wl : wu);
		}
		
		return sizes;
	}
	
	boxBlurHorz(src, trgt, width, height, stdDev){
		const iarr = 1 / (stdDev+stdDev+1);
		for(let i = 0; i < height; i++){
			let ti = i*width;
			let li = ti;
			let ri = ti+stdDev;
			
			let fv = src[ti];
			let lv = src[ti+width-1];
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
		const iarr = 1 / (stdDev+stdDev+1);
		for(let i = 0; i < width; i++){
			let ti = i;
			let li = ti;
			let ri = ti+stdDev*width;
			
			let fv = src[ti];
			let lv = src[ti+width*(height-1)];
			let val = (stdDev+1)*fv;
			
			for(let j = 0; j < stdDev; j++){
				val += src[ti+j*width];
			}
			
			for(let j = 0; j <= stdDev; j++){
				val += src[ri] - fv;
				trgt[ti] = Math.round(val*iarr);
				ri += width;
				ti += width;
			}
			
			for(let j = stdDev+1; j < height-stdDev; j++){
				val += src[ri] - src[li];
				trgt[ti] = Math.round(val*iarr);
				li += width;
				ri += width;
				ti += width;
			}
			
			for(let j = height-stdDev; j < height; j++){
				val += lv - src[li];
				trgt[ti] = Math.round(val*iarr);
				li += width;
				ti += width;
			}
		}
	}
	
	boxBlur(src, trgt, width, height, stdDev){
		for(let i = 0; i < src.length; i++){
			trgt[i] = src[i];
		}
		this.boxBlurHorz(trgt, src, width, height, stdDev);
		this.boxBlurTotal(src, trgt, width, height, stdDev);
	}
	
	// source channel, target channel, width, height, stdDev
	gaussBlur(src, trgt, width, height, stdDev){
		const boxes = this.generateGaussBoxes(stdDev, 3);
		this.boxBlur(src, trgt, width, height, (boxes[0]-1)/2);
		this.boxBlur(trgt, src, width, height, (boxes[1]-1)/2);
		this.boxBlur(src, trgt, width, height, (boxes[2]-1)/2);
	}
	
	filter(pixels){
		// run gausBlurr for each color channel, then piece them all back together
		// see Marc Pérez's comment in http://blog.ivank.net/fastest-gaussian-blur.html
		const width = pixels.width;
		const height = pixels.height;
		const data = pixels.data;
		
		const redChannel = new Uint8ClampedArray(data.length/4);
		const greenChannel = new Uint8ClampedArray(data.length/4);
		const blueChannel = new Uint8ClampedArray(data.length/4);
		
		for(let i = 0; i < data.length; i+=4){
			redChannel[i/4] = data[i];
			greenChannel[i/4] = data[i+1];
			blueChannel[i/4] = data[i+2];
		}
		
		const blurFactor = this.params.blurFactor.value;
		this.gaussBlur(redChannel, redChannel, width, height, blurFactor);
		this.gaussBlur(greenChannel, greenChannel, width, height, blurFactor);
		this.gaussBlur(blueChannel, blueChannel, width, height, blurFactor);
		
		for(let i = 0; i < data.length; i+=4){
			data[i] = redChannel[i/4];
			data[i+1] = greenChannel[i/4];
			data[i+2] = blueChannel[i/4];
		}
		
		return pixels;
    }
}

export {
	Blur
};