import { AnimationProject } from './SuperCanvas.js';
import { Toolbar } from './Toolbar.js';
import { Brush } from './Brush.js';
import { Filters } from './Filters.js';

class PresentationWrapper extends React.Component {

	constructor(props){
		super(props);
		this.state = {
			'animationProject': null,
			'brushInstance': null,
			'toolbarInstance': null,
			'filtersInstance': null,
		};
	}
	
	_setupToolbar(){
		let newToolbar = this.state.toolbarInstance;
		console.log(newToolbar);
		newToolbar.setCounter("count");
		newToolbar.setKeyDown(document);	// enables new canvas add on spacebar, go to next with right arrow, prev with left arrow.
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
	}
	
	_setupFilters(){
		
		/*
		<li onclick='newFilters.filterCanvas(newFilters.grayscale)'> grayscale </li>
		<li onclick='newFilters.filterCanvas(newFilters.saturate)'> saturate </li>
		<li onclick='newFilters.filterCanvas(newFilters.swap)'> colorswap </li>
		<li onclick='newFilters.filterCanvas(newFilters.scary)'> scary </li>
		<li onclick='newFilters.filterCanvas(newFilters.heatwave)'> heatwave </li>
		<li onclick='newFilters.filterCanvas(newFilters.randomize)'> noise </li>
		<li onclick='newFilters.filterCanvas(newFilters.invert)'> invert </li>
		<li onclick='newFilters.filterCanvas(newFilters.blurry)'> blur </li>
		<li onclick='newFilters.outline()'> outline </li>
		<li onclick='newFilters.defaultFisheye()'> fisheye </li>
		<li onclick='newFilters.filterCanvas(newFilters.areaColor)'> painted </li>
		<li onclick='newFilters.filterCanvas(newFilters.mosaic)'> mosaic </li>
		<li onclick='newFilters.filterCanvas(newFilters.voronoi)'> voronoi </li>
		<li onclick='newFilters.filterCanvas(newFilters.edgeDetect)'> edge detection </li>
		<li style="color: #ff3232" onclick='newToolbar.resetImage()'> reset </li>
		*/
	}
	
	_setupAnimationControl(){
		/*
		<li onclick='newToolbar.playBackward()'> &larr; </li>
		<li onclick='newToolbar.stop()'> stop! </li>
		<li onclick='newToolbar.playForward()'> &rarr; </li>
		
										<select id='timePerFrame' onchange='newToolbar.timePerFrame = parseInt(value)'>
									<option value='100'>100</option>
									<option value='200'>200</option>
									<option value='500'>500</option>
									<option value='700'>700</option>
									<option value='1000'>1000</option>
								</select>
		*/
	}
	
	_setupBrushControls(){
		/*
		<input id='brushSize' type='range' min='1' max='15' step='.5' value='2' oninput='newBrush.changeBrushSize(this.value); showSize()'>
		
											<li onclick='newBrush.defaultBrush()'> default brush </li>
									<li onclick='newBrush.radialGradBrush()'> radial gradient brush </li>
		*/
	}
	
	getDemo(arg){
		// do something
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
			'filtersInstance': newFilters,
		}, () => {
			this._setupToolbar();
		});
		
	}
	
	render(){
		return(
			<div class='container-fluid'>
				<div class='row'>
					<div id='toolbar' class='col-lg-3'>
						<div id='toolbarArea'>

							<h3 id='title'> funSketch: draw, edit, and animate! </h3>

							<p> use the spacebar to create a new layer or frame (see button to toggle between frame and layer addition). use the left and right arrow keys to move to the previous or next layer, and 'A' and 'D' keys to move between frames! </p>

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
								</ul>
							</div>
							
							<div id='adjustBrushSize'>
								<br />
								<p class="text-info">change brush size</p>
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
								</ul>
								<label>time per frame:</label>
								<button id='generateGif'> generate gif! </button>
							</div>
							<p id='loadingScreen'></p>
							
							<br />
							
							<div id='showDemos'>
								<h3> demos </h3>
								<select id='chooseDemo' onchange='getDemo(this)'>
									<option label=""></option>
									<option>run_demo</option>
									<option>floaty_thingy</option>
								</select>
							</div>
							
						</div>
					</div>

					<div id='screen' class='col-lg-9'>
						<div id='canvasArea'>
							<div id='pageCount'>
								<h3 id='prevFrame'> ◀ &nbsp;&nbsp;</h3>
								<h3 id='goLeft'> prev </h3>
								<h3 id='count'> frame: 1, layer: 1 </h3>
								<h3 id='goRight'> next </h3>
								<h3 id='nextFrame'>&nbsp;&nbsp;	▶</h3>
							</div>
						</div>
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