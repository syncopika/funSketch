import React from 'react';
import {useState} from 'react';

const BrushDashboard = (props) => {
	const brushManager = props.brushManager;
	const brushes = (brushManager) ? brushManager.brushesMap : {}; // can be null initially
	const brushNames = Object.keys(brushes);
	
	const style = {
		"textAlign": "center"
	};
	
	const elementStyle = {
		"width": "80%",
		"margin": "2px auto",
		"textAlign": "center",
		"border": "1px solid #000",
	};
	
	// use a hook to be able to keep track of selected brush
	const [selectedBrush, setSelectedBrush] = useState("");
	
	function equipBrush(brushManager, brushName){
		return function(evt){
			setSelectedBrush(brushName);
			if(brushManager){
				// equip brush
				brushManager.resetBrush();
				//TODO: need to also change cursor accordingly
				brushManager.setBrushType(brushName);
				brushManager.applyBrush();
			}
		}
	}
	
	return (
		<div style={elementStyle}>
			<p 
				id='brushSelect'
				onClick={
					function(){
						let el = document.getElementById("brushDisplay");
						if(el.style.display !== "block" ){
							el.style.display = "block";
						}else{
							el.style.display = "none";
						}
					}
				}					
			> brushes &#9660; </p>
				<div 
					id='brushDisplay'
					style={{"display": "none"}}
				>
				<ul 
					id='brushChoices'
					style={{"margin": "0 auto", "padding": "0"}}
				>
				{
					brushNames.map((brushName, index) => {
						let selectedStyle = null;
						if(selectedBrush === brushName){
							selectedStyle = JSON.parse(JSON.stringify(style));
							selectedStyle["backgroundColor"] = "#5f9ea0";
						}
						let s = (selectedStyle !== null) ? selectedStyle : style;
						return <li 
							style={s}
							key={(`brush_${index}`)}
							id={(`${brushName}_${index}`)}
							onClick={equipBrush(brushManager, brushName)}
						>{brushName}</li>
					})
				}
				</ul>

			</div>
		</div>
	);
}


export{
	BrushDashboard
}