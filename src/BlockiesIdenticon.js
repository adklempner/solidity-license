// Usage:
//   npm install blockies-identicon
//   const Blockies = require("blockies/react-component");
//   <Blockies opts={{seed: "foo", color: "#dfe", bgcolor: "#a71", size: 15, scale: 3, spotcolor: "#000"}}/>

var blockies = require("./blockies");
import React, { Component } from 'react'

class BlockiesIdenticon extends React.Component {
  constructor(props) {
    super(props);
  }
  getOpts () {
    return {
      seed: this.props.opts.seed || "foo",
      size: this.props.opts.size || 15,
      scale: this.props.opts.scale || 3,
      color: 'random',
      bgcolor: 'white',
      spotcolor: 'blue'
    };
  }
  componentDidMount() {
    this.draw();
  }
  draw() {
    blockies.create(this.getOpts(), this.canvas);
  }
  render() {
    const blockie = 'url(' + blockies.create(this.getOpts()).toDataURL()+')'
    const block = {
        width: 64,
        height: 64,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        borderRadius: '50%',
        boxShadow: 'inset rgba(255, 255, 255, 0.6) 0 2px 2px, inset rgba(0, 0, 0, 0.3) 0 -2px 6px',
        backgroundImage: blockie,
        float: 'inherit'
    }
    return <div style={block}></div>
  }
}

module.exports = BlockiesIdenticon;
