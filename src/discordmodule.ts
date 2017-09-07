import * as Discord from "discord.js";
import * as fs from "fs-extra"
export class Discordserver {
	Client = new Discord.Client();
	isReady = false;
	private _id = "170500343895949312";
	private window: Electron.BrowserWindow;
	public user: Discord.GuildMember;
	public servers: Discord.Guild[] = [];
	public users: Discord.GuildMember[] = [];
	private connection?: Discord.VoiceConnection;
	private connectiontimeout: NodeJS.Timer;
	constructor(window: Electron.BrowserWindow) {
		this.window = window;
		let that = this;
		this.Client.on("ready", () => {
			console.log("Ready");
			that.isReady = true;
			that.servers = that.Client.guilds.array();
			that.users = that.Client.guilds.find(g => g.id == that._id).members.filter(m => !m.user.bot).filter(m => m.voiceChannelID != null).array();
			if(that.users[0] != null)
				that.user = that.users[0];
			that.window.webContents.send("updateView");
		});
		that.Client.on("voiceStateUpdate", () => {
			that.users = that.Client.guilds.find(g => g.id == that._id).members.filter(m => !m.user.bot).filter(m => m.voiceChannelID != null).array();
			that.window.webContents.send("updateView");

		})
	}
	get user_id(): string {
		if (this.user instanceof Discord.GuildMember)
			return this.user.id
		return "";
	};
	get server_id(): string {
		return this._id
	}
	set server_id(id: string) {
		this.stop();
		this._id = id;
		this.users = this.Client.guilds.find(g => g.id == this._id).members.filter(m => m.voiceChannelID != null).array();
		this.window.webContents.send("updateView");
	}
	get volume(): number {
		if (this.connection && this.connection.dispatcher)
			return this.connection.dispatcher.volume * 200;
		return 0;
	}
	set volume(volume: number) {
		if (this.connection && this.connection.dispatcher)
			this.connection.dispatcher.setVolume(volume / 200);
		this.window.webContents.send("updateView");
	}
	async login(){
		let token = fs.readJsonSync("./config/config.json").token;
		await this.Client.login(token).catch((reason:any)=>{
			console.log(reason);
		});
		console.log("Logged in !!");
		return "yay"
	}
	destroy() {
		this.Client.destroy().then(() => console.log("destroyed"));
	}
	stop() {
		if (this.connection && this.connection.dispatcher) {
			this.connection.dispatcher.end();
		}
	}
	leave(connection: Discord.VoiceConnection) {
		connection.channel.leave();
		this.connection = undefined;
	}

	connectandPlayFile(path: string) {
		if (this.isReady) {
			console.log(this.user_id)
			let member = this.Client.guilds.find(g => g.id == this._id).members.find(m => m.user.id == this.user_id);
			console.log(member);
			if(member != null &&member.voiceChannel != null){
				let voiceChannel = member.voiceChannel;
				if (this.connection) {
					if (this.connection.channel == voiceChannel) {
						this.stop();
						clearTimeout(this.connectiontimeout);
						this.playfile(this.connection, path);
					}
				}
				else {
					voiceChannel.join().then(connection => {
						this.connection = connection;
						this.playfile(connection, path);
					}).catch(err => console.log(err));
				}
			}else{
				console.log("No User found");
			}
		}
	}
	playfile(connection: Discord.VoiceConnection, path: string) {
		const dispatcher = connection.playFile(path, { volume: 0.25 });
		dispatcher.on("end", () => {
			clearTimeout(this.connectiontimeout);
			this.connectiontimeout = setTimeout(() => this.leave(connection), 10000);
		});
		dispatcher.on("error", () => {
			this.stop();
		})
	}
}