// goal: figure out the main colors of the image and then find the closest main color for each pixel and make it that color.
// this is kinda like areacolor.js actually I realized lol. but here I'm exploring another possible route.

// https://www.alanzucconi.com/2015/05/24/how-to-find-the-main-colours-in-an-image/
// https://stackoverflow.com/questions/3241929/python-find-dominant-most-common-color-in-an-image
// https://stackoverflow.com/questions/5050250/fast-way-of-getting-the-dominant-color-of-an-image
// https://www.crisluengo.net/archives/932/

import { FilterTemplate } from './FilterTemplate.js';

class Solidify extends FilterTemplate {    
  // TODO: let user choose which colors should be the main colors that should make up the image?
    
  constructor(){
    const params = {
      'numColors': {
        'value': 70,
        'min': 10,
        'max': 90,
        'step': 1,
      }
    };
    super(params);
        
    this.colors = {};
    this.maxColors = [];
    this.colorMatchCache = {};
  }
    
  findMatch(r, g, b){
    let bestMatch = 'rgb(0,0,0)';
    let smallestDistance = 1000000;
        
    const currColor = `rgb(${r},${g},${b})`;
        
    if(this.colorMatchCache[currColor]){
      return this.colorMatchCache[currColor].match(/[0-9]{1,3}/g);
    }
        
    for(let i = 0; i < Math.min(this.maxColors.length, this.params.numColors.value); i++){
      const targetColor = this.maxColors[i][0];
      const channelValues = targetColor.match(/[0-9]{1,3}/g);
            
      //console.log(targetColor);
      const targetR = channelValues[0];
      const targetG = channelValues[1];
      const targetB = channelValues[2];
            
      // calculate distance
      const dist = Math.sqrt(
        (targetR - r)*(targetR - r) +
                (targetG - g)*(targetG - g) +
                (targetB - b)*(targetB - b));
            
      // if distance smaller than smallestDistance, update
      if(dist < smallestDistance){
        smallestDistance = dist;
        bestMatch = `rgb(${targetR},${targetG},${targetB})`;
      }
    }
        
    this.colorMatchCache[currColor] = bestMatch;
        
    return bestMatch.match(/[0-9]{1,3}/g);
  }
    
  filter(pixels){
    const width = pixels.width;
    const height = pixels.height;
        
    const data = pixels.data;
        
    for(let i = 0; i <= data.length - 4; i += 4){
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const color = `rgb(${r},${g},${b})`;
      if(this.colors[color]){
        this.colors[color]++;
      }else{
        this.colors[color] = 1;
      }
    }
        
    // TODO: maybe preprocess this further and combine counts of colors that are really close/within a certain distance, if possible? but that's a hard problem too
    // using the frequency at which a color appears to use in the palette for color matches isn't a really great idea (e.g. an image could consist of mostly a single
    // color in the background and so is rather insignificant and shouldn't be a color candidate to match against) - which is why letting user choose palette would be good. but that may be tricky to implement. :)
    const sortable = Object.entries(this.colors).sort(([,a],[,b]) => b-a);
    this.maxColors = sortable;
        
    for(let i = 0; i < height; i++){
      for(let j = 0; j < width; j++){
        const r = data[(i * width * 4) + (j * 4)];
        const g = data[(i * width * 4) + (j * 4) + 1];
        const b = data[(i * width * 4) + (j * 4) + 2];
                
        const bestMatchColor = this.findMatch(r, g, b);
                
        data[(i * width * 4) + (j * 4)] = bestMatchColor[0];
        data[(i * width * 4) + (j * 4) + 1] = bestMatchColor[1];
        data[(i * width * 4) + (j * 4) + 2] = bestMatchColor[2];
      }
    }
        
    this.colorMatchCache = {};
    this.colors = {};
    this.maxColors = [];
        
    return pixels;
  }
}

export {
  Solidify
};