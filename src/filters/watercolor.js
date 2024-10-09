// much thanks to https://3dstereophoto.blogspot.com/2018/05/non-photorealistic-rendering-watercolor.html

import { FilterTemplate } from './FilterTemplate.js';
import {
  applyPaperTexture,
  applyTurbulentFlow,
  applyEdgeDarkening,
  convertImgDataToInt,
  convertImgDataToFloat,
} from './watercolor/utils.js';

class Watercolor extends FilterTemplate {
    
  constructor(){
    const params = {};
    super(params);
  }
  
  // might need to make this async? return a promise
  filter(pixels){
    return new Promise((resolve, _) => {
      const width = pixels.width;
      const height = pixels.height;
          
      const data = pixels.data;
          
      // import watercolor paper texture
      const paperTextureCanvas = document.createElement('canvas');
      paperTextureCanvas.width = width;
      paperTextureCanvas.height = height;
      
      const img = new Image();
      img.onload = () => {
        const ctx = paperTextureCanvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        console.log('got paper texture');
        
        // do the filter
        
        // convert image data to float first
        const paperTextureImgData = convertImgDataToFloat([...ctx.getImageData(0, 0, width, height).data]);
        
        const origImgData = convertImgDataToFloat([...data]);
        
        console.log('image data converted to float');
        
        const beta = 0.5;
        const octaves = 6;
        const frequency0 = 0.01;
        const n = 3;
        const persistence = 0.3;
        
        const paperTextureRes = applyPaperTexture(origImgData, paperTextureImgData, width, height, beta);
        console.log('done applying paper texture');
        
        const turbulentFlowRes = applyTurbulentFlow(paperTextureRes, width, height, octaves, persistence, frequency0, beta);
        console.log('done applying turbulent flow');
        
        let edgeDarkeningRes = applyEdgeDarkening(origImgData, turbulentFlowRes, width, height, n, beta);
        console.log('done applying edge darkening');
        
        // convert edgeDarkeningRes back to int values (0 <= 255)
        // update pixels and resolve it
        edgeDarkeningRes = convertImgDataToInt(edgeDarkeningRes);
        console.log('converted data back to int');
        
        //console.log(pixels.data.length);
        //console.log(edgeDarkeningRes.length);
        //console.log(edgeDarkeningRes);
        
        edgeDarkeningRes.forEach((v, idx) => {
          pixels.data[idx] = v;
        });
        
        resolve(pixels);
      };
      
      img.src = './src/filters/watercolor/free-vector-watercolor-paper-texture.jpg';
    });
  }
}

export {
  Watercolor
};