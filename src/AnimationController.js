class AnimationController {
  constructor(animationProject, toolbar){
    this.animProject = animationProject;
    this.toolbar = toolbar;
        
    this.currAnimFrameIndex = 0;
    this.reqAnimFrameId = 0;
    this.currAnimSpeed = 0;
    this.currAnimElapsedTime = 0;
    this.animTimelineFrames = [];
    this.timelineMarkers = {};
    this.animationDisplay = null; // the canvas that'll hold the merged layers of each frame when animating
  }
  
  // private method
  #animate(timestamp){
    if(this.currAnimStartTime === 0){
      this.currAnimStartTime = timestamp;
    }
        
    this.currAnimElapsedTime = (timestamp - this.currAnimStartTime);
        
    // set the animation canvas to white instead of clearRect 
    // we don't want transparency otherwise we'll see our current frame we were working on flash between animation frames
    if(this.currAnimElapsedTime >= this.currAnimSpeed){
      this.currAnimElapsedTime = 0;
      this.currAnimStartTime = timestamp;
      this.currAnimFrameIndex++;
    }
            
    if(this.currAnimFrameIndex > this.animTimelineFrames.length - 1){
      // we're done animating
      cancelAnimationFrame(this.reqAnimFrameId);
      this.animationDisplay.parentNode.removeChild(this.animationDisplay);
      this.animationDisplay = null;
    }else{
      // load next frame
      if(this.timelineMarkers[this.currAnimFrameIndex+1]){
        // adjust speed if needed
        this.currAnimSpeed = parseInt(this.timelineMarkers[this.currAnimFrameIndex+1].speed); // +1 because not 0-indexed
      }
            
      const displayContext = this.animationDisplay.getContext('2d');
      displayContext.fillRect(0, 0, displayContext.width, displayContext.height);
            
      const image = new Image();
      image.onload = () => {
        displayContext.drawImage(image, 0, 0);
      };
      image.src = this.animTimelineFrames[this.currAnimFrameIndex].data;
            
      this.reqAnimFrameId = requestAnimationFrame(this.#animate.bind(this));
    }
  }

  playAnimation(direction, timelineFrames, timelineMarkers){
    /*
      plays all the timeline frames in sequence by merging each frame's layers on a separate canvas.
      note that even if a frame exists, if it's not in the timeline playAnimation will not do anything.
      
      TODO: pause? stop? just a segment?
      
      BUG: reversing the animation with timeline markers won't apply the speed changes correctly
      e.g. if we have the 1st frame be at 500 ms and the 5th frame be at 100 ms, if we reverse, currently
      we'll get last frame -> 5th frame be at 500 ms. but we really should have last frame -> 5th frame be
      at 100 ms. then 5th -> 1st be at 500 ms. one way to manage this would be just to create an array of
      times for each frame and use that.
    */
    
    if(direction !== "forward" && direction !== "backward"){
      console.log("not a valid direction for animation");
      return;
    }
        
    let frames = Array.from(timelineFrames); // make a copy
    if(Object.keys(frames).length === 0){
      return;
    }
        
    if(this.animationDisplay !== null){
      // if the animationDisplay canvas is present, we're animating already
      return;
    }
        
    if(direction === "backward"){
      // reverse alters the original array so we needed a copy
      frames = frames.reverse();
    }
        
    this.animTimelineFrames = frames;
    this.timelineMarkers = timelineMarkers;
        
    // all frames should have the same dimensions
    const currFrame = this.animProject.getCurrFrame();
        
    // create animation display (a separate canvas)
    const animationDisplay = document.createElement('canvas');
    animationDisplay.width = currFrame.currentCanvas.width; 
    animationDisplay.height = currFrame.currentCanvas.height;
    animationDisplay.style.zIndex = 200;
    animationDisplay.style.border = '1px solid #000';
    animationDisplay.style.position = 'absolute';
    animationDisplay.style.opacity = 1.0;
    animationDisplay.id = "animationDisplay";
    document.querySelector(".canvasArea").appendChild(animationDisplay);

    const displayContext = animationDisplay.getContext('2d');
    displayContext.fillStyle = "#ffffff";
    displayContext.fillRect(0, 0, displayContext.width, displayContext.height);
        
    this.animationDisplay = animationDisplay;
        
    // set up initial animation speed
    this.currAnimSpeed = this.toolbar.timePerFrame;
    if(this.timelineMarkers[1]){
      // 1 = first frame
      this.currAnimSpeed = parseInt(this.timelineMarkers[1].speed);
    }
        
    // set up first frame
    const image = new Image();
    image.onload = () => {
      displayContext.drawImage(image, 0, 0);
    };
    image.src = this.animTimelineFrames[0].data;
        
    // animate!
    this.currAnimFrameIndex = 0;
    this.currAnimStartTime = 0;
    this.reqAnimFrameId = requestAnimationFrame(this.#animate.bind(this));
  }
}

export {
  AnimationController
};
    