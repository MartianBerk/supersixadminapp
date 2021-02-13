import React, { Component } from 'react';

import * as Constants from "../constants";

import "../css/Round.css";


class Round extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentRound: {},
            historicRounds: [],
            players: [],
            error: false
        };
    }

    getCurrentRound() {
        fetch(Constants.CURRENTROUNDURL)
        .then(response => response.json())
        .then(data => this.setState({ currentRound: data["current_round"] }))
        .catch(_ => this.setState({ error: true }));
    }

    getHistoricRounds() {
        fetch(Constants.HISTORICROUNDSURL)
        .then(response => response.json())
        .then(data => this.setState({ historicRounds: data["rounds"] }))
        .catch(_ => this.setState({ error: true }));
    }

    componentDidMount() {
        this.getCurrentRound();
        this.getHistoricRounds();
    }

    formatDate(date) {
        date = new Date(date);

        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate() > 9 ? date.getDate() : "0" + date.getDate();

        return day + " " + months[month] + " " + year;
    }

    renderCurrentRound() {
        if (this.state.currentRound) {
            return (
                <div className="currentround">
                    <h2>Current Round</h2>
                    <div className="currentround-section">
                        <h4>Start Date</h4>
                        <h5>{ this.formatDate(this.state.currentRound.start_date) }</h5>
                    </div>
                    <div className="currentround-section">
                        <h4>Gameweeks</h4>
                        <h5>{ this.state.currentRound.matches }</h5>
                    </div>
                    <div className="currentround-section">
                        <h4>Players</h4>
                        <h5>{ this.state.currentRound.players }</h5>
                    </div>
                    <div className="currentround-section">
                        <h4>Jackpot</h4>
                        <h5>£{ this.state.currentRound.jackpot / 100 }</h5>
                    </div>
                </div>
            );
        }
        else {
            return "Loading...";
        }
    }

    renderHistoricRounds() {
        if (this.state.historicRounds) {
            return (
                <div className="historicrounds">
                    <h2>Previous Rounds</h2>
                    {
                        this.state.historicRounds.map((round, index) => {
                            return (
                                <div key={index} className="historicround">
                                    <div className="historicround-section">
                                        <h4>Start Date</h4>
                                        <h5>{ this.formatDate(round.start_date) }</h5>
                                    </div>
                                    <div className="historicround-section">
                                        <h4>End Date</h4>
                                        <h5>{ this.formatDate(round.start_date) }</h5>
                                    </div>
                                    <div className="historicround-section">
                                        <h4>Gameweeks</h4>
                                        <h5>{ round.matches }</h5>
                                    </div>
                                    <div className="historicround-section">
                                        <h4>Players</h4>
                                        <h5>{ round.players }</h5>
                                    </div>
                                    <div className="historicround-section">
                                        <h4>Jackpot</h4>
                                        <h5>£{ round.jackpot / 100 }</h5>
                                    </div>
                                    <div className="historicround-section">
                                        <h4>Winner</h4>
                                        <h5>{ round.winner }</h5>
                                    </div>
                                </div>
                            ) 
                        })
                    }
                </div>
            );
        }
        else {
            return "Loading...";
        }
    }

    render() {
        return (
            <div className="rounds">
                {
                    this.state.error
                    ? "Error"  // TODO: make error component
                    : [this.renderCurrentRound(), this.renderHistoricRounds()]
                }
            </div>
        );
    }
}

export default Round;
