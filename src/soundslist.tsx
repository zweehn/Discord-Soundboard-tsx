import * as React from 'react'
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu"
import PlayCircle from 'material-ui-icons/PlayCircleOutline'
import Plus from 'material-ui-icons/Add'
import { Theme } from 'material-ui/styles'
import List, { ListItem } from 'material-ui/List'
import * as path from "path"
import * as fs from "fs-extra"
const remote = require('electron').remote
const dialog = remote.dialog

const soundfiles: { name: string, path: string }[] = []

export default class Soundlist extends React.Component<{ playFile: (path: string, name:string) => void, theme:Theme }, {}> {
	constructor() {
		super()
		this.saveSounds = this.saveSounds.bind(this)
		fs.ensureFileSync("./config/savedfiles.json")
		try {
			fs.readJsonSync("./config/savedfiles.json").forEach((p: string) => {
				if (fs.existsSync(p))
					soundfiles.push({ name: path.basename(p).replace(/\.[^.]+$/, ""), path: p })
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
		soundfiles.push({ name: name.replace(/\.[^.]+$/, ""), path: path })
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

	render() {
		return (
			<div style={{ overflowX: "auto", height: "calc(100vh - 350px)" }}>
				<List>
					{soundfiles.map((item, i) => (
						<ListItem
							key={i}
							button
							dense
							data-index={i}
							onClick={() => this.props.playFile(item.path, item.name)}
							style={{ display: "inline-block", minWidth: "calc(50% - 64px)" }}>
							<ContextMenuTrigger
								id="Sounds"
								attributes={{ style: { display: "flex", alignItems: "center", fontFamily: "Roboto" } }}>
								<PlayCircle color={this.props.theme.palette.secondary.A700.toString()} />
								<span>{item.name}</span>
							</ContextMenuTrigger>
						</ListItem>
					))}
					<ListItem style={{ display: "flex", alignItems: "center", fontFamily: "Roboto" }} button dense onClick={() => this.openFile()}>
						<Plus color={this.props.theme.palette.secondary.A700.toString()} />
						<span>Add Sound</span>
					</ListItem>
					<ContextMenu id="Sounds">
						<MenuItem onClick={(a, b, c) => this.removeThis(a, b, c)} data={{ action: 'Removed' }}>Remove this Sound</MenuItem>
					</ContextMenu>
				</List>
			</div>
		)
	}
}