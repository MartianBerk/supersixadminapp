import React, { Component } from 'react';

import * as Constants from "../constants.js";
import PlayerPredictions from "./PlayerPredictions.js";

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
            viewPredictionsList: [],
            viewPredictionSubmit: null,
            error: false
        }

        this.handlePredictionsLoad = this.handlePredictionsLoad.bind(this);
        this.handlePlayerClick = this.handlePlayerClick.bind(this);
        this.handlePlayerSelect = this.handlePlayerSelect.bind(this);
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

    // getMatches(matchDate) {
    //     matchDate = this.formatDate(matchDate);

    //     fetch(`${Constants.LISTMATCHESURL}?matchDate=` + matchDate)
    //     .then(response => response.json())
    //     .then(data => this.setState({ matches: data.matches.reduce((matches, match) => {
    //         if (match.use_match) {
    //             matches.push(match);
    //         }

    //         return matches;
    //     }, []) }))
    //     .catch(/* do nothing */)
    // }

    getData(matchDate) {
        matchDate = this.formatDate(matchDate);

        fetch(`${Constants.LISTMATCHESURL}?matchDate=` + matchDate)
        .then(response => response.json())
        .then(data => this.setState({ matches: data.matches.reduce((matches, match) => {
            if (match.use_match) {
                matches.push(match);
            }

            return matches;
        }, []) }, () => {
            // collection players and predictions after matches obtained
            this.getPlayersAndPredictions(matchDate);
        }))
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
        // matchDate = this.formatDate(matchDate);

        fetch(`${Constants.LISTPREDICTIONSURL}?round=${this.state.currentRound.round_id}&matchdate=${matchDate}&playerid=${playerId}`)
        .then(response => response.json())
        .then(data => this.setState((oldState) => {
            let predictions = {...oldState.predictions};

            if (data.predictions.length > 0) {
                predictions[playerId] = data.predictions;
            }
            else {
                predictions[playerId] = this.state.matches.map(match => {
                    return {
                        round_id: this.state.currentRound.round_id,
                        player_id: playerId,
                        match_id: match.id,
                        home_team: match.home_team,
                        away_team: match.away_team,
                        prediction: null
                    }
                });
            }

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

            this.getData(matchDate);
            // this.getMatches(matchDate);
            // this.getPlayersAndPredictions(matchDate);
        }
    }

    handlePlayerClick (e) {
        let id = e.target.id.split("-");

        if (id.length === 3) {
            id = parseInt(id[2]);
            this.setState((oldState) => { 
                let viewList = [...oldState.viewPredictionsList];

                const index = viewList.indexOf(id)
                index > -1 ? viewList.splice(index, 1) : viewList.push(id);
                
                return { viewPredictionsList: viewList }
            });
        }
    }

    handlePlayerSelect (e) {
        this.setState({ viewPredictionSubmit: e.target.value });
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
                            id={"predictionslist-player-" + player.id}>
                            <span className="predictionslist-player-name" id={"predictionslist-playername-" + player.id}>
                                {player.name}
                            </span>
                            <span className="predictionslist-player-expand" id={"predictionslist-playercount-" + player.id}>
                                ({(this.state.predictions[player.id] || []).filter(prediction => {
                                    if (prediction.prediction) {
                                        return prediction
                                    }
                                }).length})
                                <img 
                                    src={this.state.viewPredictionsList.indexOf(player.id) > -1 ? 'shrink.png' : 'expand.png'} 
                                    width="10" 
                                    height="10" 
                                    onClick={this.handlePlayerClick} 
                                    id={"predictionslist-playerexpand-" + player.id}
                                />
                            </span>
                            {this.state.viewPredictionsList.indexOf(player.id) > -1
                            && <PlayerPredictions 
                                id={"predictionslist-playerexpand-" + player.id}
                                className="predictionslist-predictions" 
                                predictions={this.state.predictions[player.id]}
                            />}
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
                <select className="predictions-input" id="predictionselector-player" onChange={this.handlePlayerSelect}>
                    <option value=""></option>
                    { 
                        this.state.players.map(player => {
                            return (
                                <option value={player.id}>{player.name}</option>
                            )
                        })
                    }
                </select>
                {this.state.viewPredictionSubmit && <PlayerPredictions 
                                                     id={"predictionselector-predictions-" + this.state.viewPredictionSubmit}
                                                     className="predictionselector-predictions" 
                                                     predictions={this.state.predictions[this.state.viewPredictionSubmit]}
                                                     edit={true}
                                                     />}
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
