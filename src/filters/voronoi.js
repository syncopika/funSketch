/***
	voronoi filter
	https://softwarebydefault.com/tag/voronoi-diagrams/
	https://www.codeproject.com/Articles/882739/Simple-approach-to-Voronoi-diagrams
	
	- nearest neighbor automatically creates 'boundaries'.
	- for each pixel, find the nearest neighbor (a collection of pre-selected pixels)
	- color that pixel whatever the nearest neighbor's color is
	- evenly spaced neighbors will yield a mosaic! awesome!
***/

import { Point, getPixelCoords, build2dTree, findNearestNeighbor } from "./kdtreeutils.js";
import { FilterTemplate } from './FilterTemplate.js';

class Voronoi extends FilterTemplate {
	
	constructor(){
		super(null);
	}
	
	filter(pixels){
        let width = pixels.width;
        let height = pixels.height;
		
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

        for(let i = 0; i < data.length; i += 4){
            let currCoords = getPixelCoords(i, width, height);
            let nearestNeighbor = findNearestNeighbor(kdtree, currCoords.x, currCoords.y);
			
            // found nearest neighbor. color the current pixel the color of the nearest neighbor. 
            data[i] = nearestNeighbor.r;
            data[i + 1] = nearestNeighbor.g;
            data[i + 2] = nearestNeighbor.b;
        }
		
        return pixels;
	}
}

export {
	Voronoi
}