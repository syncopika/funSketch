import React from 'react';
import {useState} from 'react';

function saveNewLayerOrder(updateParentStateFunc){
    const layers = [...document.querySelectorAll('[id^="layerOrder"]')].map((el)=>{ 
        // currently each element's text content is like "layer <number>". 
        // map the list so that we get the number - 1, because we want list indexes so we can 
        // rearrange the order of the layers accordingly
        return parseInt(el.textContent.split(' ')[1])-1;
    });
    updateParentStateFunc(layers); // update parent state.
}


const LayerOrder = (props) => {
    const show = props.changingLayerOrder;
    const updateParentState = props.updateParentStateFunction; // need to pass arg to this function
    const layers = props.layers;
    
    const style = {
        "textAlign": "center"
    };
    
    const elementStyle = {
        "margin": "2px auto",
        "textAlign": "center",
        "border": "1px solid #000",
        "width": "10%",
    };
    
    // use a hook to be able to drag and drop with 
    const [dragSourceEl, setDragSourceEl] = useState(0);
    
    if(show){
        return (
            <div style={style}>
                <h4> layer order for current frame: </h4>
                {
                    layers.map((layerIndex) => {
                        return <div 
                            style={elementStyle} 
                            key={layerIndex}
                            id={(`layerOrder_${layerIndex}`)}
                            
                            onDragStart={
                                function(e){
                                    e.stopPropagation();
                                    
                                    const thisEl = e.target;
                                    thisEl.style.opacity = 0.5;
                                    setDragSourceEl(thisEl);
                                    e.dataTransfer.effectAllowed = "move";
                                    e.dataTransfer.setData("text/html", thisEl.innerHTML);
                                }
                            }
                            
                            onDragEnter={
                                function(e){
                                    e.target.style.border = "1px dotted #000";
                                }
                            }
                            
                            onDragOver={
                                function(e){
                                    e.preventDefault();
                                }
                            }
                            
                            onDragLeave={
                                function(e){
                                    e.target.style.border = "1px solid #000";
                                }
                            }
                            
                            onDrop={
                                function(e){
                                    let thisEl = e.target;

                                    // e is the target element to drop on
                                    e.stopPropagation();
                                    
                                    // do nothing if target is the same as the element being dragged
                                    if(dragSourceEl != thisEl){
                                        dragSourceEl.innerHTML = thisEl.innerHTML;
                                        thisEl.innerHTML = e.dataTransfer.getData('text/html');
                                    }
                                    
                                    // make sure source goes back to normal opacity
                                    dragSourceEl.style.opacity = 1;
                                    
                                    // also make sure target has its border style restored
                                    thisEl.style.border = "1px solid #000";
                                    
                                    e.preventDefault();
                                }
                            }
                            
                            draggable={"true"}
                            
                        >layer {layerIndex+1}</div>
                    })
                }
                <button
                    id={"doneChangingLayerButton"}
                    onClick={
                        function(){
                            saveNewLayerOrder(updateParentState);
                        }
                    }
                > done </button>
            </div>
        );
    }else{
        return (
            <div></div>
        )
    }
}


export{
    LayerOrder
}