import { Saturation } from './filters/saturation.js';
import { Grayscale } from './filters/grayscale.js';
import { AreaColor } from './filters/areacolor.js';
import { EdgeDetection } from './filters/edgedetection.js';
import { Invert } from './filters/invert.js';
import { Mosaic } from './filters/mosaic.js';
import { Blur } from './filters/blur.js';
import { Outline } from './filters/outline.js';
import { Voronoi } from './filters/voronoi.js';
import { Fisheye } from './filters/fisheye.js';

class FilterManager {

	constructor(animationProject, brush){
		this.animationProject = animationProject;
		this.brush = brush;
		
		this.filtersMap = {
			"saturation": new Saturation(),
			"grayscale": new Grayscale(),
			"area_color": new AreaColor(),
			"edge_detection": new EdgeDetection(),
			"invert": new Invert(),
			"mosaic": new Mosaic(),
			"blur": new Blur(),
			"outline": new Outline(),
			"voronoi": new Voronoi(),
			"fisheye": new Fisheye(),
		};
		
		this.tempImage = null; // only push current image to snapshots if a tempImage exists already.
		// this way when undo is called the image being looked at by the user won't already be saved in snapshots,
		// and so undo wouldn't need to be clicked twice to see the last saved image. a bit confusing. :/
	}

    // general filtering function. pass any kind of filter through this function.
    filterCanvas(filter){
		let currCanvas = this.animationProject.getCurrFrame().getCurrCanvas();
        let context = currCanvas.getContext("2d");
        let width = currCanvas.getAttribute('width');
        let height = currCanvas.getAttribute('height');
        let imgData = context.getImageData(0, 0, width, height);
		
        // save current image to snapshots stack
        if(this.tempImage){
            this.brush.currentCanvasSnapshots.push(this.tempImage);
        }
        let filteredImageData = filter(imgData);
        context.putImageData(filteredImageData, 0, 0);
        this.tempImage = imgData;
    }
	
    // use this for select/option elements when picking a filter
    filterCanvasOption(option){
		const selectedFilter = this.filtersMap[option];
        this.filterCanvas((selectedFilter).filter.bind(selectedFilter)); // make sure 'this' context is correct for the filtering function
    }

}

export {
	FilterManager
};