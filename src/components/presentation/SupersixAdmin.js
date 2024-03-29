import React, { Component } from 'react';

import Matches from '../container/Matches.js';
import Predictions from '../container/Predictions.js';
import Round from '../container/Round.js';

import "../css/SupersixAdmin.css";

class SupersixAdmin extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            showRound: true,
            showMatches: false,
            showPredictions: false
        };

        this.handleMenuClick = this.handleMenuClick.bind(this);
    };

    handleMenuClick(e) {
        if (e.target.id === "supersixadmin-round" || e.target.id === "supersixadmin-round-img") {
            this.setState({ showRound: true, showMatches: false, showPredictions: false });
        }
        else if (e.target.id === "supersixadmin-matches" || e.target.id === "supersixadmin-matches-img") {
            this.setState({ showRound: false, showMatches: true, showPredictions: false });
        }
        else if (e.target.id === "supersixadmin-predictions" || e.target.id === "supersixadmin-predictions-img") {
            this.setState({ showRound: false, showMatches: false, showPredictions: true });
        }
    }

    render() {
        return (
            <div className="supersixadmin-container">
                <div className="head">
                    <div className="logo">
                        <img id="supersixadmin-logo" src={`${process.env.PUBLIC_URL}/logo.png`} height='70' width='80' /> 
                    </div>
                </div>
                <div className="supersixadmin-menu">
                    <button 
                        className={`supersixadmin-menu-button ${this.state.showRound ? "active" : ""}`}
                        id="supersixadmin-round"
                        onClick={this.handleMenuClick}><img
                                                            id="supersixadmin-round-img"
                                                            onClick={this.handleMenuClick}
                                                            src={`${process.env.PUBLIC_URL}/round.png`}
                                                            height='40'
                                                            width='40'
                                                        /> 
                    </button>
                    <button 
                        className={`supersixadmin-menu-button ${this.state.showMatches ? "active" : ""}`}
                        id="supersixadmin-matches"
                        onClick={this.handleMenuClick}><img
                                                            id="supersixadmin-matches-img"
                                                            onClick={this.handleMenuClick}
                                                            src={`${process.env.PUBLIC_URL}/matches.png`}
                                                            height='40'
                                                            width='40'
                                                        /> 
                    </button>
                    <button 
                        className={`supersixadmin-menu-button ${this.state.showPredictions ? "active" : ""}`}
                        id="supersixadmin-predictions"
                        onClick={this.handleMenuClick}><img
                                                            id="supersixadmin-predictions-img"
                                                            onClick={this.handleMenuClick}
                                                            src={`${process.env.PUBLIC_URL}/predictions.png`}
                                                            height='40'
                                                            width='40'
                                                        /> 
                    </button>
                </div>
                <div className={`supersixadmin supersixadmin-round ${this.state.showRound ? "" : "hidden"}`}>
                    <Round />
                </div>
                <div className={`supersixadmin supersixadmin-matches ${this.state.showMatches ? "" : "hidden"}`}>
                    <Matches />
                </div>
                <div className={`supersixadmin supersixadmin-prdictions ${this.state.showPredictions ? "" : "hidden"}`}>
                    <Predictions />
                </div>
            </div>
        )
    }
}

export default SupersixAdmin;
