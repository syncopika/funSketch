import { AnimationProject } from './SuperCanvas.js';
import { Toolbar } from './Toolbar.js';
import { Brush } from './Brush.js';

class PresentationWrapper extends React.Component {

	constructor(props){
		super(props);
		this.state = {
			'animationProject': null,
			'brushInstance': null,
			'toolbarInstance': null,
		};
	}
	
	componentDidMount(){
		
		const animationProj = new AnimationProject('canvasArea');
		
		const newBrush = new Brush(animationProj);
		newBrush.defaultBrush();
		
		//console.log(animationProj);
		animationProj.addNewFrame(true);
		
		let currCanvas = animationProj.getCurrFrame().currentCanvas;
		this.setState({
			'animationProject': animationProj,
			'brushInstance': newBrush,
			'toolbarInstance': currCanvas,
		});
		
	}
	
	render(){
		return(
			<div>
				<h1> this is a test </h1>
				<div id="canvasArea">
				</div>
			</div>
		);
	}

}

export { PresentationWrapper };