/***
    voronoi filter
    https://softwarebydefault.com/tag/voronoi-diagrams/
    https://www.codeproject.com/Articles/882739/Simple-approach-to-Voronoi-diagrams
    
    - nearest neighbor automatically creates 'boundaries'.
    - for each pixel, find the nearest neighbor (a collection of pre-selected pixels)
    - color that pixel whatever the nearest neighbor's color is
    - evenly spaced neighbors will yield a mosaic! awesome!
***/

import { Point, getPixelCoords, build2dTree, findNearestNeighbor } from './kdtreeutils.js';
import { FilterTemplate } from './FilterTemplate.js';

class Voronoi extends FilterTemplate {
    
  constructor(){
    const params = {
      'neighborCount': {
        'value': 30,
        'min': 5,
        'max': 80,
        'step': 1,
      }
    };
    super(params);
  }
    
  filter(pixels){
    const width = pixels.width;
    const height = pixels.height;
        
    const data = pixels.data; //imgData.data;
    const neighborList = []; // array of Points 
        
    for(let i = 0; i < data.length; i += 4){
      // get neighbors.
      const pixelCoords = getPixelCoords(i, width, height);
      const neighborCount = this.params.neighborCount.value;
            
      if(pixelCoords.x % Math.floor(width / neighborCount) === 0 && pixelCoords.y % Math.floor(height / neighborCount) === 0 && pixelCoords.x !== 0){
        // add some offset to each neighbor for randomness (we don't really want evenly spaced neighbors)
        const offset = Math.floor(Math.random() * 10); // to be applied in x or y direction
        const sign = Math.random() > .5 ? 1 : -1;
                
        const x = (sign * offset) + pixelCoords.x;
        const y = (sign * offset) + pixelCoords.y;
        const pt = new Point(x, y, data[i], data[i + 1], data[i + 2]);
        neighborList.push(pt);
      }
    }
        
    const kdtree = build2dTree(neighborList, 0);

    for(let i = 0; i < data.length; i += 4){
      const currCoords = getPixelCoords(i, width, height);
      const nearestNeighbor = findNearestNeighbor(kdtree, currCoords.x, currCoords.y);
            
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
};