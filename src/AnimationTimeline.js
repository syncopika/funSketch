// https://stackoverflow.com/questions/55340888/fast-way-to-resize-imagedata-in-browser
// https://stackoverflow.com/questions/19262141/resize-image-with-javascript-canvas-smoothly
// https://stackoverflow.com/questions/13416800/how-to-generate-an-image-from-imagedata-in-javascript
import React from 'react';
import '../styles/animationTimeline.css';

const TimelineFrameThumbnail = (props) => {
    const frameImgData = props.imgData;
    return(
        <img
            className="animationTimelineFrame"
            src={frameImgData}
        />
    )
}

// need to pass in a method from PresentationWrapper to allow updates that may occur 
// in AnimationTimeline (i.e. changing the fps at a marker or deleting a marker)
// to persist (these changes should be stored in PresentationWrapper's state)
class AnimationTimeline extends React.Component {
    constructor(props){
        super(props);
        
        // functions for communicating with parent component
        this.deleteMarker = props.deleteMarker;
        this.updateCurrFrameAndTimelineMarkers = props.updateCurrFrameAndTimelineMarkers;
    }
    
    componentDidUpdate(){
        this.timelineMarkerSetup();
    }
    
    getCoordinates(canvas, event){
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.width / rect.height;
        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top) * scaleY;
        return {'x': x, 'y': y, 'rect': rect};
    }
    
    timelineMarkerSetup(){
        const timelineCanvas = document.querySelector('.animationTimelineCanvas');
        const animationTimeline = document.querySelector('.animationTimeline');
        
        // make sure pixel width of canvas is the same as the timeline element
        timelineCanvas.width = animationTimeline.clientWidth;
        timelineCanvas.height = animationTimeline.clientHeight - 20; // leave a gap for the scrollbar
        
        timelineCanvas.addEventListener('mousemove', (event) => {
            const context = timelineCanvas.getContext('2d');
            context.clearRect(0, 0, timelineCanvas.width, timelineCanvas.height);
            
            const coords = this.getCoordinates(timelineCanvas, event);
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
            const scrollDistance = animationTimeline.scrollLeft;
            const coords = this.getCoordinates(timelineCanvas, event);
            const x = coords.x + scrollDistance;
            const y = coords.y;
            
            // which frame does this coordinate match to?
            if(this.props.frames.length > 0){
                const width = 123; // TODO: don't hardcode this? it should be based on img width in the timeline
                                   // had issues getting the styling right though so pretty difficult otherwise
                const frameGuess = Math.floor(x/width) + 1;
                
                if(frameGuess <= this.props.frames.length){
                    // update markers in state
                    const markers = this.props.markers;
                    
                    // use frame number as the key
                    markers[frameGuess] = {
                        'xCoord': x, 
                        'frameNumber': frameGuess, 
                        'speed': 100, 
                        'frame': this.props.frames[frameGuess-1] 
                    };
                    
                    this.updateCurrFrameAndTimelineMarkers(markers, frameGuess);
                }
            }
        });
    }
    
    render(){
        return (
            <div className="animationTimelineArea">
                <div className="animationTimeline">
                    {
                        this.props.frames.map((frame, index) => {
                            return <TimelineFrameThumbnail imgData={frame.data} key={index} />
                        })
                    }
                </div>
                
                <canvas className='animationTimelineCanvas'></canvas>
                
                <div className="animationTimelineMarkers">
                {
                    Object.keys(this.props.markers).map((markerKey, index) => {
                        const marker = this.props.markers[markerKey];
                        return (
                            <div key={`timelineMarker${index}`}>
                                <label htmlFor={'marker' + marker.frameNumber + 'Select'}> marker for frame {marker.frameNumber}: &nbsp;</label>
                                <select 
                                    id={`marker${marker.frameNumber}Select`} 
                                    name={`marker${marker.frameNumber}Select`}
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
                                    onClick={() => this.deleteMarker(marker.frameNumber)}
                                > &nbsp;delete </label>
                            </div>
                        );
                    })
                }
                </div>
            </div>
        );
    }
}


export{
    AnimationTimeline
}