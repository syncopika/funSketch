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
		'marginTop': '5px',
		'whiteSpace': 'nowrap',
		'border': '1px solid #000',
	};
	
	return (
		<div id="animationTimelineArea">
			<div id='animationTimeline' style={timelineStyle}>
				{
					props.frames.map((frame, index) => {
						return <TimelineFrameThumbnail imgData={frame.data} key={index} />
					})
				}
			</div>
			
			<canvas id='animationTimelineCanvas'
			 style={{
				 'marginBottom': '10px', // add margins to 'squish' the canvas a bit so it falls properly on the timeline. otherwise it'll completely overlap the timeline :/
				 'marginTop': '5px',
				 'width': '100%',
				 'height': '160px', // note this height is slightly less than the height of AnimationTimeline to not cover the bottom scrollbar
			}}></canvas>
			
			<div id="animationTimelineMarkers">
			{
				Object.keys(props.markers).map((markerKey, index) => {
					const marker = props.markers[markerKey];
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
								onClick={() => props.deleteMarkerFunc(marker.frameNumber)}
							> &nbsp;delete </label>
						</div>
					);
				})
			}
			</div>
		</div>
	)
}


export{
	AnimationTimeline
}