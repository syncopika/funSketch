// mosaic filter
import { FilterTemplate } from './FilterTemplate.js';

class Mosaic extends FilterTemplate {
	
	constructor(){
		const params = {
			"chunkWidth": {
				"value": 40,
				"min": 1,
				"max": 50,
				"step": 1,
			},
			"chunkHeight": {
				"value": 40,
				"min": 1,
				"max": 50,
				"step": 1,
			}
		};
		super(params);
	}
	
    filter(pixels){
        let d = pixels.data;
        let copy = new Uint8ClampedArray(d);
		
        // get dimensions 
        let width = pixels.width;
        let height = pixels.height;
		
        // change sampling size here. lower for higher detail preservation, higher for less detail (because larger chunks)
        let chunkWidth = this.params.chunkWidth.value;
        let chunkHeight = this.params.chunkHeight.value;
		
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
    }
}

export {
	Mosaic
};