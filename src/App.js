import React, { useState, useEffect, useRef } from 'react';
import { AnimationProject } from './utils/AnimationProject.js';
import { AnimationController } from './utils/AnimationController.js';
import { Toolbar } from './utils/Toolbar.js';
import { BrushManager } from './utils/BrushManager.js';
import { FilterManager } from './utils/FilterManager.js';
import { AnimationTimeline } from './AnimationTimeline.js';
import { LayerOrder } from './LayerOrder.js';
import { FilterDashboard } from './FilterDashboard.js';
import { BrushDashboard } from './BrushDashboard.js';
import { ColorPicker } from './ColorPicker.js';
import { PasteImageManager } from './utils/PasteImageManager.js';

import "../styles/app.css";

// for displaying current frame and layer number
// TODO: importing a project won't update the counter display since it's using the Toolbar class functions
// and so the App's state doesn't get updated with the new currentFrame/Layer
export const FrameCounterDisplay = (props) => {
  return (
    <div id='pageCount'>
      <h3 className='navArrow' id='prevFrame' onClick={props.prevFrame}> &#9664; &nbsp;&nbsp;</h3>
      <h3 className='navArrow' id='prevLayer' onClick={props.prevLayer}> &#60; </h3>
      <h3 className='navArrow' id='count'> frame: {props.currFrame}, layer: {props.currLayer} </h3>
      <h3 className='navArrow' id='nextLayer' onClick={props.nextLayer}> &#62; </h3>
      <h3 className='navArrow' id='nextFrame' onClick={props.nextFrame}>&nbsp;&nbsp;    &#9654;</h3>
    </div>
  );
};

export const App = () => {
  //console.log("component render!");
  const [animationProject, setAnimationProject] = useState(null);
  const [brushInstance, setBrushInstance] = useState(null);
  const [toolbarInstance, setToolbarInstance] = useState(null);
  const [filtersInstance, setFiltersInstance] = useState(null);
  const [animationController, setAnimationController] = useState(null);
  const [pasteImageManager, setPasteImageManager] = useState(null);
  const [currFrame, setCurrFrame] = useState(1);
  const [currLayer, setCurrLayer] = useState(1);
  const [changeLayerOrder, setChangeLayerOrder] = useState(false);
  const [timelineMarkers, setTimelineMarkers] = useState({}); // keep track of where frame speed should change - not 0-indexed!
  
  const [animationTimelineFrames, setAnimationTimelineFrames] = useState([]);
  const timelineFrames = useRef([]); // use a ref for timelineFrames - this is because we need to access it in a closed context (i.e. document event listener) so we need something persistent
  
  const updateCurrFrameAndTimelineMarkers = (markers, frameNum) => {
    setTimelineMarkers(markers);
    setCurrFrame(frameNum);
    setCurrLayer(1);
  };
  
  const setTimelineFrames = (newFrames) => {
    timelineFrames.current = newFrames;
    
    // update the prop that's used by animationTimeline
    setAnimationTimelineFrames(timelineFrames.current);
  };
    
  const timelineMarkerDelete = (frameNumToDelete, timelineMarkers) => {
    const currentMarkers = JSON.parse(JSON.stringify(timelineMarkers));
    
    if(!delete currentMarkers[frameNumToDelete]){
      console.log(`couldn't delete frame marker for frame: ${frameNumToDelete}`);
    }
        
    setTimelineMarkers(currentMarkers);
  };
  
  const moveToFrame = (direction) => {
    const currFrameIndex = animationProject.getCurrFrameIndex();
    const frame = toolbarInstance.mergeFrameLayers(animationProject.getCurrFrame());
    const currFrameData = frame.toDataURL();
    
    if(currFrameIndex + 1 > timelineFrames.current.length){
      // if the animation timeline doesn't have the current frame, add it
      timelineFrames.current.push({
        "data": currFrameData,
        "height": frame.height, 
        "width": frame.width
      });
    }else{
      // update image data in the animation timeline
      timelineFrames.current[currFrameIndex].data = currFrameData;
    }
    
    if(direction === "prev"){
      if(toolbarInstance.prevFrame()){
        return true;
      }
    }else{
      if(toolbarInstance.nextFrame()){
        return true;
      }
    }
    
    return false;
  };
  
  // make the prev, next arrows clickable FOR LAYERS
  // note: this is for clicking the icons with a mouse
  const prevLayer = () => {
    if(toolbarInstance.prevLayer()){
      const curr = animationProject.getCurrFrame();
      setCurrFrame(animationProject.getCurrFrameIndex() + 1);
      setCurrLayer(curr.getCurrCanvasIndex() + 1);
    }
  };

  const nextLayer = () => {
    if(toolbarInstance.nextLayer()){
      const curr = animationProject.getCurrFrame();
      setCurrFrame(animationProject.getCurrFrameIndex() + 1);
      setCurrLayer(curr.getCurrCanvasIndex() + 1);
    }
  };

  // left and right arrows for FRAMES
  const prevFrame = () => {
    if(moveToFrame("prev")){
      const curr = animationProject.getCurrFrame();
      setCurrFrame(animationProject.getCurrFrameIndex() + 1);
      setCurrLayer(curr.getCurrCanvasIndex() + 1);
      setTimelineFrames([...timelineFrames.current]);
    }
  };

  const nextFrame = () => {
    if(moveToFrame("next")){
      const curr = animationProject.getCurrFrame();
      setCurrFrame(animationProject.getCurrFrameIndex() + 1);
      setCurrLayer(curr.getCurrCanvasIndex() + 1);
      setTimelineFrames([...timelineFrames.current]);
    }
  };
  
  const generateGif = () => {
    const frameSpeedMarkers = {};
          
    // if there's at least one timeline marker, we need to apply frame speed for each frame based on the marker
    // the initial speed will be whatever speed is currently selected (if no marker on the first frame)
    if(Object.keys(timelineMarkers).length > 0){
      let currFrameSpeed = parseInt(document.getElementById('timePerFrame').selectedOptions[0].value);
      timelineFrames.current.forEach((frame, index) => {
        if(timelineMarkers[index+1]){
          currFrameSpeed = timelineMarkers[index+1].speed;
        }
        frameSpeedMarkers[index+1] = currFrameSpeed;
      });
    }
    
    toolbarInstance.getGif('loadingScreen', frameSpeedMarkers);
  };
  
  const togglePenPressureBtn = (evt) => {
    // TODO: maybe a better approach here would be changing the classname and basing the color off classname
    if(evt.target.style.border === "1px solid rgb(255, 0, 0)"){
      evt.target.style.border = "1px solid rgb(0, 255, 0)";
    }else{
      evt.target.style.border = "1px solid rgb(255, 0, 0)";
    }
    brushInstance.togglePressureColorFlag();
  };
  
  const toggleLayerOrFrame = (evt) => {
    if(toolbarInstance.layerMode){
      evt.target.textContent = "toggle layer addition on spacebar press";
    }else{
      evt.target.textContent = "toggle frame addition on spacebar press";
    }
    toolbarInstance.layerMode = !toolbarInstance.layerMode;
  };

  const setupToolbar = (toolbarInstance) => {
    const newToolbar = toolbarInstance;
    const project = animationProject;
    
    newToolbar.setCounter('count');
    newToolbar.insertLayer('insertCanvas');
    newToolbar.deleteLayer('deleteCanvas', (newLayerIndex) => {
      setCurrLayer(newLayerIndex + 1);
    });
        
    newToolbar.deleteCurrentFrameButton('deleteCurrFrame', (frameIndexToRemove) => {
      const newTimelineFrames = [...timelineFrames.current];
      newTimelineFrames.splice(frameIndexToRemove, 1);
      
      const newTimelineMarkers = {};
            
      Object.keys(timelineMarkers).forEach((key, index) => {
        // since we removed a frame, reassign new frame indexes to each entry in the object
        if(parseInt(key) !== (frameIndexToRemove+1)){
          newTimelineMarkers[index+1] = timelineMarkers[key];
        }
      });
      
      setCurrFrame(project.getCurrFrameIndex() + 1);
      setCurrLayer(project.getCurrFrame().getCurrCanvasIndex() + 1);
      setTimelineFrames(newTimelineFrames);
      setTimelineMarkers(newTimelineMarkers);
    });
        
    // change layer order for current frame
    newToolbar.changeCurrentFrameLayerOrder('changeLayerOrder', () => {
      // update state to show layer order currently
      setChangeLayerOrder(true);
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
        
    newToolbar.importProject('importProject', importProjectUpdateFunc);
  };

  const loadDemo = (evt) => {
    getDemo(evt.target.selectedOptions[0].value);
  };

  const importProjectUpdateFunc = () => {
    // update state when loading in a project
    const project = animationProject;
    const toolbar = toolbarInstance;
        
    // update animation timeline after project is loaded
    const newFrames = [];
    project.frameList.forEach((frame, index) => {
      const mergedLayersFrame = toolbar.mergeFrameLayers(frame);
      const currFrameData = mergedLayersFrame.toDataURL();
      const currFrameIndex = index; 
      
      if(currFrameIndex + 1 > newFrames.length){
        newFrames.push({
          "data": currFrameData, 
          "height": mergedLayersFrame.height, 
          "width": mergedLayersFrame.width
        });
      }else{
        // update image data
        newFrames[currFrameIndex].data = currFrameData;
      }
    });
        
    // figure out which layer is the one that should be visible for the first frame
    const layers = project.frameList[0].canvasList;
    let visibleLayerIndex = 0;
    for(let i = 0; i < layers.length; i++){
      if(layers[i].style.opacity >= .97){
        visibleLayerIndex = i;
        break;
      }
    }
    
    project.getFrames()[0].show();
    
    setCurrFrame(1);
    setTimelineMarkers({});
    setCurrLayer(visibleLayerIndex + 1);
    
    setTimelineFrames(newFrames);
  };
    
  const getDemo = (selected) => {
    if(selected === ""){ 
      return;
    }
        
    const selectedDemo = `demos/${selected}.json`; 
    const httpRequest = new XMLHttpRequest();

    if(!httpRequest){
      return;
    }
    
    httpRequest.open("GET", selectedDemo);
        
    httpRequest.onload = () => {
      const data = JSON.parse(httpRequest.responseText);
      toolbarInstance.importData(data, importProjectUpdateFunc);
    };
    
    httpRequest.send();
  };
    
  const clickOption = (evt) => {
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
  };
    
  const showFiltersOrBrushes = (evt) => {
    const disp = document.getElementById(evt.target.textContent.trim()); // 'brushes' or 'filters'
    if(disp.style.display === "none" || !disp.style.display){
      disp.style.display = "block";
    }else{
      disp.style.display = "none";
    }
  };

  useEffect(() => {
    console.log('rendering...');
    
    if(!animationProject){
      const animationProj = new AnimationProject(document.querySelector('.canvasArea'));
      const newBrush = new BrushManager(animationProj);
      const newFilters = new FilterManager(animationProj, newBrush);
      const newToolbar = new Toolbar(newBrush, animationProj);
      const animController = new AnimationController(animationProj, newToolbar);
      const pasteImgManager = new PasteImageManager(animationProj);
      
      setAnimationProject(animationProj);
      setBrushInstance(newBrush);
      setToolbarInstance(newToolbar);
      setFiltersInstance(newFilters);
      setAnimationController(animController);
      setPasteImageManager(pasteImgManager);
    }else{
      //console.log('setting up animation project...');
      setupToolbar(toolbarInstance);
      animationProject.init();
            
      // capture the initial canvas dimensions so we can scale x and y coords if window resizes
      const canvas = animationProject.getCurrFrame().getCurrCanvas().getBoundingClientRect();
      brushInstance.updateInitialCanvasDimensions(canvas.width, canvas.height);
      
      // start with the default brush
      brushInstance.brushesMap["default"].attachBrush();
      
      // allow pasting images via ctrl+v
      document.addEventListener('paste', pasteImageManager.handlePasteEvent.bind(pasteImageManager));
      
      // register keydown events for going between layers/frames
      // it's important to define the event listener here because if you define it outside of useEffect,
      // the closure will only capture the initial state of the component (so our state variables would still be null)
      //
      // however, we still have a problem, e.g. if we load a demo, the timelineFrames array state variable will still be empty
      // so we can use a ref to keep a persistent array variable around to help
      // but we also want to update the child AnimationTimeline component which needs to use the ref >_<
      //
      // it's honestly much easier to use a React class component for this and just reference this.state wherever since it'll always be up-to-date.
      //
      // https://stackoverflow.com/questions/55565444/how-to-register-event-with-useeffect-hooks
      // https://stackoverflow.com/questions/66213641/react-keypress-event-taking-only-initial-state-values-and-not-updated-values
      // https://github.com/facebook/react/issues/15815
      const handleKeyDown = (evt) => {
        let updateStateFlag = false;
        let frame = null;
        
        switch(evt.which){
        case 37: //left arrow key
          if(toolbarInstance.prevLayer()){
            frame = animationProject.getCurrFrame();
            updateStateFlag = true;
          }
          break;
        case 39: //right arrow key
          if(toolbarInstance.nextLayer()){
            frame = animationProject.getCurrFrame();
            updateStateFlag = true;
          }
          break;
        case 32: //space bar
          evt.preventDefault();
          if(toolbarInstance.layerMode){
            toolbarInstance.addNewLayer();
          }else{
            animationProject.addNewFrame(false);
          }
          break;
        case 65: // a key 
          updateStateFlag = moveToFrame("prev");
          frame = animationProject.getCurrFrame();                
          break;
        case 68: // d key
          updateStateFlag = moveToFrame("next");
          frame = animationProject.getCurrFrame();
          break;
        default:
          break;
        }
        
        if(updateStateFlag){
          setCurrFrame(animationProject.getCurrFrameIndex() + 1);
          setCurrLayer(frame.getCurrCanvasIndex() + 1);
          setTimelineFrames([...timelineFrames.current]);
        }
      };
      
      document.addEventListener('keydown', handleKeyDown);
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [animationProject]);
  
  return(
    <div className='container'>
      <div className='toolbar'>
        <section id="toolbarOptions" className="toolbarSection">
          <h3> funSketch </h3>
          <ul>
            <li id="instructionsOption"
              className="option"
              onClick={clickOption}> instructions </li>
            <li id="frameLayerCtrlOption"
              className="option"
              onClick={clickOption}> frame/layer control </li>
            <li id="animationCtrlOption"
              className="option"
              onClick={clickOption}> animation control </li>
            <li id="otherOption"
              className="option"
              onClick={clickOption}> other </li>
            <li id="demosOption"
              className="option"
              onClick={clickOption}> demos </li>
          </ul>
        </section>                    
                  
        <section id="instructions" className="toolbarSection2">
          <h4> instructions </h4>
          <p>
            <kbd>Space</kbd>: append a new layer (default behavior) or 
            frame (see 'other' to toggle between layer or frame addition with the spacebar)
          </p>
          <p><kbd>←</kbd> <kbd>→</kbd>: move between layers</p>
          <p><kbd>A</kbd> <kbd>D</kbd>: move between frames</p>
          <p>
            After frames get added to the timeline (the rectangle below the canvas), 
            you can set different frame speeds at any frame by clicking on the frames.
          </p>
          <p><kbd>Ctrl</kbd> + <kbd>V</kbd>: paste image</p>
          <p><kbd>R</kbd> + mouse wheel: rotate pasted image</p>
          <p><kbd>S</kbd>: resize pasted image</p>
          <p><kbd>Esc</kbd>: abort image paste</p>                        
          <p>
            After pasting the image, you can move it by clicking 
            and dragging the box around it (denoted by dotted lines). 
            Apply the image to the canvas by clicking anywhere outside the dotted lines. 
          </p>
        </section>
              
        <section id="frameLayerSection" className="tbar">
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
              <li><button id='deleteCurrFrame'>delete current frame</button></li>
              <li><button id='copyCurrFrame'>duplicate frame</button></li>
              <li><button id='changeLayerOrder'>change layer order</button></li>
              <li><button id='downloadFrame'>download current frame</button></li>
            </ul>
                      
            <LayerOrder 
              changingLayerOrder={changeLayerOrder}
              layers={
                animationProject && 
                animationProject.getCurrFrame() ? 
                  animationProject.getCurrFrame().getLayers().map((x, idx) => idx) : []
              }
              updateParentStateFunction={
                (newLayerOrder) => {
                  // 1. update layer order of current frame
                  // 2. set changeLayerOrder in state to false
                  const newLayerList = [];
                  const currFrame = animationProject.getCurrFrame();
                  const currLayerIndex = currFrame.getCurrCanvasIndex();
                  const currFrameLayerList = currFrame.getLayers();
                                      
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
                  toolbarInstance.setCurrLayer(currLayerIndex);
                  
                  setChangeLayerOrder(false);
                }
              }
            />
          </div>
        </section>
                  
        <section id="otherSection" className="tbar">
          <h4> other </h4>
          <div id="displayOtherStuff">
            <ul>
              <li><button id='importImage'> import image </button></li>
              <li>
                <div>
                  <label id='fitToCanvasCheckLabel' htmlFor='fitToCanvasCheck'>
                    fit image to canvas: 
                  </label>
                  <input name='fitToCanvasCheck' id='fitToCanvasCheck' type='checkbox' defaultChecked />
                </div>
                <div>
                  <label id='centerImageCheckLabel' htmlFor='centerImageCheck'>
                    center image: 
                  </label>
                  <input name='centerImageCheck' id='centerImageCheck' type='checkbox' />
                </div>
              </li>
              <li><button id='rotateCanvasImage'>rotate image</button></li>
              <li><button id='undo'>undo</button></li>
              <li><button id='saveWork'>save project (.json)</button></li> 
              <li><button id='importProject'>import project </button></li>
              <li>
                <button 
                  id='togglePenPressureColor' 
                  onClick={togglePenPressureBtn} 
                  style={{border: '1px solid rgb(0, 255, 0)'}}
                > 
                  toggle pen pressure for color 
                </button>
              </li>
              <li>
                <button id='toggleLayerOrFrame' onClick={toggleLayerOrFrame}> 
                  toggle frame addition on spacebar press 
                </button>
              </li>
            </ul>
          </div>
          <div id="experiments">
            <h4>check out some experiments for new feature ideas:</h4>
            <p><a href="./experiments/floodfillExperiment/floodfillExperiment.html">floodfill with web workers</a></p>
            <p><a href="./experiments/oilpaintingWebWorkers/oilpainting.html">oilpainting with web workers</a></p>
            <p><a href="./experiments/selectToolExperiment/selectTool.html">selection tool</a></p>
            <p><a href="./experiments/lightingExperiment/lighting.html">lighting idea</a></p>
          </div>
        </section>
                  
        <section id='animControlSection' className='tbar'>
          <div id='animationControl'>
            <h4> animation control: </h4>
            <div id='timeOptions'>
              <label htmlFor='timePerFrame'>time per frame (ms):</label>
              <select name='timePerFrame' id='timePerFrame' onChange={
                (evt) => {
                  toolbarInstance.timePerFrame = parseInt(evt.target.value);
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
                  animationController.playAnimation(
                    "forward", 
                    timelineFrames.current,
                    timelineMarkers
                  );
                }
              }> play animation forward </button></li>
              <li><button onClick={
                () => {
                  //this._playAnimation("backward");
                  animationController.playAnimation(
                    "backward", 
                    timelineFrames.current,
                    timelineMarkers
                  );
                }
              }> play animation backward </button></li>
              <li>
                <button id='generateGif' onClick={generateGif}> generate gif! </button>
              </li>
            </ul>
          </div>
          <p id='loadingScreen'></p>
        </section>
                  
        <section id='showDemos' className="tbar">
          <h3> demos </h3>
          <select id='chooseDemo' onChange={loadDemo}>
            <option label=""></option>
            <option className='demo'>run_demo</option>
            <option className='demo'>floaty_thingy</option>
            <option className='demo'>cake_cut</option>
            <option className='demo'>basketball_blur</option>
            <option className='demo'>walk_anim_practice</option>
          </select>
        </section>
      </div>

      <main className='screen'>
        <div className='screenContainer'>
          <FrameCounterDisplay
            prevFrame={prevFrame}
            prevLayer={prevLayer}
            nextFrame={nextFrame}
            nextLayer={nextLayer}
            currFrame={currFrame}
            currLayer={currLayer}
          />
                      
          <div className='canvasArea'>
          </div>
                      
          <AnimationTimeline 
            frames={animationTimelineFrames}
            markers={timelineMarkers}
            goToFrame={toolbarInstance ? toolbarInstance.goToFrame : () => {}}
            deleteMarker={timelineMarkerDelete}
            updateCurrFrameAndTimelineMarkers={updateCurrFrameAndTimelineMarkers}
            toolbarInstance={toolbarInstance}
          />
        </div>
      </main>
              
      <section id="brushSection">
        <ColorPicker brush={brushInstance} />
                  
        <hr />
                  
        <h4 id="brushesOption"
          className="option"
          onClick={showFiltersOrBrushes}
        > brushes
        </h4>
                  
        <div id="brushes" className="tbar">
          <BrushDashboard brushManager={brushInstance} />
        </div>
                  
        <hr />

        <h4 id="filtersOption"
          className="option"
          onClick={showFiltersOrBrushes}
        > filters </h4>
                  
        <div id="filters" className="tbar">
          <FilterDashboard filterManager={filtersInstance} />
        </div>
      </section>
              
      <footer id="footer">
        <hr />
        <p> c.2017 | <a href='https://github.com/syncopika/funSketch'> source </a></p>
      </footer>
              
    </div>
  );
};
