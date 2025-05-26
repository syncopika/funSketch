import { Saturation } from './filters/saturation.js';
import { Grayscale } from './filters/grayscale.js';
import { AreaColor } from './filters/areacolor.js';
import { EdgeDetection } from './filters/edgedetection.js';
import { Invert } from './filters/invert.js';
import { Mosaic } from './filters/mosaic.js';
import { Blur } from './filters/blur.js';
//import { SimpleBlur } from './filters/simple_blur.js';
import { TargetedBlur } from './filters/targetedBlur.js';
import { Outline } from './filters/outline.js';
import { Voronoi } from './filters/voronoi.js';
import { Fisheye } from './filters/fisheye.js';
import { HorizontalShift } from './filters/shift.js';
import { CRT } from './filters/crt.js';
import { ChannelShift } from './filters/channel_shift.js';
import { Dots } from './filters/dots.js';
import { Dots2 } from './filters/dots2.js';
import { Dots3 } from './filters/dots3.js';
import { Lines } from './filters/lines.js';
import { Thinning } from './filters/thinning.js';
//import { Solidify } from './filters/solidify.js';
import { OilPainting } from './filters/oilpainting.js';
import { Painted } from './filters/painted.js';
import { Wavy } from './filters/wavy.js';
import { OutlineTop } from './filters/outlinetop.js';
import { Watercolor } from './filters/watercolor.js';
import { BilateralFilter } from './filters/bilateral.js';
import { KuwaharaPainting } from './filters/kuwahara_painting.js';

export class FilterManager {
  constructor(animationProject, imageEditorCanvasRef, brush){
    this.animationProject = animationProject;
    this.imageEditorCanvasRef = imageEditorCanvasRef;
    this.brush = brush;
        
    this.filtersMap = {
      'saturation': new Saturation(),
      'grayscale': new Grayscale(),
      'area_color': new AreaColor(),
      'edge_detection': new EdgeDetection(),
      'invert': new Invert(),
      'mosaic': new Mosaic(),
      'blur': new Blur(),
      //"simple_blur": new SimpleBlur(),
      'targeted_blur': new TargetedBlur(),
      'outline': new Outline(),
      'voronoi': new Voronoi(),
      'fisheye': new Fisheye(),
      'horizontal_shift': new HorizontalShift(),
      'cathode-ray tube-like (CRT)': new CRT(),
      'channel_shift': new ChannelShift(),
      'dots': new Dots(),
      'dots2': new Dots2(),
      'dots3': new Dots3(),
      'lines': new Lines(),
      'thinning': new Thinning(),
      //"solidify": new Solidify(),
      'painted': new Painted(),
      'oilpainting': new OilPainting(),
      'wavy': new Wavy(),
      'outline-top': new OutlineTop(),
      'watercolor': new Watercolor(),
      'bilateral_filter': new BilateralFilter(),
      'kuwahara_painted': new KuwaharaPainting(),
    };
  }

  // general filtering function. pass any kind of filter through this function.
  async filterCanvas(filter, option, currMode){
    const currFrame = this.animationProject.getCurrFrame();
    const currLayer = currMode === 'animation' ? currFrame.getCurrCanvas() : this.imageEditorCanvasRef.current;
    const context = currLayer.getContext('2d');
    const width = currLayer.getAttribute('width');
    const height = currLayer.getAttribute('height');
    const imgData = context.getImageData(0, 0, width, height);

    // save current image to snapshots stack for undo
    if(currMode === 'animation') currFrame.addSnapshot(imgData);

    // grab a new copy of image data so we don't mess with the snapshot data we just stored
    let filteredImageData;
    if(option === 'watercolor'){
      // async filter
      filteredImageData = await filter(context.getImageData(0, 0, width, height));
    }else if(option === 'targeted_blur'){
      filteredImageData = filter(currLayer);
    }else{
      filteredImageData = filter(context.getImageData(0, 0, width, height));
    }
    
    context.putImageData(filteredImageData, 0, 0);
  }
    
  // use this for select/option elements when picking a filter
  filterCanvasOption(option, currMode){
    const selectedFilter = this.filtersMap[option];
    this.filterCanvas((selectedFilter).filter.bind(selectedFilter), option, currMode); // make sure 'this' context is correct for the filtering function
  }
}