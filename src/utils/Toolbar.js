
class Toolbar {
    constructor(brush, animationProj){
        // used as a flag for the animation playback features
        this.play = null;

        // used to hold user-indicated time (ms) per frame for animation playback and gif
        this.timePerFrame = 100; // set to 100 be default
        // should the keyboard keys be affecting the layer or the frame? 2 options only
        // this is useful for the arrow keys and space bar
        this.layerMode = true;
        this.htmlCounter = ""; // html element used as a counter specifying the current frame and layer
        
        this.brush = brush;
        this.animationProj = animationProj;
    }
    
    setCounter(elementId){
        this.htmlCounter = document.getElementById(elementId);
    }
    
    nextLayer(){
        this.brush.resetBrush();
        const frame = this.animationProj.getCurrFrame();
        const result = frame.nextLayer();
        // TODO: can we figure out a better way to handle brushes?
        this.brush.applyBrush(); // apply brush whether or not layer changed because it was reset initially
        return result;
    }
    
    prevLayer(){
        this.brush.resetBrush();
        const frame = this.animationProj.getCurrFrame();
        const result = frame.prevLayer();
        this.brush.applyBrush();
        return result;
    }
    
    setCurrLayer(layerIndex){
        // true to show onion skin of prev layer (when would we not?)
        this.animationProj.getCurrFrame().setToLayer(layerIndex, true);
    }
    
    nextFrame(){
        this.brush.resetBrush();
        const curr = this.animationProj.getCurrFrame();
        const next = this.animationProj.nextFrame();
        this.brush.applyBrush();
        if(next !== null){
            curr.hide();
            next.show();
            return true;
        }
        return false;
    }
    
    prevFrame(){
        this.brush.resetBrush();
        const curr = this.animationProj.getCurrFrame();
        const prev = this.animationProj.prevFrame();
        this.brush.applyBrush();
        if(prev !== null){
            curr.hide();
            prev.show();
            return true;
        }
        return false;
    }
    
    goToFrame(frameIndex){
        this.brush.resetBrush();
        const curr = this.animationProj.getCurrFrame();
        const destFrame = this.animationProj.goToFrame(frameIndex);
        this.brush.applyBrush();
        if(destFrame !== null){
            curr.hide();
            destFrame.show();
            return true;
        }
        return false;
    }
    
    addNewLayer(){
        const canvas = this.animationProj.getCurrFrame();
        canvas.setupNewLayer();
    }
    
    insertNewLayer(){
        const canvas = this.animationProj.getCurrFrame();
        // add a new canvas first 
        canvas.setupNewLayer();
        // then move it after the current canvas 
        const newestCanvas = canvas.canvasList.pop();
        canvas.canvasList.splice(canvas.currentIndex + 1, 0, newestCanvas);
        return newestCanvas;
    }

    /***
        insert a new layer after the current layer
    ***/
    insertLayer(elementId){
        document.getElementById(elementId).addEventListener('click', () => {
            this.insertNewLayer();
        });
    }
    
    /***
        duplicate the current layer
        note: the next layer after the current will have identitcal image data
    ***/
    duplicateLayer(elementId){
        document.getElementById(elementId).addEventListener('click', () => {
            const currentCanvas = this.animationProj.getCurrFrame().currentCanvas;
            const newLayer = this.insertNewLayer();
            newLayer.getContext('2d').drawImage(currentCanvas, 0, 0);
        });
    }
    
    /***
        delete current layer
        shifts the current layer to the next one if there is one.
        otherwise, the previous layer will become the current one.
        if there isn't a previous one either, then the layer will just be made blank.
    ***/
    deleteLayer(elementId, setStateFunction){
        // elementId here refers to the display that shows current frame and layer
        document.getElementById(elementId).addEventListener('click', () => {
            const frame = this.animationProj.getCurrFrame();
            const oldLayerIndex = frame.getCurrCanvasIndex();
            const oldLayer = frame.getCurrCanvas();
            const parentNode = document.getElementById(oldLayer.id).parentNode;
            const layerList = frame.getLayers();
            
            if(oldLayerIndex + 1 < layerList.length || oldLayerIndex - 1 >= 0){
                frame.deleteLayer(oldLayerIndex);
                parentNode.removeChild(oldLayer);
                this.brush.applyBrush();
            }else{
                // otherwise, just blank the canvas 
                const context = oldLayer.getContext("2d");
                context.clearRect(0, 0, oldLayer.getAttribute('width'), oldLayer.getAttribute('height'));
                context.fillStyle = "#fff";
                context.fillRect(0, 0, oldLayer.getAttribute('width'), oldLayer.getAttribute('height'));
            }
            
            setStateFunction(frame.getCurrCanvasIndex());
        });
    }
    
    /***
        add a new frame
    ***/
    addNewFrameButton(elementId){
        document.getElementById(elementId).addEventListener('click', () => {
            this.animationProj.addNewFrame();
        });
    }
    
    /***
        duplicate current frame
    ***/
    copyCurrFrameButton(elementId){
        document.getElementById(elementId).addEventListener('click', () => {
            this.animationProj.copyCurrFrame();
        });
    }
    
    /***
        delete current frame
    ***/
    deleteCurrentFrameButton(elementId, setStateFunction){
        document.getElementById(elementId).addEventListener('click', () => {
            const currFrameIdx = this.animationProj.getCurrFrameIndex();
            
            // move to another frame first before deleting
            if(currFrameIdx - 1 >= 0){
                this.prevFrame();
            }else{
                // go forward a frame
                this.nextFrame();
            }
            if(this.animationProj.deleteFrame(currFrameIdx)){    
                setStateFunction(currFrameIdx); // the index of the frame we deleted
            }
        });
    }
    
    /***
        change layer order for current frame on button press
    ***/
    changeCurrentFrameLayerOrder(elementId, setStateFunction){
        document.getElementById(elementId).addEventListener('click', () => {
            // I'm not sure why right now but something weird happens after calling 
            // changeCurrentFrameLayerOrder for the first time.
            // it acts as expected but also I get an error saying setStateFunction is undefined 
            // in the console. :/ so for now check if setStateFunction is not undefined?
            if(setStateFunction){
                setStateFunction(null);
            }
        });
    }
    
    /***
        rotate image
        pass in an element id for a button that will rotate the current canvas image on click
        
        this is mostly for experimental purposes as the effect is not quite good (blurry and loss of pixels).
        
        there are a couple StackOverflow posts out there that explain why rotating
        an image leads to blurriness since the pixels are getting repositioned and their locations
        are approximated, which I think makes sense
        
        How do other drawing applications achieve arbitrary rotations without weirdness? 
        I think Paint.NET has that feature, maybe Krita does too?)
    ***/
    rotateImage(elementId){
        document.getElementById(elementId).addEventListener('click', () => {
            const canvas = this.animationProj.getCurrFrame();
            const width = canvas.currentCanvas.width;
            const height = canvas.currentCanvas.height;
            const context = canvas.currentCanvas.getContext("2d");
            createImageBitmap(canvas.currentCanvas, 0, 0, width, height).then((bitmap) => {
                const tmpCanvas = document.createElement("canvas");
                tmpCanvas.width = width;
                tmpCanvas.height = height;
                
                const tmpCtx = tmpCanvas.getContext("2d");
                
                // use a temp canvas because translating on the real canvas will mess with mousedown coords
                tmpCtx.clearRect(0, 0, width, height);
                tmpCtx.translate(width/2, height/2); // move origin to middle of canvas
                tmpCtx.rotate(Math.PI/180); // rotate 1 degree
                tmpCtx.drawImage(bitmap, -bitmap.width/2, -bitmap.height/2);
                tmpCtx.translate(-width/2, -height/2); // move origin back
                
                // then draw image data from tmp canvas to the real one
                context.putImageData(tmpCtx.getImageData(0, 0, width, height), 0, 0);
            });
        });
    }
    
    /***
        clear the current canvas
        pass in an element id that will execute clear canvas onclick
    ***/
    setClearCanvas(elementId){
        document.getElementById(elementId).addEventListener('click', () => {
            const frame = this.animationProj.getCurrFrame();
            const context = frame.currentCanvas.getContext("2d");
            const width = frame.currentCanvas.getAttribute("width");
            const height = frame.currentCanvas.getAttribute("height");
            context.clearRect(0, 0, width, height);
            context.fillStyle = "#FFFFFF";
            context.fillRect(0, 0, width, height);
        });
    }
    
    /***
        undo a previous drawing operation on the current canvas.
        still a little incorrect? - TODO: needs work
        - problem: undo affects all layers and is not specific to one canvas (which it should)
          maybe the frame class should store layer info for undo
    ***/
    undo(elementId){
        document.getElementById(elementId).addEventListener('click', () => {
            const frame = this.animationProj.getCurrFrame();
            const currLayer = frame.getCurrCanvas();
            const context = currLayer.getContext("2d");
            const width = currLayer.getAttribute("width");
            const height = currLayer.getAttribute("height");
            const currLayerSnapshots = frame.getSnapshots();
            
            // then put back last image (ignore the one that had just been drawn)
            if(currLayerSnapshots.length > 1){
                let mostRecentImage = currLayerSnapshots.pop();
                
                // unfortunately, we might need to pop again b/c if we just finished drawing and want to undo,
                // the first one on the stack is the image we just finished drawing
                // but this operation seems fast enough
                const currImgData = context.getImageData(0, 0, width, height).data;
                let isSameImage = true;
                for(let i = 0; i < currImgData.length; i++){
                    if(currImgData[i] !== mostRecentImage.data[i]){
                        isSameImage = false;
                        break;
                    }
                }
                if(isSameImage){
                    mostRecentImage = currLayerSnapshots.pop();
                }
                
                context.clearRect(0, 0, width, height);
                context.putImageData(mostRecentImage, 0, 0);
                
                // but then put it back on the stack
                frame.addSnapshot(mostRecentImage);
                
            }else if(currLayerSnapshots.length === 1){
                context.putImageData(currLayerSnapshots[0], 0, 0);
            }
        });
    }
    
    /***
        import an image
    ***/
    importImage(elementId){
        const self = this;
        
        document.getElementById(elementId).addEventListener('click', () => {
            const canvas = this.animationProj.getCurrFrame();
            
            // call fileHandler here
            fileHandler();
            
            // define fileHandler 
            function fileHandler(){
                //initiate file choosing after button click
                let input = document.createElement('input');
                input.type = 'file';
                input.addEventListener('change', getFile, false);
                input.click();
            }
            
            function getFile(e){
                const img = new Image();
                const reader = new FileReader();
                const file = e.target.files[0];
                if(!file.type.match(/image.*/)){
                    console.log("not a valid image");
                    return;
                }
                //when the image loads, put it on the canvas.
                img.onload = () => {
                    // change current canvas' width and height according to imported picture
                    const currentCanvas = canvas.currentCanvas;
                    const context = currentCanvas.getContext("2d");
                    const height = canvas.height;
                    const width = canvas.width;
                    currentCanvas.setAttribute('height', height);
                    currentCanvas.setAttribute('width', width);
                    
                    context.drawImage(img, 0, 0, width, height);
                    
                    canvas.addSnapshot(context.getImageData(0, 0, width, height));
                };
                //after reader has loaded file, put the data in the image object.
                reader.onloadend = function(){ 
                    img.src = reader.result;
                };
                //read the file as a URL
                reader.readAsDataURL(file);
            }
        });
    }
    
    /***
        reset the canvas to most recent imported image
    ***/
    resetImage(){
        if(this.recentImage){
            const canvas = this.animationProj.getCurrFrame();
            const context = canvas.currentCanvas.getContext("2d");
            const height = canvas.currentCanvas.getAttribute("height");
            const width = canvas.currentCanvas.getAttribute("width");
            context.drawImage(this.recentImage, 0, 0, width, height);
        }
    }
    
    /***
        download a png file of the current layer
    ***/
    downloadLayer(elementId){
        document.getElementById(elementId).addEventListener('click', () => {
            // get image data from current canvas as blob
            const canvas = this.animationProj.getCurrFrame();
            const data = document.getElementById(canvas.currentCanvas.id).toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                const name = prompt("please enter a name for the file");
                if(name === null) {
                    return;
                }else{
                    link.download = name;
                    //simulate a click on the blob's url to download it 
                    link.click();
                }
            });
        });
    }
    
    /***
        download a png file of the current frame
    ***/
    downloadFrame(elementId){
        document.getElementById(elementId).addEventListener('click', () => {
            const frame = this.animationProj.getCurrFrame();
            const mergedLayers = this.mergeFrameLayers(frame);
            const data = mergedLayers.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                const name = prompt("please enter a name for the file");
                if(name === null) {
                    return;
                }else{
                    link.download = name;
                    link.click();
                }
            });
        });
    }
    
    // for toggling the toolbar's position as sticky or not
    toggleToolbarPosition(elementId, toolbarId){
        document.getElementById(elementId).addEventListener('click', () => {
            const toolbar = document.getElementById(toolbarId);
            if(toolbar.style.position === "sticky" || toolbar.style.position === ""){
                toolbar.style.position = "static";
            }else{
                toolbar.style.position = "sticky";
            }
        });
    }
    
    /********
    
        this section controls the animation playback features
        
        note that I specifically added my page counter element to the
        functions so that they change with the call to up() and down()

        this will need to be applied for FRAMES, not LAYERS of a frame.
    
    playFor(){
        if(this.nextFrame()){
            if(this.htmlCounter){
                const counterText = this.htmlCounter;
                counterText.textContent = "frame: " + (this.animationProj.currentFrame + 1) + ", layer: " + (canvas.currentIndex + 1);
            }
        }
    }
    
    playBack(){
        if(this.prevFrame()){
            if(this.htmlCounter){
                const counterText = this.htmlCounter;
                counterText.textContent = "frame: " + (this.animationProj.currentFrame + 1) + ", layer: " + (canvas.currentIndex + 1);
            }
        }
    }
    
    playForward(){
        clearInterval(this.play);
        this.play = null;
        this.play = setInterval(this.playFor, this.timePerFrame);
    }
    
    playBackward(){
        clearInterval(this.play);
        this.play = null;
        this.play = setInterval(this.playBack, this.timePerFrame);
    }
    
    stop(){
        clearInterval(this.play);
        this.play = null;
    }
    
    *********/
    
    mergeFrameLayers(frame){
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext("2d");
        tempCanvas.width = frame.width;
        tempCanvas.height = frame.height;
        tempCtx.fillStyle = "rgba(255, 255, 255, 1)";
        tempCtx.fillRect(0, 0, frame.width, frame.height);
        const tempImageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);

        for(let j = 0; j < frame.canvasList.length; j++){
            const layer = frame.canvasList[j];
            const layerCtx = layer.getContext("2d");
            
            // this assumes that all layers within a frame share the same dimensions
            const currImageLayer = layerCtx.getImageData(0, 0, frame.width, frame.height);
            const imageData = currImageLayer.data;
            
            for(let k = 0; k <= imageData.length - 4; k += 4){
                if(imageData[k] === 255 && imageData[k+1] === 255 && imageData[k+2] === 255 && imageData[k+3] !== 128){
                    // if a pixel is rgba(255,255,255,255), we skip it as if we're treating it as transparent
                    // TODO: seems a bit unintuitive that slightly transparent white is being treated as opaque in this way
                    // make canvas use white with alpha as 128 by default and regular, opaque white as 255?
                    continue;
                }
                tempImageData.data[k] = imageData[k];
                tempImageData.data[k+1] = imageData[k+1];
                tempImageData.data[k+2] = imageData[k+2];
                tempImageData.data[k+3] = 255;
            }
            
            tempCtx.putImageData(tempImageData, 0, 0);
        }
        return tempCanvas;
    }

    
    /***
    
        create a gif from the frames.
        using gif.js - https://github.com/jnordberg/gif.js
    
        elementId is for the loading message,
        e.g. a <p> element that says "now loading..."
        
        this will need to be applied for FRAMES, not LAYERS of a frame.
    
        timeMarkers (dictionary): a dictionary mapping frames to their time delay (millisec), e.g.
        {
            1: 100, // frame 1
            2: 1000 // frame 2
        }
    ***/
    getGif(elementId, timelineMarkers){
        if(elementId){
            document.getElementById(elementId).textContent = "now loading...";
        }
        const gif = new GIF({
            workers: 2,
            quality: 10
        });
        // add frames + take into account frame rate given by timelineMarkers
        for(let i = 0; i < this.animationProj.frameList.length; i++){
            const tempCanvas = this.mergeFrameLayers(this.animationProj.frameList[i]);
            const frameTime = timelineMarkers[i+1] ? timelineMarkers[i+1] : this.timePerFrame;
            gif.addFrame(tempCanvas, { delay: frameTime });
        }
        gif.on('finished', function(blob){
            document.getElementById(elementId).textContent = "";
            const newGif = URL.createObjectURL(blob);
            window.open(newGif);
        });
        gif.render();
    }
    
    /***
    
        save/export & import functions
        check this out: https://stackoverflow.com/questions/22329481/compressing-base64-data-uri-images
        
        don't think this is going to work for large projects without some sort of better compression. simply drawing a few lines on
        a canvas produces a very large base64 string spanning many lines. not very practical for exporting a project
        that has several frames, especially if you take into account different colors and more detail
        
    ***/
    save(elementId){
        document.getElementById(elementId).addEventListener('click', () => {
            // prompt the user to name the file 
            let name = prompt("name of file: ");
            if(name === ""){
                const date = new Date(); 
                name = date.toISOString() + "_funSketch_saveFile";
            }else if(name === null){
                return;
            }
            const savedData = [];
            this.animationProj.frameList.forEach(function(frame){
                // get frame metadata
                const newFrame = frame.getMetadata();
                newFrame['layers'] = []; // list of objects
                frame.canvasList.forEach(function(layer){
                    // get layer metadata
                    const newLayer = {
                        'id': layer.id,
                        'width': layer.getAttribute("width"),
                        'height': layer.getAttribute("height"),
                        'zIndex': layer.style.zIndex,
                        'opacity': layer.style.opacity,
                    };
                    // add layer image data
                    newLayer['imageData'] = layer.toDataURL();
                    newFrame.layers.push(newLayer);
                });
                savedData.push(JSON.stringify(newFrame));
            });
            let json = "[\n";
            json += savedData.join(",\n"); // put a line break between each new object, which represents a frame
            json += "\n]";
            // make a blob so it can be downloaded 
            const blob = new Blob([json], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = name + ".json";
            link.click();
        });
    }
    
    // data: JSON data representing a project
    // updateStateFunction: function that updates state. used in the react component that has the toolbar as a prop
    importData(data, updateStateFunction){
        if(!data[0] || (!data[0].name && !data[0].height && !data[0].width && !data[0].data)){
            console.log("import failed: it appears to not be a valid project! :<");
            return;
        }
        // clear existing project
        this.animationProj.resetProject();
        
        // load saved project
        data.forEach((frame, index) => {
            if(index > 0){
                // add a new frame
                this.animationProj.addNewFrame();
            }
            // overwrite existing frame
            // TODO: implement an updateFrame method 
            // something like: animationProj.updateFrame(0, frame);
            const currFrame = this.animationProj.getFrames()[index];
            const currFrameLayersFromImport = frame.layers; // looking at data-to-import's curr frame's layers
            const currFrameLayersFromCurrPrj = currFrame.getLayers();
            
            currFrameLayersFromImport.forEach((layer, layerIndex) => {
                if((layerIndex + 1) > currFrameLayersFromCurrPrj.length){
                    // add new layer to curr project as needed based on import
                    // we want to make sure we don't prefill the layers so we don't interfere with transparency
                    const prefill = false; // use a var so the argument's purpose is clearer
                    currFrame.setupNewLayer(prefill);
                }
                
                const currLayer = currFrame.getLayers()[layerIndex];

                // add the image data 
                const newCtx = currLayer.getContext("2d");
                const img = new Image();
                (function(context, image){
                    image.onload = function(){
                        context.drawImage(image, 0, 0, currLayer.width, currLayer.height);
                        
                        // after importing all the frames, update state (i.e. frame and layer counters, animation timeline)
                        if(index === data.length-1 && updateStateFunction){
                            updateStateFunction();
                        }
                    };
                    image.src = layer.imageData;
                })(newCtx, img);
            });
            
            currFrame.setCurrIndex(frame.currentIndex);
        });
    }
    
    importProject(elementId, updateStateFunction){
        const self = this;
        document.getElementById(elementId).addEventListener('click', () => {
            fileHandler();
            //import project json file
            function fileHandler(){
                const input = document.createElement('input');
                input.type = 'file';
                input.addEventListener('change', getFile, false);
                input.click();
            }
            function getFile(e){
                const reader = new FileReader();
                const file = e.target.files[0];
                //when the file loads, put it on the canvas.
                reader.onload = (function(theFile){
                    return function(e){
                        // parse the JSON using JSON.parse 
                        // check if it can be parsed though first!
                        let data;
                        try {
                            data = JSON.parse(e.target.result);
                        }catch(e){
                            // not valid json file 
                            console.log("import failed: not a valid JSON file");
                            return;
                        }
                        self.importData(data, updateStateFunction);
                    };
                })(file);
                reader.readAsText(file);
            }
        });
    }
    
} // end of Toolbar 


export {
    Toolbar
};