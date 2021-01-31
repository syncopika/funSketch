import React from 'react';
import {useState} from 'react';

const FilterDashboard = (props) => {
	const filterManager = props.filterManager;
	
	if(!filterManager){
		// running into filterManager being null initially
		return <div></div>;
	}
	
	const filters = filterManager.filtersMap;
	const filterNames = Object.keys(filters);
	
	const style = {
		"textAlign": "center"
	};
	
	const elementStyle = {
		"margin": "2px auto",
		"textAlign": "center",
		"border": "1px solid #000",
	};
	
	// use a hook to be able to keep track of selected filter
	const [selectedFilter, setSelectedFilter] = useState("");
	
	return (
		<div style={elementStyle}>
			<p 
				id='filterSelect'
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
						let selected = null;
						if(selectedFilter === filterName){
							let selected = JSON.parse(JSON.stringify(style));
							selected["backgroundColor"] = "#20b2aa";
						}
						let s = (selected !== null) ? selected : style;
						return <li 
							style={s}
							key={(`filter_${index}`)}
							id={(`${filterName}_${index}`)}
							onClick={
								(evt) => {
									// show that the filter is selected (colored background? colored text?)
									setSelectedFilter(filterName);
								}
							}
						>{filterName}</li>
					})
				}
				</ul>
				<button
					id={"applyFilter"}
					onClick={
						function(){
							// TODO:
							// collect current param values if applicable and update filter with params
							filterManager.filterCanvasOption(selectedFilter);
						}
					}
				> apply filter </button>
				
				< hr />
				
				<div id='filterParameters'>
					<ul>
						// TODO: list parameters for the selected filter
					</ul>
				</div>
			</div>
		</div>
	);
}


export{
	FilterDashboard
}