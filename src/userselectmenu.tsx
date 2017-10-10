/* eslint-disable flowtype/require-valid-file-annotation */

import * as React from 'react';
import * as Discord from "discord.js" 

import List, { ListItem, ListItemText } from 'material-ui/List';
import Menu, { MenuItem } from 'material-ui/Menu';

const styles = theme => ({
  root: {
    width: '50%',
    maxWidth: 360,
    background: theme.palette.background.paper,
  },
});

export default class SimpleListMenu extends React.Component<{options:Discord.GuildMember[],onchange:(newindex:Discord.GuildMember)=>void},{}> {
  state = {
    anchorEl: null,
    open: false,
    selectedIndex: 0,
  };


  button = undefined;

  handleClickListItem = event => {
    this.setState({ open: true, anchorEl: event.currentTarget });
  };

  handleMenuItemClick = (event, index) => {
    this.setState({ selectedIndex: index, open: false });
    console.log(this.props.options[this.state.selectedIndex]);
    this.props.onchange(this.props.options[this.state.selectedIndex]);
  };

  handleRequestClose = () => {
    this.setState({ open: false });
  };

  render() {
    return (
      <div style={{width:"50%",display:"inline-block"}}>
        <List>
          <ListItem
            button
            aria-haspopup="true"
            aria-controls="lock-menu"
            aria-label="User"
            onClick={this.handleClickListItem}
          >
            <ListItemText
              primary="Selected Listener"
              secondary={this.props.options[this.state.selectedIndex].displayName.toString()}
            />
          </ListItem>
        </List>
        <Menu
          id="lock-menu"
          anchorEl={this.state.anchorEl}
          open={this.state.open}
          onRequestClose={this.handleRequestClose}
        >
          {this.props.options.map((option, index) => (
            <MenuItem
              key={index}
              selected={index === this.state.selectedIndex}
              onClick={event => this.handleMenuItemClick(event, index)}
            >
              {option.displayName.toString()}
            </MenuItem>
          ))}
        </Menu>
      </div>
    );
  }
}