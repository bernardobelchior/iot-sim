import React, { Component} from "react";
import { Thing} from "../../models/Thing";
import MUIDataTable, {
  MUIDataTableColumnDef,
  MUIDataTableOptions
} from "mui-datatables";
import { Properties } from "../../store/reducers/properties";
import { RootState } from "../../store/reducers";
import { connect } from "react-redux";
import { fetchThingProperties } from "../../store/actions/properties";
import { bindActionCreators, Dispatch } from "redux";
import { RootActions } from "../../store/actions";

interface IOwnProps {
  thing: Thing;
}

interface IProps extends IOwnProps{
  properties: Properties;
  fetchThingProperties: (thingId: string) => void;
}

const options: MUIDataTableOptions = {
  filterType: "checkbox",
  selectableRows: false,
  viewColumns: false,
  pagination: false,
  elevation: 0,
  download: false,
  filter: false,
  search: false,
  print: false
};

const propertyColumns: MUIDataTableColumnDef[] = [
  {
    name: "title",
    label: "Title",
    options: {
      customBodyRender: value => value || "Untitled"
    }
  },
  {
    name: "description",
    label: "Description",
    options: {
      customBodyRender: value => value || "No description provided"
    }
  },
  {
    name: "value",
    label: "Value",
    options: {
      customBodyRender: value => value === undefined ? "No value found" : JSON.stringify(value)
    }
  },
];

const columns: MUIDataTableColumnDef[] = [
  {
    name: "title",
    label: "Title",
    options: {
      customBodyRender: value => value || "Untitled"
    }
  },
  {
    name: "description",
    label: "Description",
    options: {
      customBodyRender: value => value || "No description provided"
    }
  }
];

/**
 * Shows the properties, actions and events of a thingId.
 * @param thingId
 * @param numCols Number of columns to span
 */
class ThingsDetails extends Component<IProps> {
  componentDidMount() {
    const { thing, fetchThingProperties } = this.props;

    fetchThingProperties(thing.id);
  }

  render() {
    const { thing, properties } = this.props;

    return (
      <div style={{ padding: "16px", backgroundColor: "#f8f8f8" }}>
        <MUIDataTable
          title="Properties"
          columns={propertyColumns}
          options={options}
          data={Object.entries(thing.properties).map(([id, prop]) => ({
            title: prop.title,
            description: prop.description,
            value: properties[id]
          }))}
        />
        <MUIDataTable
          title="Actions"
          columns={columns}
          options={options}
          data={Object.values(thing.actions)}
        />
        <MUIDataTable
          title="Events"
          columns={columns}
          options={options}
          data={Object.values(thing.events)}
        />
      </div>
    );
  }
}

const mapStateToProps = ({properties: { properties}}: RootState, { thing }: IOwnProps) => ({
  properties: properties[thing.id] || {}
});

const mapDispatchToProps = (dispatch: Dispatch<RootActions>) =>
  bindActionCreators(
    {
      fetchThingProperties
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(ThingsDetails);
