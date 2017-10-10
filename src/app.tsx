import * as React from 'react'
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu"
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles'
import { Discordserver } from "./discordmodule"
import { VolumeSlider } from "./VolumeSlider"
import Button from 'material-ui/Button'
import indigo from 'material-ui/colors/indigo';
import orange from 'material-ui/colors/orange';
import red from 'material-ui/colors/red';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import TextField from 'material-ui/TextField'
import PlayCircle from 'material-ui-icons/PlayCircleOutline'
import List, { ListItem } from 'material-ui/List'
import ServerSelection from "./serverselectmenu"
import UserSelection from "./userselectmenu"
import * as path from "path"
import * as fs from "fs-extra"
declare function openLink(path: string): void

const remote = require('electron').remote
const dialog = remote.dialog
const server = remote.getCurrentWindow().server as Discordserver

const soundfiles: { name: string, path: string }[] = []

const theme = createMuiTheme({
	palette: {
		primary: indigo, // indigo and orange play nicely together.
		secondary: {
			...orange,
			A400: '#00e677',
		},
		error: red,
	},
	typography: {
		fontFamily: "Roboto"
	}
});

export class App extends React.Component<undefined, undefined> {
	state = {
		youtubeLink: ''
	};

	handleChange = name => event => {
		this.setState({
			[name]: event.target.value,
		});
	};
	constructor() {
		super()
		this.saveSounds = this.saveSounds.bind(this)
		fs.ensureFileSync("./config/savedfiles.json")
		try {
			fs.readJsonSync("./config/savedfiles.json").forEach((p: string) => {
				if (fs.existsSync(p))
					soundfiles.push({ name: path.basename(p), path: p })
			})
		} catch (e) {
			fs.writeJSONSync("./config/savedfiles.json", {})
		}
	}
	handleClick = (e: Event, data: any, target: HTMLElement) => {
		const count = parseInt(target.getAttribute('data-count')!, 10)

		if (data.action === 'Added') {
			target.setAttribute('data-count', (count + 1).toString())
		}

		if (data.action === 'Removed' && count > 0) {
			target.setAttribute('data-count', (count - 1).toString())
		}
	}
	openFile() {
		let that = this
		dialog.showOpenDialog(function(fileNames: any) {

			// fileNames is an array that contains all the selected 
			if (fileNames === undefined) {
				console.log("No file selected")
			} else {
				that.addFile(path.basename(fileNames[0]), fileNames[0])
			}
		})
	}
	addFile(name: string, path: string) {
		soundfiles.push({ name: name, path: path })
		this.forceUpdate()
		this.saveSounds()
	}
	async saveSounds() {
		fs.writeJSON("./config/savedfiles.json", soundfiles.map(t => t.path))
	}
	removeThis(e: any, s: any, x: any) {
		console.log(x.parentElement.getAttribute("data-index"))
		soundfiles.splice(x.parentElement.getAttribute("data-index"), 1)
		this.saveSounds()
		this.forceUpdate()
	}
	onchangevolume(volume: number) {
		server.volume = volume / 100
	}
	render() {
		return (
			<MuiThemeProvider theme={theme}>
				<div>
					<AppBar position="static">
						<Toolbar>
							<Typography type="title" color="inherit">
								Title
          					</Typography>
						</Toolbar>
					</AppBar>
					<ServerSelection onchange={(newServer) => server.server = newServer} options={server.servers} />
					<UserSelection onchange={(newPlayer) => server.user = newPlayer} options={server.users} />
					<VolumeSlider initialvolume={server.volume * 100} updateVolume={this.onchangevolume}></VolumeSlider>
					<div style={{ overflowX: "auto" }}>
						<List>
							{soundfiles.map((item, i) => (
								<ListItem
									key={i}
									button
									dense
									data-index={i}
									onClick={() => server.connectandPlayFile(item.path)}>
									<ContextMenuTrigger
										id="Sounds"
										holdToDisplay={1000}
										attributes={{ style: { display: "flex", alignItems: "center", fontFamily: "Roboto" } }}
									>
										<PlayCircle color={theme.palette.secondary.A700.toString()} />
										<span>{item.name}</span>
									</ContextMenuTrigger>
								</ListItem>
							))}
							<ContextMenu id="Sounds">
								<MenuItem onClick={(a, b, c) => this.removeThis(a, b, c)} data={{ action: 'Removed' }}>Remove this Sound</MenuItem>
							</ContextMenu>
						</List>
					</div>
					<div style={{ position: "fixed", bottom: 0, background: "rgb(249, 249, 249)" }}>
						<TextField
							id="youtubeLink"
							label="Video Link"
							value={this.state.youtubeLink}
							onChange={this.handleChange('youtubeLink')}
							margin="normal"
						/>
						<Button raised color={"primary"} onClick={() => server.connectandPlayYoutube(this.state.youtubeLink)}>Play</Button>
						<br />
						<Button onClick={() => this.openFile()}>Add Sound</Button>
						<Button onClick={() => server.stop()}>Stop</Button>
						<br />
						<Button onClick={() => openLink("https://discordapp.com/api/oauth2/authorize?client_id=353873627374157836&scope=bot")}>Add this Bot to your Server!</Button>
					</div>
				</div>
			</MuiThemeProvider>
		)
	}
}
