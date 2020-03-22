class AnimationTimeline extends React.Component {
	
	constructor(props){
		super(props);	
		this.state = {};
	}
	
	render(){
		return (
			<div id='animationTimeline' style={
				{
					'width': '60%',
					'height': '200px',
					'border': '1px solid #000',
					'display': 'block',
				}
			}>
				
			</div>
		)
	}
	
}

export{
	AnimationTimeline
}