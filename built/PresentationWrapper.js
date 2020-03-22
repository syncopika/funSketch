import { AnimationProject } from './SuperCanvas.js';
import { Toolbar } from './Toolbar.js';
import { Brush } from './Brush.js';
import { Filters } from './Filters.js';
import { AnimationTimeline } from './AnimationTimeline.js';

// stuff to check:
// css stuff :< 
// https://stackoverflow.com/questions/18027751/overlay-divs-without-absolute-position
// https://gedd.ski/post/overlapping-grid-items/


// for displaying current frame and layer number
// TODO: importing a project won't update the counter display since it's using the Toolbar class functions
// and so the PresentationWrapper's state doesn't gets updated with the new currentFrame/Layer
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
			'currentLayer': 1
		};
	}
	
	_setKeyDown(doc){
		
		let toolbar = this.state.toolbarInstance;
		let animationProj = this.state.animationProject;
		const self = this;

		$(doc).keydown(function(e){
			let updateStateFlag = false;
			let canvas = null;
			switch(e.which){
				case 37: //left arrow key
					if(toolbar.down()){
						canvas = animationProj.getCurrFrame();
						updateStateFlag = true;
					}
					break;
				case 39: //right arrow key
					if(toolbar.up()){
						canvas = animationProj.getCurrFrame();
						updateStateFlag = true;
					}
					break;
				case 32: //space bar
					if(toolbar.layerMode){
						toolbar.addPage();
					}else{
						animationProj.addNewFrame();
					}
					break;
				case 65: // a key 
					if(toolbar.prevFrame()){
						canvas = animationProj.getCurrFrame();
						updateStateFlag = true;
					}
					break;
				case 68: // d key 
					if(toolbar.nextFrame()){
						canvas = animationProj.getCurrFrame();
						updateStateFlag = true;
					}
					break;
				default:
					break;
			}
			e.preventDefault();
			if(updateStateFlag){
				self.setState({
					'currentFrame': animationProj.currentFrame + 1,
					'currentLayer': canvas.currentIndex + 1
				});
				canvas = null;
				updateStateFlag = false;
			}
		});
	}
	
	_setupToolbar(){
		let newToolbar = this.state.toolbarInstance;
		let project = this.state.animationProject;
		
		newToolbar.setCounter("count");
		//newToolbar.setKeyDown(document);	// enables new canvas add on spacebar, go to next with right arrow, prev with left arrow.
		newToolbar.createColorWheel('colorPicker', 200);
		newToolbar.floodFill('floodfill');
		newToolbar.insertLayer('insertCanvas');
		newToolbar.deleteLayer('deleteCanvas', 'count');
		newToolbar.setClearCanvas('clearCanvas');
		newToolbar.rotateImage('rotateCanvasImage'); 
		newToolbar.undo('undo');
		newToolbar.download('download');
		newToolbar.importImage('importImage');
		newToolbar.save('saveWork');
		newToolbar.importProject('importProject', 'count');
		newToolbar.addNewFrameButton('addNewFrame');
		
		// make the goLeft and goRight arrows clickable FOR LAYERS
		// note: this is for clicking the icons with a mouse!
		document.getElementById('goLeft').addEventListener('click', () => {
			if(newToolbar.down()){
				let curr = project.getCurrFrame();
				this.setState({
					'currentFrame': project.currentFrame + 1,
					'currentLayer': curr.currentIndex + 1
				});
			}
		});

		document.getElementById('goRight').addEventListener('click', () => {
			if(newToolbar.up()){
				let curr = project.getCurrFrame();
				this.setState({
					'currentFrame': project.currentFrame + 1,
					'currentLayer': curr.currentIndex + 1
				});
			}
		});

		// left and right arrows for FRAMES
		document.getElementById('prevFrame').addEventListener('click', () => {
			if(newToolbar.prevFrame()){
				let curr = project.getCurrFrame();
				this.setState({
					'currentFrame': project.currentFrame + 1,
					'currentLayer': curr.currentIndex + 1
				});
			}
		});

		document.getElementById('nextFrame').addEventListener('click', () => {
			if(newToolbar.nextFrame()){
				let curr = project.getCurrFrame();
				this.setState({
					'currentFrame': project.currentFrame + 1,
					'currentLayer': curr.currentIndex + 1
				});
			}
		});

		document.getElementById('generateGif').addEventListener('click', () => {
			newToolbar.getGif("loadingScreen");
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
	}
	
	_setupFilters(){
		//console.log(Object.getOwnPropertyNames(this.state.filtersInstance));
		let filterInstance = this.state.filtersInstance;
		let filterNames = Object.getOwnPropertyNames(filterInstance).filter((name) => name.indexOf('filter') < 0);
		let filterChoices = document.getElementById("filterChoices");
		
		filterNames.forEach((name) => {
			let newFilterElement = document.createElement('li');
			newFilterElement.id = name;
			newFilterElement.textContent = name;
			
			if(name === "defaultFisheye" || name === "outline"){
				newFilterElement.addEventListener('click', () => {
					filterInstance[name]();
				});
			}else{
				newFilterElement.addEventListener('click', () => {
					filterInstance.filterCanvas(filterInstance[name]);
				});
			}
			filterChoices.appendChild(newFilterElement);
		});
		
		let resetOption = document.createElement('li');
		resetOption.style.color = "#ff3232";
		resetOption.textContent = "reset";
		resetOption.addEventListener('click', () => {
			this.state.toolbarInstance.resetImage();
		});
		
		filterChoices.appendChild(resetOption);
		
		document.getElementById('filterSelect').addEventListener('click', () => {
			this._showOptions('filters');
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
	
	_setupBrushControls(){

		let brush = this.state.brushInstance;
		
		document.getElementById('brushSelect').addEventListener('click', () => { 
			this._showOptions('brushes');
		});
		
		document.getElementById('defaultBrush').addEventListener('click', () => {
			brush.defaultBrush();
		});
		
		document.getElementById('radialBrush').addEventListener('click', () => {
			brush.radialGradBrush();
		});
		
		//<input id='brushSize' type='range' min='1' max='15' step='.5' value='2' oninput='newBrush.changeBrushSize(this.value); showSize()'>
		// make a function component for the brush? but then need to maintain state of brush size...
		document.getElementById('brushSize').addEventListener('input', () => {
			brush.changeBrushSize(document.getElementById('brushSize').value); 
			this._showSize();
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
	
	_showSize(){
		document.getElementById('brushSizeValue').textContent = document.getElementById('brushSize').value;
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
					project.addNewFrame();
				}
				// overwrite existing frame
				// TODO: implement an updateFrame method 
				// animationProj.updateFrame(0, frame); // updateFrame takes an index of the existing frame to overwrite and takes a SuperCanvas object to update with as well
				let currFrame = project.frameList[index];
				
				let currFrameLayersFromImport = frame.layers; // looking at data-to-import's curr frame's layers
				let currFrameLayersFromCurrPrj = currFrame.canvasList;
				currFrameLayersFromImport.forEach(function(layer, layerIndex){
					if((layerIndex+1) > currFrameLayersFromCurrPrj.length){
						// add new layer to curr project as needed based on import
						project.frameList[index].setupNewLayer();
					}
					let currLayer = project.frameList[index].canvasList[layerIndex];
					
					// is this part necessary? maybe, if you want the project to look exactly as when it was saved.
					currLayer.style.opacity = layer.opacity;
					currLayer.style.zIndex = layer.zIndex;  
					currLayer.height = layer.height;
					currLayer.width = layer.width;
					
					// add the image data 
					let newCtx = currLayer.getContext("2d");
					let img = new Image();
					
					(function(context, image){
						image.onload = function(){
								context.drawImage(image, 0, 0);
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
		
		const newBrush = new Brush(animationProj);
		newBrush.defaultBrush();
		
		const newFilters = new Filters(animationProj.getCurrFrame(), newBrush);
		
		let currCanvas = animationProj.getCurrFrame().currentCanvas;
		const newToolbar = new Toolbar(currCanvas, newBrush, animationProj);
		
		this.setState({
			'animationProject': animationProj,
			'brushInstance': newBrush,
			'toolbarInstance': newToolbar,
			'filtersInstance': newFilters
		}, () => {
			this._setupToolbar();
			this._setupBrushControls();
			this._linkDemos();
			this._setupFilters();
			this._setKeyDown(document); // set key down on the whole document
		});
	}
	
	render(){
		return(
			<div class='container-fluid'>
				<div class='row'>
					<div id='toolbar' class='col-lg-3'>
						<div id='toolbarArea'>

							<h3 id='title'> funSketch: draw, edit, and animate! </h3>

							<p> 
							use the spacebar to create a new layer or frame (see button to toggle between frame and layer addition). 
							use the left and right arrow keys to move to the previous or next layer, and 'A' and 'D' keys to move between frames! 
							</p>

							<div id='buttons'>
								<button id='insertCanvas'>add layer</button>
								<button id='deleteCanvas'>delete layer</button>
								<button id='copyCanvas' onclick='newCanvas.copyCanvas()'>copy layer</button>
								<button id='clearCanvas'>clear layer</button>
								<button id='addNewFrame'>add new frame</button>
								<button id='importImage'> import image </button>
								<button id='rotateCanvasImage'>rotate image</button>
								<button id='undo'>undo</button>
								<button id='download'>download canvas (.png)</button>
								<button id='saveWork'>save project (.json)</button> 
								<button id='importProject'>import project (.json)</button> 
								<button id='toggleLayerOrFrame'> toggle frame addition on spacebar press </button>
							</div>
							
							<br />
							
							<div id='filters'>
								<p id='filterSelect'> filters &#9660; </p>
								<ul id='filterChoices'>
								</ul>
							</div>

							<div id='brushes'>
								<p id='brushSelect'> brushes &#9660; </p>
								<ul>
									<li id='defaultBrush'> default brush </li>
									<li id='radialBrush'> radial gradient brush </li>
								</ul>
							</div>
							
							<div id='adjustBrushSize'>
								<br />
								<p class="text-info">change brush size</p>
									<input id='brushSize' type='range' min='1' max='15' step='.5' defaultValue='2' />
								<span id='brushSizeValue'> 2 </span>
							</div>
							
							<div id='colorPicker'>
								<div id='floodfillDir'>
									<p> click the button and then select a place on the canvas to floodfill </p>
									<p> make sure brush size is less than or equal to 2 and set to default brush! </p>
								</div>
								<button id='floodfill'>floodfill with currently selected color</button>
							</div>
							
							<div id='animationControl'>
								<h3> animation control </h3>
								<ul id='timeOptions'>
									<select id='timePerFrame'>
										<option value='100'>100</option>
										<option value='200'>200</option>
										<option value='500'>500</option>
										<option value='700'>700</option>
										<option value='1000'>1000</option>
									</select>
								</ul>
								<label>time per frame:</label>
								<button id='generateGif'> generate gif! </button>
							</div>
							<p id='loadingScreen'></p>
							
							<br />
							
							<div id='showDemos'>
								<h3> demos </h3>
								<select id='chooseDemo'>
									<option label=""></option>
									<option class='demo'>run_demo</option>
									<option class='demo'>floaty_thingy</option>
								</select>
							</div>
							
						</div>
					</div>

					<div id='screen' class='col-lg-9 grid'>
								
						<FrameCounterDisplay
							currFrame={this.state.currentFrame}
							currLayer={this.state.currentLayer}
						/>
						
						<div id='canvasArea'>
						</div>
						
						<AnimationTimeline />

					</div>
					
					
				</div>
				
				<div id='footer' class='row'>
					<hr />
					<p> n.c.h works 2017-2020 | <a href='https://github.com/syncopika/funSketch'>source </a></p>
				</div>
				
			</div> 
		);
	}

}

export { PresentationWrapper };