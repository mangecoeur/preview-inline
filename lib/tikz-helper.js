'use babel';
//
// tikz-helper
//
// This module will handle the process of compiling the LaTeX document in order
// to build the preview image
//
import path from 'path';



export default {
  compileLatex(tex,callback) {
    callback = maybeCallback(callback);
    let temp = require('@atom/temp'),
      fs = require('fs'),
      util = require('util'),
      path = require('path'),
      exec = require('child_process').exec;

    // Automatically track and cleanup files at exit
    temp.track();

    // latex -pdf
    // convert -density 300 -units pixelspercentimeter -background white
    // alternatively (but PS does not support transparency)
    // latexmk -ps
    // gs -sDEVICE=png16m -dBATCH -dNOPAUSE -sOutputFile=tikz.png -dGraphicsAlphaBits=4 -dTextAlphaBits=4 -r300
    temp.mkdir('tikzpreview', function(err, dirPath) {
      var inputPath = path.join(dirPath, 'tikz.tex')
      fs.writeFile(inputPath, tex, function(err) {
        if (err) throw err;
        process.chdir(dirPath);
        exec("latexmk -pdf '" + inputPath + "'", function(err) {
          if (err) throw err;
          exec("convert -density 300 -units pixelspercentimeter -background white "
            +path.join(dirPath, 'tikz.pdf')+" tikz.png", function(err) {
              if (err) throw err;
              callback(path.join(dirPath, 'tikz.png'));
            }
          )
        });
      });
    });
  }
};

function maybeCallback(callback) {
  if (typeof callback === 'function')
    return callback;

  throw new ERR_INVALID_CALLBACK(cb);
}
