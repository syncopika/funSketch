import React from 'react';
import {useState} from 'react';

function constructSlider(name, params){
	const id = "slider_" + name;
	const sliderCounterId = name + 'CurrValue';
	return (
		<div>
			<label htmlFor={name}>{name}</label>
			<input 
				type="range" 
				name={name} 
				id={id} 
				max={params.max} 
				min={params.min} 
				step={params.step} 
				defaultValue={params.value}
				onChange={
					function(evt){
						let newVal = evt.target.value;
						
						// update reference to the filter's parameter object value field,
						// which is used when applying the filter
						params.value = parseInt(newVal);
						
						document.getElementById(sliderCounterId).textContent = params.value;
					}
				}
			></input>
			<p id={sliderCounterId}>{params.value}</p>
		</div>
	);
}

const FilterDashboard = (props) => {
	const filterManager = props.filterManager;
	const filters = (filterManager) ? filterManager.filtersMap : {}; // props.filterManager can be null initially
	const filterNames = Object.keys(filters);
	
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
	
	// use a hook to be able to keep track of selected filter
	const [selectedFilter, setSelectedFilter] = useState("");
	
	const parameterSliders = [];
	if(filters[selectedFilter] && filters[selectedFilter].params){
		// need to set up sliders for each editable parameter for the selected filter
		for(let paramName in filters[selectedFilter].params){
			let newSlider = constructSlider(paramName, filters[selectedFilter].params[paramName]);
			parameterSliders.push(newSlider);
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
					<div id='filtersDisplay'>
						<ul 
							id='filterChoices'
							style={
								{
									"margin": "0 auto", 
									"padding": "0"
								}
							}
						>
						{
							filterNames.map((filterName, index) => {
								let selectedStyle = null;
								if(selectedFilter === filterName){
									selectedStyle = JSON.parse(JSON.stringify(style));
									selectedStyle["backgroundColor"] = "#c8c8c8";
								}
								let s = (selectedStyle !== null) ? selectedStyle : style;
								return <li 
									style={s}
									key={(`filter_${index}`)}
									id={(`${filterName}_${index}`)}
									onClick={
										(evt) => {
											// show that the filter is selected
											setSelectedFilter(filterName);
										}
									}
									onMouseOver={(evt) => {evt.target.style.color = "#99b5d1"}}
									onMouseOut={(evt) => {evt.target.style.color = "#000"}}
								>{filterName}</li>
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
				<button
					id={"applyFilter"}
					onClick={
						function(){
							filterManager.filterCanvasOption(selectedFilter);
						}
					}
				> apply filter </button>
				
				<hr />
				
				<div id='filterParameters'>
					<ul style={{"margin": "0 auto", "padding": "0"}}>
					{
						parameterSliders.map((slider, index) => {
							return <li key={(`filter_param_${index}`)}>{slider}</li>
						})
					}
					</ul>
				</div>
			</div>
			
		</div>
	);
}


export{
	FilterDashboard
}