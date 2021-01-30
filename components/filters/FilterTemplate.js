class FilterTemplate {
	constructor(params){
		// params should be an object,
		// with each key representing a parameter for a filter
		this.params = params;
	}
	
	filter(){
		// all filters should have a filter method, which does the thing
		console.log("unimplemented filter");
	};
}

export {
	FilterTemplate
};