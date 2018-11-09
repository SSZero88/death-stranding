import React, { Component } from "react";
import PropTypes from "prop-types";
import InputAdornment from "@material-ui/core/InputAdornment";
import IconButton from "@material-ui/core/IconButton";
import Home from "@material-ui/icons/Home";
import { Link } from "react-router-dom";
import keycode from "keycode";
import { withStyles, createStyles } from "@material-ui/core";
import SearchItems from "./SearchItems";
import "./Search.css";
// import InfoBox from '../Info/InfoBox';

const styles = createStyles({

});

const PLACEHOLDER = "start typing to search...";

class Search extends Component {
  constructor(props) {
    super(props);

    this.state = {
      size: PLACEHOLDER.length,
      value: "",
      searching: false
    };
    this.commandsArray = [];
    this.commandsArrayLowerCase = [];
    this.lowerToUpper = {};
    this.usingEdgeOrIE = (document.documentMode || /Edge/.test(navigator.userAgent));
    // this.searching = false;
  }

  // eslint-disable-next-line
  onWindowKeydown = event => {
    const { searchRef: { current } } = this.props;
    if (event.keyCode < 112 || event.keyCode > 121) {
      if (keycode(event) === "esc") {
        this.closeSearch();
      } else if (keycode(event) === "tab") {
        event.preventDefault();
        current.blur();
      } else if (keycode(event) !== "ctrl" && keycode(event) !== "alt") { // not Ctrl or Alt
        current.focus();
      }
    }
  }

  componentDidMount() {
    window.addEventListener("keydown", this.onWindowKeydown);
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.onWindowKeydown);
  }

  componentDidUpdate(prevProps) {
    const { commandToID } = this.props;
    if (prevProps.commandToID === commandToID) {
      return;
    }

    this.commandsArray = Object.keys(commandToID).sort();
    this.commandsArrayLowerCase = this.commandsArray.map(command => command.toLowerCase());
    this.lowerToUpper = this.commandsArrayLowerCase.reduce((result, item, index) => {
      result[item] = this.commandsArray[index]; // eslint-disable-line no-param-reassign
      return result;
    }, {});
  }

  closeSearch = (target) => {
    const { focusNode, searchRef: { current } } = this.props;
    this.setState(() => {
      current.blur();
      current.value = "";
      focusNode(target);
      return { searching: false, value: "", size: PLACEHOLDER.length };
    });
  }

  // eslint-disable-next-line
  render() {
    const { value, size, searching } = this.state;
    const { loading, searchRef } = this.props;
    const filteredCommands = value === "" ? [] : this.commandsArrayLowerCase
      .filter(cmd => cmd.indexOf(value.toLowerCase()) !== -1)
      .map(cmd => this.lowerToUpper[cmd]);

    return (
      <div className="search-component">
        <InputAdornment position="end">
          <IconButton
            aria-label="Clear"
            component={Link}
            to="/dashboard"
            color="inherit"
          >
            <Home />
          </IconButton>
        </InputAdornment>
        {/* <InfoBox /> */}
        <input
          type="search"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck="false"
          size={size}
          placeholder={loading ? "loading..." : PLACEHOLDER}
          ref={searchRef}
          onFocus={() => {
            console.log("focusing");
            this.setState({ searching: true });
          }}
          onBlur={() => {
            console.log("blurring");
          }}
          onChange={({ target: { value: newValue } }) => {
            this.setState({
              size: PLACEHOLDER.length < newValue.length ? newValue.length : PLACEHOLDER.length,
              value: newValue
            });
          }}
        />
        {this.usingEdgeOrIE && (
          <div
            className="search-message"
            style={{
              opacity: loading ? 1 : 0
            }}
          >
            There are some compatibility issues with Edge and IE
          </div>
        )}

        {searching && value.length > 0 && (
          <SearchItems
            filteredCommands={filteredCommands}
            click={this.closeSearch}
          />
        )}
      </div>
    );
  }
}

Search.propTypes = {
  classes: PropTypes.shape({
    // searchItems: PropTypes.string.isRequired,
    // searchResults: PropTypes.string.isRequired,
  }).isRequired,
  loading: PropTypes.bool.isRequired,
  commandToID: PropTypes.objectOf(PropTypes.number).isRequired,
  searchRef: PropTypes.shape({
    current: PropTypes.object
  }).isRequired,
  focusNode: PropTypes.func.isRequired
};

export default withStyles(styles)(Search);