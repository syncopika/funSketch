import React from 'react';
import {useState} from 'react';

function constructSlider(name, params){
	let id = "slider_" + name;
	return (
		<div>
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
					}
				}
			></input>
			<label htmlFor={name}>{name}</label>
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
		"width": "80%",
		"margin": "2px auto",
		"textAlign": "center",
		"border": "1px solid #000",
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
			<p 
				id='filterSelect'
				style={{"margin": "0"}}
				onClick={
					function(){
						let el = document.getElementById("filtersDisplay");
						if(el.style.display !== "block" ){
							el.style.display = "block";
						}else{
							el.style.display = "none";
						}
					}
				}					
			> filters &#9660; </p>
				<div 
					id='filtersDisplay'
					style={{"display": "none"}}
				>
				<ul 
					id='filterChoices'
					style={{"margin": "0 auto", "padding": "0"}}
				>
				{
					filterNames.map((filterName, index) => {
						let selectedStyle = null;
						if(selectedFilter === filterName){
							selectedStyle = JSON.parse(JSON.stringify(style));
							selectedStyle["backgroundColor"] = "#5f9ea0";
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
				<br />
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