// edge detection filter
import { FilterTemplate } from './FilterTemplate.js';

class EdgeDetection extends FilterTemplate {
	
	constructor(){
		super(null);
	}
	
	grayscale(){
		// TODO
	}
	
	filter(pixels){
        let width = pixels.width;
        let height = pixels.height;
        let data = pixels.data;
        
		let sourceImageCopy = new Uint8ClampedArray(data);
        
		// need to grayscale the image here :/
		pixels = this.grayscale(pixels);
        
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
	}
}

export {
	EdgeDetection
};