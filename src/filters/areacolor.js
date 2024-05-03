// area color filter
import { FilterTemplate } from './FilterTemplate.js';

class AreaColor extends FilterTemplate {
    
  constructor(){
    super(null);
  }
    
  withinRange(r, g, b, or, og, ob, rangeVal){
    const red = Math.abs(r - or) <= rangeVal;
    const green = Math.abs(g - og) <= rangeVal;
    const blue = Math.abs(b - ob) <= rangeVal;
    if(red && green && blue){
      return true;
    }
    return false;
  }
    
  //the idea is to find an area of pixels that are similarly colored, 
  //and then making that area one solid color
  filter(pixels){
    const width = pixels.width;
    const d = pixels.data;
    const copy = new Uint8ClampedArray(d);
    const maximum = 4 * width;
    for (let i = 0; i < d.length; i += 4) {
      //current pixel
      const r = d[i];
      const g = d[i + 1];
      const b = d[i + 2];
            
      //left neighbor's color
      const lnr = copy[i - 4];
      const lng = copy[i - 3];
      const lnb = copy[i - 2];
            
      //right neighbor's color
      const rnr = copy[i + 4];
      const rng = copy[i + 5];
      const rnb = copy[i + 6];
            
      //top neighbor's color
      const tnr = copy[i - (maximum)];
      const tng = copy[i - (maximum - 1)];
      const tnb = copy[i - (maximum - 2)];
            
      //bottom neighbor's color
      const bnr = copy[i + (maximum)];
      const bng = copy[i + (maximum + 1)];
      const bnb = copy[i + (maximum + 2)];
            
      //top right
      const trr = copy[i - (maximum - 4)];
      const trg = copy[i - (maximum - 5)];
      const trb = copy[i - (maximum - 6)];
            
      //top left
      const tlr = copy[i - (maximum + 4)];
      const tlg = copy[i - (maximum + 3)];
      const tlb = copy[i - (maximum + 2)];
            
      //below left
      const blr = copy[i + (maximum - 4)];
      const blg = copy[i + (maximum - 3)];
      const blb = copy[i + (maximum - 2)];
            
      //below right
      const brr = copy[i + (maximum + 4)];
      const brg = copy[i + (maximum + 5)];
      const brb = copy[i + (maximum + 6)];
            
      //right pixel
      const cond1 = (d[i + 4] === undefined);
            
      //left pixel
      const cond2 = (d[i - 4] === undefined);
            
      //pixel below
      const cond3 = (d[i + (maximum)] === undefined);
            
      //pixel above
      const cond4 = (d[i - (maximum)] === undefined);
            
      //top left
      const cond5 = (d[i - (maximum + 4)] === undefined);
            
      //top right
      const cond6 = (d[i - (maximum - 4)] === undefined);
            
      //below right
      const cond7 = (d[i + (maximum + 4)] === undefined);
            
      //below left
      const cond8 = (d[i + (maximum - 4)] === undefined);
            
      if(!cond1 && !cond2 && !cond3 && !cond4 && !cond5 && !cond6 && !cond7 && !cond8){
        //if next neighbor over is a completely different color, stop and move on
        const nnr = copy[i + 8];
        const nng = copy[i + 9];
        const nnb = copy[i + 10];
        //next neighbor over (top right)
        //using the current data, instead of the copy which holds the original color data,
        //seems to provide closer to my desired effect
        const trrr = d[i - (maximum - 8)];
        const trrg = d[i - (maximum - 9)];
        const trrb = d[i - (maximum - 10)];
        /*
                //next neighbor over (bottom right)
                let brrr = d[i+2808];
                let brrg = d[i+2809];
                let brrb = d[i+2810];
                */
        if(!this.withinRange(r, g, b, nnr, nng, nnb, 18) ||
                    !this.withinRange(r, g, b, trrr, trrg, trrb, 16) ||
                    //!withinRange(r, g, b, brrr, brrg, brrb, 15)||
                    (rnr >= 210 && rng >= 210 && rnb >= 200)){
          continue;
        }
        const range = 50;
        //check neighbors' colors
        if(this.withinRange(r, g, b, lnr, lng, lnb, range) &&
                    this.withinRange(r, g, b, rnr, rng, rnb, range) &&
                    this.withinRange(r, g, b, tnr, tng, tnb, range) &&
                    this.withinRange(r, g, b, bnr, bng, bnb, range) &&
                    this.withinRange(r, g, b, trr, trg, trb, range) &&
                    this.withinRange(r, g, b, tlr, tlg, tlb, range) &&
                    this.withinRange(r, g, b, blr, blg, blb, range) &&
                    this.withinRange(r, g, b, brr, brg, brb, range)){
          //make all the neighbors the same color
          //right
          d[i + 4] = r;
          d[i + 5] = g;
          d[i + 6] = b;
          //left
          d[i - 4] = r;
          d[i - 3] = g;
          d[i - 2] = b;
          //above
          d[i - (maximum)] = r;
          d[i - (maximum - 1)] = g;
          d[i - (maximum - 2)] = b;
          //below
          d[i + (maximum)] = r;
          d[i + (maximum + 1)] = g;
          d[i + (maximum + 2)] = b;
          //above left
          d[i - (maximum - 4)] = r;
          d[i - (maximum - 5)] = g;
          d[i - (maximum - 6)] = b;
          //above right
          d[i - (maximum + 4)] = r;
          d[i - (maximum + 3)] = g;
          d[i - (maximum + 2)] = b;
          //below right
          d[i + (maximum + 4)] = r;
          d[i + (maximum + 5)] = g;
          d[i + (maximum + 6)] = b;
          //below left
          d[i + (maximum - 4)] = r;
          d[i + (maximum - 3)] = g;
          d[i + (maximum - 2)] = b;
        }
      }
    }
    return pixels;
  }
    
}

export {
  AreaColor
};