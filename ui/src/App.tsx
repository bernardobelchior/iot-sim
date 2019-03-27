import React, { Component } from "react";
import { connect } from "react-redux";
import Things from "./pages/Things";
import { RootActions } from "./store/actions";
import { bindActionCreators, Dispatch } from "redux";
import Drawer from "./components/Drawer";
import { AppBar, Toolbar, Typography } from "@material-ui/core";
import { fetchThings } from "./store/actions/things";

interface Props {
  fetchThings: () => void;
}

class App extends Component<Props> {
  componentDidMount() {
    const { fetchThings } = this.props;

    fetchThings();
  }

  render() {
    return (
      <>
        <Drawer />
            <AppBar position="relative" style={{ zIndex: 2000}}>
                <Toolbar>
                    <Typography variant="h6" color="inherit">
                        IoT Simulator
                    </Typography>
                </Toolbar>
            </AppBar>
          <div style={{ marginLeft: 120}}>
          <Things />
        </div>
        </>
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch<RootActions>) =>
  bindActionCreators(
    {
      fetchThings
    },
    dispatch
  );

export default connect(
  () => ({}),
  mapDispatchToProps
)(App);
