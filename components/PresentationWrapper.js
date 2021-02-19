import React from 'react';
import { AnimationProject } from './utils/AnimationProject.js';
import { Toolbar } from './utils/Toolbar.js';
import { BrushManager } from './utils/BrushManager.js';
import { FilterManager } from './utils/FilterManager.js';
import { AnimationTimeline } from './AnimationTimeline.js';
import { LayerOrder } from './LayerOrder.js';
import { FilterDashboard } from './FilterDashboard.js';
import { BrushDashboard } from './BrushDashboard.js';

// for displaying current frame and layer number
// TODO: importing a project won't update the counter display since it's using the Toolbar class functions
// and so the PresentationWrapper's state doesn't get updated with the new currentFrame/Layer
const FrameCounterDisplay = (props) => {
	return (
		<div id='pageCount'>
			<h3 id='prevFrame'> &#9664; &nbsp;&nbsp;</h3>
			<h3 id='goLeft'> &#60; </h3>
			<h3 id='count'> frame: {props.currFrame}, layer: {props.currLayer} </h3>
			<h3 id='goRight'> &#62; </h3>
			<h3 id='nextFrame'>&nbsp;&nbsp;	&#9654;</h3>
		</div>
	);
}

class PresentationWrapper extends React.Component {

	constructor(props){
		super(props);
		this.state = {
			'animationProject': null,
			'brushInstance': null,
			'toolbarInstance': null,
			'filtersInstance': null,
			'currentFrame': 1,
			'currentLayer': 1,
			'timelineFrames': [],
			'timelineMarkers': {}, // keep track of where fps should change - not 0-indexed!
			'changingLayerOrder': false
		};
		
		this.timelineFramesSet = new Set(); // keep track of what frames have been added to timeline so we don't duplicate - 0-indexed!
	}
	
	_getCoordinates(canvas, event){
		let rect = canvas.getBoundingClientRect();
		let scaleX = canvas.width / rect.width;
		let scaleY = canvas.width / rect.height;
		let x = (event.clientX - rect.left) * scaleX;
		let y = (event.clientY - rect.top) * scaleY;
		return {'x': x, 'y': y, 'rect': rect};
	}
	
	_timelineMarkerSetup(){
		const timelineCanvas = document.getElementById('animationTimelineCanvas');
		
		// make sure pixel width of canvas is the same as the timeline element
		timelineCanvas.width = document.getElementById('animationTimeline').clientWidth;
		timelineCanvas.height = document.getElementById('animationTimeline').clientHeight - 20; // leave a gap for the scrollbar
		
		timelineCanvas.addEventListener('mousemove', (event) => {
			
			const context = timelineCanvas.getContext('2d');
			// clear canvas first
			context.clearRect(0, 0, timelineCanvas.width, timelineCanvas.height);
			// get canvas coordinates
			
			const coords = this._getCoordinates(timelineCanvas, event);
			const x = coords.x;
			const y = coords.y;
			const rect = coords.rect;
			
			context.beginPath();
			context.moveTo(x, 0);
			context.lineTo(x, rect.height);
			context.stroke();
			// just get all y-coords while holding that x coord
			// draw a line
			// if click, mark that line in canvas. have to figure out how to not erase that line 
			// how wide should line be?
			// also need to figure out how to translate distance between lines as frames per second...
			// you also can't have half a frame be a different frame rate than the other half...
		});
		
		timelineCanvas.addEventListener('mouseleave', (event) => {
			const context = timelineCanvas.getContext('2d');
			context.clearRect(0, 0, timelineCanvas.width, timelineCanvas.height);
		});
		
		timelineCanvas.addEventListener('click', (event) => {
			// also take into account horizontal scroll distance, if any
			const scrollDistance = document.getElementById('animationTimeline').scrollLeft;
			
			const coords = this._getCoordinates(timelineCanvas, event);
			const x = coords.x + scrollDistance;
			const y = coords.y;
			
			// which frame does this coordinate match to?
			if(this.state.timelineFrames.length > 0){
				const width = 123; // don't hardcode this? it should be based on img width in the timeline
				const frameGuess = Math.floor(x/width) + 1;
				
				if(frameGuess <= this.state.timelineFrames.length){
				
					// update markers in state
					let markers = this.state.timelineMarkers;
					
					// use frame number as the key
					markers[frameGuess] = {
						'xCoord': x, 
						'frameNumber': frameGuess, 
						'speed': 100, 
						'frame': this.state.timelineFrames[frameGuess-1] 
					};
					
					this.state.toolbarInstance.goToFrame(frameGuess-1);
					
					this.setState({
						'timelineMarkers': markers,
						'currentFrame': frameGuess,
						'currentLayer': 1
					});
				}
			}
		});
	}
	
	_timelineMarkerDelete(frameNumToDelete){
		let currentMarkers = this.state.timelineMarkers;
		
		if(!delete currentMarkers[frameNumToDelete]){
			console.log("couldn't delete frame marker for frame: " + frameNumToDelete);
		}
		
		this.setState({
			'timelineMarkers': currentMarkers
		});
	}
	
	_moveToFrame(direction){
		const animationProj = this.state.animationProject;
		const toolbar = this.state.toolbarInstance;
		const brush = this.state.brushInstance;
		
		const currFrameIndex = animationProj.getCurrFrameIndex();
		const frame = toolbar.mergeFrameLayers(animationProj.getCurrFrame());
		const currFrameData = frame.toDataURL();
		
		const newFrames = [...this.state.timelineFrames];
		
		if(!this.timelineFramesSet.has(currFrameIndex)){
			// if the animation timeline doesn't have the current frame, add it
			newFrames.push({"data": currFrameData, "height": frame.height, "width": frame.width});
			this.timelineFramesSet.add(currFrameIndex);
		}else{
			// update image data in the animation timeline
			newFrames[currFrameIndex].data = currFrameData;
		}
		
		this.setState({
			'timelineFrames': newFrames,
			'changingLayerOrder': false,
		});
		
		if(direction === "prev"){
			if(toolbar.prevFrame()){
				return true;
			}
		}else{
			if(toolbar.nextFrame()){
				return true;
			}
		}
		return false;
	}
	
	_setKeyDown(doc){
		
		const toolbar = this.state.toolbarInstance;
		const animationProj = this.state.animationProject;
		const self = this;

		doc.addEventListener('keydown', function(evt){
			let updateStateFlag = false;
			let frame = null;
			switch(evt.which){
				case 37: //left arrow key
					if(toolbar.prevLayer()){
						frame = animationProj.getCurrFrame();
						updateStateFlag = true;
					}
					break;
				case 39: //right arrow key
					if(toolbar.nextLayer()){
						frame = animationProj.getCurrFrame();
						updateStateFlag = true;
					}
					break;
				case 32: //space bar
					if(toolbar.layerMode){
						toolbar.addNewLayer();
					}else{
						animationProj.addNewFrame(false);
					}
					break;
				case 65: // a key 
				{
					updateStateFlag = self._moveToFrame("prev");
					frame = animationProj.getCurrFrame();				
					break;
				}
				case 68: // d key 
				{
					updateStateFlag = self._moveToFrame("next");
					frame = animationProj.getCurrFrame();
					break;
				}
				default:
					break;
			}
			evt.preventDefault();
			if(updateStateFlag){
				self.setState({
					'currentFrame': animationProj.getCurrFrameIndex() + 1,
					'currentLayer': frame.getCurrCanvasIndex() + 1
				});
				frame = null;
				updateStateFlag = false;
			}
		});
	}
	
	_setupToolbar(){
		const newToolbar = this.state.toolbarInstance;
		const project = this.state.animationProject;
		
		newToolbar.setCounter("count");
		newToolbar.createColorWheel('colorPicker', 200);
		newToolbar.insertLayer('insertCanvas');
		newToolbar.deleteLayer('deleteCanvas', (newLayerIndex) => {
			this.setState({
				'currentLayer': newLayerIndex + 1,
			});
		});
		
		newToolbar.deleteCurrentFrameButton('deleteCurrFrame', (frameIndexToRemove) => {
			let newTimelineFrames = [...this.state.timelineFrames];
			newTimelineFrames.splice(frameIndexToRemove, 1);
			
			this.timelineFramesSet = new Set(Array.from(newTimelineFrames, (x, idx) => idx));
			
			let newTimelineMarkers = {};
			
			Object.keys(this.state.timelineMarkers).forEach((key, index) => {
				// since we removed a frame, reassign new frame indexes to each entry in the object
				if(parseInt(key) !== (frameIndexToRemove+1)){
					newTimelineMarkers[index+1] = this.state.timelineMarkers[key];
				}
			});
			
			this.setState({
				'currentFrame': project.getCurrFrameIndex() + 1,
				'currentLayer': project.getCurrFrame().getCurrCanvasIndex() + 1,
				'timelineFrames': newTimelineFrames,
				'timelineMarkers': newTimelineMarkers
			});
		});
		
		// change layer order for current frame
		newToolbar.changeCurrentFrameLayerOrder('changeLayerOrder', (someArg) => {
			// update state to show layer order currently
			this.setState({"changingLayerOrder": true});
		});
			
		newToolbar.duplicateLayer('duplicateCanvas');
		newToolbar.setClearCanvas('clearCanvas');
		newToolbar.downloadLayer('downloadLayer');
		
		newToolbar.addNewFrameButton('addNewFrame');
		newToolbar.copyCurrFrameButton('copyCurrFrame');
		newToolbar.changeCurrentFrameLayerOrder('changeLayerOrder');
		newToolbar.downloadFrame('downloadFrame');
		
		newToolbar.rotateImage('rotateCanvasImage'); 
		newToolbar.undo('undo');
		newToolbar.importImage('importImage');
		newToolbar.save('saveWork');
		
		newToolbar.importProject('importProject', () => {
			this.setState({
				'currentFrame': 1,
				'currentLayer': 1,
				'timelineFrames': [],
				'timelineMarkers': {}
			});
			
			this.timelineFramesSet = new Set();
			
			// update animation timeline after project is loaded
			let newFrames = [];
			project.frameList.forEach((frame, index) => {
				let mergedLayersFrame = newToolbar.mergeFrameLayers(frame);
				let currFrameData = mergedLayersFrame.toDataURL();
				let currFrameIndex = index;
				
				if(!this.timelineFramesSet.has(currFrameIndex)){
					newFrames.push({"data": currFrameData, "height": mergedLayersFrame.height, "width": mergedLayersFrame.width});
					this.timelineFramesSet.add(currFrameIndex);
				}else{
					// update image data
					newFrames[currFrameIndex].data = currFrameData;
				}
			});
			
			// figure out which layer is the one that should be visible 
			let visibleLayerIndex = 0;
			let layers = project.frameList[0].canvasList;
			for(var i = 0; i < layers.length; i++){
				if(layers[i].style.opacity >= .97){
					visibleLayerIndex = i;
					break;
				}
			}
			
			this.setState({
				'currentLayer': visibleLayerIndex + 1,
				'timelineFrames': newFrames
			});
		});
		
		// make the goLeft and goRight arrows clickable FOR LAYERS
		// note: this is for clicking the icons with a mouse!
		document.getElementById('goLeft').addEventListener('click', () => {
			if(newToolbar.prevLayer()){
				let curr = project.getCurrFrame();
				this.setState({
					'currentFrame': project.getCurrFrameIndex() + 1,
					'currentLayer': curr.getCurrCanvasIndex() + 1
				});
			}
		});

		document.getElementById('goRight').addEventListener('click', () => {
			if(newToolbar.nextLayer()){
				let curr = project.getCurrFrame();
				this.setState({
					'currentFrame': project.getCurrFrameIndex() + 1,
					'currentLayer': curr.getCurrCanvasIndex() + 1
				});
			}
		});

		// left and right arrows for FRAMES
		document.getElementById('prevFrame').addEventListener('click', () => {
			if(this._moveToFrame("prev")){
				let curr = project.getCurrFrame();
				this.setState({
					'currentFrame': project.getCurrFrameIndex() + 1,
					'currentLayer': curr.getCurrCanvasIndex() + 1
				});
			}
		});

		document.getElementById('nextFrame').addEventListener('click', () => {
			if(this._moveToFrame("next")){
				let curr = project.getCurrFrame();
				this.setState({
					'currentFrame': project.getCurrFrameIndex() + 1,
					'currentLayer': curr.getCurrCanvasIndex() + 1
				});
			}
		});

		document.getElementById('generateGif').addEventListener('click', () => {
			let frameSpeedMarkers = {};
			
			// if there's at least one timeline marker, we need to apply frame speed for each frame 
			// based on the marker
			// the initial speed will be whatever speed is currently selected (if no marker on the first frame)
			if(Object.keys(this.state.timelineFrames).length > 0){
				let currFrameSpeed = parseInt(document.getElementById('timePerFrame').selectedOptions[0].value);
				this.state.timelineFrames.forEach((frame, index) => {
					if(this.state.timelineMarkers[index+1]){
						currFrameSpeed = this.state.timelineMarkers[index+1].speed
					}
					frameSpeedMarkers[index+1] = currFrameSpeed;
				});
			}
			
			newToolbar.getGif("loadingScreen", frameSpeedMarkers);
		});

		document.getElementById('toggleLayerOrFrame').addEventListener('click', () => {
			let element = document.getElementById("toggleLayerOrFrame");
			if(newToolbar.layerMode){
				newToolbar.layerMode = false;
				element.textContent = "toggle layer addition on spacebar press";
			}else{
				newToolbar.layerMode = true;
				element.textContent = "toggle frame addition on spacebar press";
			}
		});
		
		// toggle instructions 
		document.getElementById('toggleInstructions').addEventListener('click', function(evt){
			let instructions = document.querySelectorAll('.instructions');
			[...instructions].forEach((inst) => {
				if(inst.style.display === "none"){
					inst.style.display = "block";
					this.textContent = "hide instructions";
				}else{
					inst.style.display = "none";
					this.textContent = "show instructions";
				}
			});
		});
		
		// toggle pen pressure for brush color
		document.getElementById('togglePenPressureColor').addEventListener('click', (evt) => {
			this.state.brushInstance.togglePressureColorFlag();
		});
	}
	
	_setupAnimationControl(){
		document.getElementById('timePerFrame').addEventListener('onchange', (evt) => {
			this.state.toolbarInstance.timePerFrame = parseInt(evt.target.selectedOptions[0].value);
		});
	}
	
	_linkDemos(){
		let demoSelect = document.getElementById("chooseDemo");
		demoSelect.addEventListener("change", (evt) => {
			this._getDemo(evt.target.selectedOptions[0].value);
		});
	}
	
	_showOptions(category){
		let el = document.getElementById(category);
		let child = el.children[1]; // skip the p element and get the ul element
		if(child.style.display !== "block" ){
			child.style.display = "block";
		}else{
			child.style.display = "none";
			el.style.marginBottom = 0;
		}
	}
	
	_playAnimation(){
		let timelineFrames = this.state.timelineFrames;
		if(Object.keys(timelineFrames).length === 0){
			return;
		}

		let currFrame = this.state.animationProject.getCurrFrame();
		let animationDisplay = document.createElement('canvas');
		
		// all frames should have the same dimensions
		animationDisplay.width = currFrame.currentCanvas.width; 
		animationDisplay.height = currFrame.currentCanvas.height;
		
		animationDisplay.style.zIndex = 200;
		animationDisplay.style.border = '1px solid #000';
		animationDisplay.style.position = 'absolute';
		animationDisplay.style.opacity = 1.0;
		animationDisplay.id = "animationDisplay";
		document.getElementById("canvasArea").appendChild(animationDisplay);

		let displayContext = animationDisplay.getContext('2d');
		displayContext.fillStyle = "#ffffff";
		displayContext.fillRect(0, 0, displayContext.width, displayContext.height);
		
		let totalElapsedTime = 0;
		let lastSpeed = this.state.toolbarInstance.timePerFrame;
		
		timelineFrames.forEach((frame, index) => {
			
			if(this.state.timelineMarkers[index+1]){
				lastSpeed = parseInt(this.state.timelineMarkers[index+1].speed);
			}
			
			setTimeout(() => {
				// set the animation canvas to white instead of clearRect 
				// we don't want transparency otherwise we'll see our current frame we were working on flash between animation frames
				displayContext.fillRect(0, 0, displayContext.width, displayContext.height);
				
				let image = new Image();
				image.onload = () => {
					displayContext.drawImage(image, 0, 0);
					// remove animationDisplay after last frame
					if(index+1 === timelineFrames.length){
						setTimeout(() => {
							document.getElementById("canvasArea").removeChild(animationDisplay);
						}, lastSpeed);
					};
				};
				image.src = frame.data;
			}, totalElapsedTime + lastSpeed);
			
			totalElapsedTime += lastSpeed;
			
		});
	}
	
	_getDemo(selected){
		// case for the blank option 
		if(selected === ""){
			return;
		}

		// get the selected demo from the dropbox
		// selectedDemo is the path to the demo to load 
		let selectedDemo = "demos/" + selected + ".json"; 

		let httpRequest = new XMLHttpRequest();

		if(!httpRequest){
			return;
		}
		
		// set request type
		httpRequest.open("GET", selectedDemo);
		
		// what to do when data comes back
		httpRequest.onload = () => {
			
			let toolbar = this.state.toolbarInstance;
			let project = this.state.animationProject;
			let self = this;
			
			// parse the JSON using JSON.parse 
			let data = JSON.parse(httpRequest.responseText);

			if(!data[0] || (!data[0].name && !data[0].height && !data[0].width && !data[0].data)){
				console.log("it appears to not be a valid project! :<");
				return;
			}

			// clear existing project
			project.resetProject();
			
			// load saved project
			data.forEach(function(frame, index){
				if(index > 0){
					// add a new frame
					project.addNewFrame(false);
				}
				// overwrite existing frame
				// TODO: implement an updateFrame method 
				// animationProj.updateFrame(0, frame); // updateFrame takes an index of the existing frame to overwrite and takes a Frame object to update with as well
				let currFrame = project.frameList[index];
				let currFrameLayersFromImport = frame.layers; // looking at data-to-import's curr frame's layers
				let currFrameLayersFromCurrPrj = currFrame.getLayers();
				
				// make sure current index (the layer that should be showing) of this frame is consistent with the data
				currFrame.currentIndex = frame.currentIndex;
				
				currFrameLayersFromImport.forEach(function(layer, layerIndex){
					if((layerIndex+1) > currFrameLayersFromCurrPrj.length){
						// add new layer to curr project as needed based on import
						currFrame.setupNewLayer();
					}
					
					let currLayer = currFrame.getLayers()[layerIndex];
					if(layerIndex === currFrame.currentIndex){
						currFrame.currentCanvas = currLayer;
					}
					
					// is this part necessary? maybe, if you want the project to look exactly as when it was saved.
					currLayer.style.opacity = layer.opacity;
					currLayer.style.zIndex = layer.zIndex; 
					
					// add the image data 
					let newCtx = currLayer.getContext("2d");
					let img = new Image();
					
					(function(context, image){
						image.onload = function(){
							
							context.drawImage(image, 0, 0);
							
							// update state
							if(index === data.length - 1){
								self.timelineFramesSet = new Set();
								
								// update animation timeline after project is loaded
								let newFrames = [];
								project.frameList.forEach((frame, index) => {
									let mergedLayersFrame = toolbar.mergeFrameLayers(frame);
									let currFrameData = mergedLayersFrame.toDataURL();
									let currFrameIndex = index;
									
									if(!self.timelineFramesSet.has(currFrameIndex)){
										newFrames.push({"data": currFrameData, "height": mergedLayersFrame.height, "width": mergedLayersFrame.width});
										self.timelineFramesSet.add(currFrameIndex);
									}else{
										// update image data
										newFrames[currFrameIndex].data = currFrameData;
									}
								});
								
								self.setState({
									'timelineFrames': newFrames,
									'currentFrame': 1,
									'currentLayer': 1,
									'timelineMarkers': {}
								});
							}
						}
						image.src = layer.imageData;
					})(newCtx, img);
					
				});
			});
		}
		httpRequest.send();
	}
	

	componentDidMount(){
		const animationProj = new AnimationProject('canvasArea');
		animationProj.addNewFrame(true); 
		
		const newBrush = new BrushManager(animationProj);
		newBrush.brushesMap["default"].attachBrush();
		
		const newFilters = new FilterManager(animationProj, newBrush);
		const newToolbar = new Toolbar(newBrush, animationProj);
		
		this.setState({
			'animationProject': animationProj,
			'brushInstance': newBrush,
			'toolbarInstance': newToolbar,
			'filtersInstance': newFilters
		}, () => {
			this._setupToolbar();
			this._linkDemos();
			this._setKeyDown(document); // set key down on the whole document
			this._timelineMarkerSetup();
		});
	}
	
	componentDidUpdate(){
		// make the active canvas shown reflect the state's current frame and layer? instead of toggling it in different places
	}
	
	_clickCaret(evt){
		let id = evt.target.id;
		let target = document.getElementById("display" + id);
		if(target.style.display !== "none"){
			target.style.display = "none";
			evt.target.innerHTML = "&#9656;";
		}else{
			target.style.display = "block";
			evt.target.innerHTML = "&#9662;";
		}
	}
	
	render(){
		return(
			<div className='container-fluid'>
				<div className='row'>
					<div id='toolbar' className='col-lg-3'>
						<div id='toolbarArea'>
							<h3 id='title'> funSketch: draw and animate! </h3>

							<div id='buttons'>
							
								<p className='instructions'> Use the spacebar to append a new layer or frame. </p>
								<p className='instructions'> Use the left and right arrow keys to move to the previous or next layer, and 'A' and 'D' keys to move between frames! </p>
								<p className='instructions'> After frames get added to the timeline (the rectangle below the canvas), you can set different frame speeds at any frame by clicking on the frames. </p>
								<button id='toggleInstructions'>hide instructions</button>
							
								<h4> layer <span className="caret2" id="LayerStuff" onClick={this._clickCaret}>&#9662;</span> </h4>
								<div id="displayLayerStuff">
									<button id='insertCanvas'>add new layer after</button>
									<button id='deleteCanvas'>delete current layer</button>
									<button id='duplicateCanvas'>duplicate layer</button>
									<button id='clearCanvas'>clear layer</button>
									<button id='downloadLayer'>download current layer</button>
								</div>
								
								<h4> frame <span className="caret2" id="FrameStuff" onClick={this._clickCaret}>&#9662;</span> </h4>
								<div id="displayFrameStuff">
									<button id='addNewFrame'>add new frame</button>
									<button id='copyCurrFrame'>duplicate frame</button>
									<button id='deleteCurrFrame'>delete current frame</button>
									<button id='changeLayerOrder'>change layer order</button>
									<button id='downloadFrame'>download current frame</button>
								
								<LayerOrder 
									changingLayerOrder={this.state.changingLayerOrder}
									layers={this.state.animationProject ? this.state.animationProject.getCurrFrame().getLayers().map((x, idx) => idx) : []}
									updateParentStateFunction={
										(newLayerOrder) => {
											// 1. update layer order of current frame
											// 2. set changingLayerOrder in state to false
											let newLayerList = [];
											let currFrame = this.state.animationProject.getCurrFrame();
											let currLayerIndex = currFrame.getCurrCanvasIndex();
											let currFrameLayerList = currFrame.getLayers();
											
											currFrame.getCurrCanvas().style.opacity = 0;
											currFrame.getCurrCanvas().style.zIndex = 0;
											if(currLayerIndex-1 > 0){
												currFrame.getLayers()[currLayerIndex-1].style.opacity = 0;
												currFrame.getLayers()[currLayerIndex-1].style.zIndex = 0;
											}
										
											newLayerOrder.forEach((index) => {
												newLayerList.push(currFrameLayerList[index]);
											});
											
											currFrame.setLayers(newLayerList);
											
											// update the currently shown layer to reflect the re-ordering
											this.state.toolbarInstance.setCurrLayer(currLayerIndex);
		
											this.setState({"changingLayerOrder": false});
										}
									}
								/>
								</div>
								
								<h4> other <span className="caret2" id="OtherStuff" onClick={this._clickCaret}>&#9662;</span> </h4>
								<div id="displayOtherStuff">
									<button id='importImage'> import image </button>
									<button id='rotateCanvasImage'>rotate image</button>
									<button id='undo'>undo</button>
									<button id='saveWork'>save project (.json)</button> 
									<button id='importProject'>import project </button>
									<button id='togglePenPressureColor'> toggle pen pressure for color </button>
									<button id='toggleLayerOrFrame'> toggle frame addition on spacebar press </button>
									
									<div id='animationControl'>
										<br />
										<h4> animation control: </h4>
										<ul id='timeOptions'>
											<label htmlFor='timePerFrame'>time per frame (ms):</label>
											<select name='timePerFrame' id='timePerFrame' onChange={
												(evt) => {
													this.state.toolbarInstance.timePerFrame = parseInt(evt.target.value);
												}
											}>
												<option value='100'>100</option>
												<option value='200'>200</option>
												<option value='500'>500</option>
												<option value='700'>700</option>
												<option value='1000'>1000</option>
											</select>
										</ul>
										<button onClick={
											() => {
												this._playAnimation();
											}
										}> play animation </button>
										<button id='generateGif'> generate gif! </button>
									</div>
									<p id='loadingScreen'></p>
								</div>
							
								<br />
							</div>
							
							<br />

							<BrushDashboard brushManager={this.state.brushInstance} />
							
							<br />
							
							<FilterDashboard filterManager={this.state.filtersInstance} />
							
							<div id='colorPicker'>
							</div>
							
							<div id='showDemos'>
								<h3> demos </h3>
								<select id='chooseDemo'>
									<option label=""></option>
									<option className='demo'>run_demo</option>
									<option className='demo'>floaty_thingy</option>
									<option className='demo'>cake_cut</option>
									<option className='demo'>asakusa_mizusaki_butterfly</option>
								</select>
							</div>
							
						</div>
						
						<div id='footer' className='row'>
							<hr />
							<p> n.c.h works 2017-2021 | <a href='https://github.com/syncopika/funSketch'>source </a></p>
						</div>
						
					</div>

					<div id='screen' className='col-lg-9 grid'>
								
						<FrameCounterDisplay
							currFrame={this.state.currentFrame}
							currLayer={this.state.currentLayer}
						/>
						
						<div id='canvasArea'>
						</div>
						
						<AnimationTimeline frames={this.state.timelineFrames} />
						<canvas id='animationTimelineCanvas' style={{
									'border': '1px solid #000',
									'borderTop': 0,
									'display': 'block',
						}}></canvas>
						
						<div>
						{
							Object.keys(this.state.timelineMarkers).map((markerKey, index) => {
								let marker = this.state.timelineMarkers[markerKey];
								return (
									<div>
										<label htmlFor={'marker' + marker.frameNumber + 'Select'}>marker for frame {marker.frameNumber}: &nbsp;</label>
										<select 
										id={'marker' + marker.frameNumber + 'Select'} 
										name={'marker' + marker.frameNumber + 'Select'}
										onChange={(evt) => {
											marker.speed = evt.target.value;
										}}
										>
											<option>100</option>
											<option>200</option>
											<option>300</option>
											<option>500</option>
											<option>1000</option>
										</select>
										<label 
											id={'deleteMarker_' + marker.frameNumber} 
											style={{'color': 'red'}}
											onClick={() => this._timelineMarkerDelete(marker.frameNumber)}
										> &nbsp;delete </label>
									</div>
								);
							})
						}
						<br />
						<br />
					</div>

					</div>
					
				</div>
				
			</div> 
		);
	}

}

export { PresentationWrapper, FrameCounterDisplay };