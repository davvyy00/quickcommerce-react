import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {inject, observer} from 'mobx-react'

import { DropTarget } from 'react-dnd'
import classNames from 'classnames'

import { Well } from 'react-bootstrap'

import RowComponent from './CartRow.jsx'
import ContainerComponent from './CartTable.jsx'

let cartTarget = {
  drop(props, monitor, component) {
    if (monitor.didDrop()) {
      return
    }
        
    const item = monitor.getItem()
    component.props.onItemDropped(item.id)
  }
}

function collect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop()
  }
}

@inject(deps => ({
  actions: deps.actions,
  cartStore: deps.cartStore
}))
@observer
class Cart extends Component {
  static propTypes = {
    items: PropTypes.object,
    selection: PropTypes.array,
    onItemDropped: PropTypes.func,
    onItemAdded: PropTypes.func,
    onItemClicked: PropTypes.func,
    onItemRemoved: PropTypes.func,
    onItemQtyChanged: PropTypes.func,
    onChange: PropTypes.func,
    iterator: PropTypes.func,
    tableClassName: PropTypes.string,
    cartEmptyMessage: PropTypes.node

  }

  static defaultProps = {
    items: {},
    selection: [],
    onItemClicked: () => {},
    onItemDropped: () => {},
    onItemAdded: () => {},
    onItemRemoved: () => {},
    onItemQtyChanged: () => {},
    onChange: () => {},
    iterator: () => { return {} },
    containerComponent: ContainerComponent,
    rowComponent: RowComponent,
    tableClassName: '',
    cartEmptyMessage: (
      <span><b>You haven't made any selections.</b><span className=''><br/>Please add an item to continue.</span></span>
    )
  }

  static contextTypes = {
    cartContextManager: PropTypes.object,
    cart: PropTypes.object
  }

  constructor(props, context) {
    super(props)

    this.refresh = this.refresh.bind(this)
    this.onChange = this.onChange.bind(this)
    this.addItem = this.addItem.bind(this)
    this.removeItem = this.removeItem.bind(this)
    this.emptyCart = this.emptyCart.bind(this)
    this.clearCart = this.clearCart.bind(this)
    this.reset = this.reset.bind(this)

    this.state = {
      selection: []
    }
  }

  componentDidMount() {
    // Cart.componentDidMount
    //this.context.actions.init(this.props.items, this.context.store.getSelection())
    this.context.cartContextManager.subscribe((contextValue) => {
      console.log('update cart using context')
      console.log(contextValue)
      this.setState({
        selection: contextValue.store.getSelection()
      })
    })
  }

  refresh() {
    const cartContextValue = this.context.cartContextManager.getCartContextValue()
    const store = cartContextValue.store

    this.setState({
      selection: store.getSelection()
    })
  }
    
  onChange() {
    this.refresh()
    this.props.onChange()
  }
    
  addItem(key, quantity, item) {
    const cartContextValue = this.context.cartContextManager.getCartContextValue()
    const actions = cartContextValue.actions

    actions.addItem(key, quantity, item)
  }
    
  removeItem(index) {
    const cartContextValue = this.context.cartContextManager.getCartContextValue()
    const actions = cartContextValue.actions

    actions.removeItem(index)
  }
    
  updateQuantity(index, quantity) {
    const cartContextValue = this.context.cartContextManager.getCartContextValue()
    const actions = cartContextValue.actions

    actions.updateQuantity(index, quantity)
  }
    
  addOption(key, quantity, item, product) {
    const cartContextValue = this.context.cartContextManager.getCartContextValue()
    const actions = cartContextValue.actions

    actions.addOption(key, quantity, item, product)
  }
    
  emptyCart() {
    const cartContextValue = this.context.cartContextManager.getCartContextValue()
    const actions = cartContextValue.actions

    actions.emptyCart()
  }
    
  clearCart() {
    const cartContextValue = this.context.cartContextManager.getCartContextValue()
    const actions = cartContextValue.actions

    actions.clearCart()
  }
    
  reset() {
    const cartContextValue = this.context.cartContextManager.getCartContextValue()
    const actions = cartContextValue.actions

    actions.reset()
  }
    
  render() {
    const { position, isOver, canDrop, connectDropTarget } = this.props
        
    const Container = this.props.containerComponent
    const Row = this.props.rowComponent
        
    let context = this.props.iterator()

    const cartContextValue = this.context.cartContextManager.getCartContextValue()
    const actions = cartContextValue.actions
    const store = cartContextValue.store

    if (store !== null && store.isEmpty()) {
      return connectDropTarget(
        <div className='dnd-target-wrapper'>
          <div
            className={classNames({'well-is-over': isOver})}
            style={{marginBottom: '.5em'}}
            bsSize='large'>
            {/*<h1 className='drop-target-icon' style={{textAlign: 'center'}}><i className='fa fa-bullseye fa-2x' /></h1>*/}
            <p style={{textAlign: 'center', maxWidth: 'auto'}}>{this.props.cartEmptyMessage}</p>
          </div>
        </div>
      )
    } else {
      return connectDropTarget(
        <div className='dnd-target-wrapper'>
          <Container
            tableClassName={this.props.tableClassName}
            columns={this.props.columns}
            body={this.state.selection.map(item => {
              let context = this.props.iterator(context, item)
              return (
                <Row
                  key={item._key}
                  item={item}
                  columns={this.props.columns}
                  onItemClicked={this.props.onItemClicked}
                  removeItem={()  => this.removeItem(item._index)}
                  setItemQty={qty => this.updateQuantity(item._index, qty)} />
              )
            })}
            context={context}
          />
        </div>
      )
    }
  }
}

export default DropTarget('sprite', cartTarget, collect)(Cart)
