import * as React from 'react'
import { MuiThemeProvider, createMuiTheme, Theme } from 'material-ui/styles'
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
import ServerSelection from "./serverselectmenu"
import UserSelection from "./userselectmenu"
import Soundlist from "./soundslist"
declare function openLink(path: string): void

const remote = require('electron').remote
const server = remote.getCurrentWindow().server as Discordserver

const theme:Theme = createMuiTheme({
	palette: {
		primary: indigo, // indigo and orange play nicely together.
		secondary: {
			...orange,
		},
		error: red,
	},
	typography: {
		fontFamily: "Roboto"
	}
});

export class App extends React.Component<undefined, {youtubeLink:string}> {
	state={
		youtubeLink:''
	}
	handleChange = name => event => {
		this.setState({
			[name]: event.target.value,
		});
	};
	onchangevolume(volume: number) {
		server.volume = volume / 100
	}
	render() {
		return (
			<MuiThemeProvider theme={theme}>
				<div style={{backgroundColor:theme.palette.background.paper}}>
					<AppBar position="static">
						<Toolbar style={{justifyContent:"space-between"}}>
							<Typography type="title" color="inherit">
								Discord Soundboard
          					</Typography>
          					<div key={server.nowPlaying} style={{display:server.nowPlaying!==""?"flex":"none"}}>
								<Typography type="caption" color="inherit">
									Now Playing: {server.nowPlaying}
								</Typography>          					
	          					<Button style={{display:server.isPaused!==true?"inline-flex":"none"}} onClick={()=>server.pause()} color="contrast">Pause</Button>
	          					<Button style={{display:server.isPaused!==false?"inline-flex":"none"}} onClick={()=>server.play()} color="contrast">Play</Button>
	          					<Button onClick={() => server.stop()} color="contrast">Stop</Button>
          					</div>
						</Toolbar>
					</AppBar>
					<ServerSelection onchange={(newServer) => server.server = newServer} options={server.servers} />
					<UserSelection onchange={(newPlayer) => server.user = newPlayer} options={server.users} />
					<VolumeSlider initialvolume={server.volume * 100} updateVolume={this.onchangevolume}></VolumeSlider>
					<Soundlist playFile={server.connectandPlayFile} theme={theme} />
					<div style={{ position: "fixed", bottom: 0, background: theme.palette.background.paper, width: "100%" }}>
						<TextField
							id="youtubeLink"
							label="Video Link"
							value={this.state.youtubeLink}
							color={"accent"}
							onChange={this.handleChange('youtubeLink')}
							margin="normal"
						/>
						<Button raised color={"accent"} onClick={() => server.connectandPlayYoutube(this.state.youtubeLink)}>Play</Button>
						<br />
						
						<br />
						<Button onClick={() => openLink("https://discordapp.com/api/oauth2/authorize?client_id=353873627374157836&scope=bot")}>Add this Bot to your Server!</Button>
					</div>
				</div>
			</MuiThemeProvider>
		)
	}
}
