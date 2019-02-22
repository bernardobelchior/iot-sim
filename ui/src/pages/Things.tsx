import React, { FC } from "react";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { connect } from "react-redux";
import { RootState } from "../store/reducers";
import {
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  Typography
} from "@material-ui/core";

type Props = {
  things: Array<{ [key: string]: any }>;
};

const Things: FC<Props> = ({ things }) => (
  <div style={{ margin: "16px" }}>
    {things.map(description => (
      <ExpansionPanel>
        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>{description["name"]}</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <Typography>{JSON.stringify(description)}</Typography>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    ))}
  </div>
);

const mapStateToProps = ({ things: { things } }: RootState): Props => ({
  things
});

export default connect(mapStateToProps)(Things);
