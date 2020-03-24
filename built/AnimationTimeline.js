// https://stackoverflow.com/questions/55340888/fast-way-to-resize-imagedata-in-browser
// https://stackoverflow.com/questions/19262141/resize-image-with-javascript-canvas-smoothly
// https://stackoverflow.com/questions/13416800/how-to-generate-an-image-from-imagedata-in-javascript

const TimelineFrameThumnail = (props) => {
	let frameImgData = props.imgData;
	let height = '120px'; //props.height;
	let width = '120px'; //props.width;
	return(
		<div style={{
			'display': 'inline-block', 
			'border': '1px solid #000',
			'width': width,
			'height': height,
			'margin': '5px'
			}}>
		</div>
	)
}


class AnimationTimeline extends React.Component {
	
	constructor(props){
		super(props);	
		this.state = {
			'frames': this.props.frames, // a list of image data (all layers merged) for each frame
			'flags': []
		};
	}
	
	resizeFrame(imageData, destWidth, destHeight){
	}
	
	render(){
		return (
			<div id='animationTimeline' style={
				{
					'width': '100%',
					'height': '200px',
					'border': '1px solid #000',
					'display': 'block',
					'backgroundColor': '#fff'
				}
			}>
			
			{
				this.state.frames.map((frame, index) => {
					return <TimelineFrameThumnail imgData={frame.data} key={index} />
				})
			}
				
			</div>
		)
	}
	
}

export{
	AnimationTimeline
}