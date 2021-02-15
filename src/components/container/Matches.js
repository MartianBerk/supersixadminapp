import React, { Component } from 'react';

import * as Constants from "../constants";

import "../css/Matches.css";

class Matches extends Component {
    constructor(props) {
        super(props);
        this.state = {
            leagues: {},
            matches: [],
            selected: []
        }

        this.leagueOrder = [7, 6, 5, 4];  // PL, ELC, EL1, EL2

        this.handleMatchAdd = this.handleMatchAdd.bind(this);
        this.handleMatchDrop = this.handleMatchDrop.bind(this);
        this.handleMatchesLoad = this.handleMatchesLoad.bind(this);
    }

    loadLeagues() {
        fetch(Constants.LISTLEAGUESURL)
        .then(response => response.json())
        .then(data => this.setState({ leagues: data.leagues.reduce((leagues, league) => {
            leagues[league.id] = league.name
            return leagues
        }, {})}))
        .catch(/* do nothing */);
    }

    componentDidMount() {
        this.loadLeagues();
    }

    formatMatchTime(matchDate) {
        let d = new Date(matchDate);

        let hours = d.getHours() > 9 ? d.getHours() : "0" + d.getHours();
        let minutes = d.getMinutes() > 9 ? d.getMinutes() : "0" + d.getMinutes();

        return `${hours}:${minutes}`;
    }

    handleMatchesLoad(_) {
        this.setState({ matches: [], selected: [] });

        let matchDate = document.getElementById("matchselector-date").value;

        if (matchDate) {
            matchDate = new Date(matchDate);
            matchDate = `${matchDate.getDate()}-${matchDate.getMonth() + 1}-${matchDate.getFullYear()}`;

            fetch(`${Constants.LISTMATCHESURL}?matchDate=` + matchDate)
            .then(response => response.json())
            .then(data => this.setState({ matches: data.matches, selected: data.matches.reduce((selected, match) => {
                if (match.use_match) {
                    selected.push({ id: match.id, game_number: match.game_number });
                }
                return selected
            }, [])}))
            .then(() => {
                // sort

                this.setState((oldState) => {
                    let newMatches = [...oldState.matches];

                    newMatches.sort((a, b) => {
                        const aLeague = this.leagueOrder.indexOf(a.league_id);
                        const bLeague = this.leagueOrder.indexOf(b.league_id);

                        if (aLeague > bLeague) {
                            return 1
                        }
                        else if (aLeague < bLeague) {
                            return -1
                        }
                        else {
                            if (a.match_date < b.match_date) {
                                return -1
                            }
                            else if (a.match_date > b.match_date) {
                                return 1
                            }
                            else {
                                return 0
                            }
                        }
                    });
                    
                    return { matches: newMatches };
                })
            })
            .catch(/* do nothing */);
        }
    }

    handleMatchAdd(e) {
        let id = e.target.id.split("-");

        if (id.length == 2) {
            if (this.state.selected.length == 6) {
                alert("Already selected six games.")  // TODO: error component for better rendering.
            }

            id = parseInt(id[1]);
            const gameNumbers = [1, 2, 3, 4, 5, 6];

            for (let i = 0; i < this.state.selected.length; i++) {
                if (this.state.selected[i].game_number !== gameNumbers[i]) {
                    this.setState((oldState) => {
                        let selected = [...oldState.selected];

                        selected.splice(i, 0, { id: id, game_number: i });

                        return { selected: selected };
                    })
                }
            } 
        }
    }

    handleMatchDrop(e) {
        let id = e.target.id.split("-");

        if (id.length == 2) {
            id = parseInt(id[1]);

            this.setState((oldState) => {
                let selected = [...oldState.selected];
                
                let removeIndex = null;
                for (let i = 0; i < selected.length; i++) {
                    if (selected[i].id === id) {
                        removeIndex = i;
                        break
                    }
                }

                if (removeIndex !== null) {
                    selected.splice(removeIndex, 1);
                    return { selected: selected };
                }
            })
        }
    }

    renderMatchSelector() {
        let leagueMarker = 0
        const selected = this.state.selected.map(s => { return s.id });

        return (
            <div className="matchselector">
                <div className="matchselector-load">
                    <h4>Match Date</h4>
                    <input className="matchselector-load" type="date" id="matchselector-date" />
                    <button className="matchselector-button" id="matchselector-load" onClick={this.handleMatchesLoad}> 
                        Load Matches
                    </button>
                </div>
                <div className="matchselector-submit">
                    {this.state.matches.map(match => {
                        const row = match.home_team + " Vs " + match.away_team + " - " + this.formatMatchTime(match.match_date);

                        if (match.league_id !== leagueMarker) {
                            leagueMarker = match.league_id;
                            return (
                                <div>
                                    <h4>{this.state.leagues[match.league_id]}</h4>
                                    <div className="matchselector-submit-match">
                                        <div className="matchselector-submit-match-section">{row}</div>
                                        <div className="matchselector-submit-match-section">
                                            <button
                                                id={`matchselector-${match.id}`}
                                                className="matchselector-button"
                                                onClick={selected.indexOf(match.id) > -1 ? this.handleMatchDrop : this.handleMatchAdd}>
                                                    {selected.indexOf(match.id) > -1 ? "Drop" : "Add"} Match
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        }
                        else {
                            leagueMarker = match.league_id;
                            return (
                                <div className="matchselector-submit-match">
                                    <div className="matchselector-submit-match-section">{row}</div>
                                    <div className="matchselector-submit-match-section">
                                        <button
                                            id={`matchselector-${match.id}`}
                                            className="matchselector-button"
                                            onClick={selected.indexOf(match.id) > -1 ? this.handleMatchDrop : this.handleMatchAdd}>
                                                {selected.indexOf(match.id) > -1 ? "Drop" : "Add"} Match
                                        </button>
                                    </div>
                                </div>
                            )
                        }
                    })}
                </div>
            </div>
        )
    }

    // TODO: Add/Drop doesn't work properly - investigate.
    renderMatchSubmission() {
        if (this.state.selected.length > 0) {
            const gameNumbers = [1, 2, 3, 4, 5, 6];

            return (
                <div className="matchsubmission">
                    {gameNumbers.map((g, i) => {
                        return <p>{g}: {this.state.selected.length >= g ? this.state.selected[i].id : null}</p>
                    })}
                </div>
            )
        }
    }

    render() {
        return (
            <div className="matches-container">
                <h2>Matches</h2>
                {[
                    this.renderMatchSelector(),
                    this.renderMatchSubmission()
                ]}
            </div>
        )
    }
}

export default Matches;
