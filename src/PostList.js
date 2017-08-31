import React, { Component } from 'react'
import { List } from 'react-virtualized'
import Blockies from './BlockiesIdenticon'

class PostList extends Component {

  render () {
    return (
      <List
        style={{border: '1px solid black', padding: 5}}
        width={600}
        height={300}
        rowCount={this.props.posts.length}
        scrollToRow={this.props.posts.length}
        rowHeight={100}
        rowRenderer={({
          key,         // Unique key within array of rows
          index,       // Index of row within collection
          isScrolling, // The List is currently being scrolled
          isVisible,   // This row is visible within the List (eg it is not an overscanned row)
          style        // Style object to be applied to row (to position it)
        }) => {
          let float = (this.props.viewer === this.props.posts[index].sender) ? 'right' : 'left'
          let rowStyle = {
            width: '100%',
            height: 'auto',
            float: float,
            marginBottom: 5
          }
          return (
            <div
              key={key}
              style={rowStyle}
            >
              <Blockies opts={{ seed: this.props.posts[index].sender, size: 8, scale: 16}} />
              <p style={{float: 'inherit'}}>{this.props.posts[index].text} </p>
            </div>
          )}}
      />
    )
  }
}

export default PostList
