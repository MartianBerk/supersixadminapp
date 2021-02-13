import React, { Component } from 'react';

import Round from '../container/Round.js';

import "../css/SupersixAdmin.css";

class SupersixAdmin extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            showRound: true
        };

        this.handleMenuClick = this.handleMenuClick.bind(this);
    };

    handleMenuClick(e) {
        if (e.target.id === "supersixadmin-round" || e.target.id === "supersixadmin-round-img") {
            this.setState({ showRound: true });
        }
    }

    render() {
        return (
            <div className="supersixadmin-container">
                <div className="head">
                    <div className="logo">
                        <img id="supersixadmin-logo" src='logo.png' height='70' width='80' /> 
                    </div>
                </div>
                <div className="supersixadmin-menu">
                    <button 
                        className={`supersixadmin-menu-button ${this.state.showRound ? "active" : ""}`}
                        id="supersixadmin-round"
                        onClick={this.handleMenuClick}><img id="supersixadmin-round-img" onClick={this.handleMenuClick} src='round.png' height='40' width='40' /> 
                    </button>
                </div>
                <div className={`supersixadmin supersixadmin-round ${this.state.showRound ? "" : "hidden"}`}>
                    <Round />
                </div>
            </div>
        )
    }
}

export default SupersixAdmin;
