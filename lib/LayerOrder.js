
const LayerOrder = (props) => {
	let show = props.changingLayerOrder;
	let animationProj = props.animationProject;					
	let layers = animationProj ? animationProj.getCurrFrame().canvasList.map((x, idx) => idx) : [];
	//console.log(layers);
	
	// after swapping 2 layers, animationProject needs to be updated and parent component needs state update!
	// the state update will be taken care of by the function in toolbar.js that hooked up the element with the button click event
	// actually updating the animationProject object with the new order of layers can be taken care of here (just call the current frame's swap method)
	
	// pressing done closes this component
	
	let style = {
		"text-align": "center"
	};
	
	let elementStyle = {
		"margin": "2px auto",
		"text-align": "center",
		"border": "1px solid #000"
	};
	
	if(show){
		return (
			<div style={style}>
				<h4> layer order for current frame: </h4>
				{
					layers.map((layerNum, index) => {
						return <div style={elementStyle} key={index}>layer {layerNum+1}</div>
					})
				}
				<button> done </button>
			</div>
		);
	}else{
		return (
			<div></div>
		)
	}
}


export{
	LayerOrder
}