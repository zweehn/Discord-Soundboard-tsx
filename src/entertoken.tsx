
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {AppContainer} from 'react-hot-loader';

const electron = require('electron')
electron.ipcRenderer.on("updateView",()=>updateView());

let updateView = () => {
  const { Entertokencomponent } = require('./entertokencomponent');
  ReactDOM.render(<AppContainer><Entertokencomponent /></AppContainer>, document.getElementById('App'));
}
let openLink = (link:string)=>{
	electron.shell.openExternal(link);
}
updateView();
if (module.hot) { module.hot.accept(updateView); }
