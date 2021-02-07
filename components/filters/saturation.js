/***
	SATURATION FILTER
	source: http://www.qoncious.com/questions/changing-saturation-image-html5-canvas-using-javascript
***/
import { FilterTemplate } from './FilterTemplate.js';

class Saturation extends FilterTemplate {
	
	constructor(){
		const params = {
			"saturationValue": {
				"value": 2.5,
				"min": 0,
				"max": 5,
				"step": 0.5,
			},
			"redLuminance": {			//constant for determining luminance of red
				"value": .3086,
				"min": 0,
				"max": 2,
				"step": .0002,
			},
			"greenLuminance": {			 //constant for determining luminance of green
				"value": .6094,
				"min": 0,
				"max": 2,
				"step": .0002,
			},
			"blueLuminance": {			//constant for determining luminance of blue
				"value": .0820,
				"min": 0,
				"max": 2,
				"step": .0002,
			}
		};
		super(params);
	}
	
	filter(pixels){
		let saturationValue = this.params.saturationValue.value;
		let d = pixels.data;
		let lumR = this.params.redLuminance.value;
		let lumG = this.params.greenLuminance.value;
		let lumB = this.params.blueLuminance.value;
		
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
	}
}

export {
	Saturation
};