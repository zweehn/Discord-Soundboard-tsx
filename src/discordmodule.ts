import * as Discord from "discord.js"
import * as fs from "fs-extra"
var youtubeStream = require('youtube-audio-stream')

export class Discordserver {
	Client = new Discord.Client()
	isReady = false
	private _id = "170500343895949312"
	private window: Electron.BrowserWindow
	public user: Discord.GuildMember
	public servers: Discord.Guild[] = []
	public users: Discord.GuildMember[] = []
	private connection?: Discord.VoiceConnection
	private connectiontimeout: NodeJS.Timer
	constructor(window: Electron.BrowserWindow) {
		this.window = window
		this.Client.on("ready", () => {
			console.log("Ready")
			this.isReady = true
			this.servers = this.Client.guilds.array()
			this.users = this.Client.guilds.find(g => g.id == this._id).members.filter(m => !m.user.bot).filter(m => m.voiceChannelID != null).array()
			if (this.users[0] != null)
				this.user = this.users[0]
			this.window.webContents.send("updateView")
		})
		this.Client.on("voiceStateUpdate", () => {
			this.users = this.Client.guilds.find(g => g.id == this._id).members.filter(m => !m.user.bot).filter(m => m.voiceChannelID != null).array()
			if (this.user == null)
				this.user = this.users[0]
			this.window.webContents.send("updateView")
		})
		this.playfile = this.playfile.bind(this)
		this.playyoutube = this.playyoutube.bind(this)
	}
	get user_id(): string {
		if (this.user instanceof Discord.GuildMember)
			return this.user.id
		return ""
	}
	get server_id(): string {
		return this._id
	}
	set server_id(id: string) {
		this.stop()
		this._id = id
		this.users = this.Client.guilds.find(g => g.id == this._id).members.filter(m => m.voiceChannelID != null).array()
		this.window.webContents.send("updateView")
	}
	get volume(): number {
		if (this.connection && this.connection.dispatcher)
			return this.connection.dispatcher.volume * 200
		return 0
	}
	set volume(volume: number) {
		if (this.connection && this.connection.dispatcher)
			this.connection.dispatcher.setVolume(volume / 200)
		this.window.webContents.send("updateView")
	}
	async login() {
		let token = fs.readJsonSync("./config/config.json").token
		await this.Client.login(token).catch((reason: any) => {
			console.log(reason)
		})
	}
	destroy() {
		this.Client.destroy().then(() => console.log("destroyed"))
	}
	stop() {
		if (this.connection && this.connection.dispatcher) {
			try{
				this.connection.dispatcher.end()
			}catch(e){
				console.log(e)
			}
		}
	}
	leave() {
		if (this.connection)
			this.connection.channel.leave()
		this.connection = undefined
	}
	connectAndPlayFile(path: string) {
		this.connectandPlay(path, this.playfile)
	}
	connectAndPlayYoutube(id: string) {
		this.connectandPlay(id, this.playyoutube);
	}
	connectandPlay(path: string, playfunction: (connection: Discord.VoiceConnection, path: string) => void) {
		if (this.isReady) {
			this.stop()

			let member = this.Client.guilds.find(g => g.id == this._id).members.find(m => m.user.id == this.user_id)
			if (member != null && member.voiceChannel != null) {
				let voiceChannel = member.voiceChannel
				if (this.connection) {
					if (this.connection.channel == voiceChannel) {
						if (this.connectiontimeout)
							clearTimeout(this.connectiontimeout)
						playfunction(this.connection, path)
					} else {
						this.leave();
						voiceChannel.join().then((connection: Discord.VoiceConnection) => {
							this.connection = connection
							playfunction(connection, path)
						}).catch(err => console.log(err))
					}
				}
				else {
					voiceChannel.join().then((connection: Discord.VoiceConnection) => {
						this.connection = connection
						playfunction(connection, path)
					}).catch(err => console.log(err))
				}
			} else {
				console.log("No User found")
			}
		}
	}
	playfile(connection: Discord.VoiceConnection, path: string) {
		if(!(this instanceof Discordserver))
			console.log(this)
		const dispatcher = connection.playFile(path, { volume: 0.25 })
		dispatcher.on("end", () => {
			if(this&&this.connectiontimeout)
			clearTimeout(this.connectiontimeout)
			this.connectiontimeout = setTimeout(() => this.leave(), 10000)
		})
		dispatcher.on("error", () => {
			this.stop()
		})
	}
	playyoutube(connection: Discord.VoiceConnection, path: string) {
		let stream = youtubeStream("https://www.youtube.com/watch?v=" + path)
		const dispatcher = connection.playStream(stream, { volume: 0.25 })
		dispatcher.on("end", () => {
			if(this&&this.connectiontimeout)
			clearTimeout(this.connectiontimeout)
			this.connectiontimeout = setTimeout(() => this.leave(), 10000)
		})
		dispatcher.on("error", () => {
			this.stop()
		})
	}
}