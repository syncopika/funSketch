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
		newToolbar.createColorWheel('colorPicker', 170);
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
		newToolbar.toggleToolbarPosition('toggleToolbarPos', 'toolbar');
		
		newToolbar.importProject('importProject', this._importProjectUpdateFunc.bind(this));
		
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
		
		// toggle pen pressure for brush color
		document.getElementById('togglePenPressureColor').addEventListener('click', (evt) => {
			if(evt.target.style.border === "1px solid rgb(255, 0, 0)"){
				evt.target.style.border = "1px solid rgb(0, 255, 0)"; // green
			}else{
				evt.target.style.border = "1px solid rgb(255, 0, 0)";
			}
			
			this.state.brushInstance.togglePressureColorFlag();
		});
		document.getElementById('togglePenPressureColor').style.border = "1px solid rgb(255, 0, 0)"; // red for off by default
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
	
	_importProjectUpdateFunc(){
		// update state when loading in a project
		const project = this.state.animationProject;
		const toolbar = this.state.toolbarInstance;
	
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
			let mergedLayersFrame = toolbar.mergeFrameLayers(frame);
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
		
		// figure out which layer is the one that should be visible for the first frame
		const layers = project.frameList[0].canvasList;
		let visibleLayerIndex = 0;
		
		for(var i = 0; i < layers.length; i++){
			if(layers[i].style.opacity >= .97){
				visibleLayerIndex = i;
				break;
			}
		}
		project.getFrames()[0].show();
		
		this.setState({
			'currentLayer': visibleLayerIndex + 1,
			'timelineFrames': newFrames
		});		
	}
	
	_getDemo(selected){
		// case for the blank option 
		if(selected === ""){
			return;
		}
		const selectedDemo = "demos/" + selected + ".json"; 
		const httpRequest = new XMLHttpRequest();

		if(!httpRequest){
			return;
		}
		httpRequest.open("GET", selectedDemo);
		
		httpRequest.onload = () => {
			const data = JSON.parse(httpRequest.responseText);
			this.state.toolbarInstance.importData(data, this._importProjectUpdateFunc.bind(this));
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
			this._setKeyDown(document);
			this._timelineMarkerSetup();
		});
	}
	
	componentDidUpdate(){
		// make the active canvas shown reflect the state's current frame and layer? instead of toggling it in different places
	}
	
	_clickOption(evt){
		const id = evt.target.id;

		// map caret id to div id of option that should show up in the 2nd column of the toolbar
		const options = {
			"instructionsOption": "instructions",
			"frameLayerCtrlOption": "frameLayerSection",
			"animationCtrlOption": "animControlSection",
			"otherOption": "otherSection",
			"brushesOption": "brushSection",
			"filtersOption": "filterSection",
			"demosOption": "showDemos",
		};
		
		Array.from(Object.keys(options)).forEach((section) => {
			const contentToToggle = document.getElementById(options[section]);
			contentToToggle.classList.remove("toolbarSection2");
			
			if(section === id){
				contentToToggle.classList.add("toolbarSection2");
				contentToToggle.classList.remove("tbar");
			}else{
				contentToToggle.classList.add("tbar");
			}
		});
	}
	
	render(){
		return(
			<div className='container'>
				<div id='toolbar'
					style={{"position": "static"}}
				>
					<div id='toolbarArea'>
					
						<div id="toolbarOptions" className="toolbarSection">
							<ul>
								<li id="instructionsOption"
									onMouseOver={(evt) => {evt.target.style.color = "#99b5d1"}} 
									onMouseOut={(evt) => {evt.target.style.color = "#000"}} 
									onClick={this._clickOption}> instructions </li>
								<li id="frameLayerCtrlOption" 
									onMouseOver={(evt) => {evt.target.style.color = "#99b5d1"}} 
									onMouseOut={(evt) => {evt.target.style.color = "#000"}} 
									onClick={this._clickOption}> frame/layer control </li>
								<li id="animationCtrlOption" 
									onMouseOver={(evt) => {evt.target.style.color = "#99b5d1"}} 
									onMouseOut={(evt) => {evt.target.style.color = "#000"}} 
									onClick={this._clickOption}> animation control </li>
								<li id="brushesOption" 
									onMouseOver={(evt) => {evt.target.style.color = "#99b5d1"}} 
									onMouseOut={(evt) => {evt.target.style.color = "#000"}} 
									onClick={this._clickOption}> brushes </li>
								<li id="filtersOption" 
									onMouseOver={(evt) => {evt.target.style.color = "#99b5d1"}} 
									onMouseOut={(evt) => {evt.target.style.color = "#000"}}
									onClick={this._clickOption}> filters </li>
								<li id="otherOption"
									onMouseOver={(evt) => {evt.target.style.color = "#99b5d1"}} 
									onMouseOut={(evt) => {evt.target.style.color = "#000"}}
									onClick={this._clickOption}> other </li>
								<li id="demosOption" 
									onMouseOver={(evt) => {evt.target.style.color = "#99b5d1"}} 
									onMouseOut={(evt) => {evt.target.style.color = "#000"}}
									onClick={this._clickOption}> demos </li>
							</ul>
						</div>					
						
						<div id="instructions" className="toolbarSection2">
							<h4> instructions </h4>
							<p className='instructions'> Use the spacebar to append a new layer or frame. </p>
							<p className='instructions'> Use the left and right arrow keys to move to the previous or next layer, and 'A' and 'D' keys to move between frames! </p>
							<p className='instructions'> After frames get added to the timeline (the rectangle below the canvas), you can set different frame speeds at any frame by clicking on the frames. </p>
							<p className='instructions'> The toolbar can be static or sticky (so that it follows the scrollbar). You can toggle this via the 'toggle toolbar position' button in the 'other' section. </p>
						</div>
					
						<div id="frameLayerSection" className="tbar">
							<h4> frame/layer controls </h4>
							<div id="displayLayerStuff">
								<button id='insertCanvas'>add new layer after</button>
								<button id='deleteCanvas'>delete current layer</button>
								<button id='duplicateCanvas'>duplicate layer</button>
								<button id='clearCanvas'>clear layer</button>
								<button id='downloadLayer'>download current layer</button>
							</div>
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
						</div>
						
						<div id="otherSection" className="tbar">
							<h4> other </h4>
							<div id="displayOtherStuff">
								<button id='toggleToolbarPos'>toggle toolbar position</button>
								<button id='importImage'> import image </button>
								<button id='rotateCanvasImage'>rotate image</button>
								<button id='undo'>undo</button>
								<button id='saveWork'>save project (.json)</button> 
								<button id='importProject'>import project </button>
								<button id='togglePenPressureColor'> toggle pen pressure for color </button>
								<button id='toggleLayerOrFrame'> toggle frame addition on spacebar press </button>
							</div>
						</div>
						
						<div id="animControlSection" className="tbar">
							<div id='animationControl'>
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
						
						<div id="filterSection" className="tbar">
							<FilterDashboard filterManager={this.state.filtersInstance} />
						</div>
					
						<div id="brushSection" className="tbar">
							<BrushDashboard brushManager={this.state.brushInstance} />
						</div>
						
						<div id='showDemos' className="tbar">
							<h3> demos </h3>
							<select id='chooseDemo'>
								<option label=""></option>
								<option className='demo'>run_demo</option>
								<option className='demo'>floaty_thingy</option>
							</select>
						</div>
						
						<div id="colorPickerSection" className="toolbarSection3">
							<div id='colorPicker'>
							</div>
						</div>
							
					</div>
				</div>

				<div id='screen'>
					<div id="screenContainer">
						<FrameCounterDisplay
							currFrame={this.state.currentFrame}
							currLayer={this.state.currentLayer}
						/>
						
						<div id='canvasArea'>
						</div>
						
						<div id="animationTimelineArea">
							<AnimationTimeline frames={this.state.timelineFrames} />
							
							<canvas id='animationTimelineCanvas' style={{
										'display': 'block',
										'marginTop': '10px',
										'marginBottom': '10px',
										'width': '100%',
										'height': '185px' // note this height is slightly less than the height of AnimationTimeline to not cover the bottom scrollbar
							}}></canvas>
							
							<div id="animationTimelineMarkers">
							{
								Object.keys(this.state.timelineMarkers).map((markerKey, index) => {
									const marker = this.state.timelineMarkers[markerKey];
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
							</div>
						</div>
					</div>
				</div>
				
				<div id='footer'>
					<hr />
					<p> c.2017 | <a href='https://github.com/syncopika/funSketch'>source </a></p>
				</div>
				
			</div> 
		);
	}

}

export { PresentationWrapper, FrameCounterDisplay };