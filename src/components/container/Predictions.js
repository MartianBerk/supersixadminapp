import React, { Component } from 'react';

import * as Constants from "../constants";

import "../css/Predictions.css";

class Predictions extends Component {
    constructor(props) {
        super(props);

        this.state = {
            currentRound: null,
            date: null,
            players: [],
            predictions: {},
            matches: [],
            viewPredictions: null,
            error: false
        }

        this.handlePredictionsLoad = this.handlePredictionsLoad.bind(this);
        this.handlePlayerClick = this.handlePlayerClick.bind(this);
        this.handlePredictionSelectorSubmit = this.handlePredictionSelectorSubmit.bind(this);
    }

    componentDidMount () {
        this.getCurrentRound();
    }

    getCurrentRound() {
        fetch(Constants.CURRENTROUNDURL)
        .then(response => response.json())
        .then(data => this.setState({ currentRound: data["current_round"] }))
        .catch(_ => this.setState({ error: true }));
    }

    getMatches(matchDate) {
        matchDate = this.formatDate(matchDate);

        fetch(`${Constants.LISTMATCHESURL}?matchDate=` + matchDate)
        .then(response => response.json())
        .then(data => this.setState({ matches: data.matches.reduce((matches, match) => {
            if (match.use_match) {
                matches.push(match);
            }

            return matches;
        }, []) }))
        .catch(/* do nothing */)
    }

    getPlayersAndPredictions(matchDate) {
        fetch(Constants.LISTPLAYERSURL)
        .then(response => response.json())
        .then(data => this.setState({ players: data["players"].map(player => {
            return { id: player.id, name: player.first_name + " " + player.last_name }
        }) }, () => {
            // collect predictions once players obtained
            this.state.players.map(player => {
                this.getPredictions(matchDate, player.id);
            })
        }))
        .catch(_ => this.setState({ error: true }));
    }

    getPredictions (matchDate, playerId) {
        matchDate = this.formatDate(matchDate);

        fetch(`${Constants.LISTPREDICTIONSURL}?round=${this.state.currentRound.round_id}&matchdate=${matchDate}&playerid=${playerId}`)
        .then(response => response.json())
        .then(data => this.setState((oldState) => {
            let predictions = {...oldState.predictions};
            predictions[playerId] = data;

            return { predictions: predictions };
        }))
        .catch(/* do nothing */)
    }

    formatDate(date) {
        return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
    }

    handlePredictionsLoad (_) {
        let matchDate = document.getElementById("predictions-date").value;

        if (matchDate) {
            matchDate = new Date(matchDate);
            this.setState({ date: matchDate });

            this.getMatches(matchDate);
            this.getPlayersAndPredictions(matchDate);
        }
    }

    handlePlayerClick (e) {
        let id = e.target.id.split("-");

        if (id.length === 3) {
            id = parseInt(id[2]);
            this.setState({ viewPredictions: this.state.viewPredictions === id ? null : id });
        }
    }

    handlePredictionSelectorSubmit (_) {

    }

    renderPredictions () {
        if (this.state.matches.length === 0) {
            return null;
        }

        return (
            <div className="predictionslist">
                <h4>Existing Predictions</h4>
                {this.state.players.map((player, i) => {
                    return (
                        <div
                            className={"predictionslist-player" + (i % 2 === 0 ? " predictions-even" : " predictions-odd")}
                            id={"predictionslist-player-" + player.id}
                            onClick={this.handlePlayerClick}>
                            <span className="predictionslist-player-name">{player.name}</span>
                            <span className="predictionslist-player-expand"><img src={this.state.viewPredictions ===  player.id ? 'shrink.png' : 'expand.png'} width="10" height="10" /></span>
                        </div>
                    )
                })}
            </div>
        )
    }

    renderPredictionSelector () {
        if (this.state.matches.length === 0) {
            return null;
        }

        return (
            <div className="predictionselector">
                <h4>Player</h4>
                <select className="predictions-input" id="predictionselector-player">
                    <option value=""></option>
                    { 
                        this.state.players.map(player => {
                            return (
                                <option value={player.id}>{player.name}</option>
                            )
                        })
                    }
                </select>
                <button className="predictions-button" onClick={this.handlePredictionSelectorSubmit}> 
                    Submit
                </button>
            </div>
        )
    }

    render () {
        return (
            <div className="predictions-container">
                <div className="predictions-load">
                    <h2>Predictions</h2>
                    <h4>Match Date</h4>
                    <input className="predictions-input" type="date" id="predictions-date" />
                    <button className="predictions-button" id="predictions-load" onClick={this.handlePredictionsLoad}> 
                        Load Predictions
                    </button>
                </div>
                {[
                    this.renderPredictions(),
                    this.renderPredictionSelector()
                ]}
            </div>
        )
    }
}

export default Predictions;
