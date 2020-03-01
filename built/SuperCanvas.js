// TODO: have an animation mode and a paint mode? in paint mode, you can do all the layering per frame and stuff.
// in animation mode, we process all the frames and for each one condense all their layers into a single frame.
// then we can use those frames in an animation.
// to optimize performance when going into animation mode, maybe cache which frames are 'tainted' from the last time 
// animation mode was switched to.
/***
    super canvas class
    the instance variables hold the default attributes for any canvas.
    it also holds important information like a list of all the canvas instances.
    setupNewCanvas should be used to create a new canvas instance
    @param container = the parent element ID (i.e. of a div) to append the canvas elements to
    
    a supercanvas is really a frame, containing a list of canvas elements which represent layers of the frame
***/

function Frame(container, number) {
    this.width = 800; // default value
    this.height = 800;
    this.currentIndex = 0;
    this.canvasList = []; // keep a list of all canvas instances
    this.currentCanvas; // the current, active canvas being looked at (reference to html element)
    this.container = container; // this is the html container id to hold all the layers of this frame
    this.tainted = false; // set to true if any layers are edited
    this.number = number; // frame number
    this.count = 0; // current number of layers
    this.getMetadata = function () {
        return {
            'width': this.width,
            'height': this.height,
            'currentIndex': this.currentIndex,
            'number': this.number
        };
    };
    this.getCurrCanvas = function () {
        return this.canvasList[this.currentIndex];
    };
    /***
        set up a new canvas element
        makes the new canvas the current canvas
    ***/
    this.setupNewLayer = function () {
        // create the new canvas element 
        var newCanvas = document.createElement('canvas');
        newCanvas.id = "frame" + this.number + "canvas" + this.count;
        setCanvas(newCanvas, this.width, this.height);
        if (this.count === 0) {
            newCanvas.style.opacity = .97;
            newCanvas.style.zIndex = 1;
        }
        // add it to the container passed in as the argument
        document.getElementById(this.container).appendChild(newCanvas);
        // set new canvas to be the current canvas only initially!
        if (this.count === 0) {
            this.currentCanvas = newCanvas;
        }
        // if at least 1 canvas already present, make the previous canvas be slightly opaque for onion-skin effect
        if (this.count >= 1) {
            // position the new canvas directly on top of the previous one 
            var canvas = document.getElementById(this.canvasList[0].id);
            var top = canvas.offsetTop;
            var left = canvas.offsetLeft;
            newCanvas.style.top = top;
            newCanvas.style.left = left;
        }
        this.canvasList.push(newCanvas);
        this.count++;
    };
    this.hide = function () {
        // puts all layers at zIndex -1 so they're not visible
        this.canvasList.forEach(function (canvas) {
            canvas.style.zIndex = -1;
            canvas.style.visibility = 'hidden';
        });
    };
    this.show = function () {
        // makes all layers visible
        this.canvasList.forEach(function (canvas) {
            canvas.style.zIndex = 1;
            canvas.style.visibility = '';
        });
    };
    /***
        clone the current canvas
    ***/
    this.copyCanvas = function () {
        var newCanvas = document.createElement('canvas');
        newCanvas.id = 'frame' + this.number + 'canvas' + this.count;
        setCanvas(newCanvas, this.width, this.height);
        this.canvasList[this.count - 1].style.opacity = .92;
        // place the canvas in the container 
        document.getElementById(container).appendChild(newCanvas);
        // position the new canvas directly on top of the previous one 
        var canvas = document.getElementById(this.canvasList[0].id);
        var top = canvas.offsetTop;
        var left = canvas.offsetLeft;
        newCanvas.style.top = top;
        newCanvas.style.left = left;
        newCanvas.getContext("2d").drawImage(this.currentCanvas, 0, 0);
        this.canvasList.push(newCanvas);
        this.count++;
    };
    this.clearCurrentLayer = function () {
        var currLayer = this.getCurrCanvas();
        var context = currLayer.getContext("2d");
        context.clearRect(0, 0, currLayer.getAttribute('width'), currLayer.getAttribute('height'));
        context.fillStyle = "#FFFFFF";
        context.fillRect(0, 0, currLayer.getAttribute('width'), currLayer.getAttribute('height'));
    };
    this.resetFrame = function () {
    };
}
/***
    an animation is a single project containing one or more supercanvases (or frames).
    it also instantiates an onion skin frame.
***/
function AnimationProject(container) {
    this.name = "";
    this.currentFrame = 0; // should this be a ref to the current frame!?
    this.speed = 100; // 100 ms per frame 
    this.frameList = [];
    this.mode = 0; // 0 == drawing mode. 1 == animation mode.
    this.onionSkinFrame = createOnionSkinFrame(container);
    this.onionSkinFrame.style.display = 'none'; // hide it initially
    this.container = container; // id of the html element the frames are displayed in
    this.resetProject = function () {
        this.frameList.forEach(function (frame, frameIndex) {
            // remove each layer from the DOM 
            var parent = document.getElementById(frame['container']);
            // just keep the first layer
            frame.canvasList.forEach(function (layer, layerIndex) {
                if (layerIndex > 0) {
                    parent.removeChild(layer);
                }
            });
            frame.canvasList = [frame.canvasList[0]];
            if (frameIndex === 0) {
                frame.currentIndex = 0;
                frame.currentCanvas = frame.canvasList[0];
            }
        });
        this.frameList = [this.frameList[0]]; // just keep the first frame.
        // clear the first layer of the first frame!
        this.frameList[0].clearCurrentLayer();
        this.currentFrame = 0;
        this.mode = 0;
        this.speed = 100;
    };
    this.addNewFrame = function (showFlag) {
        var newFrame = new Frame(this.container, this.frameList.length);
        newFrame.setupNewLayer();
        this.frameList.push(newFrame);
        if (!showFlag) {
            newFrame.hide();
        }
    };
    this.nextFrame = function () {
        if (this.frameList.length === this.currentFrame + 1) {
            return null; // no more frames to see
        }
        this.currentFrame += 1;
        return this.frameList[this.currentFrame];
    };
    this.prevFrame = function () {
        if (this.currentFrame - 1 < 0) {
            return null; // no more frames to see
        }
        this.currentFrame -= 1;
        return this.frameList[this.currentFrame];
    };
    this.getCurrFrame = function () {
        return this.frameList[this.currentFrame];
    };
    this.updateOnionSkin = function () {
        if (this.currentFrame - 1 < 0) {
            return;
        }
        // https://stackoverflow.com/questions/6787899/combining-two-or-more-canvas-elements-with-some-sort-of-blending
        this.onionSkinFrame.style.display = ''; // show onion skin
        var onionSkinCtx = this.onionSkinFrame.getContext("2d");
        onionSkinCtx.clearRect(0, 0, this.onionSkinFrame.width, this.onionSkinFrame.height);
        // take the previous frame, merge all layers, put into onion skin frame
        // try this? only draw pixels that are non-white?
        var onionSkinImageData = onionSkinCtx.getImageData(0, 0, this.onionSkinFrame.width, this.onionSkinFrame.height);
        // build the merged image from the first to last
        var prevFrame = this.frameList[this.currentFrame - 1];
        prevFrame.canvasList.forEach(function (layer) {
            var imageData = layer.getContext("2d").getImageData(0, 0, layer.width, layer.height).data;
            for (var i = 0; i < imageData.length; i += 4) {
                if (imageData[i] === 255 && imageData[i + 1] === 255 && imageData[i + 2] === 255) {
                    continue;
                }
                else {
                    // what if the canvas we're getting image data from to draw on the onion skin is LARGER than the onion skin canvas.
                    // we might run into index/length issues...
                    onionSkinImageData.data[i] = imageData[i];
                    onionSkinImageData.data[i + 1] = imageData[i + 1];
                    onionSkinImageData.data[i + 2] = imageData[i + 2];
                    onionSkinImageData.data[i + 3] = 255;
                }
            }
            // apply each layer to the onion skin
            onionSkinCtx.putImageData(onionSkinImageData, 0, 0);
        });
        this.onionSkinFrame.style.zIndex = 0;
        this.onionSkinFrame.style.opacity = 0.92;
    };
}

function createOnionSkinFrame(container) {
    var width = 800;
    var height = 800;
    // create the new canvas element 
    var newCanvas = document.createElement('canvas');
    newCanvas.id = "onionSkinCanvas";
    setCanvas(newCanvas, width, height);
    newCanvas.style.opacity = .97;
    newCanvas.style.zIndex = -1; // come back to this later. make sure it's visible if current frame > 1!
    // add it to the container passed in as the argument
    document.getElementById(container).appendChild(newCanvas);
    return newCanvas;
}
// assigns position, z-index, border, width, height and opacity
function setCanvas(canvasElement, width, height) {
    canvasElement.style.position = 'absolute';
    canvasElement.style.border = '1px #000 solid';
    canvasElement.style.zIndex = 0;
    canvasElement.style.opacity = 0;
    canvasElement.setAttribute('width', width);
    canvasElement.setAttribute('height', height);
    canvasElement.getContext("2d").fillStyle = "rgba(255,255,255,255)"; //"#fff";
    canvasElement.getContext("2d").fillRect(0, 0, width, height);
}

export {
	Frame,
	AnimationProject,
	createOnionSkinFrame,
	setCanvas
};
