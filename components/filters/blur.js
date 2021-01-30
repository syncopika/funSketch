/***
	BLUR FILTER
	this function causes a blurring effect. It takes the pixel itself and
	its left, right, above and below neighbors (if it has them)
	and calculates the average of their total R, G, B, and A channels respectively.
	http://blog.ivank.net/fastest-gaussian-blur.html
***/
import { FilterTemplate } from './FilterTemplate.js';

class Blur extends FilterTemplate {
	
	constructor(){
		super(null);
	}
	
	filter(pixels){
		let d = pixels.data;
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
        return pixels;
    }

}

export {
	Blur
};