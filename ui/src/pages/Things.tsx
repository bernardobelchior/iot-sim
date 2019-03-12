import React, { FC } from "react";
import { connect } from "react-redux";
import { RootState } from "../store/reducers";
import ThingsTable from "../components/ThingsTable/ThingsTable";
import { Thing } from "../models/Thing";

interface IProps {
  things: Thing[];
}

const Things: FC<IProps> = ({ things }) => (
  <div style={{ margin: "16px" }}>
    <ThingsTable things={things} />
  </div>
);

const mapStateToProps = ({ things: { things } }: RootState): IProps => ({
  things: Object.values(things),
});

export default connect(mapStateToProps)(Things);
