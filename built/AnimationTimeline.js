// https://stackoverflow.com/questions/55340888/fast-way-to-resize-imagedata-in-browser
// https://stackoverflow.com/questions/19262141/resize-image-with-javascript-canvas-smoothly
// https://stackoverflow.com/questions/13416800/how-to-generate-an-image-from-imagedata-in-javascript

const TimelineFrameThumnail = (props) => {
	let frameImgData = props.imgData;
	let height = '120px'; //props.height;
	let width = '120px'; //props.width;
	return(
		<img style={{
			'display': 'inline-block', 
			'border': '1px solid #000',
			//'margin': '3px',
			}}
			width={width}
			height={height}
			src={frameImgData}
		/>
	)
}

// need to pass in a method from PresentationWrapper to allow updates that may occur 
// in AnimationTimeline (i.e. changing the fps at a marker or deleting a marker)
// to persist (these changes should be stored in PresentationWrapper's state)
const AnimationTimeline = (props) => {
	
	let timelineStyle = {
		'width': '100%',
		'height': '200px',
		'border': '1px solid #000',
		'display': 'block',
		'backgroundColor': '#fff',
		'overflow-x': 'auto',
		'white-space': 'nowrap'
	};
	
	return (
		<div id='animationTimeline' style={timelineStyle}>
			{
				props.frames.map((frame, index) => {
					return <TimelineFrameThumnail imgData={frame.data} key={index} />
				})
			}
		</div>
	)
}


export{
	AnimationTimeline
}