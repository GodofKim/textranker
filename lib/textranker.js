/*
Copyright (c) 2016, Godof Kim

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var async = require('async');

module.exports = function(graph, dump, limit, callback) {
  calculate(graph, dump, limit, callback);
  // calculate returns a textrank array.
  // graph must be a square matrix.
  // recommended setting : dump = 0.85, limit = 0.0001
};

function calculate (graph, dump, limit, callback){
  // Initailizing
  var Num = graph.length;
  var TR = [];
  for(var k = 0; k < Num; k++){
    TR.push(1/Num);
  }
  var connection = [];
  for(k = 0; k < Num; k++){
    connection[k] = 0;
    for(var l = 0; l < Num; l++){
      if(graph[k][l] !== 0)
        connection[k]++;
    }
  }

  // calculating
  var calCount = 0;
  var i = 0;
  async.whilst(
    function() {
      if(calCount < Num+1){
        return true;
      }else{
        return TR[getIndex(i-1, Num)]-TR[getIndex(i-2,Num)] > limit;
      }
    },
    function(next){
      getEngine(i, graph, Num, TR, connection, function(engine) {
        TR[i] = (1-dump)/Num + dump*engine;
        calCount++;
        i = getIndex(i+1, Num);
        next();
      });
    },
    function(err){
      callback(TR);
    }
  );
}

function getEngine (i, graph, Num, TR, connection, callback) {
  var j = 0;
  var engine = 0;
  async.whilst(function() {return j < Num;}, function(next){
    if(i !== j){
      engine += graph[i][j]*TR[j]/connection[j];
    }
    j++;
    next();
  }, function(err){
    callback(engine);
  });
}

function getIndex(i, Num){
  if(0 <= i && i < Num)
    return i;
  else if(Num <= i)
    return i - Num;
  else if(i < 0)
    return i + Num;
}
