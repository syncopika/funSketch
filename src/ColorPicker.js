import React from 'react';
import {useState, useEffect} from 'react';
import { makeColorWheel } from "./utils/ColorWheel.js";

export const ColorPicker = (props) => {
    const [colorPalette, setColorPalette] = useState([]);
    
    const colorPickedDisplayStyle = {
        textAlign: "center"
    };
    
    const colorPaletteContainerStyle = {
        marginTop: "3%",
        display: "flex",
        flexWrap: "wrap"
    };
    
    const paletteColorStyle = {
        width: "15px",
        height: "15px",
        border: "1px solid #000",
        padding: "2px"
    };
    
    // pass in the elementId of the div where the color wheel should be (its container)
    // pass in the size of the canvas of the color wheel 
    function createColorWheel(elementId, size, brush){
        if(!brush) return; // on the initial page render, brush will be null
        
        const colorWheel = makeColorWheel(elementId, size);
        
        document.getElementById(colorWheel.id).addEventListener('mousedown', (evt) => {
            const x = evt.offsetX;
            const y = evt.offsetY;
            
            const colorPicked = (document.getElementById(colorWheel.id).getContext('2d')).getImageData(x, y, 1, 1).data;
            
            //correct the font color if the color is really dark
            const colorPickedText = document.getElementById('colorPicked');
            if(colorPicked[0] > 10 && colorPicked[1] > 200){
                colorPickedText.style.color = "#000";
            }else{
                colorPickedText.style.color = "#fff";
            }
            
            colorPickedText.textContent = 'rgba(' + colorPicked[0] + ',' + colorPicked[1] + ',' + colorPicked[2] + ',' + colorPicked[3] + ')';
            colorPickedText.style.backgroundColor = colorPickedText.textContent;
            
            // update current color seleted in brush object as Uint8 clamped array where each index corresponds to r,g,b,a
            brush.changeBrushColor(colorPicked);
        });
    }
    
    function saveColorToPalette(){
        const colorPickedText = document.getElementById('colorPicked');
        const currColor = colorPickedText.textContent;
        if(currColor && currColor.includes("rgb") && colorPalette.indexOf(currColor) < 0){
            colorPalette.push(currColor);
            setColorPalette(colorPalette.slice());
        }
    }
    
    function selectPaletteColor(event){
        const color = event.target.style.backgroundColor;
        const colorPickedText = document.getElementById('colorPicked');
        colorPickedText.textContent = color;
        colorPickedText.style.backgroundColor = color;
        
        // color needs to be an array for the brush. set color[3] to 255
        // need to split 'rgb(x,y,z)' to [x, y, z] first
        const colorArr = color.split("rgb(")[1].split(", ").map(x => parseInt(x));
        colorArr.push(255);
        
        if(colorArr[0] > 10 && color[1] > 200){
            colorPickedText.style.color = "#000";
        }else{
            colorPickedText.style.color = "#fff";
        }
            
        props.brush.changeBrushColor(colorArr);
    }

    useEffect(() => {
        // construct the color wheel
        createColorWheel('colorPicker', 170, props.brush);
    }, [props.brush]);
    
    return (
        <React.Fragment>
            <div id="colorPicker"></div>
            <p id='colorPicked' style={colorPickedDisplayStyle}>pick a color!</p>
            <button onClick={saveColorToPalette}> save color to palette </button>
            <div id="colorPalette" style={colorPaletteContainerStyle}>
            {
                colorPalette.map((color) => {
                    const paletteColor = Object.assign({backgroundColor: color}, paletteColorStyle);
                    return (
                        <div style={paletteColor} onClick={selectPaletteColor}>
                        </div>
                    );
                })
            }
            </div>
        </React.Fragment>
    );
}