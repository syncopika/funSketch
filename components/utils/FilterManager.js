import { Saturation } from '../filters/saturation.js';
import { Grayscale } from '../filters/grayscale.js';
import { AreaColor } from '../filters/areacolor.js';
import { EdgeDetection } from '../filters/edgedetection.js';
import { Invert } from '../filters/invert.js';
import { Mosaic } from '../filters/mosaic.js';
import { Blur } from '../filters/blur.js';
import { Outline } from '../filters/outline.js';
import { Voronoi } from '../filters/voronoi.js';
import { Fisheye } from '../filters/fisheye.js';

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
	}

    // general filtering function. pass any kind of filter through this function.
    filterCanvas(filter){
		const currFrame = this.animationProject.getCurrFrame();
		const currLayer = currFrame.getCurrCanvas();
        const context = currLayer.getContext("2d");
        const width = currLayer.getAttribute('width');
        const height = currLayer.getAttribute('height');
        const imgData = context.getImageData(0, 0, width, height);

		// save current image to snapshots stack for undo
        currFrame.addSnapshot(imgData);

		// grab a new copy of image data so we don't mess with the snapshot data we just stored
        const filteredImageData = filter(context.getImageData(0, 0, width, height));
        context.putImageData(filteredImageData, 0, 0);
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