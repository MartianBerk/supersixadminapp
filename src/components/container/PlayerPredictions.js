import React, { Component } from "react";

import * as Constants from "../constants.js";

import "../css/PlayerPredictions.css";

class PlayerPredictions extends Component {
    constructor(props) {
        super(props);

        this.state = {
            predictions: this.props.predictions
        }

        this.handlePredictionSelect = this.handlePredictionSelect.bind(this);
        this.handlePredictionSubmit = this.handlePredictionSubmit.bind(this);
    }

    handlePredictionSelect (e) {
        const matchId = e.target.id.split("-");

        this.setState(oldState => {
            let predictions = [...oldState.predictions];

            for (let i = 0; i < predictions.length; i++) {
                if (predictions[i].match_id === parseInt(matchId[1])) {
                    predictions[i].prediction = e.target.value;
                    break;
                }
            }

            return { predictions: predictions };
        })
    }

    handlePredictionSubmit (_) {
        let predictions = [];

        this.state.predictions.forEach(prediction => {
            if (!prediction.prediction) {
                alert("Missing prediction for " + prediction.home_team + " & " + prediction.away_team);
                return null;
            }

            predictions.push({
                match_id: prediction.match_id,
                player_id: prediction.player_id,
                prediction: prediction.prediction,
                round_id: prediction.round_id
            })
        });

        fetch(`${Constants.ADDPREDICTIONSURL}`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: predictions
        })
        .then()
        .catch(error => JSON.stringify(error));
    }

    render () {
        return (
            <div id={this.props.id} className={this.props.className}>
                {this.state.predictions.length > 0 && this.state.predictions.map((prediction, i) => {
                    return (
                        <div key={i} className={"playerpredictions" + (this.props.edit ? "-edit" : "")}>
                            <div className={"playerprediction-section" + (this.props.edit ? "-edit" : "")}>
                                <span className={"playerprediction-subsection" + (!this.props.edit && prediction.prediction === "home" ? " playerprediction-pick" : "")}>{prediction.home_team}</span>
                                <span className="playerprediction-subsection">Vs</span>
                                <span className={"playerprediction-subsection" + (!this.props.edit && prediction.prediction === "away" ? " playerprediction-pick" : "")}>{prediction.away_team}</span>
                            </div>
                            <div className={"playerprediction-section" + (this.props.edit ? "-edit" : "")} onChange={this.handlePredictionSelect}>
                                {this.props.edit && <select id={"playerprediction-" + prediction.match_id} onChange={this.handlePredictionSelect}>
                                    <option value=""></option>
                                    <option value="home" selected={prediction.prediction === "home" ? true : false}>Home</option>
                                    <option value="away" selected={prediction.prediction === "away" ? true : false}>Away</option>
                                    <option value="draw" selected={prediction.prediction === "draw" ? true : false}>Draw</option>
                                    <option value="void" selected={prediction.prediction === "void" ? true : false}>--VOID--</option>
                                </select>}
                            </div>
                        </div>
                    )
                })}
                {this.props.edit && <button className="playerprediction-button" onClick={this.handlePredictionSubmit}> 
                    Submit
                </button>}
            </div>
        )
    }
}

export default PlayerPredictions;
