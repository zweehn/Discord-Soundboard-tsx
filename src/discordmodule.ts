import * as Discord from "discord.js"
import * as fs from "fs-extra"
import * as yt from "ytdl-core"
export class Discordserver {
	Client = new Discord.Client()
	isReady = false
	private _id: string
	private window: Electron.BrowserWindow
	public user: Discord.GuildMember
	public servers: Discord.Guild[] = []
	public users: Discord.GuildMember[] = []
	private connection?: Discord.VoiceConnection
	private connectiontimeout: NodeJS.Timer
	constructor(window: Electron.BrowserWindow) {
		let that = this;
		this.window = window
		this.connect = this.connect.bind(this)
		this.playfile = this.playfile.bind(this)
		this.playyoutube = this.playyoutube.bind(this)
		this.connectandPlayYoutube = this.connectandPlayYoutube.bind(this)
		this.connectandPlayFile = this.connectandPlayFile.bind(this)
		that.Client.on("ready", () => {
			console.info("Ready")
			that.isReady = true
			that.servers = that.Client.guilds.array()
			if (that.servers[0] != null)
				that._id = that.servers[0].id
			that.users = that.Client.guilds.find(g => g.id == that._id).members.filter(m => !m.user.bot).filter(m => m.voiceChannelID != null).array()
			if (that.users[0] != null)
				that.user = that.users[0]
			that.window.webContents.send("updateView")
		})

		that.Client.on("voiceStateUpdate", () => {
			that.users = that.Client.guilds.find(g => g.id == that._id).members.filter(m => !m.user.bot).filter(m => m.voiceChannelID != null).array()
			if (that.users[0] != null && that.user == null)
				that.user = that.users[0]
			that.window.webContents.send("updateView")
		})

		that.Client.on("message",message=>{
			let messages = message.content.toLowerCase().split(" ");
			if(messages[0].toLowerCase() != "botti")
				return;
			if(messages[1] == "halts"){
				if(messages[2] == "maul"){
					that.stop();
				}
			}
			if(messages[1] == "spiel"){
				that.user = message.member;
				that.connectandPlayYoutube(message.content);
			}
		})
	}
	get user_id(): string {
		if (this.user instanceof Discord.GuildMember)
			return this.user.id
		return ""
	}
	set server(newServer:Discord.Guild){
		this._id=newServer.id
	}
	private _volume = 0.1
	get volume() {
		return Math.sqrt(this._volume)
	}
	set volume(newVolume: number) {
		this._volume = Math.pow(newVolume,2);
		if (this.connection && this.connection.dispatcher) {
			this.connection.dispatcher.setVolume(this._volume);
		}
		console.log(this._volume);
	}
	async login() {
		let token = fs.readJsonSync("./config/config.json").token
		await this.Client.login(token)
		console.info("Succesful discord login")
	}
	destroy() {
		this.Client.destroy().then(() => console.log("destroyed"))
	}
	stop() {
		if (this.connection && this.connection.dispatcher) {
			this.connection.dispatcher.end("from this.stop")
		}
	}
	leave(connection: Discord.VoiceConnection) {
		connection.channel.leave()
		this.connection = undefined
	}
	connectandPlayFile(path: string) {
		this.stop()
		this.connect(path, this.playfile)
	}
	connectandPlayYoutube(path: string) {
		this.stop()
		this.connect(path, this.playyoutube)
	}
	private connect(path: string, player: (connection: Discord.VoiceConnection, path: string) => void) {
		if (this.isReady) {
			let member = this.Client.guilds.find(g => g.id == this._id).members.find(m => m.user.id == this.user_id)
			if (member != null && member.voiceChannel != null) {
				let voiceChannel = member.voiceChannel
				if (this.connection) {
					if (this.connection.channel == voiceChannel) {
						this.stop()
						clearTimeout(this.connectiontimeout)
						player(this.connection, path)
					}
				}
				else {
					voiceChannel.join().then(connection => {
						this.connection = connection
						player(connection, path)
					}).catch(err => console.error(err))
				}
			} else {
				console.error("No User found")
			}
		}
	}
	private playfile(connection: Discord.VoiceConnection, path: string) {
		console.log("playfile")
		const dispatcher = connection.playFile(path, { volume: this.volume })
		dispatcher.on("end", (reason) => {
			console.log(reason+" end")
			clearTimeout(this.connectiontimeout)
			this.connectiontimeout = setTimeout(() => this.leave(connection), 10000)
		})
		dispatcher.on("error", () => {
			this.stop()
		})
	}
	private playyoutube(connection: Discord.VoiceConnection, path: string) {
		console.log("playyoutube "+path)
		//yt(path, { filter: "audioonly" }).on("data",d=>console.log(d));
		const dispatcher = connection.playStream(yt(path, { filter: "audioonly" }), { volume: this.volume })
		console.log(this instanceof Discordserver)
		dispatcher.on("end", reason => {
			console.log(reason+" end")
			clearTimeout(this.connectiontimeout)
			this.connectiontimeout = setTimeout(() => this.leave(connection), 10000)
		})
		dispatcher.on("error", (e) => {
			console.trace(e)
			console.log("error")
			this.stop()
		})
	}
}