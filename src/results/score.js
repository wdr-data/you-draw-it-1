import * as d3 from "d3";
import { yourData, score, predictionDiff } from "../helpers/constants";

function compareGuess(truth, guess, graphMaxY, graphMinY) {
  let maxDiff = 0;
  let predDiff = 0;
  truth.forEach(function(ele, i) {
    maxDiff += Math.max(graphMaxY - ele.value, ele.value - graphMinY);
    predDiff += Math.abs(ele.value - guess[i+1].value);
  });
  return {maxDiff: maxDiff, predDiff: predDiff};  
}

export function getScore(key, truth, state, graphMaxY, graphMinY, resultSection, yourResult) {
  let myScore = 0;
  const guess = state.get(key, yourData);
  const r = compareGuess(truth, guess, graphMaxY, graphMinY);
  const maxDiff = r.maxDiff;
  const predDiff = r.predDiff;
  const scoreFunction = d3.scaleLinear().domain([0, maxDiff]).range([100,0]);
  
  myScore = scoreFunction(predDiff).toFixed(1);
  state.set(key, predictionDiff, predDiff);
  state.set(key, score, +myScore);

  let completed = true;
  state.getAllQuestions().forEach((ele) => {completed = completed && (typeof state.get(ele, score) !== "undefined"); });
  if (completed) {
    let scores = 0;
    state.getAllQuestions().forEach((ele) => {scores = scores + state.get(ele, score);});
    const finalScoreFunction = d3.scaleLinear().domain([0, 100 * state.getAllQuestions().length]).range([0,100]);
    let finalScore = finalScoreFunction(scores).toFixed();
    console.log("The final score is: " + finalScore);
    showFinalScore(+finalScore, resultSection, key, yourResult);
  }
        
  console.log(state.get(key, yourData));
  // console.log(truth);
  console.log("The pred is: " + predDiff);
  console.log("The maxDiff is: " + maxDiff);
  console.log("The score is: " + myScore);
  console.log(state.getState());
}

function showFinalScore(finalScore, resultSection, key, yourResult) {

  function showText() {
    d3.select(".result." + key).select("text.scoreText")
      .style("opacity", 1);
  }

  let fs = {};
  fs.div = resultSection.select("div.text")
    .append("div")
    .attr("class", "finalScore");

  fs.div.append("div")
    .attr("class", "before-finalScore")
    .append("strong")
    .text(yourResult);

  fs.svg = fs.div.append("svg")
    .attr("width", 500)
    .attr("height", 75);
    
  fs.g = fs.svg
    .append("g")
    .attr("transform", "translate(5, 10)");

  const xScale = d3.scaleLinear().domain([0, 100]).range([0, 400]);
  const xAxis = d3.axisBottom(xScale).ticks(4);
  fs.g.append("g")
    .attr("transform", "translate(0, 45)")
    .call(xAxis);

  fs.rect = fs.g.append("rect")
    .attr("class", "final-score-result")
    .attr("x", 0)
    .attr("y", 0)
    .attr("height", 40)
    .attr("width", 0);
        
  fs.txt = fs.g.append("text")
    .attr("class", "scoreText")
    .attr("x", xScale(finalScore) + 5)
    .attr("dy", 27)
    .text("(" + finalScore + "/100)");

  fs.rect.transition()
    .duration(3000)
    .attr("width", xScale(finalScore))
    .on("end", showText);
}