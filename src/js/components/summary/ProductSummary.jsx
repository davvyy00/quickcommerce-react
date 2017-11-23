import assign from 'object-assign'
 
import React, { Component } from 'react'
import {inject, observer, Provider} from 'mobx-react'

import { Alert, Table, Grid, Col, Row, Thumbnail, Modal, Accordion, Panel, HelpBlock } from 'react-bootstrap'
import { Tabs, Tab, TabContent, TabContainer, TabPanes } from 'react-bootstrap'
import { Nav, Navbar, NavItem, MenuItem, NavDropdown } from 'react-bootstrap'
import { FormGroup, FormControl, ControlLabel } from 'react-bootstrap'
import { Button, Checkbox, Radio, } from 'react-bootstrap'

import HtmlHelper from 'quickcommerce-react/helpers/HTML.js'

export default class ProductSummary extends Component {
    constructor(props) {
        super(props)
        
        this.getDescription = this.getDescription.bind(this)
        this.addToCart = this.addToCart.bind(this)
        this.toggleOptions = this.toggleOptions.bind(this)
        this.configureRow = this.configureRow.bind(this)
        
        let product = sessionStorage.getItem('selectedProduct')
        if (typeof product === 'string' && product !== '') {
            this.state = {
                showOptions: false,
                product: JSON.parse(product)
            }
        } else {
            console.log('no product to show')
            this.state = {
                showOptions: false,
                product: null
            }
        }
    }
    
    componentDidUpdate() {
        let product = sessionStorage.getItem('selectedProduct')
        if (this.state.product === null) {
            // If there's a product in session grab it (we probably triggered it from another page)
            if (typeof product === 'string' && product !== '') {
                this.setState({
                    product: JSON.parse(product)
                })
            }
        }
    }
    
    toggleOptions() {
        this.setState({
            showOptions: (this.state.showOptions) ? false : true
        })
    }
    
    getDescription() {
        if (typeof this.state.product.description === 'string') {
            const html = HtmlHelper.decodeHtmlSpecialChars(this.state.product.description)
            return { __html: html }
        }
        
        return { __html: '' }
    }
    
    addToCart(e) {
        e.preventDefault()
        
        if (typeof this.refs.parallax !== 'undefined') {
            this.refs.parallax.scrollTo(0) // Scroll subscription up
        }
        
        let input = document.querySelectorAll('#product-form input[type=number]')[0]
        let quantity = parseInt(input.value)
        console.log('adding ' + quantity + ' items to cart')
        
        let item = this.state.product
        CartStore.addItem(item.id, quantity, item)
        
        window.location.hash = '/category'
        
        let scrollDuration = 111
        let scrollStep = -window.scrollY / (scrollDuration / 15),
            scrollInterval = setInterval(() => {
            if (window.scrollY !== 0) {
                window.scrollBy(0, scrollStep)
            } else clearInterval(scrollInterval)
        }, 15)
    }
    
    configureRow(rowComponent) {
        let that = this
        let fn = null

        if (this.props.hasOwnProperty('onItemClicked') &&
            typeof this.props.onItemClicked === 'function') {

            // Wrap the function in a generic handler so we can pass in custom args
            let callback = fn = this.props.onItemClicked
            fn = function () {
                // What's the current step?
                let step = BrowserActions.getCurrentStep()

                // Make sure there's a next step before calling it into action
                // Also, subtract a step to account for zero index
                if (that.props.stepper.currentStep < (that.props.stepper.steps.length - 1)) {
                    that.props.stepper.next()
                }

                // Execute our handler
                callback(arguments[0])
            }
        } else {
            fn = this.props.onItemClicked
        }

        rowComponent.defaultProps.onItemClicked = fn

        return rowComponent
    }
    
    render() {
        // Render Product component
        let description = this.getDescription()
        let price = (parseFloat(this.state.product.price)).toFixed(2)
        let options = false
        if (typeof this.state.product.options !== 'undefined' && 
        this.state.product.options instanceof Array && 
        this.state.product.options.length > 0) {
           options = this.state.product.options
        }
        
        return (
            <div className="summary entry-summary">
                {/* Microdata */}
                {/*<meta itemProp="priceCurrency" content="USD" />
                <link itemProp="availability" href="http://schema.org/InStock" />*/}
                <div className="product-details">
                    <div className="row">
                      <div className="col-sm-12 col-md-3 featured_image top_row" 
                        style={{
                            backgroundImage: 'url(' + QC_IMAGES_URI + this.state.product.image + ')',
                            backgroundSize: 'cover', 
                            height: 450
                        }}>
                        <div className="product_section">
                          &nbsp;
                        </div>
                      </div>
                      <div className="col-sm-12 col-md-8 top_row">
                        {/*<div className="row">
                          <div className="col-sm-12 columns">
                            <div className="product_section">
                              <span className="section_title"></span>
                              <span itemProp="name" className="description product_title entry-title">My Special Product</span>
                            </div>
                          </div>
                        </div>*/}
                        <div className="row">
                          <div className="col-sm-12 flavor">
                            <div className="product_section">
                              <span className="section_title">Roaster's Notes</span>
                              <span itemProp="name" className="tags">
                                <div dangerouslySetInnerHTML={description}></div>
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-sm-12 col-md-5 location mid_block" style={{height: 114}}>
                            <div className="product_section">
                              <span className="section_title">Origin / Blend</span>
                              <span itemProp="name" className="tags">
                                <span>Sau Paulo, Brazil</span>
                              </span>
                            </div>
                          </div>
                          <div className="col-sm-12 col-md-4 mid_block" style={{height: 114}}>
                            <div className="product_section">
                              <span className="section_title">Species</span>
                              <span itemProp="name" className="tags">
                                <span>Blue Mountain</span>
                              </span>
                            </div>
                          </div>
                          <div className="col-sm-12 col-md-3 type bottom_row" style={{height: 114}}>
                        <div className="product_section">
                          <span className="section_title">Elevation</span>
                          <span itemProp="name" className="tags">
                            <span>1,345ft</span>
                          </span>
                        </div>
                      </div>
                      <div className="col-sm-12 col-md-4 type bottom_row" style={{height: 114}}>
                        <div className="product_section">
                          <span className="section_title">Variety</span>
                          <span itemProp="name" className="tags">
                            <span>Ipsum dolor</span>
                          </span>
                        </div>
                      </div>
                        </div>{/* .row .collapse */}
                      </div>
                      
                    </div>{/* .row */}
                </div>
            </div>
        )
    }
}