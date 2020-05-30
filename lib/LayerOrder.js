import {useState} from 'react';


function saveNewLayerOrder(updateParentStateFunc){
	let layers = [...document.querySelectorAll('[id^="layerOrder"]')].map((el)=>{ 
		// currently each element is like "layer <number>". 
		// map the list so that we get the number - 1, because we want list indexes so we can 
		// rearrange the order of the layers accordingly
		return parseInt(el.textContent.split(' ')[1])-1;
	});
	console.log(layers);
	//updateParentStateFunc(); // update parent state. don't forget to pass arg
}


const LayerOrder = (props) => {
	let show = props.changingLayerOrder;
	let updateParentState = props.updateParentStateFunction; // need to pass arg to this function
	let animationProj = props.animationProject;					
	let layers = animationProj ? animationProj.getCurrFrame().canvasList.map((x, idx) => idx) : [];
	
	// https://www.html5rocks.com/en/tutorials/dnd/basics/
	// https://stackoverflow.com/questions/46138145/functions-in-stateless-components
	// https://stackoverflow.com/questions/53176610/react-functional-component-reinitialises-local-functions-and-variables-on-re-ren
	// https://stackoverflow.com/questions/10716986/swap-two-html-elements-and-preserve-event-listeners-on-them
	
	// after swapping 2 layers, animationProject needs to be updated and parent component needs state update!
	// the state update will be taken care of by the function in toolbar.js that hooked up the element with the button click event
	// actually updating the animationProject object with the new order of layers can be taken care of here (just call the current frame's swap method)
	
	// pressing done closes this component
	// close the component by updating parent state's changingLayerOrder field to false
	// AND also update the new layer order for the current frame using animationProject of the parent
	
	let style = {
		"text-align": "center"
	};
	
	let elementStyle = {
		"margin": "2px auto",
		"text-align": "center",
		"border": "1px solid #000",
	};
	
	// use a hook to be able to drag and drop with 
	const [dragSourceEl, setDragSourceEl] = useState(0);
	
	if(show){
		return (
			<div style={style}>
				<h4> layer order for current frame: </h4>
				{
					layers.map((layerNum, index) => {
						return <div 
							style={elementStyle} 
							key={index}
							id={("layerOrder_"+index)}
							
							onDragStart={
								function(e){
									
									e.stopPropagation();
									
									let thisEl = e.target;
									thisEl.style.opacity = 0.5;
									setDragSourceEl(thisEl);
									e.dataTransfer.effectAllowed = "move";
									e.dataTransfer.setData("text/html", thisEl.innerHTML);
								}
							}
							
							onDragEnter={
								function(e){
									e.target.style.border = "1px dotted #000";
								}
							}
							
							onDragOver={
								function(e){
									e.preventDefault();
								}
							}
							
							onDragLeave={
								function(e){
									e.target.style.border = "1px solid #000";
								}
							}
							
							onDrop={
								function(e){
									let thisEl = e.target;

									// e is the target element to drop on
									e.stopPropagation();
									
									// do nothing if target is the same as the element being dragged
									if(dragSourceEl != thisEl){
										dragSourceEl.innerHTML = thisEl.innerHTML;
										thisEl.innerHTML = e.dataTransfer.getData('text/html');
									}
									
									// make sure source goes back to normal opacity
									dragSourceEl.style.opacity = 1;
									
									// also make sure target has its border style restored
									thisEl.style.border = "1px solid #000";
									
									e.preventDefault();
								}
							}
							
							draggable={"true"}
							
						>layer {layerNum+1}</div>
					})
				}
				<button
					id={"doneChangingLayerButton"}
					onClick={
						function(){
							saveNewLayerOrder(updateParentState);
						}
					}
				> done </button>
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