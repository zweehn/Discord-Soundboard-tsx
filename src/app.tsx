import * as React from 'react';
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import { Discordserver } from "./discordmodule"
import { VolumeSlider } from "./VolumeSlider"
import * as path from "path";
import * as fs from "fs-extra";
declare function openLink(path: string): void;
const remote = require('electron').remote
const dialog = remote.dialog;
const server = remote.getCurrentWindow().server as Discordserver;

const targets: { name: string, path: string }[] = [];


export class App extends React.Component<undefined, undefined> {
	constructor() {
		super();
		this.saveSounds = this.saveSounds.bind(this)
		fs.ensureFileSync("./config/savedfiles.json");
		try {
			fs.readJsonSync("./config/savedfiles.json").forEach((p: string) => {
				if(fs.existsSync(p))
					targets.push({ name: path.basename(p), path: p })
			})
		} catch(e) {
		fs.writeJSONSync("./config/savedfiles.json", {});
	}
}
private youtubelink:string="";
handleClick = (e: Event, data: any, target: HTMLElement) => {
	const count = parseInt(target.getAttribute('data-count')!, 10);

	if (data.action === 'Added') {
		target.setAttribute('data-count', (count + 1).toString());
	}

	if (data.action === 'Removed' && count > 0) {
		target.setAttribute('data-count', (count - 1).toString());
	}
}
openFile() {
	let that = this;
	dialog.showOpenDialog(function(fileNames: any) {

		// fileNames is an array that contains all the selected 
		if (fileNames === undefined) {
			console.log("No file selected");
		} else {
			that.addFile(path.basename(fileNames[0]), fileNames[0]);
		}
	});
}
addFile(name: string, path: string) {
	targets.push({ name: name, path: path });
	this.forceUpdate();
	this.saveSounds();
}
async saveSounds() {
	fs.writeJSON("./config/savedfiles.json", targets.map(t => t.path));
}
changeServer() {
	server.server_id = server.servers[(document.getElementById("serverselectpanel") as HTMLSelectElement).selectedIndex].id;
}
changeUser() {
	server.user = server.users[(document.getElementById("userselectpanel") as HTMLSelectElement).selectedIndex];
}
removeThis(e: any, s: any, x: any) {
	targets.splice(x.firstChild.getAttribute("data-index"), 1);
	this.saveSounds();
	this.forceUpdate();
}
onchangevolume(volume:number) {
	server.volume = volume;
}
render() {
	return (
		<div>
			<select id="serverselectpanel" onChange={() => this.changeServer()}>
				{server.servers.map(s => { return <option key={s.id}>{s.name}</option> })}
			</select>
			<select id="userselectpanel" onChange={() => this.changeUser()}>
				{server.users.map(s => { return <option key={s.user.discriminator}>{s.user.username}</option> })}
			</select>
			<VolumeSlider initialvolume={25} updateVolume={this.onchangevolume}></VolumeSlider>
			{targets.map((item, i) => (
				<div key={i}>
					<ContextMenuTrigger
						id="Sounds"
						holdToDisplay={1000}
						attributes={{ className: 'button' }}>
						<button data-index={i} onClick={() => server.connectAndPlayFile(item.path)}>{item.name}</button>
					</ContextMenuTrigger>
				</div>
			))}
			<input type="text" value={this.youtubelink} onChange={(val)=>{this.youtubelink=val.target.value;this.forceUpdate()}/><button onClick={() => server.connectAndPlayYoutube(this.youtubelink)}>PlayYoutube</button>
			<br />
			<button onClick={() => this.openFile()}>Add Sound</button>
			<button onClick={() => server.stop()}>Stop</button>
			<br />
			<button onClick={() => openLink("https://discordapp.com/api/oauth2/authorize?client_id=353873627374157836&scope=bot")}>Add this Bot to your Server!</button>

			<ContextMenu id="Sounds">
				<MenuItem onClick={(a, b, c) => this.removeThis(a, b, c)} data={{ action: 'Removed' }}>Remove this Sound</MenuItem>
			</ContextMenu>
		</div>
	);
}
}
