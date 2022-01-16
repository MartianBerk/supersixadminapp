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
            error: false,
            confirm: null,
            confirmYesAction: null,
            confirmNoAction: null,
            specialMessage: null
        };

        this.defaultBuyin = 2;

        this.handleMessageChange = this.handleMessageChange.bind(this);
        this.handleMessageSubmit = this.handleMessageSubmit.bind(this);
        this.handleMessageClear = this.handleMessageClear.bind(this);
        this.handleWinnerSubmit = this.handleWinnerSubmit.bind(this);
        this.handleCreateRound = this.handleCreateRound.bind(this);
        this.handleConfirmationClick = this.handleConfirmationClick.bind(this);
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

    getPlayers() {
        fetch(Constants.LISTPLAYERSURL)
        .then(response => response.json())
        .then(data => this.setState({ players: data["players"].map(player => {
            return { id: player.id, name: player.first_name + " " + player.last_name }
        }) }))
        .catch(_ => this.setState({ error: true }));
    }

    getSpecialMessage() {
        fetch(Constants.GETSPECIALMESSAGEURL)
        .then(response => response.json())
        .then(data => this.setState({ specialMessage: data.message }))
        .catch(_ => this.setState({ error: true }));
    }

    componentDidMount() {
        this.getCurrentRound();
        this.getHistoricRounds();
        this.getPlayers();
        this.getSpecialMessage();
    }

    handleWinnerSubmit(_) {
        const winnerId = parseInt(document.getElementById("currentround-winner").value);

        let winner = null;
        this.state.players.forEach(p => {
            if (p.id === winnerId) {
                winner = p.name
            }
        });

        if (!winner) {
            return false;
        }

        this.setState({
            confirm: `Ending round with winner ${winner} on ${this.formatDate(this.state.currentRound.current_match_date)}.\nProceed?`,
            confirmYesAction: (() => {
                let winnerIds = [];

                const opts = document.getElementById("currentround-winner").options;
                for(var i = 0; i < opts.length; i++) {
                    if(opts[i].selected)
                        winnerIds.push(parseInt(opts[i].value))
                }

                let endDate = new Date(this.state.currentRound.current_match_date)
                endDate = `${endDate.getDate()}-${endDate.getMonth() + 1}-${endDate.getFullYear()}`;

                fetch(Constants.ENDROUNDURL, {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({
                        winner_ids: winnerIds,
                        end_date: endDate
                    })
                })
                .then(/* reload? */)
                
            }),
            confirmNoAction: (() => {
                document.getElementById("currentround-winner").value = null;
            })
        });
    }

    handleMessageChange(_) {
        this.setState({ specialMessage: document.getElementById("currentround-message").value });
    }

    handleMessageSubmit(_) {
        const message = document.getElementById("currentround-message").value;

        this.setState({
            confirm: `Submitting special message '${message}'.\nProceed?`,
            confirmYesAction: (() => {
                fetch(Constants.SETSPECIALMESSAGEURL, {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({
                        message: message
                    })
                })
                .then(this.setState({ specialMessage: message }))
                .catch(/* do nothing */);
            }),
            confirmNoAction: (() => {
                document.getElementById("currentround-message").value = null;
            })
        });
    }

    handleMessageClear(_) {
        this.setState({
            confirm: `Clearing special message.\nProceed?`,
            confirmYesAction: (() => {
                fetch(Constants.ENDSPECIALMESSAGEURL)
                .then(this.setState({ specialMessage: null }))
                .catch(/* do nothing */);
            }),
            confirmNoAction: (() => {/* do nothing */})
        });
    }

    handleCreateRound(_) {
        let startDate = document.getElementById("createround-startdate").value;
        const buyIn = parseInt(document.getElementById("createround-buyin").value) * 100;

        this.setState({
            confirm: `Adding round to start on ${this.formatDate(startDate)} with a buy in of £${buyIn}.\nProceed?`,
            confirmYesAction: (() => {
                startDate = new Date(startDate)
                startDate = `${startDate.getDate()}-${startDate.getMonth() + 1}-${startDate.getFullYear()}`;

                fetch(Constants.ADDROUNDURL, {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({
                        start_date: startDate,
                        buy_in: buyIn
                    })
                })
                .then(/* TODO: reload? */);
            }),
            confirmNoAction: (() => {/* do nothing */})
        })
    }

    handleConfirmationClick(e) {
        if (e.target.id == "confirm-yes") {
            this.state.confirmYesAction();
        }
        else {
            this.state.confirmNoAction();
        }

        this.setState({ confirm: null });
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
        if (this.state.currentRound && Object.keys(this.state.currentRound).length > 0) {
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
                    <div className="currentround-section">
                        <h4>Special Message</h4>
                        <input className="currentround-message" id="currentround-message" type="text" value={this.state.specialMessage} onChange={this.handleMessageChange} />
                        <br /><br />
                        <button className="currentround-message-button" id="currentround-submit-message" onClick={this.handleMessageSubmit}>
                            Submit
                        </button>
                        <button className="currentround-message-button" id="currentround-clear-message" onClick={this.handleMessageClear}>
                            Clear
                        </button>
                    </div>
                    <div className="currentround-section">
                        <h4>Winner</h4>
                        <select id="currentround-winner" className="currentround-winner" multiple>
                            <option value=""></option>
                            { 
                                this.state.players.map(player => {
                                    return (
                                        <option value={player.id}>{player.name}</option>
                                    )
                                })
                            }
                        </select>
                        <br /><br />
                        <button className="currentround-submit" id="currentround-submit-winner" onClick={this.handleWinnerSubmit}> 
                            Submit
                        </button>
                    </div>
                </div>
            );
        }
        else {
            return (
                <div className="currentround">
                    <h2>Current Round</h2>
                    <h4>Create round.</h4>
                    <div className="currentround-createround">
                        <div className="currentround-create-fields">
                            <div className="currentround-create-field">
                                <h5>Start Date</h5>
                                <input type="date" id="createround-startdate" />
                            </div>
                            <div className="currentround-create-field">
                                <h5>Buy In (£)</h5>
                                <input type="number" id="createround-buyin" value={this.defaultBuyin} />
                            </div>
                        </div>
                        <button className="currentround-submit" id="currentround-create" onClick={this.handleCreateRound}> 
                            Submit
                        </button>
                    </div>
                </div>
            )
        }
    }

    renderHistoricRounds() {
        if (this.state.historicRounds) {
            return (
                <div className="historicrounds">
                    <br />
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
                                        <h5>{ this.formatDate(round.end_date) }</h5>
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

    renderConfirmation() {
        return (
            <div className={"confirm-container" + (!this.state.confirm ? " hidden" : "")}>
                <div className="confirm">
                    {this.state.confirm}
                    <div className="confirm-buttons">
                        <button className="confirm-button" id="confirm-yes" onClick={this.handleConfirmationClick}> 
                            Yes
                        </button>
                        <button className="confirm-button" id="confirm-no" onClick={this.handleConfirmationClick}> 
                            No
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    render() {
        return (
            <div className="rounds">
                {
                    this.state.error
                    ? "Error"  // TODO: make error component
                    : [this.renderConfirmation(), this.renderCurrentRound(), this.renderHistoricRounds()]
                }
            </div>
        );
    }
}

export default Round;
