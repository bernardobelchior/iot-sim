import React, { Component } from "react";
import { connect } from "react-redux";
import Things from "./pages/Things";
import { RootActions } from "./store/actions";
import { bindActionCreators, Dispatch } from "redux";
import { fetchThings } from "./store/actions/things";
import Drawer from "./components/Drawer";
import { AppBar, Toolbar, Typography } from "@material-ui/core";

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
      <div>
        <Drawer />
        <div style={{ marginLeft: "120px" }}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" color="inherit">
                        IoT Simulator
                    </Typography>
                </Toolbar>
            </AppBar>
          <Things />
        </div>
      </div>
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
