// invert filter
import { FilterTemplate } from './FilterTemplate.js';

class Invert extends FilterTemplate {
	
	constructor(){
		super(null);
	}
	
	filter(pixels){
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
    }
}

export {
	Invert
};