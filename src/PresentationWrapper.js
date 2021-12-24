import React from 'react';
import { AnimationProject } from './utils/AnimationProject.js';
import { AnimationController } from './utils/AnimationController.js';
import { Toolbar } from './utils/Toolbar.js';
import { BrushManager } from './utils/BrushManager.js';
import { FilterManager } from './utils/FilterManager.js';
import { AnimationTimeline } from './AnimationTimeline.js';
import { LayerOrder } from './LayerOrder.js';
import { FilterDashboard } from './FilterDashboard.js';
import { BrushDashboard } from './BrushDashboard.js';

import "../styles/presentationWrapper.css";

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
			'animationController': null,
			'currentFrame': 1,
			'currentLayer': 1,
			'timelineFrames': [],
			'timelineMarkers': {}, // keep track of where fps should change - not 0-indexed!
			'changingLayerOrder': false
		};
		
		this.timelineFramesSet = new Set(); // keep track of what frames have been added to timeline so we don't duplicate - 0-indexed!
	}
	
	_updateCurrFrameAndTimelineMarkers(markers, frameNum){
		this.setState({
			'timelineMarkers': markers,
			'currentFrame': frameNum,
			'currentLayer': 1
		});
		this.state.toolbarInstance.goToFrame(frameNum-1);
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
				evt.target.style.border = "1px solid rgb(0, 255, 0)";
			}else{
				evt.target.style.border = "1px solid rgb(255, 0, 0)";
			}
			
			this.state.brushInstance.togglePressureColorFlag();
		});
		document.getElementById('togglePenPressureColor').style.border = "1px solid rgb(255, 0, 0)";
	}
	
	_setupAnimationControl(){
		document.getElementById('timePerFrame').addEventListener('onchange', (evt) => {
			this.state.toolbarInstance.timePerFrame = parseInt(evt.target.selectedOptions[0].value);
		});
	}
	
	_linkDemos(){
		const demoSelect = document.getElementById("chooseDemo");
		demoSelect.addEventListener("change", (evt) => {
			this._getDemo(evt.target.selectedOptions[0].value);
		});
	}
	
	_showOptions(category){
		const el = document.getElementById(category);
		const child = el.children[1]; // skip the p element and get the ul element
		if(child.style.display !== "block" ){
			child.style.display = "block";
		}else{
			child.style.display = "none";
			el.style.marginBottom = 0;
		}
	}
	
	_importProjectUpdateFunc(){
		// update state when loading in a project
		const project = this.state.animationProject;
		const toolbar = this.state.toolbarInstance;
	
		this.setState({
			'currentFrame': 1,
			'currentLayer': 1,
			'timelineFrames': [],
			'timelineMarkers': {},
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
	
	_clickOption(evt){
		const id = evt.target.id;

		// map caret id to div id of option that should show up in the 2nd column of the toolbar
		const options = {
			"instructionsOption": "instructions",
			"frameLayerCtrlOption": "frameLayerSection",
			"animationCtrlOption": "animControlSection",
			"otherOption": "otherSection",
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
	
	_showFiltersOrBrushes(evt){
		const disp = document.getElementById(evt.target.textContent.trim()); // 'brushes' or 'filters'
		if(disp.style.display === "none" || !disp.style.display){
			disp.style.display = "block";
		}else{
			disp.style.display = "none";
		}
	}

	componentDidMount(){
		const animationProj = new AnimationProject(document.querySelector('.canvasArea'));
		const newBrush = new BrushManager(animationProj);	
		const newFilters = new FilterManager(animationProj, newBrush);
		const newToolbar = new Toolbar(newBrush, animationProj);
		const animationController = new AnimationController(animationProj, newToolbar);
		
		//animationProj.addNewFrame(true);
		//newBrush.brushesMap["default"].attachBrush();
		
		this.setState({
			'animationProject': animationProj,
			'brushInstance': newBrush,
			'toolbarInstance': newToolbar,
			'filtersInstance': newFilters,
			'animationController': animationController,
		}, () => {
			this._setupToolbar();
			this._linkDemos();
			this._setKeyDown(document);
			
			this.state.animationProject.init();
			this.state.brushInstance.brushesMap["default"].attachBrush();
			
		});
	}
	
	componentDidUpdate(){
		// make the active canvas shown reflect the state's current frame and layer? instead of toggling it in different places
	}
	
	render(){
		return(
			<div className='container'>
				<div className='toolbar'>
					<div id="toolbarOptions" className="toolbarSection">
						<h3> funSketch </h3>
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
						<p className='instructions'> Use the spacebar to append a new layer (default behavior) or frame (see 'other' to toggle between layer or frame addition with the spacebar). </p>
						<p className='instructions'> Use the left and right arrow keys to move to the previous or next layer, and 'A' and 'D' keys to move between frames. </p>
						<p className='instructions'> After frames get added to the timeline (the rectangle below the canvas), you can set different frame speeds at any frame by clicking on the frames. </p>
					</div>
				
					<div id="frameLayerSection" className="tbar">
						<h4> frame/layer controls </h4>
						<div id="displayLayerStuff">
							<p> layer: </p>
							<ul>
								<li><button id='insertCanvas'>add new layer after</button></li>
								<li><button id='deleteCanvas'>delete current layer</button></li>
								<li><button id='duplicateCanvas'>duplicate layer</button></li>
								<li><button id='clearCanvas'>clear layer</button></li>
								<li><button id='downloadLayer'>download current layer</button></li>
							</ul>
						</div>
						<hr />
						<div id="displayFrameStuff">
							<p> frame: </p>
							<ul>
								<li><button id='addNewFrame'>add new frame</button></li>
								<li><button id='copyCurrFrame'>duplicate frame</button></li>
								<li><button id='deleteCurrFrame'>delete current frame</button></li>
								<li><button id='changeLayerOrder'>change layer order</button></li>
								<li><button id='downloadFrame'>download current frame</button></li>
							</ul>
						
							<LayerOrder 
								changingLayerOrder={this.state.changingLayerOrder}
								layers={
									this.state.animationProject && this.state.animationProject.getCurrFrame() ? this.state.animationProject.getCurrFrame().getLayers().map((x, idx) => idx) : []
								}
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
							<ul>
								<li><button id='importImage'> import image </button></li>
								<li><button id='rotateCanvasImage'>rotate image</button></li>
								<li><button id='undo'>undo</button></li>
								<li><button id='saveWork'>save project (.json)</button></li> 
								<li><button id='importProject'>import project </button></li>
								<li><button id='togglePenPressureColor'> toggle pen pressure for color </button></li>
								<li><button id='toggleLayerOrFrame'> toggle frame addition on spacebar press </button></li>
							</ul>
						</div>
						<div>
							<br />
							<h4>check out some experiments for new feature ideas:</h4>
							<p><a href="./experiments/floodfillExperiment/floodfillExperiment.html">floodfill with web workers</a></p>
							<p><a href="./experiments/selectToolExperiment/selectTool.html">selection tool</a></p>
							<p><a href="./experiments/pasteToolExperiment/pasteTest.html">image paste tool</a></p>
						</div>
					</div>
					
					<div id="animControlSection" className="tbar">
						<div id='animationControl'>
							<h4> animation control: </h4>
							<div id='timeOptions'>
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
							</div>
							<ul>
								<li><button onClick={
									() => {
										//this._playAnimation("forward");
										this.state.animationController.playAnimation(
											"forward", 
											this.state.timelineFrames,
											this.state.timelineMarkers
										);
									}
								}> play animation forward </button></li>
								<li><button onClick={
									() => {
										//this._playAnimation("backward");
										this.state.animationController.playAnimation(
											"backward", 
											this.state.timelineFrames,
											this.state.timelineMarkers
										);
									}
								}> play animation backward </button></li>
								<li><button id='generateGif'> generate gif! </button></li>
							</ul>
						</div>
						<p id='loadingScreen'></p>
					</div>
					
					<div id='showDemos' className="tbar">
						<h3> demos </h3>
						<select id='chooseDemo'>
							<option label=""></option>
							<option className='demo'>run_demo</option>
							<option className='demo'>floaty_thingy</option>
							<option className='demo'>cake_cut</option>
							<option className='demo'>basketball_blur</option>
						</select>
					</div>	
				</div>

				<div className='screen'>
					<div className="screenContainer">
						<FrameCounterDisplay
							currFrame={this.state.currentFrame}
							currLayer={this.state.currentLayer}
						/>
						
						<div className='canvasArea'>
						</div>
						
						<AnimationTimeline 
							frames={this.state.timelineFrames}
							markers={this.state.timelineMarkers}
							goToFrame={this.state.toolbarInstance ? this.state.toolbarInstance.goToFrame : () => {}}
							deleteMarker={this._timelineMarkerDelete.bind(this)}
							updateCurrFrameAndTimelineMarkers={this._updateCurrFrameAndTimelineMarkers.bind(this)}
						/>
					</div>
				</div>
				
				<div id="brushSection">
					<div id="colorPicker">
					</div>
					
					<hr />
					
					<p id="brushesOption" 
						onMouseOver={(evt) => {evt.target.style.color = "#99b5d1"}} 
						onMouseOut={(evt) => {evt.target.style.color = "#000"}} 
						onClick={this._showFiltersOrBrushes}
					> brushes 
					</p>
					<div id="brushes" className="tbar">
						<BrushDashboard brushManager={this.state.brushInstance} />
					</div>
					
					<hr />

					<p id="filtersOption" 
						onMouseOver={(evt) => {evt.target.style.color = "#99b5d1"}} 
						onMouseOut={(evt) => {evt.target.style.color = "#000"}}
						onClick={this._showFiltersOrBrushes}
					> filters 
					</p>
					<div id="filters" className="tbar">
						<FilterDashboard filterManager={this.state.filtersInstance} />
					</div>
				</div>
				
				<div id="footer">
					<hr />
					<p> c.2017 | <a href='https://github.com/syncopika/funSketch'> source </a></p>
				</div>
				
			</div> 
		);
	}

}

export { PresentationWrapper, FrameCounterDisplay };