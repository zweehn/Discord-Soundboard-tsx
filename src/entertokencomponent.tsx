import * as React from 'react';
import * as fs from 'fs-extra';
const config = require("../config/config.json");
const remote = require('electron').remote;
export class Entertokencomponent extends React.Component<undefined, undefined> {
	constructor(){
		super();
		this.inputchange = this.inputchange.bind(this);
	}
	inputchange(handler:Event){
		console.log(handler.target.value);
		config.token = handler.target.value;
		this.forceUpdate();
	}
	save(){
		fs.writeJsonSync("./config/config.json",config);
       var window = remote.getCurrentWindow();
       window.close();
	}
	render(){
		return (
			<div>
				<input type="text" value={config.token} onChange={this.inputchange}/>
				<button onClick={this.save}>Save</button>
			</div>
		);
	}
}