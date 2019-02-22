import React, { FC } from "react";
import {
  List,
  ListItem,
  ListItemText,
  Drawer as MUIDrawer,
  createStyles,
  withStyles,
  WithStyles,
  Theme,
  Divider
} from "@material-ui/core";

const styles = (theme: Theme) =>
  createStyles({
    drawerPaper: {
      width: 120
    },
    toolbar: theme.mixins.toolbar
  });

interface Props extends WithStyles {}

const Drawer: FC<Props> = ({ classes }) => (
  <MUIDrawer
    classes={{ paper: classes.drawerPaper }}
    variant="permanent"
    anchor="left"
  >
    <div className={classes.toolbar} />
    <Divider />
    <List>
      {["Things"].map(text => (
        <ListItem button key={text}>
          <ListItemText primary={text} />
        </ListItem>
      ))}
    </List>
  </MUIDrawer>
);

export default withStyles(styles)(Drawer);
