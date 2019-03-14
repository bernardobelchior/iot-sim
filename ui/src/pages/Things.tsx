import React, { FC } from "react";
import { connect } from "react-redux";
import { RootState } from "../store/reducers";
import ThingsTable from "../components/ThingsTable/ThingsTable";
import { Thing } from "../models/Thing";
import { ActionCreatorsMapObject, bindActionCreators, Dispatch } from "redux";
import { RootActions } from "../store/actions";
import { fetchThings } from "../store/actions/things";

interface IProps {
  things: Thing[];
}

const Things: FC<IProps & ActionCreatorsMapObject> = ({ things, fetchThings }) => (
  <div style={{ margin: "16px" }}>
    <ThingsTable things={things} fetchThings={fetchThings} />
  </div>
);

const mapStateToProps = ({ things: { things } }: RootState): IProps => ({
  things: Object.values(things),
});

const mapDispatchToProps = (dispatch: Dispatch<RootActions>) =>
  bindActionCreators(
    {
      fetchThings
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(Things);
