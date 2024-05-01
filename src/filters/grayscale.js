// grayscale filter
import { FilterTemplate } from './FilterTemplate.js';

class Grayscale extends FilterTemplate {
    
  constructor(){
    super(null); // no adjustable parameters for this filter
  }
    
  filter(pixels){
    const d = pixels.data;
    for(let i = 0; i < d.length; i += 4){
      const r = d[i];
      const g = d[i + 1];
      const b = d[i + 2];
      //the value obtained by (r+g+b)/3 will be the value assigned to d[i], d[i+1], and d[i+2].  
      d[i] = d[i + 1] = d[i + 2] = (r + g + b) / 3;
    }
    return pixels;
  }
}

export {
  Grayscale
};