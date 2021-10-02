// https://stackoverflow.com/questions/55340888/fast-way-to-resize-imagedata-in-browser
// https://stackoverflow.com/questions/19262141/resize-image-with-javascript-canvas-smoothly
// https://stackoverflow.com/questions/13416800/how-to-generate-an-image-from-imagedata-in-javascript
import React from 'react';

const TimelineFrameThumbnail = (props) => {
	const frameImgData = props.imgData;
	const height = '120px';
	const width = '120px';
	return(
		<img style={{
			'display': 'inline-block', 
			'border': '1px solid #000',
			'margin': '1px',
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
	const timelineStyle = {
		'width': '100%',
		'height': '100%',
		'backgroundColor': '#fff',
		'overflowX': 'scroll',
		'whiteSpace': 'nowrap',
		'borderLeft': '1px solid #000',
		'borderRight': '1px solid #000',
		'borderBottom': '1px solid #000',
	};
	
	return (
		<div id='animationTimeline' style={timelineStyle}>
			{
				props.frames.map((frame, index) => {
					return <TimelineFrameThumbnail imgData={frame.data} key={index} />
				})
			}
		</div>
	)
}


export{
	AnimationTimeline
}