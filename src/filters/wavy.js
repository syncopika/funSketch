import { FilterTemplate } from './FilterTemplate.js';

// wavy filter
// https://stackoverflow.com/questions/29586754/how-can-i-recreate-this-wavy-image-effect

class Wavy extends FilterTemplate {
    
  constructor(){
    const params = {
      "waveSpeed": {
        "value": 0.08,
        "min": 0.01,
        "max": 1.0,
        "step": 0.01,
      },
    };
    super(params);
  }
  
  filter(pixels){
    const width = pixels.width;
    const height = pixels.height;
        
    const data = pixels.data;
        
    // make a temp canvas and set it to white
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
        
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.fillStyle = '#fff';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        
    let tempPixelData = tempCtx.getImageData(0, 0, width, height);
    for(let i = 0; i < pixels.data.length; i++){
      tempPixelData.data[i] = pixels.data[i];
    }
        
    tempCtx.putImageData(tempPixelData, 0, 0);
        
    // set up oscillations
    const oscillators = [];
    const numOscs = 3;
    const speed = this.params.waveSpeed.value;
    for(let i = 0; i < numOscs; i++){
      oscillators.push(
        (val) => Math.sin(val * speed)
      );
    }
        
    for(let y = 0; y < height; y++){
      // grid line x-positions
      const x0 = 0;
      const x1 = width * 0.25;
      const x2 = width * 0.5;
      const x3 = width * 0.75;
      const x4 = width;
            
      // x-positions for the oscillator waves
      const waveX1 = x1 + oscillators[0](y * 0.2) * 3;
      const waveX2 = x2 + oscillators[1](y * 0.2) * 3;
      const waveX3 = x3 + oscillators[2](y * 0.2) * 3;
            
      // get width of segments determined by the distance between waves
      const width0 = waveX1;
      const width1 = waveX2 - waveX1;
      const width2 = waveX3 - waveX2;
      const width3 = x4 - waveX3;
            
      // draw each segment taken from source back to the canvas, taking into account
      // the distance between each wave. drawImage will automatically scale the image segment
      // as needed.
      tempCtx.drawImage(tempCanvas, x0, y, x1, 1, 0, y, width0, 1);
      tempCtx.drawImage(tempCanvas, x1, y, x2 - x1, 1, waveX1 - 0.5, y, width1, 1);
      tempCtx.drawImage(tempCanvas, x2, y, x3 - x2, 1, waveX2 - 1, y, width2, 1);
      tempCtx.drawImage(tempCanvas, x3, y, x4 - x3, 1, waveX3 - 1.5, y, width3, 1);
    }
        
    tempPixelData = tempCtx.getImageData(0, 0, width, height);
    for(let i = 0; i < pixels.data.length; i++){
      pixels.data[i] = tempPixelData.data[i];
    }
        
    return pixels;
  }
}

export {
  Wavy
};