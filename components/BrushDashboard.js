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
		"width": "85%",
		"height": "100%",
		"margin": "1% auto",
		"textAlign": "center",
		"display": "grid",
		"gridTemplateRows": "1fr",
		"gridTemplateColumns": "1fr 1fr",
	};
	
	// use a hook to be able to keep track of selected brush
	const [selectedBrush, setSelectedBrush] = useState("default");
	
	let brushSize = brushManager ? `${brushManager.currSize}` : "2";
	const [currBrushSize, setBrushSize] = useState(brushSize);
	
	function equipBrush(brushManager, brushName){
		return function(evt){
			setSelectedBrush(brushName);
			if(brushManager){
				// equip brush
				brushManager.resetBrush();
				brushManager.setBrushType(brushName);
				brushManager.applyBrush();
			}
		}
	}
	
	return (
		<div style={elementStyle}>
			<div style={
				{
					"gridRow": "1",
					"gridColumn": "1",
					"position": "relative",
					"height": "100%"
				}
			}>
				<div style={
					{
						"position": "absolute",
						"overflowY": "auto",
						"top": "0",
						"left": "10%",
						"height": "85%",
						"width": "85%"
					}
				}>
					<div id='brushDisplay'>
						<ul 
							id='brushChoices'
							style={
								{
									"margin": "0 auto", 
									"padding": "0"
								}
							}
						>
						{
							brushNames.map((brushName, index) => {
								let selectedStyle = JSON.parse(JSON.stringify(style));
								if(selectedBrush === brushName){
									selectedStyle["backgroundColor"] = "#c8c8c8";
								}
								let s = (selectedStyle !== null) ? selectedStyle : style;
								return <li 
									style={s}
									key={(`brush_${index}`)}
									id={(`${brushName}_${index}`)}
									onClick={equipBrush(brushManager, brushName)}
									onMouseOver={(evt) => {evt.target.style.color = "#99b5d1"}}
									onMouseOut={(evt) => {evt.target.style.color = "#000"}}
								>{brushName}</li>
							})
						}
						</ul>
					</div>
				</div>	
			</div>
				
			<div style={
				{
					"gridRow": "1",
					"gridColumn": "2"
				}
			}>
				<div id='adjustBrushSize'>
					<p className="text-info">change brush size</p>
						<input
							id='brushSize' 
							type='range' 
							min='1' 
							max='20' 
							step='.5'
							defaultValue={currBrushSize}
							onChange={
								function(evt){
									brushManager.changeBrushSize(evt.target.value);
									setBrushSize(evt.target.value);
								}
							}
						/>
					<span id='brushSizeValue'>{currBrushSize}</span>
				</div>
			</div>

		</div>
	);
}


export{
	BrushDashboard
}