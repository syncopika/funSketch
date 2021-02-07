class FilterTemplate {
	constructor(params){
		// params should be an object,
		// with each key representing a parameter for a filter
		this.params = params;
	}
	
	filter(imageData){
		// all filters should have a filter method that returns imageData
		console.log("unimplemented filter");
		return imageData;
	}
}

export {
	FilterTemplate
};